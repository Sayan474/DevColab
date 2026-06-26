import mongoose from 'mongoose';

const pendingSignupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  hashedPassword: { type: String, required: true },
  otpHash: { type: String, required: true },
  otpExpiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  lastSentAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now, expires: 600 },
});

pendingSignupSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.hashedPassword;
    delete ret.otpHash;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('PendingSignup', pendingSignupSchema);
