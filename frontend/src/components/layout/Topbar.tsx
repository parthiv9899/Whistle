'use client';

import { Search, Bell, Menu, X, MessageSquare } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { useUIStore } from '@/store/uiStore';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function Topbar() {
  const isNavOpen = useUIStore((state) => state.isNavOpen);
  const toggleNav = useUIStore((state) => state.toggleNav);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-surface/95 backdrop-blur-sm border-b border-border">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Left Section: Hamburger + Logo */}
        <div className="flex items-center gap-4">
          {/* Hamburger Button */}
          <button
            onClick={toggleNav}
            className="p-2 rounded-lg hover:bg-surface-hover transition-smooth"
            aria-label={isNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <AnimatePresence mode="wait">
              {isNavOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} className="text-text" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} className="text-text" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3">
            {/* Whistle Icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 50 50" className="w-10 h-10">
                {/* Whistle mouthpiece (left side) */}
                <rect x="10" y="24" width="14" height="6" rx="1" fill="white" />

                {/* Main whistle body (center cylinder) */}
                <rect x="18" y="20" width="16" height="10" rx="2" fill="white" />

                {/* Sound hole */}
                <circle cx="26" cy="25" r="2" fill="#2563eb" />

                {/* Lanyard ring */}
                <circle cx="36" cy="22" r="3" stroke="white" strokeWidth="1.5" fill="none" />
              </svg>
            </div>

            {/* Logo Text */}
            <div className="hidden sm:flex flex-col">
              <span className="text-xl font-bold text-text tracking-tight">
                Whistle
              </span>
              <span className="text-[10px] text-blue-500 -mt-1 tracking-wider uppercase font-semibold">
                Anonymous Platform
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="search"
              placeholder="Search Whistle..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-base text-sm placeholder:text-text-dim focus:border-primary focus:outline-none transition-smooth"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Chat */}
          <button
            className="relative p-2 hover:bg-surface-hover rounded-base transition-smooth"
            aria-label="Chat"
          >
            <MessageSquare size={20} />
          </button>

          {/* Notifications */}
          <button
            className="relative p-2 hover:bg-surface-hover rounded-base transition-smooth"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
          </button>

          {/* User Menu */}
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: 'w-9 h-9',
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
