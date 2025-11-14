'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPaperAirplane, HiSparkles, HiTrash } from 'react-icons/hi';
import { aegisService } from '@/lib/services';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'aegis';
  content: string;
  timestamp: Date;
  references?: { postId: string; title: string; category?: string; upvotes?: number }[];
}

export default function AegisPage() {
  const { user } = useUserStore();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!user?.userId) {
      toast.error('Please sign in to use Aegis AI');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aegisService.chat(input, user.userId, conversationId);

      if (response.conversationId && !conversationId) {
        setConversationId(response.conversationId);
      }

      const aegisMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'aegis',
        content: response.message || 'I apologize, but I couldn\'t generate a response.',
        timestamp: new Date(),
        references: response.references || [],
      };

      setMessages((prev) => [...prev, aegisMessage]);
    } catch (error: any) {
      console.error('Aegis error:', error);
      toast.error(error?.response?.data?.error || 'Failed to get response from Aegis AI');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'aegis',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReferenceClick = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handleClearConversation = async () => {
    if (!user?.userId || !conversationId) {
      setMessages([]);
      setConversationId(undefined);
      toast.success('Conversation cleared');
      return;
    }

    try {
      await aegisService.deleteConversation(conversationId, user.userId);
      setMessages([]);
      setConversationId(undefined);
      toast.success('Conversation cleared');
    } catch (error) {
      toast.error('Failed to clear conversation');
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6 bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/10">
              <HiSparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text">Aegis AI</h1>
              <p className="text-sm text-text-muted">Your intelligent assistant for Whistle</p>
            </div>
          </div>
          {conversationId && messages.length > 0 && (
            <button
              onClick={handleClearConversation}
              className="flex items-center gap-2 px-4 py-2 rounded-base bg-surface-hover hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-smooth"
            >
              <HiTrash className="w-4 h-4" />
              <span className="text-sm font-medium">Clear Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="space-y-4 mb-6">
        {messages.length === 0 ? (
          // Welcome Screen
          <div className="bg-surface border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/10 mx-auto mb-4">
              <HiSparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-text mb-2">
              Welcome to Aegis AI
            </h2>
            <p className="text-text-muted mb-6 max-w-2xl mx-auto">
              Your intelligent assistant is ready to help. Ask me anything about whistleblowing, find relevant posts, or get information about the platform.
            </p>

            {/* Suggestion Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
              {[
                { text: 'What is whistleblowing?', icon: '🔍' },
                { text: 'How does anonymous posting work?', icon: '🛡️' },
                { text: 'Show me recent corruption posts', icon: '📋' },
                { text: 'How can I protect my identity?', icon: '🔐' },
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInput(suggestion.text)}
                  className="bg-surface-hover hover:bg-primary/10 border border-border hover:border-primary/30 rounded-base p-4 text-left transition-smooth"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{suggestion.icon}</span>
                    <span className="text-sm font-medium text-text">{suggestion.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Chat Messages
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-primary/20 ring-2 ring-primary/10'
                      : 'bg-surface-hover ring-2 ring-border'
                  }`}>
                    {message.role === 'user' ? (
                      <span className="text-primary font-bold text-sm">You</span>
                    ) : (
                      <HiSparkles className="w-5 h-5 text-primary" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1">
                    <div className={`rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-surface border border-border'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>

                      {/* References Section */}
                      {message.references && message.references.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <p className="text-xs font-semibold mb-3 text-text-muted uppercase tracking-wider">
                            Referenced Posts
                          </p>
                          <div className="space-y-2">
                            {message.references.map((ref, index) => (
                              <div
                                key={index}
                                onClick={() => handleReferenceClick(ref.postId)}
                                className="bg-surface-hover hover:bg-primary/10 border border-border hover:border-primary/30 rounded-base p-3 cursor-pointer transition-smooth"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-text text-sm truncate">
                                      {ref.title}
                                    </p>
                                    {ref.category && (
                                      <span className="inline-block mt-1.5 px-2 py-0.5 bg-primary/10 text-primary rounded-md text-xs font-medium">
                                        {ref.category}
                                      </span>
                                    )}
                                  </div>
                                  {ref.upvotes !== undefined && (
                                    <span className="text-xs text-text-muted font-medium whitespace-nowrap flex items-center gap-0.5">
                                      <span className="text-sm">↑</span> {ref.upvotes}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-text-dim mt-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex gap-3 max-w-[85%]">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface-hover ring-2 ring-border flex items-center justify-center">
                <HiSparkles className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div className="bg-surface border border-border rounded-lg p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-surface border border-border rounded-lg p-4">
        <div className="flex items-end gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Aegis anything..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-background border border-border rounded-base text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-smooth disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-primary hover:bg-primary-hover rounded-base text-white disabled:opacity-50 disabled:cursor-not-allowed transition-smooth flex items-center gap-2"
          >
            <HiPaperAirplane className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">Send</span>
          </button>
        </div>
        <p className="text-xs text-text-dim mt-3 text-center">
          Powered by Gemini 2.5 Flash • Aegis AI can make mistakes
        </p>
      </div>
    </div>
  );
}
