const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  commentId: {
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
  authorId: {
    type: String,
    required: true,
  },
  authorAlias: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  parentCommentId: {
    type: String,
    default: null,
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
  isDeleted: {
    type: Boolean,
    default: false,
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

commentSchema.index({ postId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
