import express from 'express';
import { createReflection, getReflection } from '../controllers/reflectionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createReflection);
router.get('/:echoId', getReflection);

export default router;
