'use client';

import { TrendingUp, Users, AlertCircle } from 'lucide-react';

const trendingTopics = [
  { tag: '#whistleblowing', posts: 1234 },
  { tag: '#transparency', posts: 892 },
  { tag: '#accountability', posts: 567 },
  { tag: '#ethics', posts: 432 },
];

const suggestedCommunities = [
  { name: 'Corporate Accountability', members: '12.5K' },
  { name: 'Government Transparency', members: '8.2K' },
  { name: 'Tech Ethics', members: '6.7K' },
];

export default function RightRail() {
  return (
    <aside className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-surface border-l border-border overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Trending Topics */}
        <div className="bg-background rounded-base p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="font-semibold text-lg">Trending Topics</h2>
          </div>
          <ul className="space-y-3">
            {trendingTopics.map((topic) => (
              <li key={topic.tag}>
                <button className="w-full text-left hover:bg-surface-hover rounded-sm p-2 transition-smooth">
                  <div className="font-medium text-text">{topic.tag}</div>
                  <div className="text-sm text-text-muted">
                    {topic.posts.toLocaleString()} posts
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Suggested Communities */}
        <div className="bg-background rounded-base p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-primary" />
            <h2 className="font-semibold text-lg">Suggested Communities</h2>
          </div>
          <ul className="space-y-3">
            {suggestedCommunities.map((community) => (
              <li key={community.name}>
                <button className="w-full text-left hover:bg-surface-hover rounded-sm p-2 transition-smooth">
                  <div className="font-medium text-text">{community.name}</div>
                  <div className="text-sm text-text-muted">
                    {community.members} members
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Safety Notice */}
        <div className="bg-background rounded-base p-4 border border-warning/20">
          <div className="flex items-start gap-2">
            <AlertCircle size={18} className="text-warning mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-sm mb-1">Stay Safe</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Your anonymity is protected. Never share personal information in posts or
                messages.
              </p>
            </div>
          </div>
        </div>

        {/* Credibility Tokens Info */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-base p-4 border border-primary/20">
          <h3 className="font-semibold text-sm mb-2">Credibility Tokens</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Earn tokens by posting quality content and participating in the community. Use
            tokens to boost your posts.
          </p>
        </div>
      </div>
    </aside>
  );
}
