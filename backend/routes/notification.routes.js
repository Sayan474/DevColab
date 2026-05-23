import { Router } from 'express';
import auth from '../middleware/auth.js';
import { deleteNotification, listNotifications, markAllRead, markRead } from '../controllers/notification.controller.js';

const router = Router();
router.use(auth);
router.get('/', listNotifications);
router.put('/read-all', markAllRead);
router.put('/:notifId/read', markRead);
router.delete('/:notifId', deleteNotification);
export default router;
