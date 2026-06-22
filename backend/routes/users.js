import express from 'express';
import { getProfile, deleteAccount, updateName } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/profile', getProfile);
router.patch('/name', updateName);
router.delete('/account', deleteAccount);

export default router;