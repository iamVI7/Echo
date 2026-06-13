import mongoose from 'mongoose';

const reflectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  echo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Echo',
    required: true,
    unique: true
  },
  aged: {
    type: String,
    enum: ['yes', 'partially', 'no'],
    required: true
  },
  note: {
    type: String,
    maxlength: [1000, 'Reflection note cannot exceed 1000 characters'],
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Reflection', reflectionSchema);
