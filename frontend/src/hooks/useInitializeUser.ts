'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUserStore } from '@/store/userStore';
import { userService } from '@/lib/services';

/**
 * Global hook to initialize user data from Clerk authentication
 * This ensures the Zustand user store is populated whenever a user is signed in
 */
export function useInitializeUser() {
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const currentUser = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const initializingRef = useRef(false);

  useEffect(() => {
    // Don't do anything until Clerk is fully loaded
    if (!isLoaded) {
      console.log('[useInitializeUser] Clerk not loaded yet, waiting...');
      return;
    }

    const initializeUser = async () => {
      if (isSignedIn && clerkUser) {
        // Skip if user is already in store OR currently initializing
        if (currentUser?.userId || initializingRef.current) {
          console.log('[useInitializeUser] User already in store or initializing:', currentUser?.userId);
          return;
        }

        initializingRef.current = true;
        console.log('[useInitializeUser] Clerk user detected:', clerkUser.id);

        try {
          // Try to get existing user from backend
          let userData;
          try {
            console.log('[useInitializeUser] Fetching existing user...');
            userData = await userService.getCurrentUser(clerkUser.id);
            console.log('[useInitializeUser] User found:', userData);
          } catch (error: any) {
            // User doesn't exist in backend, create new one
            console.log('[useInitializeUser] User not found, creating new user...');
            try {
              userData = await userService.createUser(clerkUser.id);
              console.log('[useInitializeUser] User created:', userData);
            } catch (createError: any) {
              console.error('[useInitializeUser] Failed to create user:', createError);
              console.error('[useInitializeUser] Error details:', createError.response?.data || createError.message);
              throw createError;
            }
          }
          console.log('[useInitializeUser] Setting user in store:', userData);
          setUser(userData);
          console.log('[useInitializeUser] User set successfully');
        } catch (error: any) {
          console.error('[useInitializeUser] Failed to initialize user:', error);
          console.error('[useInitializeUser] Error response:', error.response?.data);
        } finally {
          initializingRef.current = false;
        }
      } else if (isSignedIn === false) {
        console.log('[useInitializeUser] User not signed in, clearing store');
        // User signed out, clear the store
        clearUser();
      }
    };

    initializeUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerkUser?.id, isSignedIn, isLoaded]);
}
