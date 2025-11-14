const mongoose = require('mongoose');

const aegisMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'aegis'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  references: [{
    postId: String,
    title: String,
    excerpt: String,
  }],
});

const aegisConversationSchema = new mongoose.Schema({
  conversationId: {
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
  messages: [aegisMessageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    totalMessages: {
      type: Number,
      default: 0,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
});

// Update the updatedAt field on save
aegisConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.metadata.lastMessageAt = new Date();
  this.metadata.totalMessages = this.messages.length;
  next();
});

// Index for efficient queries
aegisConversationSchema.index({ userId: 1, updatedAt: -1 });
aegisConversationSchema.index({ conversationId: 1 });

module.exports = mongoose.model('AegisConversation', aegisConversationSchema);
