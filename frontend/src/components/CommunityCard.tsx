'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiUsers, HiDocument, HiArrowRight } from 'react-icons/hi';
import { Community } from '@/store/communityStore';

interface CommunityCardProps {
  community: Community;
}

export default function CommunityCard({ community }: CommunityCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/communities/${community.communityId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      className="group bg-surface border border-border rounded-xl overflow-hidden transition-all hover:shadow-xl hover:border-primary/30 cursor-pointer w-full h-full flex flex-col"
    >
      {/* Banner/Header */}
      <div className="relative w-full h-40 flex-shrink-0 bg-gradient-to-br from-primary/20 via-primary/10 to-surface overflow-hidden">
        {community.bannerUrl ? (
          <img
            src={community.bannerUrl}
            alt={community.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center ring-4 ring-primary/10">
              <span className="text-4xl font-bold text-primary">
                {community.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-surface/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 flex-grow flex flex-col">
        {/* Community Name with Arrow Icon */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-text group-hover:text-primary transition-colors line-clamp-1">
            {community.name}
          </h3>
          <HiArrowRight className="w-5 h-5 text-text/40 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>

        {/* Description */}
        <p className="text-text/60 text-sm leading-relaxed line-clamp-2 min-h-[2.5rem] flex-grow">
          {community.description}
        </p>

        {/* Divider */}
        <div className="border-t border-border/50" />

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-text/70">
            <div className="p-2 rounded-lg bg-primary/10">
              <HiUsers className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-text">{community.memberCount.toLocaleString()}</span>
              <span className="text-xs text-text/50">members</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-text/70">
            <div className="p-2 rounded-lg bg-info/10">
              <HiDocument className="w-4 h-4 text-info" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-text">{community.postCount.toLocaleString()}</span>
              <span className="text-xs text-text/50">posts</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
