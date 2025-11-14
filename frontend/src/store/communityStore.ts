import { create } from 'zustand';

export interface Community {
  communityId: string;
  name: string;
  description: string;
  bannerUrl?: string;
  creatorId: string;
  creatorAlias?: string;
  members: string[];
  posts: string[];
  memberCount: number;
  postCount: number;
  rules?: string[];
  createdAt: Date;
}

interface CommunityStore {
  communities: Community[];
  currentCommunity: Community | null;
  setCommunities: (communities: Community[]) => void;
  setCurrentCommunity: (community: Community | null) => void;
  addCommunity: (community: Community) => void;
  updateCommunity: (communityId: string, updates: Partial<Community>) => void;
  removeCommunity: (communityId: string) => void;
}

export const useCommunityStore = create<CommunityStore>((set) => ({
  communities: [],
  currentCommunity: null,
  setCommunities: (communities) => set({ communities }),
  setCurrentCommunity: (community) => set({ currentCommunity: community }),
  addCommunity: (community) =>
    set((state) => ({ communities: [community, ...state.communities] })),
  updateCommunity: (communityId, updates) =>
    set((state) => ({
      communities: state.communities.map((c) =>
        c.communityId === communityId ? { ...c, ...updates } : c
      ),
      currentCommunity:
        state.currentCommunity?.communityId === communityId
          ? { ...state.currentCommunity, ...updates }
          : state.currentCommunity,
    })),
  removeCommunity: (communityId) =>
    set((state) => ({
      communities: state.communities.filter((c) => c.communityId !== communityId),
    })),
}));
