import { create } from 'zustand';

interface UIStore {
  isNavOpen: boolean;
  toggleNav: () => void;
  openNav: () => void;
  closeNav: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isNavOpen: false,
  toggleNav: () => set((state) => ({ isNavOpen: !state.isNavOpen })),
  openNav: () => set({ isNavOpen: true }),
  closeNav: () => set({ isNavOpen: false }),
}));
