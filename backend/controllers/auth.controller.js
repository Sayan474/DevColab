import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { fail, ok } from '../utils/http.js';
import asyncHandler from '../utils/asyncHandler.js';

// Cookie config — same object used in all three places
const COOKIE_OPTIONS = {
  httpOnly: true,          // JS cannot read this — prevents XSS attacks
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod, HTTP ok in dev
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' needed for cross-origin in prod
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

const signToken = (user) => jwt.sign(
  { id: user._id.toString() },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const publicUser = async (userId) =>
  User.findById(userId).select('-passwordHash').populate('workspaces');

export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, errors.array()[0].msg, 422, { errors: errors.array() });

  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return fail(res, 'Email is already registered', 409);

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
  });

  const token = signToken(user);
  const hydrated = await publicUser(user._id);

  // Set token as httpOnly cookie instead of returning in body
  res.cookie('devcollab_token', token, COOKIE_OPTIONS);
  return ok(res, { user: hydrated, socketToken: token }, 201); // ← add socketToken
});

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

  // Set token as httpOnly cookie
  res.cookie('devcollab_token', token, COOKIE_OPTIONS);
  return ok(res, { user: hydrated, socketToken: token }); // ← add socketToken
});

export const logout = asyncHandler(async (req, res) => {
  // Clear the cookie by setting maxAge to 0
  res.cookie('devcollab_token', '', { ...COOKIE_OPTIONS, maxAge: 0 });
  return ok(res, { message: 'Logged out successfully' });
});

export const me = asyncHandler(async (req, res) => {
  const user = await publicUser(req.user.id);
  return ok(res, { user });
});

const sendResetEmail = async (email, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const error = new Error('Email credentials are not configured');
    error.status = 503;
    throw error;
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'DevColab password reset code',
    text: `Your DevColab password reset code is ${otp}. It expires in 10 minutes.`,
  });
};

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, errors.array()[0].msg, 422, { errors: errors.array() });

  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return ok(res, { sent: true }); // don't reveal if email exists

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