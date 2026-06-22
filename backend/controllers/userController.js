import Echo from '../models/Echo.js';
import Reflection from '../models/Reflection.js';
import User from '../models/User.js';
import path from 'path';
import fs from 'fs';

export const getProfile = async (req, res) => {
  try {
    const echoes = await Echo.find({ user: req.user._id, isDeleted: false });

    const now = new Date();
    const total = echoes.length;
    const locked = echoes.filter(e => e.status !== 'opened' && new Date(e.deliveryDate) > now).length;
    const unlocked = echoes.filter(e => e.status !== 'opened' && new Date(e.deliveryDate) <= now).length;
    const opened = echoes.filter(e => e.status === 'opened').length;

    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt
      },
      stats: { total, locked, unlocked, opened }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Updates the authenticated user's display name.
 */
export const updateName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    req.user.name = name.trim();
    await req.user.save();
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Permanently deletes the authenticated user's account, along with all
 * their Echoes, Reflections, and stored voice recordings.
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const echoes = await Echo.find({ user: userId });

    for (const echo of echoes) {
      // Remove stored voice recording file
      if (echo.voiceUrl) {
        const filePath = path.join(process.cwd(), echo.voiceUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await Echo.deleteMany({ user: userId });
    await Reflection.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};