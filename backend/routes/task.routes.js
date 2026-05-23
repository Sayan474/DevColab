import { Router } from 'express';
import auth from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { uploadSingle } from '../middleware/upload.js';
import {
  addAttachment,
  addComment,
  createTask,
  deleteTask,
  getTask,
  listProjectTasks,
  moveTask,
  updateTask,
} from '../controllers/task.controller.js';

const router = Router();
router.use(auth);
router.post('/', requireRole('member'), createTask);
router.get('/project/:projectId', requireRole('viewer'), listProjectTasks);
router.get('/:taskId', getTask);
router.put('/:taskId', updateTask);
router.put('/:taskId/move', moveTask);
router.delete('/:taskId', deleteTask);
router.post('/:taskId/comments', addComment);
router.post('/:taskId/attachments', uploadSingle, addAttachment);
export default router;
