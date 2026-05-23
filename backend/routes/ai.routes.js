import { Router } from 'express';
import auth from '../middleware/auth.js';
import { breakdownFeature, generateStandup, getBlockers, reviewCode, summariseProject } from '../controllers/ai.controller.js';

const router = Router();
router.use(auth);
router.post('/summarise', summariseProject);
router.post('/blockers', getBlockers);
router.post('/standup', generateStandup);
router.post('/breakdown', breakdownFeature);
router.post('/review-code', reviewCode);
export default router;
