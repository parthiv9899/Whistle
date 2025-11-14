const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/whistle', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('User Service: MongoDB Connected'))
  .catch((err) => console.error('User Service: MongoDB Connection Error:', err));

// Models
const User = require('../shared/models/User');
const Post = require('../shared/models/Post');
const Comment = require('../shared/models/Comment');

// Utility: Generate Random Alias
const generateAlias = () => {
  const adjectives = ['Shadow', 'Cipher', 'Ghost', 'Silent', 'Dark', 'Phantom', 'Mystic', 'Stealth'];
  const nouns = ['Wolf', 'Hawk', 'Viper', 'Raven', 'Fox', 'Sentinel', 'Guardian', 'Watcher'];
  const number = Math.floor(Math.random() * 1000);
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}_${nouns[Math.floor(Math.random() * nouns.length)]}_${number}`;
};

// Routes

// Create new user (called after Clerk auth)
app.post('/users', async (req, res) => {
  try {
    const { clerkUserId } = req.body;

    if (!clerkUserId) {
      return res.status(400).json({ error: 'Clerk user ID is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ clerkUserId });
    if (existingUser) {
      return res.json(existingUser);
    }

    // Generate unique alias
    let alias = generateAlias();
    while (await User.findOne({ alias })) {
      alias = generateAlias();
    }

    const user = new User({
      userId: uuidv4(),
      clerkUserId,
      alias,
      credibilityTokens: 10, // Starting tokens
      avatarUrl: '',
      bio: '',
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get user by Clerk ID
app.get('/users/profile/:clerkUserId', async (req, res) => {
  try {
    const user = await User.findOne({ clerkUserId: req.params.clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get user by userId
app.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update alias (with cooldown check)
app.patch('/users/:userId/alias', async (req, res) => {
  try {
    const { alias } = req.body;
    const user = await User.findOne({ userId: req.params.userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check cooldown (7 days)
    if (user.lastAliasChange) {
      const daysSinceChange = (Date.now() - user.lastAliasChange) / (1000 * 60 * 60 * 24);
      if (daysSinceChange < 7) {
        return res.status(400).json({
          error: `You can change your alias in ${Math.ceil(7 - daysSinceChange)} days`,
        });
      }
    }

    // Check if alias is taken
    const existingAlias = await User.findOne({ alias });
    if (existingAlias && existingAlias.userId !== user.userId) {
      return res.status(400).json({ error: 'Alias already taken' });
    }

    user.alias = alias;
    user.lastAliasChange = Date.now();
    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Error updating alias:', error);
    res.status(500).json({ error: 'Failed to update alias' });
  }
});

// Connect with user
app.post('/users/:userId/follow', async (req, res) => {
  try {
    console.log('[Connect] Request received:', { userId: req.params.userId, targetUserId: req.body.targetUserId });
    const { targetUserId } = req.body;
    const user = await User.findOne({ userId: req.params.userId });
    const targetUser = await User.findOne({ userId: targetUserId });

    console.log('[Connect] Users found:', { user: !!user, targetUser: !!targetUser });

    if (!user || !targetUser) {
      console.log('[Connect] User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent connecting with yourself
    if (user.userId === targetUserId) {
      console.log('[Connect] Attempted to connect with self');
      return res.status(400).json({ error: 'Cannot connect with yourself' });
    }

    // Add to following/followers
    if (!user.following.includes(targetUserId)) {
      user.following.push(targetUserId);
      targetUser.followers.push(user.userId);
      await user.save();
      await targetUser.save();
      console.log('[Connect] Connection created successfully');
    } else {
      console.log('[Connect] Already connected');
    }

    res.json({ message: 'Connected successfully' });
  } catch (error) {
    console.error('Error connecting with user:', error);
    res.status(500).json({ error: 'Failed to connect with user' });
  }
});

// Disconnect from user
app.delete('/users/:userId/follow', async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const user = await User.findOne({ userId: req.params.userId });
    const targetUser = await User.findOne({ userId: targetUserId });

    if (!user || !targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove from following/followers
    user.following = user.following.filter(id => id !== targetUserId);
    targetUser.followers = targetUser.followers.filter(id => id !== user.userId);

    await user.save();
    await targetUser.save();

    res.json({ message: 'Disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting from user:', error);
    res.status(500).json({ error: 'Failed to disconnect from user' });
  }
});

// Update credibility tokens
app.patch('/users/:userId/tokens', async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findOne({ userId: req.params.userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.credibilityTokens += amount;
    if (user.credibilityTokens < 0) user.credibilityTokens = 0;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating tokens:', error);
    res.status(500).json({ error: 'Failed to update tokens' });
  }
});

// Get current user with counts (unified profile)
app.get('/users/me', async (req, res) => {
  try {
    const { clerkUserId } = req.query;

    if (!clerkUserId) {
      return res.status(400).json({ error: 'Clerk user ID required' });
    }

    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get post counts
    const postsCount = await Post.countDocuments({ authorId: user.userId, isDeleted: false });

    const profile = {
      userId: user.userId,
      alias: user.alias,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      credibilityTokens: user.credibilityTokens,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      postsCount,
      joinedAt: user.joinedAt,
      publicKey: user.publicKey,
    };

    res.json(profile);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile (avatar, bio, alias)
app.patch('/users/me/edit', async (req, res) => {
  try {
    const { clerkUserId, alias, bio, avatarUrl } = req.body;

    if (!clerkUserId) {
      return res.status(400).json({ error: 'Clerk user ID required' });
    }

    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldAlias = user.alias;

    // Update alias with cooldown check
    if (alias && alias !== user.alias) {
      if (user.lastAliasChange) {
        const daysSinceChange = (Date.now() - user.lastAliasChange) / (1000 * 60 * 60 * 24);
        if (daysSinceChange < 7) {
          return res.status(400).json({
            error: `You can change your alias in ${Math.ceil(7 - daysSinceChange)} days`,
          });
        }
      }

      // Check if alias is taken
      const existingAlias = await User.findOne({ alias });
      if (existingAlias) {
        return res.status(400).json({ error: 'Alias already taken' });
      }

      user.alias = alias;
      user.lastAliasChange = Date.now();

      // Update alias in all posts and comments
      try {
        await Post.updateMany(
          { authorId: user.userId },
          { $set: { authorAlias: alias } }
        );

        await Comment.updateMany(
          { authorId: user.userId },
          { $set: { authorAlias: alias } }
        );
      } catch (error) {
        console.error('Error updating alias in posts/comments:', error);
        // Continue even if this fails
      }
    }

    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update public key for encrypted chat
app.post('/users/me/publicKey', async (req, res) => {
  try {
    const { clerkUserId, publicKey } = req.body;

    if (!clerkUserId || !publicKey) {
      return res.status(400).json({ error: 'Clerk user ID and public key required' });
    }

    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.publicKey = publicKey;
    await user.save();

    res.json({ message: 'Public key updated successfully' });
  } catch (error) {
    console.error('Error updating public key:', error);
    res.status(500).json({ error: 'Failed to update public key' });
  }
});

// Get user by alias
app.get('/users/by-alias/:alias', async (req, res) => {
  try {
    const user = await User.findOne({ alias: req.params.alias });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get post counts
    const postsCount = await Post.countDocuments({ authorId: user.userId, isDeleted: false });

    const profile = {
      userId: user.userId,
      alias: user.alias,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      credibilityTokens: user.credibilityTokens,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      postsCount,
      joinedAt: user.joinedAt,
    };

    res.json(profile);
  } catch (error) {
    console.error('Error fetching user by alias:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get user's connections (followers + following combined)
app.get('/users/:userId/connections', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Combine followers and following, remove duplicates
    const connectionIds = [...new Set([...user.followers, ...user.following])];

    // Fetch all connection user details
    const connections = await User.find({ userId: { $in: connectionIds } })
      .select('userId alias avatarUrl bio credibilityTokens followers following joinedAt');

    const connectionsWithCounts = connections.map(conn => ({
      userId: conn.userId,
      alias: conn.alias,
      avatarUrl: conn.avatarUrl,
      bio: conn.bio,
      credibilityTokens: conn.credibilityTokens,
      followersCount: conn.followers.length,
      followingCount: conn.following.length,
      joinedAt: conn.joinedAt,
    }));

    res.json(connectionsWithCounts);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

// Get user's posts
app.get('/users/:userId/posts', async (req, res) => {
  try {
    // User's own posts should include archived posts but exclude deleted ones
    const posts = await Post.find({
      authorId: req.params.userId,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get posts where user commented
app.get('/users/:userId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ authorId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    // Get all unique post IDs
    const postIds = [...new Set(comments.map(c => c.postId))];

    // Fetch posts
    const posts = await Post.find({ postId: { $in: postIds } });

    // Map comments to posts
    const postsWithComments = posts.map(post => {
      const userComments = comments.filter(c => c.postId === post.postId);
      return {
        ...post.toObject(),
        userComments: userComments.map(c => ({
          commentId: c.commentId,
          content: c.content,
          upvotes: c.upvotes,
          downvotes: c.downvotes,
          createdAt: c.createdAt,
        })),
      };
    });

    res.json(postsWithComments);
  } catch (error) {
    console.error('Error fetching user comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'User Service is running' });
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
