import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { fail, ok } from '../utils/http.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash').populate('workspaces');
  return ok(res, { user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'bio', 'skills', 'githubUrl', 'avatar'];
  const update = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  });
  const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-passwordHash');
  return ok(res, { user });
});

export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('name email avatar bio skills githubUrl createdAt');
  if (!user) return fail(res, 'User not found', 404);
  return ok(res, { user });
});
