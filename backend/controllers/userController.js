import Echo from '../models/Echo.js';

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
