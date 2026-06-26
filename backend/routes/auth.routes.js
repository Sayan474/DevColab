import { Router } from 'express';
import { body } from 'express-validator';
import passport from 'passport';
import auth from '../middleware/auth.js';

// Clean, combined import for all auth controllers
import { 
  login, 
  me, 
  register, 
  logout,
  startRegister,
  verifyRegister,
  resendRegisterOtp,
  requestPasswordReset, 
  resetPasswordWithOtp, 
  oAuthCallback 
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], register);

router.post('/register/start', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], startRegister);

router.post('/register/verify', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Enter the 6-digit OTP'),
], verifyRegister);

router.post('/register/resend', [
  body('email').isEmail().withMessage('Valid email is required'),
], resendRegisterOtp);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], login);

router.post('/logout', logout);

router.post('/password/otp', [
  body('email').isEmail().withMessage('Valid email is required'),
], requestPasswordReset);

router.post('/password/reset', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 4 }).withMessage('OTP is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], resetPasswordWithOtp);

router.get('/me', auth, me);

router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login`, 
    session: false 
  }), 
  oAuthCallback
);

router.get('/github', 
  passport.authenticate('github', { scope: ['user:email'], session: false })
);

router.get('/github/callback', 
  passport.authenticate('github', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login`, 
    session: false 
  }), 
  oAuthCallback
);

export default router;
