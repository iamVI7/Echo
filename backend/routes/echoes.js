import express from 'express';
import { createEcho, getEchoes, getEcho, openEcho, deleteEcho } from '../controllers/echoController.js';
import { protect } from '../middleware/auth.js';
import { uploadVoice } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.get('/', getEchoes);
router.post('/', uploadVoice.single('voice'), createEcho);
router.get('/:id', getEcho);
router.patch('/:id/open', openEcho);
router.delete('/:id', deleteEcho);

export default router;
