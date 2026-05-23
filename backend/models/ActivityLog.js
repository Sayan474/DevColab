import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  action: { type: String, required: true },
  entityType: { type: String, enum: ['task', 'snippet', 'wiki', 'member', 'project'] },
  entityId: mongoose.Schema.Types.ObjectId,
  entityName: String,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

activityLogSchema.index({ workspaceId: 1, createdAt: -1 });
activityLogSchema.set('toJSON', { transform: (doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret; } });

export default mongoose.model('ActivityLog', activityLogSchema);
