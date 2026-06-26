import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import PendingSignup from '../models/PendingSignup.js';
import { fail, ok } from '../utils/http.js';
import asyncHandler from '../utils/asyncHandler.js';

const COOKIE_OPTIONS = {
  httpOnly: true,          
  secure: process.env.NODE_ENV === 'production', 
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
  maxAge: 7 * 24 * 60 * 60 * 1000, 
};

const signToken = (user) => jwt.sign(
  { id: user._id.toString() },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const publicUser = async (userId) =>
  User.findById(userId).select('-passwordHash').populate('workspaces');

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_SIGNUP_OTP_ATTEMPTS = 5;

const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

const createEmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const error = new Error('Email credentials are not configured');
    error.status = 503;
    throw error;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
};

const sendSignupOtpEmail = async (email, otp) => {
  const transporter = createEmailTransporter();
  await transporter.sendMail({
    from: `"DevCollab" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your DevCollab account',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0a0b;color:#fff;border-radius:16px;">
        <h1 style="font-size:22px;margin:0 0 12px;">Verify your DevCollab account</h1>
        <p style="color:#9ca3af;margin:0 0 24px;">Use this one-time code to finish creating your account.</p>
        <div style="font-size:32px;letter-spacing:8px;font-weight:800;background:#18181b;border:1px solid #27272a;border-radius:12px;padding:18px 20px;text-align:center;color:#fff;">
          ${otp}
        </div>
        <p style="color:#9ca3af;margin:24px 0 0;">This code expires in 10 minutes.</p>
        <p style="color:#6b7280;font-size:12px;margin:12px 0 0;">If you did not request this account, you can safely ignore this email.</p>
      </div>
    `,
  });
};

const completeRegister = async (pendingSignup, res) => {
  const user = await User.create({
    name: pendingSignup.name,
    email: pendingSignup.email,
    passwordHash: pendingSignup.hashedPassword,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(pendingSignup.name)}`,
  });

  await PendingSignup.deleteOne({ _id: pendingSignup._id });

  const token = signToken(user);
  const hydrated = await publicUser(user._id);

  res.cookie('devcollab_token', token, COOKIE_OPTIONS);
  return ok(res, { user: hydrated, socketToken: token }, 201);
};

export const startRegister = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, errors.array()[0].msg, 422, { errors: errors.array() });

  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return fail(res, 'Email is already registered', 409);

  const currentPending = await PendingSignup.findOne({ email: normalizedEmail });
  if (currentPending?.lastSentAt && Date.now() - currentPending.lastSentAt.getTime() < RESEND_COOLDOWN_MS) {
    return fail(res, 'OTP already sent. Please wait before requesting another code.', 429);
  }

  const otp = generateOtp();
  const hashedPassword = await bcrypt.hash(password, 12);
  const pendingSignup = await PendingSignup.findOneAndUpdate(
    { email: normalizedEmail },
    {
      name,
      email: normalizedEmail,
      hashedPassword,
      otpHash: hashOtp(otp),
      otpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
      attempts: 0,
      lastSentAt: new Date(),
      createdAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  try {
    await sendSignupOtpEmail(normalizedEmail, otp);
  } catch (error) {
    await PendingSignup.deleteOne({ _id: pendingSignup._id });
    throw error;
  }

  return ok(res, { sent: true, email: normalizedEmail });
});

export const verifyRegister = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, errors.array()[0].msg, 422, { errors: errors.array() });

  const { email, otp } = req.body;
  const normalizedEmail = email.toLowerCase();
  const pendingSignup = await PendingSignup.findOne({ email: normalizedEmail });
  if (!pendingSignup || pendingSignup.otpExpiresAt < new Date()) {
    if (pendingSignup) await PendingSignup.deleteOne({ _id: pendingSignup._id });
    return fail(res, 'Invalid or expired OTP', 400);
  }

  if (hashOtp(otp) !== pendingSignup.otpHash) {
    pendingSignup.attempts += 1;
    if (pendingSignup.attempts >= MAX_SIGNUP_OTP_ATTEMPTS) {
      await PendingSignup.deleteOne({ _id: pendingSignup._id });
      return fail(res, 'Too many invalid attempts. Please register again.', 400);
    }
    await pendingSignup.save();
    return fail(res, 'Invalid or expired OTP', 400, { attemptsRemaining: MAX_SIGNUP_OTP_ATTEMPTS - pendingSignup.attempts });
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    await PendingSignup.deleteOne({ _id: pendingSignup._id });
    return fail(res, 'Email is already registered', 409);
  }

  return completeRegister(pendingSignup, res);
});

export const resendRegisterOtp = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, errors.array()[0].msg, 422, { errors: errors.array() });

  const normalizedEmail = req.body.email.toLowerCase();
  const pendingSignup = await PendingSignup.findOne({ email: normalizedEmail });
  if (!pendingSignup || pendingSignup.otpExpiresAt < new Date()) {
    if (pendingSignup) await PendingSignup.deleteOne({ _id: pendingSignup._id });
    return fail(res, 'Signup verification expired. Please register again.', 400);
  }

  if (pendingSignup.lastSentAt && Date.now() - pendingSignup.lastSentAt.getTime() < RESEND_COOLDOWN_MS) {
    return fail(res, 'Please wait before requesting another OTP.', 429);
  }

  const previous = {
    otpHash: pendingSignup.otpHash,
    otpExpiresAt: pendingSignup.otpExpiresAt,
    attempts: pendingSignup.attempts,
    lastSentAt: pendingSignup.lastSentAt,
  };
  const otp = generateOtp();
  pendingSignup.otpHash = hashOtp(otp);
  pendingSignup.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  pendingSignup.attempts = 0;
  pendingSignup.lastSentAt = new Date();
  await pendingSignup.save();

  try {
    await sendSignupOtpEmail(normalizedEmail, otp);
  } catch (error) {
    pendingSignup.otpHash = previous.otpHash;
    pendingSignup.otpExpiresAt = previous.otpExpiresAt;
    pendingSignup.attempts = previous.attempts;
    pendingSignup.lastSentAt = previous.lastSentAt;
    await pendingSignup.save();
    throw error;
  }

  return ok(res, { sent: true, email: normalizedEmail });
});

export const register = startRegister;

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, errors.array()[0].msg, 422, { errors: errors.array() });

  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    return fail(res, 'Invalid email or password', 401);
  }

  const token = signToken(user);
  const hydrated = await publicUser(user._id);

  res.cookie('devcollab_token', token, COOKIE_OPTIONS);
  return ok(res, { user: hydrated, socketToken: token }); 
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie('devcollab_token', '', { ...COOKIE_OPTIONS, maxAge: 0 });
  return ok(res, { message: 'Logged out successfully' });
});

export const me = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    return fail(res, 'Unauthorized access request', 401);
  }
  const user = await publicUser(req.user.id);
  return ok(res, { user });
});

const sendResetEmail = async (email, otp) => {
  const transporter = createEmailTransporter();
  await transporter.sendMail({
    from: `"DevCollab" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'DevCollab password reset code',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0a0b;color:#fff;border-radius:16px;">
        <h1 style="font-size:22px;margin:0 0 12px;">Reset your DevCollab password</h1>

        <p style="color:#9ca3af;margin:0 0 24px;">
          We received a request to reset the password for your DevCollab account.
          Use the one-time code below to continue.
        </p>

        <div style="font-size:32px;letter-spacing:8px;font-weight:800;background:#18181b;border:1px solid #27272a;border-radius:12px;padding:18px 20px;text-align:center;color:#fff;">
          ${otp}
        </div>

        <p style="color:#9ca3af;margin:24px 0 0;">
          This verification code expires in <strong>10 minutes</strong>.
        </p>

        <p style="color:#9ca3af;margin:12px 0 0;">
          If you didn't request a password reset, you can safely ignore this email.
          Your password will remain unchanged.
        </p>

        <hr style="border:none;border-top:1px solid #27272a;margin:28px 0;" />

        <p style="color:#6b7280;font-size:12px;line-height:1.6;margin:0;">
          For your security, never share this code with anyone.
          DevCollab will never ask for your verification code by email or phone.
        </p>
      </div>
    `,
  });
};

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, errors.array()[0].msg, 422, { errors: errors.array() });

  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return ok(res, { sent: true }); 

  const otp = crypto.randomInt(100000, 999999).toString();
  const hash = crypto.createHash('sha256').update(otp).digest('hex');
  user.resetOtpHash = hash;
  user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  try {
    await sendResetEmail(user.email, otp);
  } catch (error) {
    user.resetOtpHash = '';
    user.resetOtpExpires = null;
    await user.save();
    throw error;
  }

  return ok(res, { sent: true });
});

export const resetPasswordWithOtp = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, errors.array()[0].msg, 422, { errors: errors.array() });

  const { email, otp, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.resetOtpHash || !user.resetOtpExpires) {
    return fail(res, 'Invalid or expired OTP', 400);
  }
  if (user.resetOtpExpires < new Date()) return fail(res, 'Invalid or expired OTP', 400);

  const hash = crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
  if (hash !== user.resetOtpHash) return fail(res, 'Invalid or expired OTP', 400);

  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetOtpHash = '';
  user.resetOtpExpires = null;
  await user.save();

  return ok(res, { reset: true });
});

export const oAuthCallback = asyncHandler(async (req, res) => {
  if (!req.user) {
    console.error('OAuth Callback Error: No authenticated user payload found on request object.');
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }

  const token = signToken(req.user);
  res.cookie('devcollab_token', token, COOKIE_OPTIONS);
  
  return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
});
