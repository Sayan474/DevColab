import crypto from 'crypto';
import nodemailer from 'nodemailer';
import Invite from '../models/Invite.js';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { fail, ok } from '../utils/http.js';
import logActivity from '../utils/logActivity.js';

export const createInvite = asyncHandler(async (req, res) => {
  const { email, workspaceId, role = 'member' } = req.body;
  if (!email || !workspaceId) return fail(res, 'email and workspaceId are required', 422);
  const token = crypto.randomBytes(32).toString('hex');
  const invite = await Invite.create({
    email,
    workspaceId,
    role,
    token,
    invitedBy: req.user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  const acceptUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/invite/accept/${token}`;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const error = new Error('Email credentials are not configured');
    error.status = 503;
    error.invite = invite;
    throw error;
  }
  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
  const workspace = await Workspace.findById(workspaceId);
  const invitedByUser = await User.findById(req.user.id).select('name');

  await transporter.sendMail({
    from: `"DevColab" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `You've been invited to join ${workspace?.name || 'a workspace'} on DevColab`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0a0b;color:#fff;border-radius:16px;">
        <h1 style="font-size:22px;margin-bottom:8px;">You're invited! 🎉</h1>
        <p style="color:#9ca3af;margin-bottom:24px;">
          <strong style="color:#fff">${invitedByUser?.name || 'Someone'}</strong> has invited you to join
          <strong style="color:#7c3aed">${workspace?.name || 'a workspace'}</strong> on DevColab as a
          <strong style="color:#fff">${role}</strong>.
        </p>
        <a href="${acceptUrl}"
          style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
          Accept Invitation →
        </a>
        <p style="color:#6b7280;font-size:12px;margin-top:24px;">
          This link expires in 7 days.<br/>
          If you didn't expect this invite, you can safely ignore this email.
        </p>
      </div>
    `
  });
  await logActivity({ userId: req.user.id, workspaceId, action: 'invite.sent', entityType: 'member', entityName: email });
  return ok(res, { invite, acceptUrl }, 201);
});

export const acceptInvite = asyncHandler(async (req, res) => {
  const invite = await Invite.findOne({ token: req.params.token });
  if (!invite || invite.accepted || invite.expiresAt < new Date()) return fail(res, 'Invite is invalid or expired', 400);
  const user = await User.findOne({ email: invite.email });
  if (!user) return ok(res, { registered: false, email: invite.email, workspaceId: invite.workspaceId });
  const workspace = await Workspace.findById(invite.workspaceId);
  if (!workspace.members.some((member) => member.userId.toString() === user._id.toString())) {
    workspace.members.push({ userId: user._id, role: invite.role });
    await workspace.save();
    await User.findByIdAndUpdate(user._id, { $addToSet: { workspaces: workspace._id } });
  }
  invite.accepted = true;
  await invite.save();
  await logActivity({ userId: user._id, workspaceId: workspace._id, action: 'member.joined', entityType: 'member', entityId: user._id, entityName: user.name });
  return ok(res, { accepted: true, workspace });
});

export const listPendingInvites = asyncHandler(async (req, res) => {
  const invites = await Invite.find({ workspaceId: req.params.workspaceId, accepted: false }).sort({ expiresAt: 1 }).populate('invitedBy', 'name avatar email');
  return ok(res, { invites });
});
