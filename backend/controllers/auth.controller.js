import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { fail, ok } from '../utils/http.js';
import asyncHandler from '../utils/asyncHandler.js';

const signToken = (user) => jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });

const publicUser = async (userId) => User.findById(userId).select('-passwordHash').populate('workspaces');

export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, errors.array()[0].msg, 422, { errors: errors.array() });
  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return fail(res, 'Email is already registered', 409);
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email: normalizedEmail, passwordHash, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}` });
  const hydrated = await publicUser(user._id);
  return ok(res, { token: signToken(user), user: hydrated }, 201);
});

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, errors.array()[0].msg, 422, { errors: errors.array() });
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) return fail(res, 'Invalid email or password', 401);
  const hydrated = await publicUser(user._id);
  return ok(res, { token: signToken(user), user: hydrated });
});

export const me = asyncHandler(async (req, res) => {
  const user = await publicUser(req.user.id);
  return ok(res, { user });
});
