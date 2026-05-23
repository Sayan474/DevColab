import mongoose from 'mongoose';

const snippetSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  language: { type: String, enum: ['javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust', 'html', 'css', 'sql'], required: true },
  code: { type: String, required: true },
  description: { type: String, default: '' },
  tags: [{ type: String }],
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

snippetSchema.index({ projectId: 1, title: 'text', description: 'text', tags: 1 });
snippetSchema.set('toJSON', { transform: (doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret; } });

export default mongoose.model('Snippet', snippetSchema);
