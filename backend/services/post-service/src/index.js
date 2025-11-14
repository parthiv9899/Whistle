const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/whistle', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Post Service: MongoDB Connected'))
  .catch((err) => console.error('Post Service: MongoDB Connection Error:', err));

// Models
const Post = require('../shared/models/Post');
const User = require('../shared/models/User');
const Comment = require('../shared/models/Comment');
const VeilTransaction = require('../shared/models/VeilTransaction');
const Community = require('../shared/models/Community');

// Utility: Generate Random Alias
const generateAnonymousAlias = () => {
  const adjectives = ['Silent', 'Shadow', 'Cipher', 'Ghost', 'Masked', 'Phantom', 'Stealth', 'Hidden', 'Veiled', 'Dark'];
  const nouns = ['Truth', 'Wolf', 'Hawk', 'Viper', 'Raven', 'Fox', 'Sentinel', 'Guardian', 'Watcher', 'Keeper'];
  const number = Math.floor(Math.random() * 1000);
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${number}`;
};

// ========== POST ROUTES ==========

// Get all posts with pagination, filtering, and sorting
app.get('/posts', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      postType,
      search,
      sort = 'recent' // recent, trending
    } = req.query;

    const query = {
      isDeleted: false,
      isArchived: false
    };

    if (category) query.category = category;
    if (postType) query.postType = postType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    let sortQuery = {};
    switch(sort) {
      case 'trending':
        sortQuery = { upvotes: -1, createdAt: -1 };
        break;
      default: // recent
        sortQuery = { createdAt: -1 };
    }

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .sort(sortQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Populate community names for posts
    const postsWithCommunityNames = await Promise.all(
      posts.map(async (post) => {
        if (post.communityId) {
          const community = await Community.findOne({ communityId: post.communityId });
          return {
            ...post,
            communityName: community ? community.name : null
          };
        }
        return post;
      })
    );

    res.json({
      posts: postsWithCommunityNames,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post by ID
app.get('/posts/:postId', async (req, res) => {
  try {
    const post = await Post.findOne({ postId: req.params.postId });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create new post
app.post('/posts', async (req, res) => {
  try {
    const {
      clerkUserId, // Now accepting Clerk user ID directly
      title,
      content,
      category,
      postType,
      tags,
      attachments,
      isNSFW,
      isAnonymous = true,
      communityId // Add community support
    } = req.body;

    if (!clerkUserId || !content) {
      return res.status(400).json({ error: 'User ID and content are required' });
    }

    console.log('[Post Service] Creating post for clerkUserId:', clerkUserId);

    // Try to get or create user
    let user = await User.findOne({ clerkUserId });
    if (!user) {
      console.log('[Post Service] User not found, creating new user...');
      // Generate unique alias with a limit
      let alias = generateAnonymousAlias();
      let attempts = 0;
      const maxAttempts = 10;

      while (await User.findOne({ alias }) && attempts < maxAttempts) {
        alias = generateAnonymousAlias();
        attempts++;
      }

      if (attempts >= maxAttempts) {
        // If still colliding after 10 attempts, just append timestamp
        alias = generateAnonymousAlias() + '_' + Date.now();
      }

      user = new User({
        userId: uuidv4(),
        clerkUserId,
        alias,
        credibilityTokens: 10,
        avatarUrl: '',
        bio: '',
      });
      await user.save();
      console.log('[Post Service] User created:', user.userId);
    }

    // If communityId provided, verify community exists and user is a member
    if (communityId) {
      const community = await Community.findOne({ communityId });
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }
      if (!community.members.includes(user.userId)) {
        return res.status(403).json({ error: 'You must be a member of this community to post' });
      }
    }

    // Always use user's alias - this maintains anonymity while providing accountability
    const authorAlias = user.alias;

    const post = new Post({
      postId: uuidv4(),
      authorId: user.userId, // Use the internal userId
      authorAlias,
      title: title || '',
      content,
      category: category || 'Other',
      postType: postType || 'public_concern',
      tags: tags || [],
      attachments: attachments || [],
      isNSFW: isNSFW || false,
      isAnonymous: false, // No longer truly anonymous - always shows alias
      communityId: communityId || null, // Set community if provided
    });

    await post.save();
    console.log('[Post Service] Post created:', post.postId);

    // If posted to a community, add to community's posts array
    if (communityId) {
      await Community.findOneAndUpdate(
        { communityId },
        { $push: { posts: post.postId } }
      );
    }

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post', details: error.message });
  }
});

// Update post (for editing)
app.put('/posts/:postId', async (req, res) => {
  try {
    const { userId, title, content, category, tags } = req.body;
    const post = await Post.findOne({ postId: req.params.postId });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify ownership
    if (post.authorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this post' });
    }

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (category !== undefined) post.category = category;
    if (tags !== undefined) post.tags = tags;
    post.updatedAt = Date.now();

    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Vote on post
app.post('/posts/:postId/vote', async (req, res) => {
  try {
    const { voteType, userId } = req.body; // 'upvote' or 'downvote'
    const post = await Post.findOne({ postId: req.params.postId });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user already voted
    const hasUpvoted = post.upvotedBy.includes(userId);
    const hasDownvoted = post.downvotedBy.includes(userId);

    if (voteType === 'upvote') {
      if (hasUpvoted) {
        // Remove upvote
        post.upvotes -= 1;
        post.upvotedBy = post.upvotedBy.filter(id => id !== userId);
      } else {
        // Add upvote
        post.upvotes += 1;
        post.upvotedBy.push(userId);

        // Remove downvote if exists
        if (hasDownvoted) {
          post.downvotes -= 1;
          post.downvotedBy = post.downvotedBy.filter(id => id !== userId);
        }
      }
    } else if (voteType === 'downvote') {
      if (hasDownvoted) {
        // Remove downvote
        post.downvotes -= 1;
        post.downvotedBy = post.downvotedBy.filter(id => id !== userId);
      } else {
        // Add downvote
        post.downvotes += 1;
        post.downvotedBy.push(userId);

        // Remove upvote if exists
        if (hasUpvoted) {
          post.upvotes -= 1;
          post.upvotedBy = post.upvotedBy.filter(id => id !== userId);
        }
      }
    }

    await post.save();
    res.json({ message: 'Vote recorded', post });
  } catch (error) {
    console.error('Error voting on post:', error);
    res.status(500).json({ error: 'Failed to vote on post' });
  }
});

// Archive post (soft delete - only owner can see it)
app.post('/posts/:postId/archive', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findOne({ postId: req.params.postId });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify ownership
    if (post.authorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to archive this post' });
    }

    // Toggle archive status
    post.isArchived = !post.isArchived;
    post.archivedAt = post.isArchived ? new Date() : null;
    post.updatedAt = Date.now();

    await post.save();
    res.json({
      message: post.isArchived ? 'Post archived successfully' : 'Post unarchived successfully',
      post
    });
  } catch (error) {
    console.error('Error archiving post:', error);
    res.status(500).json({ error: 'Failed to archive post' });
  }
});

// Delete post (hard delete - permanently removes post and all related data)
app.delete('/posts/:postId', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findOne({ postId: req.params.postId });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify ownership or admin
    if (post.authorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    // Delete all comments associated with this post
    await Comment.deleteMany({ postId: req.params.postId });

    // Remove post from community if it belongs to one
    if (post.communityId) {
      await Community.findOneAndUpdate(
        { communityId: post.communityId },
        { $pull: { posts: post.postId } }
      );
    }

    // Delete the post
    await Post.deleteOne({ postId: req.params.postId });

    res.json({ message: 'Post and all related data deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// ========== COMMENT ROUTES ==========

// Get comments for a post
app.get('/posts/:postId/comments', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const comments = await Comment.find({
      postId: req.params.postId,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create comment
app.post('/posts/:postId/comments', async (req, res) => {
  try {
    const { authorId, content, parentCommentId } = req.body;

    if (!authorId || !content) {
      return res.status(400).json({ error: 'Author ID and content are required' });
    }

    const author = await User.findOne({ userId: authorId });
    if (!author) {
      return res.status(404).json({ error: 'User not found' });
    }

    const comment = new Comment({
      commentId: uuidv4(),
      postId: req.params.postId,
      authorId,
      authorAlias: author.alias, // Use user's alias for accountability
      content,
      parentCommentId: parentCommentId || null,
    });

    await comment.save();

    // Update post comments count
    await Post.findOneAndUpdate(
      { postId: req.params.postId },
      { $inc: { commentsCount: 1 } }
    );

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Vote on comment
app.post('/comments/:commentId/vote', async (req, res) => {
  try {
    const { voteType, userId } = req.body;
    const comment = await Comment.findOne({ commentId: req.params.commentId });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const hasUpvoted = comment.upvotedBy.includes(userId);
    const hasDownvoted = comment.downvotedBy.includes(userId);

    if (voteType === 'upvote') {
      if (hasUpvoted) {
        comment.upvotes -= 1;
        comment.upvotedBy = comment.upvotedBy.filter(id => id !== userId);
      } else {
        comment.upvotes += 1;
        comment.upvotedBy.push(userId);
        if (hasDownvoted) {
          comment.downvotes -= 1;
          comment.downvotedBy = comment.downvotedBy.filter(id => id !== userId);
        }
      }
    } else if (voteType === 'downvote') {
      if (hasDownvoted) {
        comment.downvotes -= 1;
        comment.downvotedBy = comment.downvotedBy.filter(id => id !== userId);
      } else {
        comment.downvotes += 1;
        comment.downvotedBy.push(userId);
        if (hasUpvoted) {
          comment.upvotes -= 1;
          comment.upvotedBy = comment.upvotedBy.filter(id => id !== userId);
        }
      }
    }

    await comment.save();
    res.json({ message: 'Vote recorded', comment });
  } catch (error) {
    console.error('Error voting on comment:', error);
    res.status(500).json({ error: 'Failed to vote on comment' });
  }
});

// ========== VEIL TRANSACTION ROUTES ==========

// Get user's Veil transaction history
app.get('/users/:userId/veil-transactions', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const transactions = await VeilTransaction.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// ========== COMMUNITY ROUTES ==========

// Get all communities
app.get('/communities', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Community.countDocuments(query);
    const communities = await Community.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Add member count to each community
    const communitiesWithCounts = communities.map(community => ({
      ...community,
      memberCount: community.members.length,
      postCount: community.posts.length
    }));

    res.json({
      communities: communitiesWithCounts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
});

// Get single community by ID
app.get('/communities/:communityId', async (req, res) => {
  try {
    const community = await Community.findOne({ communityId: req.params.communityId });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Get community creator details
    const creator = await User.findOne({ userId: community.creatorId });

    // Check if requesting user is a member (if clerkUserId provided in query)
    let isMember = false;
    const { clerkUserId } = req.query;
    console.log('[Post Service] GET /communities/:communityId - clerkUserId from query:', clerkUserId);
    if (clerkUserId) {
      const user = await User.findOne({ clerkUserId });
      console.log('[Post Service] User lookup result:', user ? { userId: user.userId, alias: user.alias } : 'User not found');
      if (user) {
        isMember = community.members.includes(user.userId);
        console.log('[Post Service] Membership check - userId:', user.userId, 'members:', community.members, 'isMember:', isMember);
      }
    }

    res.json({
      ...community.toObject(),
      memberCount: community.members.length,
      postCount: community.posts.length,
      creatorAlias: creator ? creator.alias : 'Unknown',
      isMember
    });
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({ error: 'Failed to fetch community' });
  }
});

// Create new community
app.post('/communities', async (req, res) => {
  try {
    const { clerkUserId, name, description, bannerUrl, rules } = req.body;

    if (!clerkUserId || !name || !description) {
      return res.status(400).json({ error: 'User ID, name, and description are required' });
    }

    // Check if community name already exists
    const existingCommunity = await Community.findOne({ name });
    if (existingCommunity) {
      return res.status(400).json({ error: 'Community name already exists' });
    }

    // Get user
    let user = await User.findOne({ clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please sign in.' });
    }

    const community = new Community({
      communityId: uuidv4(),
      name,
      description,
      bannerUrl: bannerUrl || '',
      creatorId: user.userId,
      members: [user.userId], // Creator is automatically a member
      posts: [],
      rules: rules || []
    });

    await community.save();
    console.log('[Post Service] Community created:', community.communityId);

    res.status(201).json({
      ...community.toObject(),
      memberCount: 1,
      postCount: 0
    });
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ error: 'Failed to create community', details: error.message });
  }
});

// Join community
app.post('/communities/:communityId/join', async (req, res) => {
  try {
    const { clerkUserId } = req.body;

    if (!clerkUserId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const community = await Community.findOne({ communityId: req.params.communityId });
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already a member
    if (community.members.includes(user.userId)) {
      return res.status(400).json({ error: 'Already a member of this community' });
    }

    community.members.push(user.userId);
    await community.save();

    res.json({
      message: 'Successfully joined community',
      memberCount: community.members.length
    });
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ error: 'Failed to join community' });
  }
});

// Leave community
app.post('/communities/:communityId/leave', async (req, res) => {
  try {
    const { clerkUserId } = req.body;

    if (!clerkUserId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const community = await Community.findOne({ communityId: req.params.communityId });
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Cannot leave if you're the creator
    if (community.creatorId === user.userId) {
      return res.status(400).json({ error: 'Community creator cannot leave. Transfer ownership or delete the community.' });
    }

    // Check if member
    if (!community.members.includes(user.userId)) {
      return res.status(400).json({ error: 'Not a member of this community' });
    }

    community.members = community.members.filter(id => id !== user.userId);
    await community.save();

    res.json({
      message: 'Successfully left community',
      memberCount: community.members.length
    });
  } catch (error) {
    console.error('Error leaving community:', error);
    res.status(500).json({ error: 'Failed to leave community' });
  }
});

// Get posts for a specific community
app.get('/communities/:communityId/posts', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'recent'
    } = req.query;

    const query = {
      communityId: req.params.communityId,
      isDeleted: false,
      isArchived: false
    };

    let sortQuery = {};
    switch(sort) {
      case 'trending':
        sortQuery = { upvotes: -1, createdAt: -1 };
        break;
      default: // recent
        sortQuery = { createdAt: -1 };
    }

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .sort(sortQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get community name and add it to all posts
    const community = await Community.findOne({ communityId: req.params.communityId });
    const communityName = community ? community.name : null;

    const postsWithCommunityName = posts.map(post => ({
      ...post,
      communityName
    }));

    res.json({
      posts: postsWithCommunityName,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({ error: 'Failed to fetch community posts' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Post Service is running' });
});

app.listen(PORT, () => {
  console.log(`Post Service running on port ${PORT}`);
});
