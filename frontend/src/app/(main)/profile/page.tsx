'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { userService, mediaService } from '@/lib/services';
import {
  HiPencil,
  HiUser,
  HiCalendar,
  HiCurrencyDollar,
  HiDocumentText,
  HiChatAlt,
  HiUserGroup,
  HiX,
  HiCheck,
  HiCamera,
  HiRefresh,
  HiShieldCheck,
  HiSparkles
} from 'react-icons/hi';
import PostCard from '@/components/PostCard';
import { Post } from '@/store/postStore';
import { toast } from 'react-hot-toast';

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

const generateRandomAlias = () => {
  const adjectives = ['Shadow', 'Cipher', 'Ghost', 'Silent', 'Dark', 'Phantom', 'Mystic', 'Stealth', 'Hidden', 'Veiled'];
  const nouns = ['Wolf', 'Hawk', 'Viper', 'Raven', 'Fox', 'Sentinel', 'Guardian', 'Watcher', 'Keeper', 'Hunter'];
  const number = Math.floor(Math.random() * 1000);
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}_${nouns[Math.floor(Math.random() * nouns.length)]}_${number}`;
};

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [newAlias, setNewAlias] = useState('');
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userComments, setUserComments] = useState<PostWithComments[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accountAge, setAccountAge] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setNewAlias(user.alias);
      calculateAccountAge();
    }
  }, [user]);

  useEffect(() => {
    if (user?.userId) {
      fetchProfileData();
    }
  }, [user?.userId, activeTab]);

  const calculateAccountAge = () => {
    if (!user?.joinedAt) return;
    const joinDate = new Date(user.joinedAt);
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

  const fetchProfileData = async () => {
    if (!user?.userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      if (activeTab === 'posts') {
        const posts = await userService.getUserPosts(user.userId);
        setUserPosts(posts || []);
      } else {
        const comments = await userService.getUserComments(user.userId);
        setUserComments(comments || []);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load profile data');
      } else {
        if (activeTab === 'posts') {
          setUserPosts([]);
        } else {
          setUserComments([]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConnections = async () => {
    if (!user?.userId) return;

    try {
      const connectionsData = await userService.getConnections(user.userId);
      setConnections(connectionsData);
      setShowConnectionsModal(true);
    } catch (error) {
      toast.error('Failed to load connections');
    }
  };

  const handleAliasChange = async () => {
    if (!clerkUser?.id || !newAlias.trim()) return;

    if (newAlias === user?.alias) {
      setIsEditingAlias(false);
      return;
    }

    try {
      await userService.updateProfile(clerkUser.id, { alias: newAlias });
      toast.success('Alias updated successfully!');
      setIsEditingAlias(false);
      if (clerkUser?.id) {
        const updatedUser = await userService.getCurrentUser(clerkUser.id);
        useUserStore.getState().setUser(updatedUser);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update alias');
      setNewAlias(user?.alias || '');
    }
  };

  const handleGenerateRandomAlias = () => {
    const randomAlias = generateRandomAlias();
    setNewAlias(randomAlias);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clerkUser?.id) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const uploadedFile = await mediaService.upload(file);
      await userService.updateProfile(clerkUser.id, { avatarUrl: uploadedFile.url });
      toast.success('Profile picture updated!');

      const updatedUser = await userService.getCurrentUser(clerkUser.id);
      useUserStore.getState().setUser(updatedUser);
    } catch (error) {
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!user || !clerkUser) {
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

  const uniqueConnections = new Set([...(user.followers || []), ...(user.following || [])]).size;

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="relative mb-8">
          {/* Cover Image */}
          <div className="h-48 w-full bg-gradient-to-br from-primary via-accent to-primary relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
          </div>

          {/* Profile Card - Overlapping Cover */}
          <div className="relative -mt-20 px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface border border-border rounded-xl shadow-xl p-6"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center md:items-start flex-shrink-0">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-background shadow-lg bg-gradient-to-br from-primary/20 to-accent/20">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.alias}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-accent">
                          <HiUser className="w-16 h-16 text-white" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary hover:bg-primary-hover rounded-lg flex items-center justify-center shadow-lg transition-all transform hover:scale-105 disabled:opacity-50"
                    >
                      {isUploadingAvatar ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <HiCamera className="w-5 h-5 text-white" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0 space-y-4">
                  {/* Alias */}
                  {isEditingAlias ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="text"
                          value={newAlias}
                          onChange={(e) => setNewAlias(e.target.value)}
                          className="flex-1 min-w-[200px] px-3 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary text-lg font-bold text-text-primary transition-colors"
                          placeholder="Enter new alias"
                        />
                        <button
                          onClick={handleGenerateRandomAlias}
                          className="px-3 py-2 bg-surface-elevated hover:bg-border rounded-lg transition-colors"
                          title="Generate random alias"
                        >
                          <HiRefresh className="w-5 h-5 text-accent" />
                        </button>
                        <button
                          onClick={handleAliasChange}
                          className="px-3 py-2 bg-primary hover:bg-primary-hover rounded-lg transition-colors"
                          title="Save"
                        >
                          <HiCheck className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingAlias(false);
                            setNewAlias(user.alias);
                          }}
                          className="px-3 py-2 bg-surface-elevated hover:bg-border rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <HiX className="w-5 h-5 text-text-muted" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-muted">
                        <HiShieldCheck className="w-4 h-4 text-accent" />
                        <span>Your identity is protected and anonymous</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-2xl md:text-3xl font-bold text-text-primary break-all">{user.alias}</h1>
                      <button
                        onClick={() => setIsEditingAlias(true)}
                        className="p-2 hover:bg-surface-elevated rounded-lg transition-colors flex-shrink-0"
                      >
                        <HiPencil className="w-4 h-4 text-text-muted hover:text-text-primary" />
                      </button>
                      <div className="flex items-center gap-2 px-2.5 py-1 bg-accent/10 rounded-full flex-shrink-0">
                        <HiSparkles className="w-3.5 h-3.5 text-accent" />
                        <span className="text-xs font-semibold text-accent">Anonymous</span>
                      </div>
                    </div>
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
                        <HiUserGroup className="w-4 h-4 text-primary items-center" />
                        <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide items-center">Connections</span>
                      </div>
                      <p className="text-2xl font-bold text-text-primary">{uniqueConnections}</p>
                    </motion.button>

                    {/* Tokens */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="group relative overflow-hidden bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 rounded-lg p-3 transition-all hover:border-accent/40 hover:shadow-md"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <HiCurrencyDollar className="w-4 h-4 text-accent" />
                        <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide">Tokens</span>
                      </div>
                      <p className="text-2xl font-bold text-text-primary">{user.credibilityTokens || 0}</p>
                    </motion.div>

                    {/* Account Age */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-lg p-3 transition-all hover:border-blue-500/40 hover:shadow-md"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <HiCalendar className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide">Member</span>
                      </div>
                      <p className="text-xl font-bold text-text-primary">{accountAge}</p>
                    </motion.div>

                    {/* Posts */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-lg p-3 transition-all hover:border-purple-500/40 hover:shadow-md"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <HiDocumentText className="w-4 h-4 text-purple-400" />
                        <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide">Posts</span>
                      </div>
                      <p className="text-2xl font-bold text-text-primary">{userPosts.length}</p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 sm:px-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-surface border border-border rounded-xl p-1.5">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'posts'
                  ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-md'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated'
              }`}
            >
              <HiDocumentText className="w-4 h-4" />
              <span className="hidden sm:inline">My Posts</span>
              <span className="sm:hidden">Posts</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'posts' ? 'bg-white/20' : 'bg-primary/10 text-primary'
              }`}>
                {userPosts.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'comments'
                  ? 'bg-gradient-to-r from-accent to-accent/80 text-white shadow-md'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated'
              }`}
            >
              <HiChatAlt className="w-4 h-4" />
              <span className="hidden sm:inline">My Comments</span>
              <span className="sm:hidden">Comments</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'comments' ? 'bg-white/20' : 'bg-accent/10 text-accent'
              }`}>
                {userComments.length}
              </span>
            </button>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mb-4"
                />
                <p className="text-text-muted">Loading {activeTab}...</p>
              </motion.div>
            ) : activeTab === 'posts' ? (
              <motion.div
                key="posts"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {userPosts.length === 0 ? (
                  <div className="bg-surface border border-border rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-surface-elevated rounded-xl flex items-center justify-center mx-auto mb-4">
                      <HiDocumentText className="w-8 h-8 text-text-muted" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">No posts yet</h3>
                    <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
                      Share your first whistle with the community
                    </p>
                    <button
                      onClick={() => window.location.href = '/new'}
                      className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-all shadow-md"
                    >
                      Create Post
                    </button>
                  </div>
                ) : (
                  userPosts.map((post) => (
                    <motion.div
                      key={post.postId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <PostCard
                        post={post}
                        showActions={true}
                        onPostUpdate={fetchProfileData}
                      />
                    </motion.div>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div
                key="comments"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {userComments.length === 0 ? (
                  <div className="bg-surface border border-border rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-surface-elevated rounded-xl flex items-center justify-center mx-auto mb-4">
                      <HiChatAlt className="w-8 h-8 text-text-muted" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">No comments yet</h3>
                    <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
                      Join conversations and share your thoughts
                    </p>
                    <button
                      onClick={() => window.location.href = '/feed'}
                      className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white font-semibold rounded-lg transition-all shadow-md"
                    >
                      Explore Posts
                    </button>
                  </div>
                ) : (
                  userComments.map((post) => (
                    <div key={post.postId} className="space-y-4">
                      <PostCard post={post} />
                      {post.userComments && post.userComments.length > 0 && (
                        <div className="ml-4 space-y-2">
                          {post.userComments.map((comment) => (
                            <motion.div
                              key={comment.commentId}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-surface border border-primary/20 rounded-lg p-4 hover:border-primary/40 transition-all"
                            >
                              <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                  {user.alias[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-semibold text-primary">Your Comment</span>
                                    <span className="text-xs text-text-muted">
                                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-text-primary leading-relaxed mb-3">{comment.content}</p>
                                  <div className="flex items-center gap-4 text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-green-500">▲</span>
                                      <span className="text-text-muted font-medium">{comment.upvotes}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-red-500">▼</span>
                                      <span className="text-text-muted font-medium">{comment.downvotes}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-border rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-border bg-surface-elevated">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <HiUserGroup className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">Your Connections</h2>
                    <p className="text-xs text-text-muted mt-0.5">{connections.length} connections</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConnectionsModal(false)}
                  className="p-2 hover:bg-surface rounded-lg transition-colors"
                >
                  <HiX className="w-6 h-6 text-text-muted" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(85vh-100px)] p-5">
                {connections.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-surface-elevated rounded-xl flex items-center justify-center mx-auto mb-4">
                      <HiUserGroup className="w-8 h-8 text-text-muted" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-2">No connections yet</h3>
                    <p className="text-sm text-text-muted">Connect with users to build your network!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {connections.map((connection) => (
                      <motion.div
                        key={connection.userId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => {
                          setShowConnectionsModal(false);
                          router.push(`/user/${connection.alias}`);
                        }}
                        className="flex items-center gap-3 p-3 bg-surface-elevated hover:bg-border rounded-lg transition-all border border-transparent hover:border-border cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary to-accent">
                          {connection.avatarUrl ? (
                            <img
                              src={connection.avatarUrl}
                              alt={connection.alias}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                              {connection.alias[0]}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-text-primary truncate">{connection.alias}</h3>
                          {connection.bio && (
                            <p className="text-xs text-text-muted line-clamp-1 mt-0.5">{connection.bio}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
                            <span className="flex items-center gap-1">
                              <HiUserGroup className="w-3 h-3" />
                              {connection.followersCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <HiCurrencyDollar className="w-3 h-3" />
                              {connection.credibilityTokens}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
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
