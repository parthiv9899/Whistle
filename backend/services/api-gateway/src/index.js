const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://strider:strider123%3F%3F@ct.l2yrumi.mongodb.net/whistle';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('[MongoDB] Connected successfully'))
  .catch((err) => console.error('[MongoDB] Connection error:', err));

// Initialize Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCIaqLONha4iM34gNHPunAE0ShNwsEwSR8';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Import models
const AegisConversation = require('../shared/models/AegisConversation');
const Post = require('../shared/models/Post');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Service URLs
const SERVICES = {
  user: process.env.USER_SERVICE_URL || 'http://user-service:4001',
  post: process.env.POST_SERVICE_URL || 'http://post-service:4002',
  chat: process.env.CHAT_SERVICE_URL || 'http://chat-service:4004',
  media: process.env.MEDIA_SERVICE_URL || 'http://media-service:4005',
};

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Route handlers for microservices

// User Service routes - parse body before proxying
app.use('/users', express.json(), createProxyMiddleware({
  target: SERVICES.user,
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('User service proxy error:', err.message);
    res.status(503).json({ error: 'User service unavailable' });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('[Proxy] Forwarding', req.method, req.path, 'to', SERVICES.user);
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('[Proxy] Received response from user-service:', proxyRes.statusCode);
  },
}));

// Post Service routes
app.use('/posts', createProxyMiddleware({
  target: SERVICES.post,
  changeOrigin: true,
  timeout: 60000,
  proxyTimeout: 60000,
  onError: (err, req, res) => {
    console.error('Post service proxy error:', err.message);
    res.status(503).json({ error: 'Post service unavailable' });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('[Proxy] Forwarding', req.method, req.path, 'to', SERVICES.post);
    // Rewrite body for POST/PUT/PATCH/DELETE requests
    if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') && req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
      proxyReq.end();
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('[Proxy] Received response from post-service:', proxyRes.statusCode);
  },
}));

// Community routes (proxied to Post Service)
app.use('/communities', createProxyMiddleware({
  target: SERVICES.post,
  changeOrigin: true,
  timeout: 60000,
  proxyTimeout: 60000,
  onError: (err, req, res) => {
    console.error('Community service proxy error:', err.message);
    res.status(503).json({ error: 'Community service unavailable' });
  },
  onProxyReq: (proxyReq, req, res) => {
    const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    console.log('[Proxy] Forwarding', req.method, req.path + queryString, 'to', SERVICES.post);
    // Rewrite body for POST/PUT/PATCH/DELETE requests
    if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') && req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
      proxyReq.end();
    }
  },
}));

// Chat Service routes
app.use('/chat', createProxyMiddleware({
  target: SERVICES.chat,
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('Chat service proxy error:', err.message);
    res.status(503).json({ error: 'Chat service unavailable' });
  },
}));

// Media Service routes
app.use('/media', createProxyMiddleware({
  target: SERVICES.media,
  changeOrigin: true,
  pathRewrite: {
    '^/media': '', // Remove /media prefix
  },
  onError: (err, req, res) => {
    console.error('Media service proxy error:', err.message);
    res.status(503).json({ error: 'Media service unavailable' });
  },
}));

// Helper function to search relevant posts for RAG
async function searchRelevantPosts(query, limit = 5) {
  try {
    // Search for posts containing relevant keywords
    const posts = await Post.find({
      $or: [
        { content: { $regex: query, $options: 'i' } },
        { title: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
      isDeleted: { $ne: true },
      isArchived: { $ne: true },
    })
      .sort({ upvotes: -1, createdAt: -1 })
      .limit(limit)
      .select('postId title content tags category upvotes authorAlias createdAt')
      .lean();

    return posts.map(post => ({
      postId: post.postId,
      title: post.title || 'Untitled Post',
      excerpt: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : ''),
      category: post.category,
      upvotes: post.upvotes,
      tags: post.tags,
    }));
  } catch (error) {
    console.error('[Aegis] Error searching posts:', error.message);
    return [];
  }
}

// Enhanced Aegis AI Chatbot with conversation history and RAG
app.post('/aegis/chat', async (req, res) => {
  try {
    const { message, conversationId, userId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('[Aegis] Chat request from user:', userId);
    console.log('[Aegis] Message:', message);

    // Generate or use existing conversation ID
    const convId = conversationId || `aegis_${userId}_${uuidv4()}`;

    // Get or create conversation
    let conversation = await AegisConversation.findOne({ conversationId: convId });

    if (!conversation) {
      conversation = new AegisConversation({
        conversationId: convId,
        userId: userId,
        messages: [],
      });
    }

    // Add user message to conversation history
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Search for relevant posts (RAG)
    console.log('[Aegis] Searching for relevant posts...');
    const relevantPosts = await searchRelevantPosts(message, 3);

    // Build context from conversation history (last 10 messages)
    const recentMessages = conversation.messages.slice(-10);
    const conversationContext = recentMessages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Aegis'}: ${msg.content}`)
      .join('\n');

    // Build context from relevant posts
    let postsContext = '';
    if (relevantPosts.length > 0) {
      postsContext = '\n\nRelevant posts from the Whistle platform:\n' +
        relevantPosts.map((post, idx) =>
          `${idx + 1}. [${post.category}] ${post.title}\n   ${post.excerpt}\n   (${post.upvotes} upvotes, Tags: ${post.tags.join(', ')})`
        ).join('\n\n');
    }

    // Create enhanced prompt with RAG and conversation history
    const systemPrompt = `You are Aegis AI, an intelligent and helpful assistant for Whistle - an anonymous whistleblowing platform where people share sensitive information about corruption, government issues, corporate misconduct, and other important societal concerns.

Your role:
- Help users find relevant information from existing posts (whistles)
- Answer questions about the platform and how it works
- Provide thoughtful analysis while respecting user privacy and anonymity
- Be supportive and understanding of whistleblowers
- Cite specific posts when referencing information
- Maintain a professional, empathetic, and informative tone

Platform features:
- Anonymous posting with generated aliases
- Categories: Corruption, Environment, Education, Military, Technology, Healthcare, Government, Corporate, Society
- Credibility token system for reputation
- Communities for topic-based discussions
- Encrypted messaging between users
- Post verification system

${postsContext}

Previous conversation:
${conversationContext}

Current question: ${message}

Please provide a helpful, accurate response. If you reference information from the posts above, mention the post number.`;

    // Call Gemini API
    console.log('[Aegis] Calling Gemini API...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    console.log('[Aegis] Response generated successfully');

    // Add Aegis response to conversation history
    conversation.messages.push({
      role: 'aegis',
      content: text,
      timestamp: new Date(),
      references: relevantPosts.map(post => ({
        postId: post.postId,
        title: post.title,
        excerpt: post.excerpt,
      })),
    });

    // Save conversation
    await conversation.save();
    console.log('[Aegis] Conversation saved:', convId);

    res.json({
      message: text,
      conversationId: convId,
      references: relevantPosts.map(post => ({
        postId: post.postId,
        title: post.title,
        category: post.category,
        upvotes: post.upvotes,
      })),
    });
  } catch (error) {
    console.error('[Aegis] Error:', error.message);
    res.status(500).json({
      error: 'Failed to get response',
      details: error.message
    });
  }
});

// Aegis search endpoint - enhanced with direct DB search
app.get('/aegis/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    console.log('[Aegis] Searching posts for:', q);

    // Search posts directly from database
    const posts = await Post.find({
      $or: [
        { content: { $regex: q, $options: 'i' } },
        { title: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ],
      isDeleted: { $ne: true },
      isArchived: { $ne: true },
    })
      .sort({ upvotes: -1, createdAt: -1 })
      .limit(20)
      .select('postId title content tags category upvotes downvotes authorAlias commentsCount createdAt')
      .lean();

    res.json(posts);
  } catch (error) {
    console.error('Aegis search error:', error.message);
    res.status(500).json({ error: 'Failed to search posts' });
  }
});

// Get conversation history for a user
app.get('/aegis/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('[Aegis] Fetching conversations for user:', userId);

    const conversations = await AegisConversation.find({ userId })
      .sort({ 'metadata.lastMessageAt': -1 })
      .select('conversationId metadata createdAt updatedAt')
      .limit(50)
      .lean();

    res.json(conversations);
  } catch (error) {
    console.error('[Aegis] Error fetching conversations:', error.message);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get specific conversation details
app.get('/aegis/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    console.log('[Aegis] Fetching conversation:', conversationId);

    const conversation = await AegisConversation.findOne({ conversationId }).lean();

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('[Aegis] Error fetching conversation:', error.message);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Delete a conversation
app.delete('/aegis/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    console.log('[Aegis] Deleting conversation:', conversationId);

    const conversation = await AegisConversation.findOne({ conversationId });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Verify user owns this conversation
    if (conversation.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await AegisConversation.deleteOne({ conversationId });

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('[Aegis] Error deleting conversation:', error.message);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const healthChecks = await Promise.allSettled([
      axios.get(`${SERVICES.user}/health`),
      axios.get(`${SERVICES.post}/health`),
      axios.get(`${SERVICES.chat}/health`),
    ]);

    const status = {
      gateway: 'ok',
      services: {
        user: healthChecks[0].status === 'fulfilled' ? 'ok' : 'error',
        post: healthChecks[1].status === 'fulfilled' ? 'ok' : 'error',
        chat: healthChecks[2].status === 'fulfilled' ? 'ok' : 'error',
      },
    };

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Whistle API Gateway',
    version: '1.0.0',
    services: Object.keys(SERVICES),
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Connected services:', SERVICES);
});
