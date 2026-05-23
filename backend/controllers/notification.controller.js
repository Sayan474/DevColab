import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import { fail, ok, message } from '../utils/http.js';

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.id }).sort({ read: 1, createdAt: -1 }).limit(100).populate('senderId', 'name avatar email');
  return ok(res, { notifications });
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.notifId, userId: req.user.id }, { read: true }, { new: true });
  if (!notification) return fail(res, 'Notification not found', 404);
  return ok(res, { notification });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
  return message(res, 'Notifications marked as read');
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.notifId, userId: req.user.id });
  if (!notification) return fail(res, 'Notification not found', 404);
  return message(res, 'Notification deleted');
});
