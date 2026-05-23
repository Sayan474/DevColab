import { Router } from 'express';
import auth from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { acceptInvite, createInvite, listPendingInvites } from '../controllers/invite.controller.js';

const router = Router();
router.get('/accept/:token', acceptInvite);
router.post('/', auth, requireRole('admin'), createInvite);
router.get('/workspace/:workspaceId', auth, requireRole('admin'), listPendingInvites);
export default router;
