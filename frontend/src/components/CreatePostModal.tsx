'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiPhotograph } from 'react-icons/hi';
import { postService } from '@/lib/services';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

const tags = ['Government', 'Corporate', 'Society', 'Leaks', 'Confessions', 'Other'];

export default function CreatePostModal({
  isOpen,
  onClose,
  onPostCreated,
}: CreatePostModalProps) {
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isNSFW, setIsNSFW] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('[CreatePostModal] Submit started');
    console.log('[CreatePostModal] isLoaded:', isLoaded);
    console.log('[CreatePostModal] isSignedIn:', isSignedIn);
    console.log('[CreatePostModal] clerkUser:', clerkUser?.id);

    // Simple check - just need Clerk user to be signed in
    if (!isLoaded) {
      toast.error('Loading, please wait...');
      return;
    }

    if (!isSignedIn || !clerkUser) {
      console.log('[CreatePostModal] Not signed in');
      toast.error('Please sign in to create a post');
      return;
    }

    if (!content.trim()) {
      toast.error('Please write something');
      return;
    }

    console.log('[CreatePostModal] Creating post with clerkUserId:', clerkUser.id);
    setIsSubmitting(true);

    try {
      await postService.createPost({
        clerkUserId: clerkUser.id, // Pass clerkUserId directly
        content: content.trim(),
        tags: selectedTags,
        isNSFW,
      });

      toast.success('Whistle posted successfully!');
      setContent('');
      setSelectedTags([]);
      setMediaUrl('');
      setIsNSFW(false);
      onClose();
      if (onPostCreated) onPostCreated();
    } catch (error) {
      console.error('[CreatePostModal] Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-secondary border border-border rounded-2xl p-6 z-50 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold glow-text">Create a Whistle</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-smooth"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Content Textarea */}
              <div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your truth anonymously..."
                  className="w-full min-h-[150px] bg-muted border border-border rounded-lg p-4 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  maxLength={5000}
                />
                <p className="text-sm text-foreground/50 mt-1">
                  {content.length}/5000 characters
                </p>
              </div>

              {/* Media URL */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <HiPhotograph className="w-5 h-5 text-foreground/70" />
                  <label className="text-sm font-medium">Media URL (optional)</label>
                </div>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
                        selectedTags.includes(tag)
                          ? 'bg-primary text-white glow'
                          : 'bg-muted text-foreground/70 hover:bg-muted/70'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* NSFW Toggle */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="nsfw"
                  checked={isNSFW}
                  onChange={(e) => setIsNSFW(e.target.checked)}
                  className="w-5 h-5 rounded border-border bg-muted accent-primary"
                />
                <label htmlFor="nsfw" className="text-sm font-medium">
                  Mark as NSFW/Sensitive Content
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="w-full bg-gradient-to-r from-primary to-accent py-3 rounded-lg font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed glow"
              >
                {isSubmitting ? 'Posting...' : 'Post Whistle'}
              </motion.button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
