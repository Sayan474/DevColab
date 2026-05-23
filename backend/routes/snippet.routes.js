import { Router } from 'express';
import auth from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { createSnippet, deleteSnippet, getSnippet, listSnippets, updateSnippet } from '../controllers/snippet.controller.js';

const router = Router();
router.use(auth);
router.post('/', requireRole('member'), createSnippet);
router.get('/project/:projectId', requireRole('viewer'), listSnippets);
router.get('/:snippetId', getSnippet);
router.put('/:snippetId', updateSnippet);
router.delete('/:snippetId', deleteSnippet);
export default router;
