'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useCommunityStore } from '@/store/communityStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function NewCommunityPage() {
  const router = useRouter();
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const addCommunity = useCommunityStore((state) => state.addCommunity);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [rules, setRules] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    console.log('[NewCommunityPage] Submit started');
    console.log('[NewCommunityPage] isLoaded:', isLoaded);
    console.log('[NewCommunityPage] isSignedIn:', isSignedIn);
    console.log('[NewCommunityPage] clerkUser:', clerkUser?.id);

    if (!isLoaded) {
      toast.error('Loading...');
      return;
    }

    if (!isSignedIn || !clerkUser) {
      toast.error('Please sign in to create a community');
      router.push('/sign-in');
      return;
    }

    if (!name.trim()) {
      toast.error('Community name is required');
      return;
    }

    if (!description.trim()) {
      toast.error('Community description is required');
      return;
    }

    try {
      setIsSubmitting(true);

      const rulesArray = rules
        .split('\n')
        .map(rule => rule.trim())
        .filter(rule => rule.length > 0);

      console.log('[NewCommunityPage] Creating community with clerkUserId:', clerkUser.id);

      const response = await axios.post('http://localhost:4000/communities', {
        clerkUserId: clerkUser.id,
        name: name.trim(),
        description: description.trim(),
        bannerUrl: bannerUrl.trim() || undefined,
        rules: rulesArray.length > 0 ? rulesArray : undefined,
      });

      console.log('[NewCommunityPage] Community created:', response.data);

      addCommunity(response.data);
      toast.success('Community created successfully!');
      router.push(`/communities/${response.data.communityId}`);
    } catch (error: any) {
      console.error('[NewCommunityPage] Failed to create community:', error);
      console.error('[NewCommunityPage] Error response:', error.response?.data);
      toast.error(
        'Failed to create community: ' +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2">Create a Community</h1>
        <p className="text-text-muted">
          Build a space for people to connect around shared interests
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Community Name */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Community Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Technology Whistleblowers"
            maxLength={100}
            className="w-full px-4 py-3 bg-background border border-border rounded-base text-text placeholder:text-text-dim focus:border-primary focus:outline-none transition-smooth"
          />
          <p className="text-xs text-text-dim mt-1">
            Choose a unique, descriptive name
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what your community is about..."
            maxLength={500}
            rows={8}
            className="w-full px-4 py-3 bg-background border border-border rounded-base text-text placeholder:text-text-dim focus:border-primary focus:outline-none resize-none transition-smooth"
          />
          <p className="text-xs text-text-dim mt-1">
            {description.length}/500 characters
          </p>
        </div>

        {/* Banner URL */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Banner Image URL (Optional)
          </label>
          <div className="space-y-3">
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://example.com/banner.jpg"
              className="w-full px-4 py-3 bg-background border border-border rounded-base text-text placeholder:text-text-dim focus:border-primary focus:outline-none transition-smooth"
            />
            {bannerUrl && (
              <div className="rounded-base overflow-hidden border border-border bg-surface">
                <img
                  src={bannerUrl}
                  alt="Banner preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-48 flex items-center justify-center bg-surface-hover"><div class="text-center"><svg class="w-16 h-16 mx-auto mb-2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="text-sm text-text-muted">Invalid or broken image URL</p></div></div>';
                    }
                  }}
                />
              </div>
            )}
            <p className="text-xs text-text-dim flex items-center gap-1">
              <ImageIcon size={14} />
              Recommended: 1200x400px, JPG or PNG
            </p>
          </div>
        </div>

        {/* Rules */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Community Rules (Optional)
          </label>
          <textarea
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            placeholder="1. Be respectful to all members&#10;2. No spam or self-promotion&#10;3. Keep posts on-topic&#10;(One rule per line)"
            rows={8}
            className="w-full px-4 py-3 bg-background border border-border rounded-base text-text placeholder:text-text-dim focus:border-primary focus:outline-none resize-none transition-smooth"
          />
          <p className="text-xs text-text-dim mt-1">
            One rule per line. These will guide community behavior.
          </p>
        </div>

        {/* Info Notice */}
        <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-base">
          <AlertCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-primary mb-1">
              Community Guidelines
            </p>
            <p className="text-text-muted">
              As the creator, you'll be responsible for moderating this community
              and ensuring it follows Whistle's terms of service.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim() || !description.trim()}
          >
            {isSubmitting ? 'Creating...' : 'Create Community'}
          </Button>
        </div>
      </Card>
    </>
  );
}
