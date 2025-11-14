'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import {
  HiHome,
  HiSearch,
  HiUserGroup,
  HiUser,
  HiChat,
  HiSparkles
} from 'react-icons/hi';
import { useUserStore } from '@/store/userStore';
import { useChatStore } from '@/store/chatStore';

const navItems = [
  { name: 'Home', path: '/home', icon: HiHome },
  { name: 'Explore', path: '/explore', icon: HiSearch },
  { name: 'Communities', path: '/communities', icon: HiUserGroup },
  { name: 'Profile', path: '/profile', icon: HiUser },
  { name: 'Chat', path: '/chat', icon: HiChat },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user: clerkUser } = useUser();
  const user = useUserStore((state) => state.user);
  const { toggleAegis, unreadCount } = useChatStore();

  // Hide navbar on feed page
  if (pathname === '/feed') {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center space-x-2">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Image
                src="/icons/Whistlelogo.png"
                alt="Whistle Logo"
                width={120}
                height={40}
                className="object-contain"
              />
            </motion.div>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <Link key={item.path} href={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-smooth ${
                      isActive
                        ? 'bg-primary/20 text-primary glow'
                        : 'text-foreground/70 hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                    {item.name === 'Chat' && unreadCount > 0 && (
                      <span className="bg-accent text-xs px-2 py-1 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right Side - Aegis Button, Veil Tokens, User */}
          <div className="flex items-center space-x-4">
            {/* Veil Tokens Display */}
            {user && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden sm:flex items-center space-x-2 bg-secondary px-4 py-2 rounded-lg glow"
              >
                <HiSparkles className="w-5 h-5 text-accent" />
                <span className="font-bold text-accent">{user.credibilityTokens}</span>
                <span className="text-sm text-foreground/70">Veil</span>
              </motion.div>
            )}

            {/* Aegis AI Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleAegis}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary to-accent px-4 py-2 rounded-lg font-medium animate-pulse-glow"
            >
              <HiSparkles className="w-5 h-5" />
              <span className="hidden sm:inline">Aegis</span>
            </motion.button>

            {/* User Button from Clerk */}
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center p-2 rounded-lg ${
                    isActive ? 'text-primary' : 'text-foreground/70'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs mt-1">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
