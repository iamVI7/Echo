import Reflection from '../models/Reflection.js';
import Echo from '../models/Echo.js';

export const createReflection = async (req, res) => {
  try {
    const { echoId, aged, note } = req.body;

    const echo = await Echo.findOne({
      _id: echoId,
      user: req.user._id,
      status: 'opened'
    });

    if (!echo) {
      return res.status(404).json({ message: 'Opened echo not found' });
    }

    const existing = await Reflection.findOne({ echo: echoId });
    if (existing) {
      return res.status(400).json({ message: 'Reflection already exists for this echo' });
    }

    const reflection = await Reflection.create({
      user: req.user._id,
      echo: echoId,
      aged,
      note: note || ''
    });

    res.status(201).json(reflection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReflection = async (req, res) => {
  try {
    const reflection = await Reflection.findOne({
      echo: req.params.echoId,
      user: req.user._id
    });

    if (!reflection) {
      return res.status(404).json({ message: 'Reflection not found' });
    }

    res.json(reflection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
