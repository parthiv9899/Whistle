const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  verificationId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  postId: {
    type: String,
    required: true,
    index: true,
  },
  moderatorId: {
    type: String,
    required: true,
  },
  moderatorAlias: {
    type: String,
    required: true,
  },
  decision: {
    type: String,
    enum: ['legit', 'fake', 'needs_more_info'],
    required: true,
  },
  notes: {
    type: String,
    maxlength: 1000,
  },
  evidence: [{
    type: String,
    description: String,
  }],
  veilAwarded: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

verificationSchema.index({ postId: 1 });
verificationSchema.index({ moderatorId: 1, createdAt: -1 });

module.exports = mongoose.model('Verification', verificationSchema);
