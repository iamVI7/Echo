import Echo from '../models/Echo.js';
import path from 'path';
import fs from 'fs';

const computeStatus = (echo) => {
  if (echo.status === 'opened') return 'opened';
  if (new Date() >= new Date(echo.deliveryDate)) return 'unlocked';
  return 'locked';
};

const formatEcho = (echo) => {
  const obj = echo.toObject({ virtuals: true });
  obj.computedStatus = computeStatus(echo);
  return obj;
};

export const createEcho = async (req, res) => {
  try {
    const { title, messageType, textContent, deliveryDate, category, voiceDuration } = req.body;

    if (!deliveryDate) {
      return res.status(400).json({ message: 'Delivery date is required' });
    }

    if (new Date(deliveryDate) <= new Date()) {
      return res.status(400).json({ message: 'Delivery date must be in the future' });
    }

    if (messageType === 'text' && !textContent?.trim()) {
      return res.status(400).json({ message: 'Text content is required for text echoes' });
    }

    if (messageType === 'voice' && !req.file) {
      return res.status(400).json({ message: 'Voice recording is required for voice echoes' });
    }

    const echoData = {
      user: req.user._id,
      title: title || '',
      messageType,
      deliveryDate: new Date(deliveryDate),
      category: category || 'Personal',
      status: 'locked'
    };

    if (messageType === 'text') {
      echoData.textContent = textContent;
    } else if (messageType === 'voice' && req.file) {
      echoData.voiceUrl = `/uploads/voice/${req.file.filename}`;
      echoData.voiceDuration = voiceDuration ? parseInt(voiceDuration) : 0;
    }

    const echo = await Echo.create(echoData);
    res.status(201).json(formatEcho(echo));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEchoes = async (req, res) => {
  try {
    const echoes = await Echo.find({
      user: req.user._id,
      isDeleted: false
    }).sort({ createdAt: -1 });

    res.json(echoes.map(formatEcho));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEcho = async (req, res) => {
  try {
    const echo = await Echo.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });

    if (!echo) {
      return res.status(404).json({ message: 'Echo not found' });
    }

    res.json(formatEcho(echo));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const openEcho = async (req, res) => {
  try {
    const echo = await Echo.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });

    if (!echo) {
      return res.status(404).json({ message: 'Echo not found' });
    }

    const computed = computeStatus(echo);
    if (computed === 'locked') {
      return res.status(403).json({ message: 'This Echo is still locked' });
    }

    if (echo.status !== 'opened') {
      echo.status = 'opened';
      echo.openedAt = new Date();
      await echo.save();
    }

    res.json(formatEcho(echo));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEcho = async (req, res) => {
  try {
    const echo = await Echo.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });

    if (!echo) {
      return res.status(404).json({ message: 'Echo not found' });
    }

    // Only allow deletion of locked echoes
    const computed = computeStatus(echo);
    if (computed !== 'locked') {
      return res.status(400).json({ message: 'Only locked echoes can be deleted' });
    }

    // Remove voice file if exists
    if (echo.voiceUrl) {
      const filePath = path.join(process.cwd(), echo.voiceUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    echo.isDeleted = true;
    await echo.save();

    res.json({ message: 'Echo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
