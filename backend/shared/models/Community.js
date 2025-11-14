const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  communityId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  bannerUrl: {
    type: String,
  },
  creatorId: {
    type: String,
    required: true,
  },
  members: [{
    type: String,
  }],
  posts: [{
    type: String,
  }],
  rules: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Community', communitySchema);
