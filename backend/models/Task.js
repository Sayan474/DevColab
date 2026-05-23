import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  filename: String,
  url: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: true });

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['todo', 'in_progress', 'in_review', 'done'], default: 'todo' },
  priority: { type: String, enum: ['P0', 'P1', 'P2'], default: 'P1' },
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  labels: [{ type: String }],
  dueDate: Date,
  attachments: [attachmentSchema],
  comments: [commentSchema],
  position: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

taskSchema.index({ projectId: 1, status: 1, position: 1 });
taskSchema.set('toJSON', { transform: (doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret; } });

export default mongoose.model('Task', taskSchema);
