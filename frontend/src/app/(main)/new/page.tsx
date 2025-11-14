'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, X, AlertCircle, FileText, Film } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { mediaService, communityService } from '@/lib/services';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import toast from 'react-hot-toast';
import axios from 'axios';

const categories = [
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

const postTypes = [
  { value: 'personal_experience', label: 'Personal Experience' },
  { value: 'leaked_info', label: 'Leaked Information' },
  { value: 'public_concern', label: 'Public Concern' }
];

export default function NewPostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Other');
  const [postType, setPostType] = useState('public_concern');
  const [tags, setTags] = useState('');
  const [isNSFW, setIsNSFW] = useState(false);
  const [attachments, setAttachments] = useState<Array<{url: string; filename: string; type: string}>>([]);
  const [previewFiles, setPreviewFiles] = useState<Array<{file: File; preview: string; type: string}>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Community support - will be set from URL params
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');
  const [communityName, setCommunityName] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);

      // Create local previews immediately
      const newPreviews: Array<{file: File; preview: string; type: string}> = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const preview = URL.createObjectURL(file);
        const type = file.type.startsWith('image/') ? 'image' :
                     file.type.startsWith('video/') ? 'video' : 'document';
        newPreviews.push({ file, preview, type });
      }
      setPreviewFiles([...previewFiles, ...newPreviews]);

      // Upload to backend
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const response = await mediaService.uploadMultiple(formData);
      setAttachments([...attachments, ...response.files]);
      toast.success('Files uploaded successfully');
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to upload files');
      // Remove previews if upload fails
      const failedPreviews = previewFiles.slice(-files.length);
      failedPreviews.forEach(p => URL.revokeObjectURL(p.preview));
      setPreviewFiles(previewFiles.slice(0, -files.length));
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    // Revoke object URL to free memory
    if (previewFiles[index]) {
      URL.revokeObjectURL(previewFiles[index].preview);
    }
    setAttachments(attachments.filter((_, i) => i !== index));
    setPreviewFiles(previewFiles.filter((_, i) => i !== index));
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      previewFiles.forEach(p => URL.revokeObjectURL(p.preview));
    };
  }, []);

  // Load community from URL params if present
  useEffect(() => {
    const loadCommunityFromParams = async () => {
      const communityParam = searchParams.get('community');
      if (communityParam) {
        try {
          const community = await communityService.getCommunity(communityParam);
          setSelectedCommunity(communityParam);
          setCommunityName(community.name);
        } catch (error) {
          console.error('Failed to load community:', error);
          toast.error('Failed to load community information');
        }
      }
    };

    loadCommunityFromParams();
  }, [searchParams]);

  const handleSubmit = async () => {
    console.log('[NewPostPage] Submit started');
    console.log('[NewPostPage] isLoaded:', isLoaded);
    console.log('[NewPostPage] isSignedIn:', isSignedIn);
    console.log('[NewPostPage] clerkUser:', clerkUser?.id);

    if (!isLoaded) {
      toast.error('Loading...');
      return;
    }

    if (!isSignedIn || !clerkUser) {
      toast.error('Please sign in to create a post');
      router.push('/sign-in');
      return;
    }

    if (!title.trim()) {
      toast.error('Title cannot be empty');
      return;
    }

    if (!content.trim()) {
      toast.error('Content cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);

      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      console.log('[NewPostPage] Creating post with clerkUserId:', clerkUser.id);

      const response = await axios.post('http://localhost:4000/posts', {
        clerkUserId: clerkUser.id,
        title: title.trim(),
        content: content.trim(),
        category,
        postType,
        tags: tagsArray,
        attachments,
        isAnonymous: false, // Always use alias - never truly anonymous
        isNSFW,
        communityId: selectedCommunity || null
      });

      console.log('[NewPostPage] Post created:', response.data);

      // Clean up previews after successful submission
      previewFiles.forEach(p => URL.revokeObjectURL(p.preview));
      setPreviewFiles([]);
      setAttachments([]);

      toast.success('Whistle created successfully!');
      router.push('/home'); // Redirect to home to see the post
    } catch (error: any) {
      console.error('[NewPostPage] Failed to create post:', error);
      console.error('[NewPostPage] Error response:', error.response?.data);
      toast.error('Failed to create post: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2">
          {selectedCommunity ? `Create a Post in ${communityName}` : 'Create a Whistle'}
        </h1>
        <p className="text-text-muted">
          {selectedCommunity
            ? `Share your thoughts with the ${communityName} community`
            : 'Share information securely and anonymously.'}
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your whistle a title..."
            maxLength={200}
            className="w-full px-4 py-3 bg-background border border-border rounded-base text-text placeholder:text-text-dim focus:border-primary focus:outline-none transition-smooth"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Content *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your information here..."
            maxLength={5000}
            rows={8}
            className="w-full px-4 py-3 bg-background border border-border rounded-base text-text placeholder:text-text-dim focus:border-primary focus:outline-none resize-none transition-smooth"
          />
          <p className="text-xs text-text-dim mt-1">{content.length}/5000 characters</p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-base text-text focus:border-primary focus:outline-none transition-smooth"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Community Badge (if posting to community) */}
        {selectedCommunity && communityName && (
          <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-base">
            <AlertCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-primary mb-1">
                Posting to Community
              </p>
              <p className="text-text-muted">
                This post will be shared in <span className="font-semibold text-text">{communityName}</span>
              </p>
            </div>
          </div>
        )}

        {/* Post Type */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Type *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {postTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setPostType(type.value)}
                className={`px-4 py-3 rounded-base text-sm font-medium transition-smooth ${
                  postType === type.value
                    ? 'bg-primary text-white'
                    : 'bg-surface hover:bg-surface-hover text-text-muted border border-border'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Tags (Optional)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., fraud, scandal, leak (comma separated)"
            className="w-full px-4 py-3 bg-background border border-border rounded-base text-text placeholder:text-text-dim focus:border-primary focus:outline-none transition-smooth"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Attachments (Optional)
          </label>
          <div className="space-y-3">
            <label className="flex items-center justify-center gap-2 px-4 py-6 bg-background border-2 border-dashed border-border rounded-base cursor-pointer hover:border-primary transition-smooth">
              <Upload size={20} className="text-text-muted" />
              <span className="text-sm text-text-muted">
                {isUploading ? 'Uploading...' : 'Click to upload files'}
              </span>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf,.doc,.docx,.txt,video/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            {previewFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {previewFiles.map((preview, index) => (
                  <div
                    key={index}
                    className="relative group bg-surface rounded-base overflow-hidden border border-border"
                  >
                    {/* Preview Content */}
                    {preview.type === 'image' && (
                      <img
                        src={preview.preview}
                        alt={preview.file.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    {preview.type === 'video' && (
                      <div className="relative w-full h-48 bg-surface-hover flex items-center justify-center">
                        <video
                          src={preview.preview}
                          className="w-full h-full object-cover"
                          controls={false}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Film size={48} className="text-white" />
                        </div>
                      </div>
                    )}
                    {preview.type === 'document' && (
                      <div className="w-full h-48 bg-surface-hover flex flex-col items-center justify-center gap-2">
                        <FileText size={48} className="text-text-muted" />
                        <span className="text-xs text-text-muted px-2 text-center truncate max-w-full">
                          {preview.file.name}
                        </span>
                      </div>
                    )}

                    {/* Filename overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <span className="text-xs text-white truncate block">
                        {preview.file.name}
                      </span>
                      <span className="text-xs text-white/60">
                        {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeAttachment(index)}
                      className="absolute top-2 right-2 p-1.5 bg-error rounded-full hover:bg-error/80 transition-smooth opacity-0 group-hover:opacity-100"
                      aria-label="Remove file"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isNSFW}
              onChange={(e) => setIsNSFW(e.target.checked)}
              className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary focus:ring-2"
            />
            <div>
              <span className="text-sm font-medium text-text">Mark as NSFW</span>
              <p className="text-xs text-text-muted">
                Contains sensitive or graphic content
              </p>
            </div>
          </label>
        </div>

        {/* Info Notice */}
        <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-base">
          <AlertCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-primary mb-1">Anonymous Posting with Alias</p>
            <p className="text-text-muted">
              All posts are published with your anonymous alias. Your alias cannot be traced back to your personal information, ensuring your anonymity while maintaining accountability through the Veil token system.
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
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            {isSubmitting ? 'Creating...' : 'Create Whistle'}
          </Button>
        </div>
      </Card>
    </>
  );
}
