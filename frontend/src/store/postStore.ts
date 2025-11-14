import { create } from 'zustand';

export interface Post {
  postId: string;
  authorId: string;
  authorAlias: string;
  title?: string;
  content: string;
  tags: string[];
  mediaUrl?: string;
  attachments?: Array<{
    url: string;
    type: string;
    filename: string;
  }>;
  upvotes: number;
  downvotes: number;
  isNSFW: boolean;
  communityId?: string;
  communityName?: string;
  isArchived?: boolean;
  isDeleted?: boolean;
  archivedAt?: Date | null;
  deletedAt?: Date | null;
  createdAt: Date;
}

interface PostStore {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  removePost: (postId: string) => void;
}

export const usePostStore = create<PostStore>((set) => ({
  posts: [],
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  updatePost: (postId, updates) =>
    set((state) => ({
      posts: state.posts.map((p) => (p.postId === postId ? { ...p, ...updates } : p)),
    })),
  removePost: (postId) =>
    set((state) => ({ posts: state.posts.filter((p) => p.postId !== postId) })),
}));
