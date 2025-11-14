'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HiArrowUp,
  HiArrowDown,
  HiChat,
  HiShare,
  HiFlag,
  HiEye,
  HiEyeOff,
  HiUserGroup,
  HiArchive,
  HiTrash
} from 'react-icons/hi';
import { Post } from '@/store/postStore';
import { postService } from '@/lib/services';
import { useUserStore } from '@/store/userStore';
import toast from 'react-hot-toast';

interface PostCardProps {
  post: Post;
  onVote?: (postId: string, voteType: 'upvote' | 'downvote') => void;
  showActions?: boolean; // Show archive/delete actions for owner
  onPostUpdate?: () => void; // Callback after archive/delete
}

export default function PostCard({ post, onVote, showActions = false, onPostUpdate }: PostCardProps) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const [isBlurred, setIsBlurred] = useState(post.isNSFW);
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [voteCount, setVoteCount] = useState(post.upvotes - post.downvotes);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'A'
    ) {
      return;
    }
    router.push(`/post/${post.postId}`);
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    try {
      await postService.votePost(post.postId, voteType);

      if (voteType === 'upvote') {
        if (upvoted) {
          setVoteCount(voteCount - 1);
          setUpvoted(false);
        } else {
          setVoteCount(downvoted ? voteCount + 2 : voteCount + 1);
          setUpvoted(true);
          setDownvoted(false);
        }
      } else {
        if (downvoted) {
          setVoteCount(voteCount + 1);
          setDownvoted(false);
        } else {
          setVoteCount(upvoted ? voteCount - 2 : voteCount - 1);
          setDownvoted(true);
          setUpvoted(false);
        }
      }

      if (onVote) onVote(post.postId, voteType);
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Whistle Post',
        text: post.content.substring(0, 100),
        url: `/post/${post.postId}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.postId}`);
      toast.success('Link copied to clipboard');
    }
  };

  const handleArchive = async () => {
    if (!user?.userId) {
      toast.error('You must be logged in');
      return;
    }

    setIsArchiving(true);
    try {
      await postService.archivePost(post.postId, user.userId);
      toast.success(post.isArchived ? 'Post unarchived successfully' : 'Post archived successfully');
      if (onPostUpdate) onPostUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to archive post');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.userId) {
      toast.error('You must be logged in');
      return;
    }

    setIsDeleting(true);
    try {
      await postService.deletePost(post.postId, user.userId);
      toast.success('Post and all related data deleted permanently');
      if (onPostUpdate) onPostUpdate();
      setShowDeleteConfirm(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      className="bg-surface border border-border rounded-lg p-6 mb-6 transition-smooth hover:shadow-card-hover hover:border-border/60 cursor-pointer"
    >
      {/* Community Badge - Show at the very top if post is in a community */}
      {post.communityId && post.communityName && (
        <div className="mb-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/communities/${post.communityId}`);
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-smooth"
          >
            <HiUserGroup className="w-4 h-4" />
            {post.communityName}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/user/${post.authorAlias}`);
            }}
            className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/10 hover:ring-primary/30 transition-all"
          >
            <span className="text-primary font-bold text-base">
              {post.authorAlias.charAt(0)}
            </span>
          </button>
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/user/${post.authorAlias}`);
              }}
              className="font-semibold text-text text-base hover:text-primary transition-colors"
            >
              {post.authorAlias}
            </button>
            <p className="text-sm text-text-dim">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
        {/* Archived Badge */}
        {post.isArchived && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
            <HiArchive className="w-4 h-4 text-yellow-600" />
            <span className="text-xs font-semibold text-yellow-600 uppercase">Archived</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-surface-hover text-text-muted hover:bg-primary/10 hover:text-primary transition-smooth cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      {post.title && (
        <h2 className="text-xl font-bold text-text mb-3">
          {post.title}
        </h2>
      )}

      {/* Content Preview */}
      <div className="mb-5">
        <p className="text-text text-base leading-relaxed line-clamp-3">
          {post.content}
        </p>
      </div>

      {/* Attachments */}
      {post.attachments && post.attachments.length > 0 && (
        <div className="mb-5">
          {post.attachments.length === 1 ? (
            // Single image - full width
            <div className="relative rounded-lg overflow-hidden">
              {post.isNSFW && isBlurred && (
                <div className="absolute inset-0 backdrop-blur-xl bg-black/50 flex flex-col items-center justify-center z-10">
                  <HiEyeOff className="w-16 h-16 text-white mb-3" />
                  <p className="text-white font-semibold text-lg mb-3">NSFW Content</p>
                  <button
                    onClick={() => setIsBlurred(false)}
                    className="px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg text-white font-semibold transition-smooth"
                  >
                    Reveal Content
                  </button>
                </div>
              )}
              {post.attachments[0].type === 'image' && (
                <Image
                  src={post.attachments[0].url}
                  alt={post.attachments[0].filename || 'Post attachment'}
                  width={800}
                  height={500}
                  className={`w-full h-auto max-h-96 object-cover ${isBlurred && post.isNSFW ? 'blur-2xl' : ''}`}
                />
              )}
              {post.isNSFW && !isBlurred && (
                <button
                  onClick={() => setIsBlurred(true)}
                  className="absolute top-3 right-3 p-2.5 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-smooth"
                >
                  <HiEye className="w-6 h-6" />
                </button>
              )}
            </div>
          ) : (
            // Multiple images - grid layout
            <div className={`grid gap-2 ${post.attachments.length === 2 ? 'grid-cols-2' : post.attachments.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {post.attachments.slice(0, 4).map((attachment, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden aspect-square">
                  {attachment.type === 'image' && (
                    <Image
                      src={attachment.url}
                      alt={attachment.filename || `Attachment ${index + 1}`}
                      width={400}
                      height={400}
                      className={`w-full h-full object-cover ${isBlurred && post.isNSFW ? 'blur-2xl' : ''}`}
                    />
                  )}
                  {index === 3 && post.attachments && post.attachments.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">+{post.attachments.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
              {post.isNSFW && isBlurred && (
                <div className="absolute inset-0 backdrop-blur-xl bg-black/50 flex flex-col items-center justify-center z-10">
                  <HiEyeOff className="w-16 h-16 text-white mb-3" />
                  <p className="text-white font-semibold text-lg mb-3">NSFW Content</p>
                  <button
                    onClick={() => setIsBlurred(false)}
                    className="px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg text-white font-semibold transition-smooth"
                  >
                    Reveal Content
                  </button>
                </div>
              )}
              {post.isNSFW && !isBlurred && (
                <button
                  onClick={() => setIsBlurred(true)}
                  className="absolute top-3 right-3 p-2.5 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-smooth z-20"
                >
                  <HiEye className="w-6 h-6" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Legacy Media URL support */}
      {post.mediaUrl && (!post.attachments || post.attachments.length === 0) && (
        <div className="relative mb-5 rounded-lg overflow-hidden">
          {post.isNSFW && isBlurred && (
            <div className="absolute inset-0 backdrop-blur-xl bg-black/50 flex flex-col items-center justify-center z-10">
              <HiEyeOff className="w-16 h-16 text-white mb-3" />
              <p className="text-white font-semibold text-lg mb-3">NSFW Content</p>
              <button
                onClick={() => setIsBlurred(false)}
                className="px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg text-white font-semibold transition-smooth"
              >
                Reveal Content
              </button>
            </div>
          )}
          <Image
            src={post.mediaUrl}
            alt="Post media"
            width={800}
            height={500}
            className={`w-full h-auto ${isBlurred && post.isNSFW ? 'blur-2xl' : ''}`}
          />
          {post.isNSFW && !isBlurred && (
            <button
              onClick={() => setIsBlurred(true)}
              className="absolute top-3 right-3 p-2.5 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-smooth"
            >
              <HiEye className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        {/* Vote Section */}
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleVote('upvote')}
            className={`p-2.5 rounded-lg transition-smooth ${
              upvoted
                ? 'bg-primary text-white shadow-md'
                : 'bg-surface-hover text-text-muted hover:bg-primary/20'
            }`}
          >
            <HiArrowUp className="w-6 h-6" />
          </motion.button>
          <span className="font-bold text-text text-lg min-w-[3rem] text-center">{voteCount}</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleVote('downvote')}
            className={`p-2.5 rounded-lg transition-smooth ${
              downvoted
                ? 'bg-error text-white shadow-md'
                : 'bg-surface-hover text-text-muted hover:bg-error/20'
            }`}
          >
            <HiArrowDown className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Other Actions */}
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-lg bg-surface-hover text-text-muted hover:bg-info/20 hover:text-info transition-smooth"
          >
            <HiChat className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="p-2.5 rounded-lg bg-surface-hover text-text-muted hover:bg-info/20 hover:text-info transition-smooth"
          >
            <HiShare className="w-6 h-6" />
          </motion.button>

          {/* Archive/Delete Actions for Owner */}
          {showActions && user && user.userId === post.authorId && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleArchive}
                disabled={isArchiving}
                className="p-2.5 rounded-lg bg-surface-hover text-text-muted hover:bg-yellow-500/20 hover:text-yellow-600 transition-smooth disabled:opacity-50"
                title={post.isArchived ? 'Unarchive post' : 'Archive post'}
              >
                {isArchiving ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-yellow-600 border-t-transparent rounded-full"
                  />
                ) : (
                  <HiArchive className="w-6 h-6" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2.5 rounded-lg bg-surface-hover text-text-muted hover:bg-red-500/20 hover:text-red-600 transition-smooth"
                title="Delete post permanently"
              >
                <HiTrash className="w-6 h-6" />
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface border border-border rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <HiTrash className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">Delete Post</h3>
                <p className="text-sm text-text-muted">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-text mb-6">
              Are you sure you want to permanently delete this post? This will also delete all comments and related data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-surface-elevated hover:bg-border rounded-lg font-semibold text-text-primary transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Deleting...
                  </>
                ) : (
                  'Delete Permanently'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
