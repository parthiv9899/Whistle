'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiSearch } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import CommunityCard from '@/components/CommunityCard';
import { useCommunityStore, Community } from '@/store/communityStore';
import { communityService } from '@/lib/services';
import toast from 'react-hot-toast';

export default function CommunitiesPage() {
  const router = useRouter();
  const communities = useCommunityStore((state) => state.communities);
  const setCommunities = useCommunityStore((state) => state.setCommunities);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await communityService.getCommunities();
        setCommunities(response.communities || []);
      } catch (error) {
        console.error('Failed to fetch communities:', error);
        toast.error('Failed to load communities');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunities();
  }, [setCommunities]);

  const filteredCommunities = communities.filter(
    (community) =>
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Communities</h1>
            <p className="text-text/70">
              Join communities and connect with like-minded individuals
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/communities/new')}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-smooth"
          >
            <HiPlus className="w-5 h-5" />
            Create Community
          </motion.button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text/50" />
          <input
            type="text"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-text placeholder-text/50 focus:outline-none focus:border-primary transition-smooth"
          />
        </div>
      </div>

      {/* Communities Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
            />
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            <p className="text-xl mb-2">
              {searchQuery ? 'No communities found' : 'No communities yet'}
            </p>
            <p className="mb-4">
              {searchQuery
                ? 'Try a different search term'
                : 'Be the first to create a community'}
            </p>
            {!searchQuery && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/communities/new')}
                className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-smooth"
              >
                Create First Community
              </motion.button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCommunities.map((community) => (
              <CommunityCard key={community.communityId} community={community} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
