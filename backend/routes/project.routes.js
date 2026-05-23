import { Router } from 'express';
import auth from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { createProject, deleteProject, getProject, listProjects, updateProject } from '../controllers/project.controller.js';

const router = Router();
router.use(auth);
router.post('/', requireRole('member'), createProject);
router.get('/workspace/:workspaceId', requireRole('viewer'), listProjects);
router.get('/:projectId', requireRole('viewer'), getProject);
router.put('/:projectId', requireRole('admin'), updateProject);
router.delete('/:projectId', requireRole('admin'), deleteProject);
export default router;
