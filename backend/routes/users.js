import express from 'express';
import { getProfile, deleteAccount } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/profile', getProfile);
router.delete('/account', deleteAccount);

export default router;