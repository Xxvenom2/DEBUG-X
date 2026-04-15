const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['frontend', 'backend', 'database', 'auth', 'deployment', 'other'],
    default: 'other'
  },
  file: {
    type: String,
    default: null
  },
  submittedBy: {
    type: String, // email
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved'],
    default: 'open'
  }
}, { timestamps: true });

module.exports = mongoose.model('Bug', bugSchema);
