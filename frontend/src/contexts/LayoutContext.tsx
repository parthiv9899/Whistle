'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type LayoutMode = 'default' | 'minimal' | 'fullscreen';

interface LayoutContextType {
  mode: LayoutMode;
  setMode: (mode: LayoutMode) => void;
  isNavOpen: boolean;
  setIsNavOpen: (open: boolean) => void;
  toggleNav: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<LayoutMode>('default');
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => setIsNavOpen(prev => !prev);

  return (
    <LayoutContext.Provider value={{ mode, setMode, isNavOpen, setIsNavOpen, toggleNav }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
