'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function FloatingActionButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href="/new">
      <motion.button
        className="fixed bottom-6 right-6 z-40 p-4 bg-primary hover:bg-primary-hover active:bg-primary-active text-white rounded-full shadow-lg transition-smooth"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Create post"
      >
        <Plus size={28} />

        {/* Tooltip */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-surface border border-border rounded-base text-sm whitespace-nowrap"
          >
            <span>Create post</span>
          </motion.div>
        )}
      </motion.button>
    </Link>
  );
}
