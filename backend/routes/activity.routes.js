import { Router } from 'express';
import auth from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { getWorkspaceActivity } from '../controllers/activity.controller.js';

const router = Router();
router.use(auth);
router.get('/workspace/:workspaceId', requireRole('viewer'), getWorkspaceActivity);
export default router;
