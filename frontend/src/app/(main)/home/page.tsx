'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPlus } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import PostCard from '@/components/PostCard';
import AegisChat from '@/components/AegisChat';
import { usePostStore, Post } from '@/store/postStore';
import { useUserStore } from '@/store/userStore';
import { postService } from '@/lib/services';

export default function HomePage() {
  const router = useRouter();
  const posts = usePostStore((state) => state.posts);
  const setPosts = usePostStore((state) => state.setPosts);
  const user = useUserStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      // Return early if posts are already loaded
      if (posts.length > 0) {
        setIsLoading(false);
        return;
      }

      try {
        const fetchedPosts = await postService.getPosts();
        setPosts(fetchedPosts.posts || []);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        // Load sample posts for demo
        const samplePosts: Post[] = [
          {
            postId: '1',
            authorId: 'sample',
            authorAlias: 'Agent_001',
            content:
              'This platform represents a new era of anonymous whistleblowing. Truth should never be silenced.',
            tags: ['Society', 'Other'],
            upvotes: 42,
            downvotes: 3,
            isNSFW: false,
            createdAt: new Date(),
          },
          {
            postId: '2',
            authorId: 'sample2',
            authorAlias: 'CipherWolf',
            content:
              'Remember: anonymity is not a shield for lies, but a protection for truth-tellers. Use the Veil Token system to build credibility.',
            tags: ['Government'],
            upvotes: 87,
            downvotes: 5,
            isNSFW: false,
            createdAt: new Date(Date.now() - 3600000),
          },
        ];
        setPosts(samplePosts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [setPosts, posts.length]);

  return (
    <>
      <AegisChat />

      {/* Feed Section */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
            />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            <p className="text-xl mb-2">No whistles yet</p>
            <p>Be the first to share something</p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.postId} post={post} />)
        )}
      </div>

      {/* Floating Action Button - Redirects to /new */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => router.push('/new')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary hover:bg-primary-hover rounded-full flex items-center justify-center shadow-card-hover z-40 transition-smooth"
        aria-label="Create new post"
      >
        <HiPlus className="w-8 h-8 text-white" />
      </motion.button>
    </>
  );
}
