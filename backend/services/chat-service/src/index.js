const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 4004;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/whistle', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Chat Service: MongoDB Connected'))
  .catch((err) => console.error('Chat Service: MongoDB Connection Error:', err));

const Message = require('../shared/models/Message');

// Helper: Generate conversation ID from two user IDs
function generateConversationId(userId1, userId2) {
  return [userId1, userId2].sort().join('_');
}

// REST API Routes

// Get all conversations for a user
app.get('/chat/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all messages where user is sender or receiver
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
        },
      },
    ]);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a conversation
app.get('/chat/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50 } = req.query;

    const messages = await Message.find({ conversationId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message (REST endpoint)
app.post('/chat/message', async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const conversationId = generateConversationId(senderId, receiverId);

    const message = new Message({
      messageId: uuidv4(),
      senderId,
      receiverId,
      content, // This should be encrypted on client-side
      conversationId,
    });

    await message.save();

    // Emit to WebSocket if receiver is connected
    io.to(receiverId).emit('new_message', message);

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Delete conversation (burn chat)
app.delete('/chat/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    await Message.deleteMany({ conversationId });
    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// WebSocket Handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join user's personal room for notifications
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Send message via WebSocket
  socket.on('send_message', async (data) => {
    try {
      const { senderId, receiverId, content } = data;

      const conversationId = generateConversationId(senderId, receiverId);

      const message = new Message({
        messageId: uuidv4(),
        senderId,
        receiverId,
        content, // Encrypted content
        conversationId,
      });

      await message.save();

      // Send to receiver
      io.to(receiverId).emit('new_message', message);

      // Confirm to sender
      socket.emit('message_sent', message);
    } catch (error) {
      console.error('WebSocket send error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Mark messages as read
  socket.on('mark_read', async (data) => {
    try {
      const { conversationId } = data;
      await Message.updateMany({ conversationId, isRead: false }, { isRead: true });
      socket.emit('marked_read', { conversationId });
    } catch (error) {
      console.error('Mark read error:', error);
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { receiverId, isTyping } = data;
    io.to(receiverId).emit('user_typing', { isTyping });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Chat Service is running' });
});

server.listen(PORT, () => {
  console.log(`Chat Service with WebSocket running on port ${PORT}`);
});
