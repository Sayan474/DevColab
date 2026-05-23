import { Router } from 'express';
import auth from '../middleware/auth.js';
import { getProfile, getPublicProfile, updateProfile } from '../controllers/user.controller.js';

const router = Router();
router.use(auth);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/:userId', getPublicProfile);
export default router;
