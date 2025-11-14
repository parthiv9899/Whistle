'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiUsers, HiDocument, HiPlus, HiUserAdd, HiUserRemove } from 'react-icons/hi';
import { useUser } from '@clerk/nextjs';
import PostCard from '@/components/PostCard';
import { useCommunityStore } from '@/store/communityStore';
import { communityService, postService } from '@/lib/services';
import { Post } from '@/store/postStore';
import toast from 'react-hot-toast';

interface CommunityPageProps {
  params: {
    id: string;
  };
}

export default function CommunityPage({ params }: CommunityPageProps) {
  const router = useRouter();
  const { user: clerkUser, isSignedIn, isLoaded: clerkLoaded } = useUser();
  const { currentCommunity, setCurrentCommunity, updateCommunity } = useCommunityStore();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    // Wait for Clerk to finish loading before fetching data
    if (!clerkLoaded) {
      console.log('[Community Page] Waiting for Clerk to load...');
      return;
    }

    const fetchCommunityData = async () => {
      try {
        // Fetch community details with user membership check
        console.log('[Community Page] Clerk loaded. isSignedIn:', isSignedIn, 'clerkUserId:', clerkUser?.id);
        const community = await communityService.getCommunity(
          params.id,
          clerkUser?.id
        );
        console.log('[Community Page] Community data received:', {
          communityId: community.communityId,
          name: community.name,
          isMember: community.isMember,
          members: community.members
        });
        setCurrentCommunity(community);

        // Set membership status from API response
        if (community.isMember !== undefined) {
          console.log('[Community Page] Setting isMember to:', community.isMember);
          setIsMember(community.isMember);
        } else {
          console.warn('[Community Page] isMember not returned by API');
        }

        // Fetch posts for this community
        const postsResponse = await postService.getCommunityPosts(params.id);
        setPosts(postsResponse.posts || []);
      } catch (error) {
        console.error('Failed to fetch community data:', error);
        toast.error('Failed to load community');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunityData();
  }, [params.id, setCurrentCommunity, clerkUser?.id, clerkLoaded, isSignedIn]);

  const handleJoinLeave = async () => {
    if (!isSignedIn || !clerkUser) {
      toast.error('Please sign in to join this community');
      router.push('/sign-in');
      return;
    }

    if (!currentCommunity) return;

    try {
      setIsJoining(true);

      if (isMember) {
        await communityService.leaveCommunity(currentCommunity.communityId, clerkUser.id);
        setIsMember(false);
        updateCommunity(currentCommunity.communityId, {
          memberCount: currentCommunity.memberCount - 1,
        });
        toast.success('Left community');
      } else {
        await communityService.joinCommunity(currentCommunity.communityId, clerkUser.id);
        setIsMember(true);
        updateCommunity(currentCommunity.communityId, {
          memberCount: currentCommunity.memberCount + 1,
        });
        toast.success('Joined community!');
      }
    } catch (error: any) {
      console.error('Failed to join/leave community:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update membership';

      // If already a member, update the UI to reflect that
      if (errorMessage.includes('Already a member')) {
        console.log('[Community Page] User is already a member, updating state');
        setIsMember(true);
        toast.success('You are already a member of this community');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreatePost = () => {
    if (!isSignedIn) {
      toast.error('Please sign in to create a post');
      router.push('/sign-in');
      return;
    }

    if (!isMember) {
      toast.error('You must be a member to post in this community');
      return;
    }

    // Redirect to post creation with community pre-selected
    router.push(`/new?community=${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!currentCommunity) {
    return (
      <div className="text-center py-20 text-text-muted">
        <p className="text-xl mb-2">Community not found</p>
        <button
          onClick={() => router.push('/communities')}
          className="text-primary hover:underline"
        >
          Browse all communities
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Community Header */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        {/* Banner */}
        {currentCommunity.bannerUrl && (
          <div className="w-full h-48 bg-surface-hover">
            <img
              src={currentCommunity.bannerUrl}
              alt={currentCommunity.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Info Section */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-text mb-2">
                {currentCommunity.name}
              </h1>
              <p className="text-text/70 mb-4">{currentCommunity.description}</p>

              {/* Stats */}
              <div className="flex items-center gap-6 text-text/60 text-sm">
                <div className="flex items-center gap-2">
                  <HiUsers className="w-5 h-5" />
                  <span>{currentCommunity.memberCount.toLocaleString()} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiDocument className="w-5 h-5" />
                  <span>{currentCommunity.postCount.toLocaleString()} posts</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {isMember ? (
                <>
                  {/* Joined Badge */}
                  {/* <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 text-success border border-success/20">
                    <HiUserAdd className="w-5 h-5" />
                    <span className="font-medium">Joined</span>
                  </div> */}
                  {/* Leave Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleJoinLeave}
                    disabled={isJoining}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth bg-surface hover:bg-surface-hover text-text border border-border"
                  >
                    <HiUserRemove className="w-5 h-5" />
                    {isJoining ? 'Leaving...' : 'Leave'}
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleJoinLeave}
                  disabled={isJoining}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth bg-primary hover:bg-primary-hover text-white"
                >
                  <HiUserAdd className="w-5 h-5" />
                  {isJoining ? 'Joining...' : 'Join'}
                </motion.button>
              )}

              {isMember && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreatePost}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-smooth"
                >
                  <HiPlus className="w-5 h-5" />
                  Create Post
                </motion.button>
              )}
            </div>
          </div>

          {/* Community Rules */}
          {currentCommunity.rules && currentCommunity.rules.length > 0 && (
            <div className="mt-6 p-4 bg-background border border-border rounded-lg">
              <h3 className="text-sm font-semibold text-text mb-3">
                Community Rules
              </h3>
              <ol className="space-y-2 text-sm text-text/70">
                {currentCommunity.rules.map((rule, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="font-medium">{index + 1}.</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Posts Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Posts</h2>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-text-muted bg-surface border border-border rounded-lg">
            <p className="text-xl mb-2">No posts yet</p>
            <p className="mb-4">Be the first to share something in this community</p>
            {isMember && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreatePost}
                className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-smooth"
              >
                Create First Post
              </motion.button>
            )}
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.postId} post={post} />)
        )}
      </div>
    </div>
  );
}
