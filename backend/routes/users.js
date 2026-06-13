import express from 'express';
import { getProfile } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/profile', getProfile);

export default router;
