const mongoose = require('mongoose');

const veilTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['earned', 'spent', 'bonus', 'penalty'],
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  relatedPostId: {
    type: String,
  },
  relatedCommentId: {
    type: String,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

veilTransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('VeilTransaction', veilTransactionSchema);
