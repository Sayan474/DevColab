import { Router } from 'express';
import auth from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { createPage, deletePage, getPage, listPages, listVersions, updatePage } from '../controllers/wiki.controller.js';

const router = Router();
router.use(auth);
router.post('/', requireRole('member'), createPage);
router.get('/project/:projectId', requireRole('viewer'), listPages);
router.get('/:pageId', getPage);
router.put('/:pageId', updatePage);
router.delete('/:pageId', deletePage);
router.get('/:pageId/versions', listVersions);
export default router;
