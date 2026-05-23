import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['mention', 'assignment', 'task_moved', 'comment', 'invite', 'system'], default: 'system' },
  message: { type: String, required: true },
  link: { type: String, default: '' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.set('toJSON', { transform: (doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret; } });

export default mongoose.model('Notification', notificationSchema);
