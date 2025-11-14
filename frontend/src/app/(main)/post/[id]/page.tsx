'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Flag,
  Shield
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { postService } from '@/lib/services';
import { useUserStore } from '@/store/userStore';
import { Post as BasePost } from '@/store/postStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import toast from 'react-hot-toast';

interface Post extends BasePost {
  title?: string;
  category?: string;
  postType?: string;
  veilReward?: number;
  commentsCount?: number;
  createdAt: Date;
  upvotedBy?: string[];
  downvotedBy?: string[];
  attachments?: Array<{ url: string; type: string; filename: string }>;
}

interface Comment {
  commentId: string;
  authorAlias: string;
  authorId: string;
  content: string;
  upvotes: number;
  downvotes: number;
  upvotedBy: string[];
  downvotedBy: string[];
  parentCommentId: string | null;
  createdAt: Date;
  replies?: Comment[];
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const currentUser = useUserStore((state) => state.user);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (params.id) {
      fetchPost();
      fetchComments();
    }
  }, [params.id]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      const data = await postService.getPost(params.id as string);
      setPost(data);
    } catch (error) {
      console.error('Failed to fetch post:', error);
      toast.error('Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await postService.getComments(params.id as string);
      // Organize comments into threaded structure
      const organizedComments = organizeComments(data);
      setComments(organizedComments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  // Organize flat comments into threaded structure
  const organizeComments = (flatComments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create a map of all comments
    flatComments.forEach((comment) => {
      commentMap.set(comment.commentId, { ...comment, replies: [] });
    });

    // Second pass: organize into parent-child relationships
    flatComments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.commentId)!;
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId);
        if (parent) {
          parent.replies!.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    // Sort root comments by upvotes (highest first)
    rootComments.sort((a, b) => b.upvotes - a.upvotes);

    return rootComments;
  };

  const handleCommentVote = async (commentId: string, voteType: 'upvote' | 'downvote') => {
    if (!currentUser) {
      toast.error('Please sign in to vote');
      return;
    }

    try {
      await postService.voteComment(commentId, voteType, currentUser.userId);
      fetchComments(); // Refresh comments
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const handleReply = async (parentCommentId: string) => {
    if (!currentUser) {
      toast.error('Please sign in to reply');
      return;
    }

    const content = replyContent[parentCommentId];
    if (!content?.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      await postService.createComment(post!.postId, {
        authorId: currentUser.userId,
        content,
        parentCommentId,
      });
      setReplyContent({ ...replyContent, [parentCommentId]: '' });
      setReplyingTo(null);
      fetchComments();
      toast.success('Reply posted');
    } catch (error) {
      toast.error('Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!currentUser) {
      toast.error('Please sign in to vote');
      return;
    }

    try {
      await postService.votePost(post!.postId, voteType);
      fetchPost(); // Refresh post data
      toast.success('Vote recorded');
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const handleSubmitComment = async () => {
    if (!currentUser) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      await postService.createComment(post!.postId, {
        authorId: currentUser.userId,
        content: newComment
      });
      setNewComment('');
      fetchComments();
      toast.success('Comment posted');
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title || 'Whistle Post',
        text: post?.content.substring(0, 100),
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
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

  if (!post) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-text-muted mb-4">Post not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const hasUpvoted = post.upvotedBy?.includes(currentUser?.userId || '');
  const hasDownvoted = post.downvotedBy?.includes(currentUser?.userId || '');

  // Helper function to count all nested replies recursively
  const countAllReplies = (comment: Comment): number => {
    if (!comment.replies || comment.replies.length === 0) return 0;

    let count = comment.replies.length;
    comment.replies.forEach(reply => {
      count += countAllReplies(reply);
    });
    return count;
  };

  // Recursive comment component (Threads-like design)
  const CommentThread = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
    const hasUpvotedComment = comment.upvotedBy?.includes(currentUser?.userId || '');
    const hasDownvotedComment = comment.downvotedBy?.includes(currentUser?.userId || '');
    const isReplying = replyingTo === comment.commentId;
    const totalReplies = countAllReplies(comment);

    return (
      <div className={`${depth > 0 ? 'ml-8 mt-3' : ''}`}>
        {/* Comment */}
        <div className="flex gap-3">
          {/* Left border for nested replies */}
          {depth > 0 && (
            <div className="w-0.5 bg-border flex-shrink-0" />
          )}

          <div className="flex-1">
            {/* Comment header */}
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-xs">
                  {comment.authorAlias.charAt(0)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-text">{comment.authorAlias}</span>
                <span className="text-xs text-text-dim">
                  {new Date(comment.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Comment content */}
            <p className="text-text text-sm mb-2 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>

            {/* Comment actions */}
            <div className="flex items-center gap-4 mb-3">
              {/* Upvote */}
              <button
                onClick={() => handleCommentVote(comment.commentId, 'upvote')}
                className={`flex items-center gap-1 transition-colors ${
                  hasUpvotedComment
                    ? 'text-primary'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <ThumbsUp size={14} fill={hasUpvotedComment ? 'currentColor' : 'none'} />
                <span className="text-xs font-medium">{comment.upvotes || 0}</span>
              </button>

              {/* Downvote */}
              <button
                onClick={() => handleCommentVote(comment.commentId, 'downvote')}
                className={`flex items-center gap-1 transition-colors ${
                  hasDownvotedComment
                    ? 'text-error'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <ThumbsDown size={14} fill={hasDownvotedComment ? 'currentColor' : 'none'} />
              </button>

              {/* Reply button */}
              <button
                onClick={() => {
                  setReplyingTo(isReplying ? null : comment.commentId);
                  if (!isReplying && !replyContent[comment.commentId]) {
                    setReplyContent({ ...replyContent, [comment.commentId]: '' });
                  }
                }}
                className="text-xs font-medium text-text-muted hover:text-text transition-colors"
              >
                {isReplying ? 'Cancel' : 'Reply'}
              </button>

              {/* View replies button */}
              {comment.replies && comment.replies.length > 0 && (
                <button
                  onClick={() => setShowReplies({ ...showReplies, [comment.commentId]: !showReplies[comment.commentId] })}
                  className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  {showReplies[comment.commentId] ? 'Hide replies' : `View replies (${totalReplies})`}
                </button>
              )}
            </div>

            {/* Reply input */}
            {isReplying && (
              <div className="mb-4 pb-4 border-b border-border">
                <input
                  type="text"
                  value={replyContent[comment.commentId] || ''}
                  onChange={(e) =>
                    setReplyContent({ ...replyContent, [comment.commentId]: e.target.value })
                  }
                  placeholder={`Reply to ${comment.authorAlias}...`}
                  className="w-full p-3 bg-surface border border-border rounded-lg text-sm text-text placeholder:text-text-dim focus:border-primary focus:outline-none transition-smooth"
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent({ ...replyContent, [comment.commentId]: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleReply(comment.commentId)}
                    disabled={isSubmitting || !replyContent[comment.commentId]?.trim()}
                  >
                    {isSubmitting ? 'Posting...' : 'Reply'}
                  </Button>
                </div>
              </div>
            )}

            {/* Nested replies */}
            {comment.replies && comment.replies.length > 0 && showReplies[comment.commentId] && (
              <div className="space-y-0">
                {comment.replies.map((reply) => (
                  <CommentThread key={reply.commentId} comment={reply} depth={depth + 1} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-text-muted hover:text-text mb-6 transition-smooth"
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      {/* Post Card */}
      <Card className="p-6 mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold">{post.authorAlias.charAt(0)}</span>
            </div>
            <div>
              <p className="font-semibold text-text">{post.authorAlias}</p>
              <p className="text-sm text-text-dim">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Archived Badge */}
          {post.isArchived && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-base">
              <span className="text-xs font-semibold text-yellow-600 uppercase">Archived</span>
            </div>
          )}
        </div>

        {/* Category & Type */}
        {(post.category || post.postType) && (
          <div className="flex gap-2 mb-4">
            {post.category && (
              <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-base">
                {post.category}
              </span>
            )}
            {post.postType && (
              <span className="px-3 py-1 text-xs font-medium bg-surface-hover text-text-muted rounded-base">
                {post.postType.replace('_', ' ')}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        {post.title && (
          <h1 className="text-2xl font-bold text-text mb-4">{post.title}</h1>
        )}

        {/* Content */}
        <p className="text-text whitespace-pre-wrap mb-6">{post.content}</p>

        {/* Attachments - Show full images */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="mb-6 space-y-3">
            {post.attachments.map((attachment, index) => (
              <div key={index}>
                {attachment.type === 'image' ? (
                  <img
                    src={attachment.url}
                    alt={attachment.filename}
                    className="w-full rounded-lg"
                  />
                ) : (
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-surface-hover rounded-base hover:bg-border transition-smooth"
                  >
                    <span className="text-sm text-text">{attachment.filename}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-sm bg-surface-hover text-text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <div className="flex items-center gap-2">
            <Button
              variant={hasUpvoted ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleVote('upvote')}
            >
              <ThumbsUp size={16} />
              <span>{post.upvotes}</span>
            </Button>

            <Button
              variant={hasDownvoted ? 'danger' : 'secondary'}
              size="sm"
              onClick={() => handleVote('downvote')}
            >
              <ThumbsDown size={16} />
              <span>{post.downvotes}</span>
            </Button>

            <Button variant="ghost" size="sm">
              <MessageSquare size={16} />
              <span>{post.commentsCount}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 size={16} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Comments Section */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-text mb-6">
          Comments ({comments.reduce((count, c) => count + 1 + (c.replies?.length || 0), 0)})
        </h2>

        {/* Add Comment */}
        <div className="mb-8 pb-6 border-b border-border">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold">
                {currentUser?.alias.charAt(0) || '?'}
              </span>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 bg-surface border border-border rounded-lg text-text placeholder:text-text-dim focus:border-primary focus:outline-none resize-none transition-smooth"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !newComment.trim()}
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-center text-text-muted py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => (
              <CommentThread key={comment.commentId} comment={comment} depth={0} />
            ))
          )}
        </div>
      </Card>
    </>
  );
}
