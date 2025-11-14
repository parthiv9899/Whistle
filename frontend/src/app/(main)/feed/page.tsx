'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import PostCard from '@/components/PostCard';
import { usePostStore, Post } from '@/store/postStore';
import { postService } from '@/lib/services';
import Button from '@/components/ui/Button';

const categories = [
  'All',
  'Corruption',
  'Environment',
  'Education',
  'Military',
  'Technology',
  'Healthcare',
  'Government',
  'Corporate',
  'Society',
  'Other'
];

export default function FeedPage() {
  const posts = usePostStore((state) => state.posts);
  const setPosts = usePostStore((state) => state.setPosts);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'trending' | 'legit'>('recent');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [sortBy, selectedCategory]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        sort: sortBy,
        page: 1,
        limit: 20
      };

      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await postService.getPosts(params);
      setPosts(response.posts || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-background px-6 py-6 max-w-[1200px] mx-auto">
      {/* Sort & Filter Bar */}
      <div className="mb-6 space-y-4">

        {/* Sort Options */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSortBy('recent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-base transition-smooth ${
              sortBy === 'recent'
                ? 'bg-primary text-white'
                : 'bg-surface hover:bg-surface-hover text-text-muted'
            }`}
          >
            <Clock size={16} />
            <span className="text-sm font-medium">Recent</span>
          </button>

          <button
            onClick={() => setSortBy('trending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-base transition-smooth ${
              sortBy === 'trending'
                ? 'bg-primary text-white'
                : 'bg-surface hover:bg-surface-hover text-text-muted'
            }`}
          >
            <TrendingUp size={16} />
            <span className="text-sm font-medium">Trending</span>
          </button>

          <button
            onClick={() => setSortBy('legit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-base transition-smooth ${
              sortBy === 'legit'
                ? 'bg-primary text-white'
                : 'bg-surface hover:bg-surface-hover text-text-muted'
            }`}
          >
            <CheckCircle size={16} />
            <span className="text-sm font-medium">Verified</span>
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-text-muted" />
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-base text-xs font-medium transition-smooth ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-surface hover:bg-surface-hover text-text-muted'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
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
            <p className="text-xl mb-2">No whistles found</p>
            <p className="mb-4">Try adjusting your filters or search terms</p>
            <Button
              variant="primary"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSortBy('recent');
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.postId} post={post} />)
        )}
      </div>
    </div>
  );
}
