const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  authorId: {
    type: String,
    required: true,
    index: true,
  },
  authorAlias: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  attachments: [{
    url: String,
    type: { type: String, enum: ['image', 'document', 'video'] },
    filename: String,
  }],
  category: {
    type: String,
    enum: ['Corruption', 'Environment', 'Education', 'Military', 'Technology', 'Healthcare', 'Government', 'Corporate', 'Society', 'Other'],
    default: 'Other',
  },
  postType: {
    type: String,
    enum: ['personal_experience', 'leaked_info', 'public_concern'],
    default: 'public_concern',
  },
  tags: [{
    type: String,
  }],
  mediaUrl: {
    type: String,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  downvotes: {
    type: Number,
    default: 0,
  },
  upvotedBy: [{
    type: String,
  }],
  downvotedBy: [{
    type: String,
  }],
  isNSFW: {
    type: Boolean,
    default: false,
  },
  isAnonymous: {
    type: Boolean,
    default: true,
  },
  communityId: {
    type: String,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  archivedAt: {
    type: Date,
    default: null,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for trending algorithm
postSchema.index({ upvotes: -1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
