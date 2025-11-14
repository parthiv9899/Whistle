'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useUserStore } from '@/store/userStore';
import { userService } from '@/lib/services';
import {
  HiUser,
  HiCalendar,
  HiCurrencyDollar,
  HiDocumentText,
  HiChatAlt,
  HiUserGroup,
  HiX,
  HiSparkles,
  HiArrowLeft,
  HiUserAdd,
  HiUserRemove
} from 'react-icons/hi';
import PostCard from '@/components/PostCard';
import { Post } from '@/store/postStore';
import { toast } from 'react-hot-toast';

interface UserProfile {
  userId: string;
  alias: string;
  avatarUrl: string;
  bio: string;
  credibilityTokens: number;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  joinedAt: Date;
}

interface Connection {
  userId: string;
  alias: string;
  avatarUrl: string;
  bio: string;
  credibilityTokens: number;
  followersCount: number;
  followingCount: number;
  joinedAt: Date;
}

interface PostWithComments extends Post {
  userComments?: Array<{
    commentId: string;
    content: string;
    upvotes: number;
    downvotes: number;
    createdAt: Date;
  }>;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const alias = params.alias as string;
  const currentUser = useUserStore((state) => state.user);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userComments, setUserComments] = useState<PostWithComments[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accountAge, setAccountAge] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    if (alias) {
      loadUserProfile();
    }
  }, [alias]);

  useEffect(() => {
    if (profile?.userId) {
      loadProfileData();
    }
  }, [profile?.userId, activeTab]);

  useEffect(() => {
    if (profile?.userId && currentUser?.userId) {
      checkIfFollowing();
    }
  }, [profile?.userId, currentUser?.userId, currentUser?.following]);

  const checkIfFollowing = () => {
    if (!currentUser?.following || !profile?.userId) {
      setIsFollowing(false);
      return;
    }
    setIsFollowing(currentUser.following.includes(profile.userId));
  };

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const userData = await userService.getUserByAlias(alias);
      setProfile(userData);
      calculateAccountAge(userData.joinedAt);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('User not found');
        router.push('/home');
      } else {
        toast.error('Failed to load user profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAccountAge = (joinedAt: Date) => {
    const joinDate = new Date(joinedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      setAccountAge(`${diffDays} day${diffDays !== 1 ? 's' : ''}`);
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      setAccountAge(`${months} month${months !== 1 ? 's' : ''}`);
    } else {
      const years = Math.floor(diffDays / 365);
      setAccountAge(`${years} year${years !== 1 ? 's' : ''}`);
    }
  };

  const loadProfileData = async () => {
    if (!profile?.userId) return;

    try {
      if (activeTab === 'posts') {
        const posts = await userService.getUserPosts(profile.userId);
        setUserPosts(posts || []);
      } else {
        const comments = await userService.getUserComments(profile.userId);
        setUserComments(comments || []);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        if (activeTab === 'posts') {
          setUserPosts([]);
        } else {
          setUserComments([]);
        }
      } else {
        toast.error('Failed to load profile data');
      }
    }
  };

  const fetchConnections = async () => {
    if (!profile?.userId) return;

    try {
      const connectionsData = await userService.getConnections(profile.userId);
      setConnections(connectionsData);
      setShowConnectionsModal(true);
    } catch (error) {
      toast.error('Failed to load connections');
    }
  };

  const handleFollowToggle = async () => {
    if (!clerkUser?.id || !currentUser?.userId || !profile?.userId) {
      toast.error('Please log in to connect with users');
      return;
    }

    if (currentUser.userId === profile.userId) {
      toast.error('You cannot connect with yourself');
      return;
    }

    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await userService.disconnectUser(currentUser.userId, profile.userId);
        toast.success(`Disconnected from ${profile.alias}`);

        // Update local state
        setIsFollowing(false);

        // Update profile follower count
        setProfile(prev => prev ? {
          ...prev,
          followersCount: prev.followersCount - 1
        } : null);
      } else {
        await userService.connectUser(currentUser.userId, profile.userId);
        toast.success(`Connected with ${profile.alias}`);

        // Update local state
        setIsFollowing(true);

        // Update profile follower count
        setProfile(prev => prev ? {
          ...prev,
          followersCount: prev.followersCount + 1
        } : null);
      }

      // Refetch current user data to update the store with latest following/followers
      if (clerkUser?.id) {
        const updatedUser = await userService.getCurrentUser(clerkUser.id);
        useUserStore.getState().setUser(updatedUser);
      }
    } catch (error: any) {
      console.error('Connection error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error
      });
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update connection status';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleConnectionClick = (connectionAlias: string) => {
    setShowConnectionsModal(false);
    if (connectionAlias === currentUser?.alias) {
      router.push('/profile');
    } else {
      router.push(`/user/${connectionAlias}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <h1 className="text-2xl font-bold text-text-primary mb-4">User not found</h1>
        <button
          onClick={() => router.push('/home')}
          className="px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg text-white font-medium transition-colors"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.userId === profile.userId;

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="px-4 sm:px-6 pt-4 mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        {/* Header Section */}
        <div className="relative mb-8">
          {/* Cover Image */}
          <div className="h-48 w-full bg-gradient-to-br from-primary via-accent to-primary relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
          </div>

          {/* Profile Card */}
          <div className="relative -mt-20 px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface border border-border rounded-xl shadow-xl p-6"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center md:items-start flex-shrink-0">
                  <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-background shadow-lg bg-gradient-to-br from-primary/20 to-accent/20">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.alias}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-accent">
                        <HiUser className="w-16 h-16 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0 space-y-4">
                  {/* Alias and Follow Button */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-2xl md:text-3xl font-bold text-text-primary break-all">
                        {profile.alias}
                      </h1>
                      <div className="flex items-center gap-2 px-2.5 py-1 bg-accent/10 rounded-full flex-shrink-0">
                        <HiSparkles className="w-3.5 h-3.5 text-accent" />
                        <span className="text-xs font-semibold text-accent">Anonymous</span>
                      </div>
                    </div>

                    {!isOwnProfile && currentUser && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleFollowToggle}
                        disabled={isFollowLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isFollowing
                            ? 'bg-surface-elevated border border-border hover:bg-border text-text-primary'
                            : 'bg-primary hover:bg-primary-hover text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isFollowLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                          />
                        ) : isFollowing ? (
                          <>
                            <HiUserRemove className="w-5 h-5" />
                            <span>Disconnect</span>
                          </>
                        ) : (
                          <>
                            <HiUserAdd className="w-5 h-5" />
                            <span>Connect</span>
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <p className="text-text-muted leading-relaxed">{profile.bio}</p>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Connections */}
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={fetchConnections}
                      className="group relative overflow-hidden bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-lg p-3 text-left transition-all hover:border-primary/40 hover:shadow-md"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <HiUserGroup className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide">
                          Connections
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-text-primary">
                        {profile.followersCount + profile.followingCount}
                      </p>
                    </motion.button>

                    {/* Tokens */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="group relative overflow-hidden bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <HiCurrencyDollar className="w-4 h-4 text-accent" />
                        <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide">
                          Tokens
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-text-primary">{profile.credibilityTokens}</p>
                    </motion.div>

                    {/* Posts */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="group relative overflow-hidden bg-gradient-to-br from-success/10 to-transparent border border-success/20 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <HiDocumentText className="w-4 h-4 text-success" />
                        <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide">
                          Posts
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-text-primary">{profile.postsCount}</p>
                    </motion.div>

                    {/* Account Age */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="group relative overflow-hidden bg-gradient-to-br from-warning/10 to-transparent border border-warning/20 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <HiCalendar className="w-4 h-4 text-warning" />
                        <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide">
                          Account Age
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-text-primary">{accountAge}</p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 mb-6">
          <div className="flex gap-4 border-b border-border">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'posts'
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <HiDocumentText className="w-5 h-5" />
              <span>Posts</span>
              {activeTab === 'posts' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'comments'
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <HiChatAlt className="w-5 h-5" />
              <span>Comments</span>
              {activeTab === 'comments' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6">
          <AnimatePresence mode="wait">
            {activeTab === 'posts' && (
              <motion.div
                key="posts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <PostCard key={post.postId} post={post} />
                  ))
                ) : (
                  <div className="text-center py-12 bg-surface border border-border rounded-xl">
                    <HiDocumentText className="w-16 h-16 mx-auto text-text-muted mb-4" />
                    <p className="text-text-muted">No posts yet</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'comments' && (
              <motion.div
                key="comments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {userComments.length > 0 ? (
                  userComments.map((post) => (
                    <div key={post.postId} className="space-y-3">
                      <PostCard post={post} />
                      {post.userComments && post.userComments.length > 0 && (
                        <div className="ml-8 space-y-2">
                          {post.userComments.map((comment) => (
                            <div
                              key={comment.commentId}
                              className="bg-surface-elevated border border-border rounded-lg p-4"
                            >
                              <p className="text-text-primary mb-2">{comment.content}</p>
                              <div className="flex items-center gap-4 text-sm text-text-muted">
                                <span>↑ {comment.upvotes}</span>
                                <span>↓ {comment.downvotes}</span>
                                <span>
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-surface border border-border rounded-xl">
                    <HiChatAlt className="w-16 h-16 mx-auto text-text-muted mb-4" />
                    <p className="text-text-muted">No comments yet</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Connections Modal */}
      <AnimatePresence>
        {showConnectionsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowConnectionsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-2xl font-bold text-text-primary">Connections</h2>
                <button
                  onClick={() => setShowConnectionsModal(false)}
                  className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
                >
                  <HiX className="w-6 h-6 text-text-muted" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[calc(80vh-88px)] p-6">
                {connections.length > 0 ? (
                  <div className="grid gap-4">
                    {connections.map((connection) => (
                      <motion.button
                        key={connection.userId}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleConnectionClick(connection.alias)}
                        className="flex items-center gap-4 p-4 bg-surface-elevated hover:bg-border border border-border rounded-lg transition-all text-left"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/20 to-accent/20">
                          {connection.avatarUrl ? (
                            <img
                              src={connection.avatarUrl}
                              alt={connection.alias}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-accent">
                              <HiUser className="w-8 h-8 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-text-primary truncate">
                            {connection.alias}
                          </h3>
                          {connection.bio && (
                            <p className="text-sm text-text-muted line-clamp-1">{connection.bio}</p>
                          )}
                          <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                            <span>
                              {connection.followersCount + connection.followingCount} connections
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <HiUserGroup className="w-16 h-16 mx-auto text-text-muted mb-4" />
                    <p className="text-text-muted">No connections yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
