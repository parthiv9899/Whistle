import { create } from 'zustand';

interface ChatStore {
  isAegisOpen: boolean;
  activeChatUserId: string | null;
  unreadCount: number;
  toggleAegis: () => void;
  setActiveChat: (userId: string | null) => void;
  setUnreadCount: (count: number) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  isAegisOpen: false,
  activeChatUserId: null,
  unreadCount: 0,
  toggleAegis: () => set((state) => ({ isAegisOpen: !state.isAegisOpen })),
  setActiveChat: (userId) => set({ activeChatUserId: userId }),
  setUnreadCount: (count) => set({ unreadCount: count }),
}));
