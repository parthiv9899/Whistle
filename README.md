<div align="center">

# 🔔 Whistle

### *Where Truth Finds Its Voice*

[![Next.js](https://img.shields.io/badge/Next.js-14.1.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18-green?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)

**Whistle** is a production-grade anonymous whistleblowing platform that empowers individuals to expose corruption, share critical information, and engage in meaningful discussions—all while maintaining complete anonymity. Built with cutting-edge AI technology and enterprise-grade security.

[Features](#-key-features) • [Architecture](#-architecture) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [API Documentation](#-api-documentation)

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Setup](#-environment-setup)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Security Features](#-security-features)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🎯 Overview

**Whistle** is a sophisticated whistleblowing platform designed for the modern era. It combines the community-driven aspects of Reddit, the simplicity of Twitter, and the power of AI to create a safe haven for truth-tellers worldwide.

### Why Whistle?

- **Absolute Anonymity**: Auto-generated aliases with secure authentication
- **AI-Powered Intelligence**: Aegis AI assistant with RAG (Retrieval-Augmented Generation)
- **Privacy First**: EXIF metadata stripping, encrypted messaging, anonymous posting
- **Community Driven**: Upvoting, communities, credibility tokens, and engagement
- **Real-Time**: WebSocket-powered chat and live notifications
- **Enterprise Ready**: Microservices architecture, Docker containerization, MongoDB Atlas

---

## 🚀 Key Features

### 🎭 Complete Anonymity System

- **Auto-Generated Aliases**: Users receive random aliases like `Shadow_Wolf_742` or `Silent_Raven_319`
- **Alias Customization**: Change your alias with a 7-day cooldown period
- **Anonymous Posting**: Option to post without revealing even your alias
- **Privacy Protection**: Automatic EXIF metadata stripping from uploaded images

### 🤖 Aegis AI - Intelligent Assistant *(Standout Feature)*

The crown jewel of Whistle is **Aegis AI**, powered by Google Gemini 2.5 Flash with advanced **RAG (Retrieval-Augmented Generation)**:

- **Intelligent Post Search**: Searches through the database to find relevant whistleblows
- **Context-Aware Responses**: Maintains conversation history (last 10 messages) for contextual understanding
- **Citations & References**: Returns post citations with metadata (upvotes, category, excerpt)
- **Platform Guidance**: Helps users navigate features and understand the platform
- **Floating Widget**: Accessible from any page + full-page dedicated interface

**How RAG Works:**
1. User asks a question
2. Aegis searches MongoDB for relevant posts using regex and sorting algorithms
3. Post content, tags, and metadata are added to the AI context
4. Gemini generates an intelligent response with citations
5. References are returned with clickable links to original posts

### 💎 Veil Token System (Credibility Economy)

A reputation-based economy that rewards truth and punishes misinformation:

- **Starting Balance**: 10 tokens per new user
- **Transaction Types**:
  - `earned` - Receive upvotes on posts/comments
  - `spent` - Creating posts or taking actions
  - `bonus` - Community rewards
  - `penalty` - Downvotes or rule violations
- **Transaction History**: Complete audit trail of all token movements
- **Reputation Display**: Public credibility score visible on profiles

### 🔒 End-to-End Encrypted Messaging

Secure, anonymous communication between users:

- **Client-Side Encryption**: Messages encrypted with crypto-js before transmission
- **Public Key Management**: Each user has a unique public key for encryption
- **Real-Time Delivery**: Socket.IO for instant message delivery
- **Burn Conversation**: Permanently delete entire conversation threads
- **Typing Indicators**: Live typing status
- **Read Receipts**: Message read/unread status

### 📱 Rich Post Creation & Management

Comprehensive content creation and curation:

- **Categories**: Corruption, Government, Corporate, Technology, Healthcare, Education, Environment, Military, Society, Other
- **Post Types**: Personal Experience, Leaked Info, Public Concern
- **Multi-Media Support**: Upload up to 5 files (images, PDFs, documents, videos)
- **NSFW Protection**: Automatic content blur with toggle
- **Tags System**: Hashtag-based categorization
- **Post Actions**:
  - **Archive**: Soft delete (only owner can see)
  - **Delete**: Permanent removal with cascade deletion of all comments
  - **Edit**: Update post content and metadata
- **Character Limits**:
  - Title: 200 characters
  - Content: 5000 characters
  - Comments: 2000 characters

### 👥 Communities

Reddit-style topic-based communities for organized discussions:

- **Create Communities**: Users can establish new communities
- **Community Management**: Creators have full control
- **Join/Leave**: Seamless membership system
- **Creator Protection**: Creators cannot leave (must transfer or delete)
- **Community Posts**: Isolated post feeds per community

### ⚡ Voting & Engagement System

Democratic content curation:

- **Upvote/Downvote**: Vote on posts and comments
- **Vote Tracking**: Prevents duplicate voting, allows vote changes
- **Trending Algorithm**: Combines upvotes + recency for trending posts
- **Comment Nesting**: Multi-level threaded discussions
- **Vote Indicators**: Visual feedback on vote counts

### 📸 Advanced Media Handling

Privacy-focused file upload system:

- **Metadata Stripping**: Removes GPS coordinates, camera info, timestamps using Sharp
- **File Validation**: Type and size restrictions (50MB max)
- **Supported Formats**:
  - Images: JPEG, JPG, PNG, GIF
  - Documents: PDF, DOC, DOCX, TXT
  - Videos: MP4, WEBM
- **Multiple Uploads**: Up to 5 files per post
- **Secure Storage**: Organized file structure with unique filenames

### 📊 User Profiles & Social Features

Comprehensive user identity and social networking:

- **Profile Information**: Alias, avatar, bio (500 char max)
- **Follow/Follower System**: Called "connections" for privacy
- **Post History**: All user posts with filtering (archived/active)
- **Comment History**: User's comment activity
- **Credibility Display**: Public token balance
- **Profile By Alias**: Discover users via their alias

---

## 🏗️ Architecture

### Microservices Overview

Whistle employs a **microservices architecture** for scalability, maintainability, and fault tolerance:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                         │
│         Port: 3000 | TypeScript | App Router                     │
│  Pages: Home • Communities • Profile • Chat • Aegis AI           │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP + WebSocket
                            ▼
                    ┌───────────────┐
                    │  API Gateway  │
                    │   Port: 4000  │
                    │  Aegis AI RAG │
                    └───────┬───────┘
                            │
        ┌───────────────────┼──────────────────┬─────────────┐
        │                   │                  │             │
        ▼                   ▼                  ▼             ▼
  ┌──────────┐      ┌──────────┐      ┌──────────┐  ┌──────────┐
  │   User   │      │   Post   │      │   Chat   │  │  Media   │
  │ Service  │      │ Service  │      │ Service  │  │ Service  │
  │Port: 4001│      │Port: 4002│      │Port: 4004│  │Port: 4005│
  └────┬─────┘      └────┬─────┘      └────┬─────┘  └────┬─────┘
       │                 │                  │             │
       │                 │                  │             │
       └─────────────────┴──────────────────┴─────────────┘
                                │
                                ▼
                        ┌───────────────┐
                        │   MongoDB     │
                        │  Port: 27017  │
                        │  (Atlas Cloud)│
                        └───────────────┘
```

### Service Responsibilities

| Service | Port | Responsibilities |
|---------|------|------------------|
| **API Gateway** | 4000 | Request routing, Aegis AI with RAG, proxy middleware, health checks |
| **User Service** | 4001 | User profiles, authentication sync, follow/follower, alias management, public keys |
| **Post Service** | 4002 | Posts, comments, communities, voting system, token transactions, archive/delete |
| **Chat Service** | 4004 | Real-time messaging, Socket.IO, encrypted chat, conversation management, typing indicators |
| **Media Service** | 4005 | File uploads, metadata stripping, multi-file support, secure file serving |

### Communication Patterns

- **API Gateway → Services**: HTTP proxying via `http-proxy-middleware`
- **Frontend → API Gateway**: REST API calls via Axios
- **Frontend ↔ Chat Service**: WebSocket connection via Socket.IO
- **Services → MongoDB**: Mongoose ODM with shared models
- **Inter-Service**: Direct HTTP calls when needed

---

## 🛠️ Tech Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.1.3 | React framework with App Router for server-side rendering |
| **TypeScript** | 5.x | Type-safe development |
| **Tailwind CSS** | 3.x | Utility-first CSS framework for responsive design |
| **Framer Motion** | 11.0.8 | Smooth animations and transitions |
| **Clerk** | 5.0.0 | Authentication provider with JWT |
| **Zustand** | 4.5.2 | Lightweight state management |
| **TanStack React Query** | 5.28.0 | Server state management and caching |
| **Axios** | 1.6.7 | HTTP client for API requests |
| **Socket.IO Client** | 4.7.5 | Real-time WebSocket communication |
| **crypto-js** | 4.2.0 | Client-side encryption for messaging |
| **Lucide React** | Latest | Modern icon library |
| **React Hot Toast** | 2.4.1 | Toast notifications |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express.js** | 4.18.3 | Web framework for REST APIs |
| **MongoDB** | Latest | NoSQL database |
| **Mongoose** | 8.2.0 | ODM for MongoDB with schema validation |
| **Socket.IO** | 4.7.5 | WebSocket server for real-time features |
| **http-proxy-middleware** | 2.0.6 | API Gateway proxy routing |
| **Google Generative AI** | 0.24.1 | Gemini 2.5 Flash for Aegis AI |
| **Multer** | 1.4.5 | Multipart form data handling for uploads |
| **Sharp** | 0.33.0 | Image processing and EXIF metadata removal |
| **UUID** | 9.0.1 | Unique identifier generation |
| **dotenv** | Latest | Environment variable management |
| **CORS** | Latest | Cross-origin resource sharing |

### DevOps & Infrastructure

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization of all backend services |
| **Docker Compose** | Multi-container orchestration |
| **MongoDB Atlas** | Cloud-hosted database (production) |
| **Vercel** | Frontend deployment platform (recommended) |
| **Railway/Render** | Backend deployment (recommended) |

---

## 📁 Project Structure

```
Whistle/
│
├── frontend/                           # Next.js 14 Frontend Application
│   ├── src/
│   │   ├── app/                        # App Router Pages
│   │   │   ├── (main)/                # Main layout group
│   │   │   │   ├── home/              # Home feed page
│   │   │   │   ├── feed/              # Alternative feed view
│   │   │   │   ├── new/               # Create post page
│   │   │   │   ├── post/[id]/         # Post detail page (dynamic)
│   │   │   │   ├── communities/       # Communities listing
│   │   │   │   ├── profile/           # User profile
│   │   │   │   ├── user/[alias]/      # Public user profile (dynamic)
│   │   │   │   ├── aegis/             # Full-page Aegis AI interface
│   │   │   │   └── layout.tsx         # Main layout wrapper
│   │   │   ├── sign-in/               # Clerk sign-in page
│   │   │   ├── sign-up/               # Clerk sign-up page
│   │   │   ├── globals.css            # Global styles + Tailwind
│   │   │   ├── layout.tsx             # Root layout
│   │   │   └── page.tsx               # Landing page
│   │   │
│   │   ├── components/                 # Reusable React Components
│   │   │   ├── AegisChat.tsx          # Floating AI chatbot widget
│   │   │   ├── PostCard.tsx           # Post display card
│   │   │   ├── CommunityCard.tsx      # Community card component
│   │   │   ├── CreatePostModal.tsx    # Post creation modal
│   │   │   ├── LayoutWrapper.tsx      # Layout with navigation
│   │   │   ├── Topbar.tsx             # Top navigation bar
│   │   │   ├── LeftNav.tsx            # Left sidebar navigation
│   │   │   ├── RightRail.tsx          # Right sidebar (trending, etc.)
│   │   │   ├── FloatingActionButton.tsx # Quick post FAB
│   │   │   └── Providers.tsx          # Context providers wrapper
│   │   │
│   │   ├── store/                      # Zustand State Management
│   │   │   ├── userStore.ts           # User profile & auth state
│   │   │   ├── postStore.ts           # Posts collection state
│   │   │   ├── communityStore.ts      # Communities data
│   │   │   ├── chatStore.ts           # Chat UI state
│   │   │   └── uiStore.ts             # Global UI state
│   │   │
│   │   ├── lib/                        # Utilities & Services
│   │   │   ├── api.ts                 # Axios instance configuration
│   │   │   └── services.ts            # API service functions
│   │   │
│   │   ├── hooks/                      # Custom React Hooks
│   │   │   └── useAuth.ts             # Authentication hook
│   │   │
│   │   └── contexts/                   # React Contexts
│   │       └── AuthContext.tsx        # Auth context provider
│   │
│   ├── public/                         # Static assets
│   │   └── images/                    # Image assets
│   ├── package.json                    # Dependencies
│   ├── tsconfig.json                   # TypeScript config
│   ├── tailwind.config.ts              # Tailwind configuration
│   ├── next.config.js                  # Next.js configuration
│   └── .env.example                    # Environment variables template
│
├── backend/                            # Backend Microservices
│   ├── services/
│   │   ├── api-gateway/               # API Gateway Service (Port 4000)
│   │   │   ├── src/
│   │   │   │   └── index.js          # Gateway server + Aegis AI
│   │   │   ├── package.json
│   │   │   └── Dockerfile
│   │   │
│   │   ├── user-service/              # User Management Service (Port 4001)
│   │   │   ├── src/
│   │   │   │   └── index.js          # User CRUD, follow, alias
│   │   │   ├── package.json
│   │   │   └── Dockerfile
│   │   │
│   │   ├── post-service/              # Post Management Service (Port 4002)
│   │   │   ├── src/
│   │   │   │   └── index.js          # Posts, comments, communities
│   │   │   ├── package.json
│   │   │   └── Dockerfile
│   │   │
│   │   ├── chat-service/              # Real-Time Chat Service (Port 4004)
│   │   │   ├── src/
│   │   │   │   └── index.js          # Socket.IO server, messaging
│   │   │   ├── package.json
│   │   │   └── Dockerfile
│   │   │
│   │   └── media-service/             # Media Upload Service (Port 4005)
│   │       ├── src/
│   │       │   └── index.js          # File uploads, metadata stripping
│   │       ├── uploads/              # Local file storage
│   │       ├── package.json
│   │       └── Dockerfile
│   │
│   ├── shared/                         # Shared Code Across Services
│   │   ├── models/                    # Mongoose Schemas
│   │   │   ├── User.js               # User model
│   │   │   ├── Post.js               # Post model
│   │   │   ├── Comment.js            # Comment model
│   │   │   ├── Community.js          # Community model
│   │   │   ├── Message.js            # Chat message model
│   │   │   ├── AegisConversation.js  # Aegis AI conversation model
│   │   │   └── VeilTransaction.js    # Token transaction model
│   │   └── package.json
│   │
│   └── .env.example                    # Backend environment template
│
├── docker-compose.yml                  # Docker Compose orchestration
├── .gitignore                          # Git ignore rules
└── README.md                           # This file
```

---

## ⚡ Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **Git** - [Download](https://git-scm.com/)
- **Clerk Account** (Free) - [Sign up](https://clerk.com/)
- **Google Gemini API Key** (Free) - [Get Key](https://makersuite.google.com/app/apikey)

### Installation Steps

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/Whistle.git
cd Whistle
```

#### 2️⃣ Setup Backend Services

Navigate to backend and configure environment:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
MONGODB_URI=mongodb://mongo:27017/whistle
USER_SERVICE_URL=http://user-service:4001
POST_SERVICE_URL=http://post-service:4002
CHAT_SERVICE_URL=http://chat-service:4004
MEDIA_SERVICE_URL=http://media-service:4005
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_here
```

#### 3️⃣ Setup Frontend

Navigate to frontend and install dependencies:

```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `.env` and add your Clerk credentials:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here
NEXT_PUBLIC_API_GATEWAY=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4004
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home
```

#### 4️⃣ Start Backend Services (Docker)

From the project root directory:

```bash
docker-compose up --build
```

This will start:
- ✅ MongoDB (Port 27017)
- ✅ API Gateway (Port 4000)
- ✅ User Service (Port 4001)
- ✅ Post Service (Port 4002)
- ✅ Chat Service (Port 4004)
- ✅ Media Service (Port 4005)

Wait for all services to show "Server running on port..." messages.

#### 5️⃣ Start Frontend (Development)

In a new terminal:

```bash
cd frontend
npm run dev
```

Frontend will be available at: **http://localhost:3000**

#### 6️⃣ Access the Application

1. Open your browser to **http://localhost:3000**
2. Click **Sign Up** to create an account via Clerk
3. You'll be automatically assigned a random alias (e.g., `Shadow_Wolf_742`)
4. Start exploring, posting, and using Aegis AI!

---

## 🔧 Environment Setup

### Backend Environment Variables

Create `backend/.env` with the following:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://mongo:27017/whistle` |
| `USER_SERVICE_URL` | Internal URL for User Service | `http://user-service:4001` |
| `POST_SERVICE_URL` | Internal URL for Post Service | `http://post-service:4002` |
| `CHAT_SERVICE_URL` | Internal URL for Chat Service | `http://chat-service:4004` |
| `MEDIA_SERVICE_URL` | Internal URL for Media Service | `http://media-service:4005` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `GEMINI_API_KEY` | Google Gemini API key for Aegis AI | `AIza...` |

### Frontend Environment Variables

Create `frontend/.env` with the following:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk secret key | `sk_test_...` |
| `NEXT_PUBLIC_API_GATEWAY` | API Gateway URL | `http://localhost:4000` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL for chat | `ws://localhost:4004` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in page route | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up page route | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Redirect after sign-in | `/home` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Redirect after sign-up | `/home` |

---

## 📚 API Documentation

### User Service API (`/users`)

#### Create User
```http
POST /users
Content-Type: application/json

{
  "clerkUserId": "user_abc123",
  "alias": "Shadow_Wolf_742"
}
```

#### Get User Profile
```http
GET /users/profile/:clerkUserId
GET /users/:userId
GET /users/me
GET /users/by-alias/:alias
```

#### Update Profile
```http
PATCH /users/me/edit
Content-Type: application/json

{
  "alias": "NewAlias_123",
  "bio": "Whistleblower for truth",
  "avatarUrl": "https://..."
}
```

#### Follow/Unfollow User
```http
POST /users/:userId/follow
DELETE /users/:userId/follow
```

#### Get User Data
```http
GET /users/:userId/connections       # Get followers + following
GET /users/:userId/posts             # Get user's posts
GET /users/:userId/comments          # Get user's comments
```

### Post Service API (`/posts`)

#### Get Posts
```http
GET /posts?page=1&limit=10&sort=trending&category=corruption&communityId=123
```

Query Parameters:
- `page` - Page number (default: 1)
- `limit` - Posts per page (default: 10)
- `sort` - `trending`, `new`, `top` (default: trending)
- `category` - Filter by category
- `communityId` - Filter by community

#### Create Post
```http
POST /posts
Content-Type: application/json

{
  "title": "Corruption in Government",
  "content": "Detailed information...",
  "category": "corruption",
  "postType": "leaked_info",
  "tags": ["government", "corruption"],
  "attachments": [
    {
      "url": "http://...",
      "type": "image",
      "filename": "evidence.jpg"
    }
  ],
  "isNSFW": false,
  "isAnonymous": true,
  "communityId": null
}
```

#### Vote on Post
```http
POST /posts/:postId/vote
Content-Type: application/json

{
  "userId": "user123",
  "voteType": "upvote"  // or "downvote"
}
```

#### Archive/Delete Post
```http
POST /posts/:postId/archive          # Soft delete (toggle)
DELETE /posts/:postId                # Permanent delete
```

#### Comments
```http
GET /posts/:postId/comments          # Get all comments
POST /posts/:postId/comments         # Create comment

{
  "content": "This is important!",
  "authorId": "user123",
  "parentCommentId": null  // For nested replies
}
```

#### Vote on Comment
```http
POST /comments/:commentId/vote
Content-Type: application/json

{
  "userId": "user123",
  "voteType": "upvote"
}
```

### Community Service API (`/communities`)

#### Get Communities
```http
GET /communities                      # List all
GET /communities/:communityId         # Get single community
GET /communities/:communityId/posts   # Get community posts
```

#### Create Community
```http
POST /communities
Content-Type: application/json

{
  "name": "Tech Whistleblowers",
  "description": "Expose tech industry secrets",
  "bannerUrl": "https://...",
  "rules": ["Be respectful", "No spam"]
}
```

#### Join/Leave Community
```http
POST /communities/:communityId/join
POST /communities/:communityId/leave
```

### Aegis AI API (`/aegis`)

#### Chat with Aegis AI
```http
POST /aegis/chat
Content-Type: application/json

{
  "userId": "user123",
  "message": "What are the latest corruption posts?",
  "conversationId": "conv_456"  // Optional, for continuing conversation
}

Response:
{
  "response": "Here are the latest corruption posts...",
  "conversationId": "conv_456",
  "references": [
    {
      "postId": "post123",
      "title": "Government Scandal",
      "excerpt": "...",
      "upvotes": 142,
      "category": "corruption"
    }
  ]
}
```

#### Search Posts
```http
GET /aegis/search?query=corruption&category=government&limit=10
```

#### Get Conversations
```http
GET /aegis/conversations/:userId                # Get all conversations
GET /aegis/conversation/:conversationId         # Get specific conversation
DELETE /aegis/conversation/:conversationId      # Delete conversation
```

### Chat Service API (`/chat`)

#### REST Endpoints
```http
GET /chat/conversations/:userId                 # Get user's conversations
GET /chat/:conversationId/messages              # Get messages in conversation
POST /chat/message                              # Send message (also use WebSocket)
DELETE /chat/:conversationId                    # Burn conversation
```

#### WebSocket Events

**Client → Server:**
- `join` - Join a conversation room
- `send_message` - Send encrypted message
- `typing` - Notify typing status
- `mark_read` - Mark messages as read

**Server → Client:**
- `new_message` - Receive new message
- `user_typing` - User is typing notification
- `message_read` - Message read status update

### Media Service API (`/media`)

#### Upload Files
```http
POST /media/upload
Content-Type: multipart/form-data

file: [binary data]

Response:
{
  "url": "http://localhost:4005/media/uploads/filename.jpg",
  "type": "image",
  "filename": "filename.jpg"
}
```

#### Upload Multiple Files
```http
POST /media/upload/multiple
Content-Type: multipart/form-data

files: [file1, file2, file3]  // Max 5 files

Response:
{
  "files": [
    {
      "url": "...",
      "type": "image",
      "filename": "file1.jpg"
    },
    ...
  ]
}
```

#### Delete File
```http
DELETE /media/files/:filename
```

### Veil Token Transactions

#### Get Token History
```http
GET /users/:userId/veil-transactions?page=1&limit=20
```

---

## 🗄️ Database Schema

### User Model

```javascript
{
  userId: String,           // UUID (indexed)
  clerkUserId: String,      // Clerk ID (unique, indexed)
  alias: String,            // Unique username (e.g., "Shadow_Wolf_742")
  avatarUrl: String,        // Profile picture URL
  bio: String,              // Max 500 characters
  credibilityTokens: Number, // Veil token balance (default: 10)
  followers: [String],      // Array of userIds
  following: [String],      // Array of userIds
  publicKey: String,        // For encrypted messaging
  joinedAt: Date,
  lastAliasChange: Date,    // For 7-day cooldown
  createdAt: Date,
  updatedAt: Date
}

Indexes: userId, clerkUserId
```

### Post Model

```javascript
{
  postId: String,           // UUID (indexed)
  authorId: String,         // User ID (indexed)
  authorAlias: String,      // Snapshot of alias at post time
  title: String,            // Max 200 characters
  content: String,          // Max 5000 characters
  attachments: [            // Array of file objects
    {
      url: String,
      type: String,         // "image", "document", "video"
      filename: String
    }
  ],
  category: String,         // Enum: corruption, government, etc.
  postType: String,         // Enum: personal_experience, leaked_info, public_concern
  tags: [String],           // Hashtags
  upvotes: Number,          // Upvote count
  downvotes: Number,        // Downvote count
  upvotedBy: [String],      // Array of userIds
  downvotedBy: [String],    // Array of userIds
  isNSFW: Boolean,
  isAnonymous: Boolean,
  communityId: String,      // Optional community association
  commentsCount: Number,    // Denormalized count
  isArchived: Boolean,      // Soft delete flag (indexed)
  isDeleted: Boolean,       // Hard delete flag (indexed)
  archivedAt: Date,
  deletedAt: Date,
  createdAt: Date (indexed),
  updatedAt: Date
}

Indexes:
  - { upvotes: -1, createdAt: -1 }  // Trending
  - { category: 1, createdAt: -1 }   // Category filter
  - { authorId: 1, createdAt: -1 }   // User posts
```

### Comment Model

```javascript
{
  commentId: String,        // UUID (indexed)
  postId: String,           // Parent post (indexed)
  authorId: String,         // User ID
  authorAlias: String,      // Snapshot of alias
  content: String,          // Max 2000 characters
  parentCommentId: String,  // For nested replies (null for top-level)
  upvotes: Number,
  downvotes: Number,
  upvotedBy: [String],
  downvotedBy: [String],
  isDeleted: Boolean,
  createdAt: Date (indexed),
  updatedAt: Date
}

Indexes:
  - { postId: 1, createdAt: -1 }
```

### Community Model

```javascript
{
  communityId: String,      // UUID (indexed)
  name: String,             // Unique community name
  description: String,
  bannerUrl: String,
  creatorId: String,        // Creator user ID
  members: [String],        // Array of member userIds
  posts: [String],          // Array of postIds
  rules: [String],          // Community rules
  createdAt: Date,
  updatedAt: Date
}

Indexes: communityId, name (unique)
```

### Message Model

```javascript
{
  messageId: String,        // UUID
  senderId: String,         // User ID (indexed)
  receiverId: String,       // User ID (indexed)
  content: String,          // Encrypted content
  conversationId: String,   // Conversation ID (indexed)
  timestamp: Date,
  isRead: Boolean
}

Indexes:
  - { conversationId: 1, timestamp: -1 }
  - { senderId: 1 }
  - { receiverId: 1 }
```

### AegisConversation Model

```javascript
{
  conversationId: String,   // UUID (indexed)
  userId: String,           // User ID (indexed)
  messages: [
    {
      role: String,         // "user" or "aegis"
      content: String,      // Message content
      timestamp: Date,
      references: [         // Only for Aegis responses
        {
          postId: String,
          title: String,
          excerpt: String
        }
      ]
    }
  ],
  createdAt: Date,
  updatedAt: Date,
  metadata: {
    totalMessages: Number,
    lastMessageAt: Date
  }
}

Indexes:
  - { userId: 1, updatedAt: -1 }
  - { conversationId: 1 }
```

### VeilTransaction Model

```javascript
{
  transactionId: String,    // UUID (indexed)
  userId: String,           // User ID (indexed)
  amount: Number,           // Positive or negative
  type: String,             // Enum: earned, spent, bonus, penalty
  reason: String,           // Description of transaction
  relatedPostId: String,    // Optional post reference
  relatedCommentId: String, // Optional comment reference
  balanceAfter: Number,     // Token balance after transaction
  createdAt: Date (indexed)
}

Indexes:
  - { userId: 1, createdAt: -1 }
```

---

## 🔐 Security Features

### Privacy Protection

1. **EXIF Metadata Stripping**
   - Removes GPS coordinates from images
   - Strips camera information
   - Removes timestamps and device data
   - Uses Sharp library for processing

2. **Anonymous Aliases**
   - Auto-generated on signup
   - No real name exposure
   - Customizable with cooldown

3. **Anonymous Posting**
   - Option to hide even your alias
   - Complete content anonymity

### Encryption

1. **End-to-End Chat Encryption**
   - Client-side encryption with crypto-js
   - AES-256 encryption standard
   - Public key distribution
   - Messages stored encrypted

2. **JWT Authentication**
   - Clerk-managed tokens
   - Secure session handling
   - Automatic token refresh

### Access Control

- **Authentication Required**: Most endpoints require valid JWT
- **User Ownership**: Users can only edit/delete their own content
- **Creator Protection**: Community creators cannot leave without transfer
- **Archive Privacy**: Only post owner can see archived posts

### Data Validation

- Input sanitization on all endpoints
- File type restrictions
- File size limits (50MB)
- Character limits on all text fields
- CORS configuration for frontend-only access

---

## 🚀 Deployment

### Production Deployment Guide

#### Frontend Deployment (Vercel)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Visit [vercel.com](https://vercel.com/)
   - Click "New Project"
   - Import your GitHub repository
   - Root directory: `frontend`

3. **Configure Environment Variables**
   Add all variables from `.env` in Vercel dashboard

4. **Deploy**
   - Click "Deploy"
   - Vercel will auto-build and deploy

**Production URL**: `https://your-app.vercel.app`

#### Backend Deployment (Railway)

1. **Push Backend to Separate Repo** (Optional)
   ```bash
   # Or use Railway monorepo support
   ```

2. **Deploy Each Service**
   - Visit [railway.app](https://railway.app/)
   - Create new project
   - Deploy from GitHub
   - Add each service separately

3. **Configure Services**
   - Set environment variables for each service
   - Configure internal networking
   - Update service URLs

4. **MongoDB Atlas Setup**
   - Create cluster at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
   - Get connection string
   - Update `MONGODB_URI` in all services

#### Environment Variables for Production

**Frontend (.env.production)**:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_API_GATEWAY=https://your-gateway.railway.app
NEXT_PUBLIC_WS_URL=wss://your-chat-service.railway.app
```

**Backend (.env.production)**:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/whistle
USER_SERVICE_URL=https://user-service.railway.app
POST_SERVICE_URL=https://post-service.railway.app
CHAT_SERVICE_URL=https://chat-service.railway.app
MEDIA_SERVICE_URL=https://media-service.railway.app
FRONTEND_URL=https://your-app.vercel.app
GEMINI_API_KEY=your_production_key
```

---

## 🤝 Contributing

We welcome contributions to Whistle! Here's how you can help:

### Development Workflow

1. **Fork the Repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**
   - Follow existing code style
   - Add comments for complex logic
   - Test your changes locally

4. **Commit with Conventional Commits**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

   Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

5. **Push and Create PR**
   ```bash
   git push origin feature/amazing-feature
   ```

### Code Style Guidelines

- **Frontend**: Use TypeScript, follow React best practices
- **Backend**: Use ESLint, maintain service independence
- **Commits**: Conventional commits format
- **Documentation**: Update README for new features

---

## 📄 License

This project is for **educational and demonstration purposes**.

---

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Clerk** - Seamless authentication
- **Google** - Gemini AI for Aegis
- **MongoDB** - Flexible database
- **Socket.IO** - Real-time magic
- **Sharp** - Image processing
- **Open Source Community** - For all the incredible tools

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/Whistle/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/Whistle/discussions)
- **Email**: support@whistle.example.com

---

<div align="center">

### 🔔 Built with passion for truth and transparency

**Whistle** - *Where anonymity meets accountability*

[⭐ Star this repo](https://github.com/yourusername/Whistle) • [🐛 Report Bug](https://github.com/yourusername/Whistle/issues) • [💡 Request Feature](https://github.com/yourusername/Whistle/issues)

---

*"Truth should never be silenced. Anonymity should never shield lies."*

**Made with ❤️ by the Whistle Team**

</div>
