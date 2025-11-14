'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { LayoutProvider, useLayout } from '@/contexts/LayoutContext';
import { useUIStore } from '@/store/uiStore';
import LeftNav from './LeftNav';
import RightRail from './RightRail';
import Topbar from './Topbar';
import FloatingActionButton from './FloatingActionButton';

function LayoutContent({ children }: { children: ReactNode }) {
  const { mode } = useLayout();
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();
  const isNavOpen = useUIStore((state) => state.isNavOpen);

  // Public routes: sign-in, sign-up - render without any chrome
  const isPublicRoute = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');

  if (isPublicRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  // Show loading state while auth is being checked to prevent flash
  if (!isLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </main>
    );
  }

  // Only show layout chrome if user is signed in
  if (!isSignedIn) {
    return <main className="min-h-screen">{children}</main>;
  }

  // Show RightRail only on /home page
  const showRightRail = pathname === '/home' || pathname === '/';
  const isHomePage = pathname === '/home' || pathname === '/';
  const isFeedPage = pathname === '/feed';

  // Calculate dynamic margins based on nav state
  const leftMargin = isNavOpen ? '280px' : '80px';
  const contentWidth = isFeedPage ? 'max-w-[1200px]' : (isHomePage ? 'max-w-6xl' : 'max-w-[680px]');

  // Default mode: show all chrome
  return (
    <>
      <Topbar />
      <div className="flex min-h-screen pt-16">
        <LeftNav />

        <motion.main
          initial={false}
          animate={{
            marginLeft: leftMargin,
          }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 200,
          }}
          className={`flex-1 transition-all duration-300 ${showRightRail ? 'mr-80' : ''}`}
        >
          {/* Content with dynamic width and padding */}
          <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-6 ${contentWidth}`}>
            {children}
          </div>
        </motion.main>

        {showRightRail && <RightRail />}
      </div>
    </>
  );
}

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <LayoutProvider>
      <LayoutContent>{children}</LayoutContent>
    </LayoutProvider>
  );
}
