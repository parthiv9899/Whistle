import { create } from 'zustand';

export interface User {
  userId: string;
  alias: string;
  credibilityTokens: number;
  avatarUrl?: string;
  bio?: string;
  followers: string[];
  following: string[];
  joinedAt: Date;
  isAdmin?: boolean;
}

interface UserStore {
  user: User | null;
  isSignedIn: boolean;
  setUser: (user: User | null) => void;
  updateCredibilityTokens: (tokens: number) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isSignedIn: false,
  setUser: (user) => set({ user, isSignedIn: !!user }),
  updateCredibilityTokens: (tokens) =>
    set((state) => ({
      user: state.user ? { ...state.user, credibilityTokens: tokens } : null,
    })),
  clearUser: () => set({ user: null, isSignedIn: false }),
}));
