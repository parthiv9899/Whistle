'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useInitializeUser } from '@/hooks/useInitializeUser';
import { motion } from 'framer-motion';

function UserInitializer() {
  // This component runs the user initialization hook globally
  useInitializeUser();
  return null;
}

function AuthLoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
        <p className="text-text-muted text-sm">Loading...</p>
      </div>
    </div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useUser();
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <UserInitializer />
      {!isLoaded ? <AuthLoadingScreen /> : children}
    </QueryClientProvider>
  );
}
