import mongoose from 'mongoose';

const echoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
    default: ''
  },
  messageType: {
    type: String,
    enum: ['text', 'voice'],
    required: true,
    default: 'text'
  },
  textContent: {
    type: String,
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  voiceUrl: {
    type: String
  },
  voiceDuration: {
    type: Number // in seconds
  },
  deliveryDate: {
    type: Date,
    required: [true, 'Delivery date is required']
  },
  category: {
    type: String,
    enum: ['Career', 'Health', 'Learning', 'Project', 'Personal', 'Memory', 'Other'],
    default: 'Personal'
  },
  status: {
    type: String,
    enum: ['locked', 'unlocked', 'opened'],
    default: 'locked'
  },
  openedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual: compute dynamic status based on delivery date
echoSchema.virtual('computedStatus').get(function() {
  if (this.status === 'opened') return 'opened';
  if (new Date() >= new Date(this.deliveryDate)) return 'unlocked';
  return 'locked';
});

echoSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Echo', echoSchema);