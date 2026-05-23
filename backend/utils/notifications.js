import Notification from '../models/Notification.js';
import { emitToUser } from '../config/socket.js';

export const createNotification = async ({ userId, senderId, type = 'system', message, link = '' }) => {
  if (!userId || !message) return null;
  const notification = await Notification.create({ userId, senderId, type, message, link });
  const populated = await notification.populate('senderId', 'name avatar email');
  emitToUser(userId, 'notification:new', populated);
  return populated;
};
