import { Router } from 'express';

import { getWiki, updateWiki, getPage } from '../controllers/wiki.controller.js';
import auth from '../middleware/auth.js'; 

const router = Router();


router.use(auth);


router.get('/project/:projectId', getWiki);


router.get('/:id', getPage);


router.post('/', updateWiki);
router.put('/', updateWiki);
router.put('/:id', updateWiki);

export default router;