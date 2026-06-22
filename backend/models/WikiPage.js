import mongoose from 'mongoose';

const versionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  changeSummary: { type: String, default: 'Updated page content' },
  editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  editedAt: { type: Date, default: Date.now },
}, { _id: true });

const wikiPageSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  content: { 
    type: String, 
    default: '' 
  },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  parentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'WikiPage', 
    default: null 
  },
  order: { 
    type: Number, 
    default: 0 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  versionHistory: [versionSchema],
}, { timestamps: true });

wikiPageSchema.index({ projectId: 1, parentId: 1, order: 1 });

wikiPageSchema.set('toJSON', { 
  transform: (doc, ret) => { 
    ret.id = ret._id.toString(); 
    delete ret._id;
    delete ret.__v; 
    return ret; 
  } 
});

export default mongoose.model('WikiPage', wikiPageSchema);