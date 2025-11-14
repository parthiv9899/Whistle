const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
  },
  alias: {
    type: String,
    required: true,
    unique: true,
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500,
  },
  credibilityTokens: {
    type: Number,
    default: 10,
  },
  followers: [{
    type: String,
  }],
  following: [{
    type: String,
  }],
  publicKey: {
    type: String,
    default: null,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  lastAliasChange: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('User', userSchema);
