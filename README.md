# Whistle - Anonymous Whistleblowing Platform

![Whistle Logo](https://via.placeholder.com/800x200/7c3aed/ffffff?text=Whistle+-+Truth+Should+Never+Be+Silenced)

**Whistle** is a production-grade, full-stack anonymous whistleblowing and discussion platform that combines the community features of Reddit, the simplicity of Twitter, and AI-powered moderation to ensure truth and authenticity.

## Features

### Core Functionality
- **Total Anonymity**: Random alias generation (e.g., Shadow_Wolf_423) with secure Clerk authentication
- **AI-Powered Moderation**: Automatic content verification for spam, AI-generated text, image manipulation, and NSFW content
- **Veil Token System**: Credibility-based reputation system rewarding truthful contributions
- **Aegis AI Chatbot**: Intelligent assistant that searches posts and the web to answer questions
- **Encrypted Chat**: End-to-end encrypted anonymous messaging with "burn conversation" feature
- **Communities**: Reddit-style topic-based communities for organized discussions
- **Rich Media Support**: Image uploads with NSFW blur protection
- **Real-time Updates**: WebSocket-powered live chat and notifications

### Technical Highlights
- **Microservices Architecture**: Scalable backend with 5 independent services
- **Next.js 14**: Modern React framework with App Router
- **MongoDB**: NoSQL database for flexible data storage
- **Docker**: Containerized deployment for easy orchestration
- **TypeScript**: Type-safe development across frontend
- **Framer Motion**: Smooth, buttery animations

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  • Home Feed    • Profile    • Communities    • Chat         │
│  • Aegis AI     • Explore    • Post Creation                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ API Gateway  │
                  │   (Port 4000)│
                  └──────┬───────┘
                         │
        ┌────────────────┼────────────────┬───────────────┐
        ▼                ▼                ▼               ▼
  ┌─────────┐     ┌─────────┐      ┌──────────┐   ┌──────────┐
  │  User   │     │  Post   │      │Moderation│   │   Chat   │
  │ Service │     │ Service │      │ Service  │   │ Service  │
  │(Port    │     │(Port    │      │(Port     │   │(Port     │
  │ 4001)   │     │ 4002)   │      │ 4003)    │   │ 4004)    │
  └────┬────┘     └────┬────┘      └────┬─────┘   └────┬─────┘
       │               │                 │              │
       └───────────────┴─────────────────┴──────────────┘
                              │
                              ▼
                     ┌────────────────┐
                     │   MongoDB      │
                     │  (Port 27017)  │
                     └────────────────┘
```

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Data Fetching**: Axios + React Query
- **Auth**: Clerk
- **Real-time**: Socket.io Client
- **Encryption**: CryptoJS

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB + Mongoose
- **Real-time**: Socket.io
- **API Gateway**: http-proxy-middleware
- **Containerization**: Docker + Docker Compose

### AI Services (Production Integrations)
- **Text Moderation**: GPTZero API, Sapling AI
- **Image Moderation**: Sightengine
- **Chatbot**: Google Gemini API
- **NSFW Detection**: Sightengine

## Project Structure

```
Whistle/
├── frontend/                      # Next.js Frontend
│   ├── src/
│   │   ├── app/                   # Next.js App Router pages
│   │   │   ├── (main)/
│   │   │   │   ├── home/         # Home feed page
│   │   │   │   └── layout.tsx
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/            # React components
│   │   │   ├── Navbar.tsx
│   │   │   ├── PostCard.tsx
│   │   │   ├── CreatePostModal.tsx
│   │   │   ├── AegisChat.tsx
│   │   │   └── Providers.tsx
│   │   ├── store/                 # Zustand stores
│   │   │   ├── userStore.ts
│   │   │   ├── postStore.ts
│   │   │   └── chatStore.ts
│   │   └── lib/                   # Utilities
│   │       ├── api.ts
│   │       └── services.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── .env.example
│
├── backend/                       # Backend Microservices
│   ├── services/
│   │   ├── api-gateway/          # Routes all requests (Port 4000)
│   │   │   ├── src/index.js
│   │   │   ├── package.json
│   │   │   └── Dockerfile
│   │   ├── user-service/         # User management (Port 4001)
│   │   │   ├── src/index.js
│   │   │   ├── package.json
│   │   │   └── Dockerfile
│   │   ├── post-service/         # Post CRUD (Port 4002)
│   │   │   ├── src/index.js
│   │   │   ├── package.json
│   │   │   └── Dockerfile
│   │   ├── moderation-service/   # AI moderation (Port 4003)
│   │   │   ├── src/index.js
│   │   │   ├── package.json
│   │   │   └── Dockerfile
│   │   └── chat-service/         # WebSocket chat (Port 4004)
│   │       ├── src/index.js
│   │       ├── package.json
│   │       └── Dockerfile
│   ├── shared/                    # Shared models
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Post.js
│   │   │   ├── Community.js
│   │   │   └── Message.js
│   │   └── package.json
│   └── .env.example
│
├── docker-compose.yml             # Docker orchestration
└── README.md                      # This file
```

## Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **Clerk Account** (free) - [Sign up here](https://clerk.com)

### Installation

#### 1. Clone the Repository
```bash
cd Whistle
```

#### 2. Setup Frontend

```bash
cd frontend
npm install
```

Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Edit `.env` and add your Clerk keys:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_GATEWAY=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4004
```

#### 3. Setup Backend

The backend uses Docker Compose, so no manual npm install is needed. However, you can optionally create a `.env` file:

```bash
cd ../backend
cp .env.example .env
```

#### 4. Start Backend Services with Docker

From the project root:

```bash
docker-compose up --build
```

This will start:
- MongoDB (Port 27017)
- API Gateway (Port 4000)
- User Service (Port 4001)
- Post Service (Port 4002)
- Moderation Service (Port 4003)
- Chat Service (Port 4004)

Wait for all services to show "running" status.

#### 5. Start Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

Frontend will be available at: **http://localhost:3000**

### Access the Application

1. Open **http://localhost:3000**
2. Sign up using Clerk (Google or email)
3. You'll be assigned a random anonymous alias
4. Start posting Whistles!

## Usage Guide

### Creating a Post (Whistle)

1. Click the **+** floating button
2. Write your content (max 5000 characters)
3. Add tags (#Government, #Corporate, etc.)
4. Optionally add media URL
5. Mark as NSFW if needed
6. Click "Post Whistle"

Your post will be sent to AI moderation and approved/rejected automatically.

### Using Aegis AI Chatbot

1. Click the **Aegis** button in the navbar
2. Ask questions like:
   - "What are the latest government whistles?"
   - "Summarize posts about corporate fraud"
   - "Find information on data leaks"
3. Aegis searches existing posts and provides intelligent answers

### Veil Token System

- **Earn tokens**: Upvotes on your posts (+2 per upvote)
- **Lose tokens**: Downvotes (-1), rejected posts (-5)
- **Higher tokens**: Better visibility and credibility
- **Starting balance**: 100 tokens

### Anonymous Chat

1. Go to **Chat** section
2. Select a user to message
3. Messages are encrypted on the client-side
4. Use "Burn Conversation" to delete all messages

## API Endpoints

### User Service (Port 4001)
- `POST /users` - Create new user
- `GET /users/profile/:clerkUserId` - Get user by Clerk ID
- `GET /users/:userId` - Get user by userId
- `PATCH /users/:userId/alias` - Update alias
- `POST /users/:userId/follow` - Follow user
- `PATCH /users/:userId/tokens` - Update Veil tokens

### Post Service (Port 4002)
- `GET /posts` - Get all posts (with pagination)
- `GET /posts/:postId` - Get single post
- `POST /posts` - Create new post
- `POST /posts/:postId/vote` - Vote on post
- `POST /posts/:postId/report` - Report post
- `DELETE /posts/:postId` - Delete post
- `GET /posts/trending` - Get trending posts

### Moderation Service (Port 4003)
- `POST /moderate` - Moderate a post (AI checks)

### Chat Service (Port 4004)
- `GET /chat/conversations/:userId` - Get conversations
- `GET /chat/:conversationId/messages` - Get messages
- `POST /chat/message` - Send message
- `DELETE /chat/:conversationId` - Delete conversation

### API Gateway (Port 4000)
- All above routes proxied through gateway
- `POST /aegis/chat` - Chat with Aegis AI
- `GET /aegis/search` - Search posts
- `GET /health` - Health check for all services

## AI Moderation Integration

### Production Setup

For production, integrate real AI APIs:

#### 1. GPTZero (AI Text Detection)
- Sign up: https://gptzero.me
- Get API key
- Add to backend `.env`: `GPTZERO_API_KEY=your_key`

#### 2. Sightengine (NSFW & Image Moderation)
- Sign up: https://sightengine.com
- Get credentials
- Add to `.env`:
  ```
  SIGHTENGINE_USER=your_user
  SIGHTENGINE_SECRET=your_secret
  ```

#### 3. Google Gemini (Aegis Chatbot)
- Get free API key: https://makersuite.google.com/app/apikey
- Add to `.env`: `GEMINI_API_KEY=your_key`

Update `moderation-service/src/index.js` and `api-gateway/src/index.js` to uncomment API calls.

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Backend (Railway/Render)

1. Push backend to separate GitHub repo
2. Deploy each service independently or use Railway monorepo
3. Set environment variables for each service
4. Connect services via internal URLs

### MongoDB (MongoDB Atlas)

Use MongoDB Atlas (free tier):
1. Create cluster at https://mongodb.com/atlas
2. Get connection string
3. Update `MONGODB_URI` in backend services

## Development

### Running Backend Services Locally (without Docker)

```bash
# Terminal 1 - MongoDB
mongod

# Terminal 2 - User Service
cd backend/services/user-service
npm install
npm run dev

# Terminal 3 - Post Service
cd backend/services/post-service
npm install
npm run dev

# Terminal 4 - Moderation Service
cd backend/services/moderation-service
npm install
npm run dev

# Terminal 5 - Chat Service
cd backend/services/chat-service
npm install
npm run dev

# Terminal 6 - API Gateway
cd backend/services/api-gateway
npm install
npm run dev
```

### Code Structure Guidelines

- **Frontend**: Use TypeScript, follow component-based architecture
- **Backend**: Keep services independent, communicate via API Gateway
- **Database**: Use Mongoose schemas from `shared/models`
- **Styling**: Use Tailwind utility classes, maintain dark theme
- **Animations**: Use Framer Motion for smooth transitions

## Troubleshooting

### Docker Issues

**Problem**: Services not connecting
```bash
docker-compose down
docker-compose up --build
```

**Problem**: Port already in use
- Stop services using ports 3000, 4000-4004, 27017
- Or change ports in `docker-compose.yml`

### Frontend Issues

**Problem**: Clerk auth not working
- Verify `.env` has correct Clerk keys
- Check Clerk dashboard for allowed domains

**Problem**: API calls failing
- Ensure backend is running
- Check `NEXT_PUBLIC_API_GATEWAY` points to correct URL

### Backend Issues

**Problem**: MongoDB connection failed
- Ensure MongoDB container is running: `docker ps`
- Check connection string in service env variables

**Problem**: Services can't communicate
- Verify Docker network: `docker network ls`
- Check service URLs in API Gateway config

## Roadmap

- [ ] Profile pages with post history
- [ ] Community creation and management
- [ ] Advanced search with filters
- [ ] Media upload to Cloudinary
- [ ] Email notifications for important updates
- [ ] Mobile app (React Native)
- [ ] Admin moderation dashboard
- [ ] Blockchain-based verification (optional)
- [ ] Multi-language support

## Contributing

This is a demonstration project. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Security Notes

- **Anonymity**: User IDs are pseudonymous, not linked to real identity
- **Encryption**: Chat messages encrypted with CryptoJS (client-side)
- **Moderation**: AI scans all content before approval
- **API Keys**: Never commit real API keys to version control
- **Authentication**: Clerk handles secure auth with JWT tokens

## License

This project is for educational and demonstration purposes.

## Support

For issues or questions:
- Check troubleshooting section above
- Review code comments for implementation details
- Refer to service documentation in respective folders

---

*"Truth should never be silenced. Anonymity should never shield lies."*
