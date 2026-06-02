import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    // Read token from httpOnly cookie instead of Authorization header
    const token = req.cookies?.devcollab_token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = { id: user._id.toString(), _id: user._id, email: user.email, name: user.name };
    req.currentUser = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export default auth;