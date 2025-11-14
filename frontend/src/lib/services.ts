import apiClient from './api';
import { User } from '@/store/userStore';
import { Post } from '@/store/postStore';

// User Service APIs
export const userService = {
  getCurrentUser: async (clerkUserId: string): Promise<User> => {
    const response = await apiClient.get(`/users/profile/${clerkUserId}`);
    return response.data;
  },

  createUser: async (clerkUserId: string): Promise<User> => {
    const response = await apiClient.post('/users', { clerkUserId });
    return response.data;
  },

  updateAlias: async (userId: string, newAlias: string): Promise<User> => {
    const response = await apiClient.patch(`/users/${userId}/alias`, { alias: newAlias });
    return response.data;
  },

  getUserProfile: async (userId: string): Promise<User> => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  connectUser: async (userId: string, targetUserId: string) => {
    console.log('[connectUser] Sending request:', { userId, targetUserId });
    const response = await apiClient.post(`/users/${userId}/follow`, { targetUserId });
    console.log('[connectUser] Response:', response.data);
    return response.data;
  },

  disconnectUser: async (userId: string, targetUserId: string) => {
    console.log('[disconnectUser] Sending request:', { userId, targetUserId });
    const response = await apiClient.delete(`/users/${userId}/follow`, { data: { targetUserId } });
    console.log('[disconnectUser] Response:', response.data);
    return response.data;
  },

  getUserByAlias: async (alias: string) => {
    const response = await apiClient.get(`/users/by-alias/${alias}`);
    return response.data;
  },

  getConnections: async (userId: string) => {
    const response = await apiClient.get(`/users/${userId}/connections`);
    return response.data;
  },

  getUserPosts: async (userId: string) => {
    const response = await apiClient.get(`/users/${userId}/posts`);
    return response.data;
  },

  getUserComments: async (userId: string) => {
    const response = await apiClient.get(`/users/${userId}/comments`);
    return response.data;
  },

  updateProfile: async (clerkUserId: string, data: { alias?: string; bio?: string; avatarUrl?: string }) => {
    const response = await apiClient.patch('/users/me/edit', { clerkUserId, ...data });
    return response.data;
  },
};

// Post Service APIs
export const postService = {
  getPosts: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    postType?: string;
    search?: string;
    sort?: 'recent' | 'trending';
  }): Promise<{ posts: Post[]; totalPages: number; currentPage: number; total: number }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    const response = await apiClient.get(`/posts?${queryParams.toString()}`);
    return response.data;
  },

  getPost: async (postId: string): Promise<Post> => {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data;
  },

  getPostById: async (postId: string): Promise<Post> => {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data;
  },

  createPost: async (postData: {
    clerkUserId: string; // Changed to clerkUserId
    title?: string;
    content: string;
    category?: string;
    postType?: string;
    tags: string[];
    attachments?: Array<{url: string; filename: string; type: string}>;
    isNSFW?: boolean;
    isAnonymous?: boolean;
  }): Promise<Post> => {
    const response = await apiClient.post('/posts', postData);
    return response.data;
  },

  updatePost: async (postId: string, postData: {
    userId: string;
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
  }): Promise<Post> => {
    const response = await apiClient.put(`/posts/${postId}`, postData);
    return response.data;
  },

  votePost: async (postId: string, voteType: 'upvote' | 'downvote', userId?: string) => {
    // Use provided userId or generate a temporary session ID
    const voterId = userId || (typeof window !== 'undefined' ? localStorage.getItem('sessionId') || 'anonymous' : 'anonymous');
    const response = await apiClient.post(`/posts/${postId}/vote`, { voteType, userId: voterId });
    return response.data;
  },

  reportPost: async (postId: string, reason: string) => {
    const response = await apiClient.post(`/posts/${postId}/report`, { reason });
    return response.data;
  },

  deletePost: async (postId: string, userId: string) => {
    const response = await apiClient.delete(`/posts/${postId}`, { data: { userId } });
    return response.data;
  },

  archivePost: async (postId: string, userId: string) => {
    const response = await apiClient.post(`/posts/${postId}/archive`, { userId });
    return response.data;
  },

  getComments: async (postId: string, page: number = 1) => {
    const response = await apiClient.get(`/posts/${postId}/comments?page=${page}`);
    return response.data;
  },

  createComment: async (postId: string, data: { authorId: string; content: string; parentCommentId?: string }) => {
    const response = await apiClient.post(`/posts/${postId}/comments`, data);
    return response.data;
  },

  voteComment: async (commentId: string, voteType: 'upvote' | 'downvote', userId: string) => {
    const response = await apiClient.post(`/comments/${commentId}/vote`, { voteType, userId });
    return response.data;
  },

  getVeilTransactions: async (userId: string, page: number = 1) => {
    const response = await apiClient.get(`/users/${userId}/veil-transactions?page=${page}`);
    return response.data;
  },

  getCommunityPosts: async (communityId: string, params?: {
    page?: number;
    limit?: number;
    sort?: 'recent' | 'trending';
  }): Promise<{ posts: Post[]; totalPages: number; currentPage: number; total: number }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    const response = await apiClient.get(`/communities/${communityId}/posts?${queryParams.toString()}`);
    return response.data;
  },
};

// Community Service APIs
export const communityService = {
  getCommunities: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    const response = await apiClient.get(`/communities?${queryParams.toString()}`);
    return response.data;
  },

  getCommunity: async (communityId: string, clerkUserId?: string) => {
    const params = clerkUserId ? `?clerkUserId=${clerkUserId}` : '';
    const response = await apiClient.get(`/communities/${communityId}${params}`);
    return response.data;
  },

  createCommunity: async (data: {
    clerkUserId: string;
    name: string;
    description: string;
    bannerUrl?: string;
    rules?: string[];
  }) => {
    const response = await apiClient.post('/communities', data);
    return response.data;
  },

  joinCommunity: async (communityId: string, clerkUserId: string) => {
    const response = await apiClient.post(`/communities/${communityId}/join`, { clerkUserId });
    return response.data;
  },

  leaveCommunity: async (communityId: string, clerkUserId: string) => {
    const response = await apiClient.post(`/communities/${communityId}/leave`, { clerkUserId });
    return response.data;
  },
};

// Aegis AI Service
export const aegisService = {
  chat: async (message: string, userId: string, conversationId?: string) => {
    const response = await apiClient.post('/aegis/chat', {
      message,
      userId,
      conversationId,
    });
    return response.data;
  },

  searchPosts: async (query: string) => {
    const response = await apiClient.get(`/aegis/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getConversations: async (userId: string) => {
    const response = await apiClient.get(`/aegis/conversations/${userId}`);
    return response.data;
  },

  getConversation: async (conversationId: string) => {
    const response = await apiClient.get(`/aegis/conversation/${conversationId}`);
    return response.data;
  },

  deleteConversation: async (conversationId: string, userId: string) => {
    const response = await apiClient.delete(`/aegis/conversation/${conversationId}`, {
      data: { userId },
    });
    return response.data;
  },
};

// Chat Service APIs
export const chatService = {
  getConversations: async () => {
    const response = await apiClient.get('/chat/conversations');
    return response.data;
  },

  getMessages: async (conversationId: string) => {
    const response = await apiClient.get(`/chat/${conversationId}/messages`);
    return response.data;
  },

  sendMessage: async (receiverId: string, encryptedContent: string) => {
    const response = await apiClient.post('/chat/message', {
      receiverId,
      content: encryptedContent,
    });
    return response.data;
  },
};

// Media Service APIs
export const mediaService = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadMultiple: async (formData: FormData) => {
    const response = await apiClient.post('/media/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteFile: async (filename: string) => {
    const response = await apiClient.delete(`/media/files/${filename}`);
    return response.data;
  },
};

