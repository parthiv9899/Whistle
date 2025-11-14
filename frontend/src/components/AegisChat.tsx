'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiPaperAirplane, HiSparkles, HiTrash } from 'react-icons/hi';
import { useChatStore } from '@/store/chatStore';
import { useUserStore } from '@/store/userStore';
import { aegisService } from '@/lib/services';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'aegis';
  content: string;
  timestamp: Date;
  references?: { postId: string; title: string; category?: string; upvotes?: number }[];
}

export default function AegisChat() {
  const { isAegisOpen, toggleAegis } = useChatStore();
  const { user } = useUserStore();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'aegis',
      content:
        'Hello! I\'m Aegis AI, your intelligent assistant for Whistle. I can help you find relevant information from existing posts, answer questions about the platform, and provide insights. What would you like to know?',
      timestamp: new Date(),
    },
  ]);
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
      // Call the enhanced Aegis API with user ID and conversation ID
      const response = await aegisService.chat(input, user.userId, conversationId);

      // Save the conversation ID for future messages
      if (response.conversationId && !conversationId) {
        setConversationId(response.conversationId);
      }

      const aegisMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'aegis',
        content: response.message || 'I found some relevant information for you.',
        timestamp: new Date(),
        references: response.references || [],
      };

      setMessages((prev) => [...prev, aegisMessage]);
    } catch (error: any) {
      console.error('Aegis error:', error);
      toast.error(error?.response?.data?.error || 'Failed to get response from Aegis');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'aegis',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = async () => {
    if (!user?.userId || !conversationId) return;

    try {
      await aegisService.deleteConversation(conversationId, user.userId);
      setMessages([
        {
          id: Date.now().toString(),
          role: 'aegis',
          content:
            'Conversation cleared. How can I help you today?',
          timestamp: new Date(),
        },
      ]);
      setConversationId(undefined);
      toast.success('Conversation cleared');
    } catch (error) {
      toast.error('Failed to clear conversation');
    }
  };

  const handleReferenceClick = (postId: string) => {
    router.push(`/post/${postId}`);
    toggleAegis(); // Close the chat when navigating
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isAegisOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed right-4 bottom-4 md:right-6 md:bottom-6 w-[95%] md:w-[420px] h-[80vh] md:h-[650px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-xl"
          style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-5 flex items-center justify-between">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center">
                <HiSparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg tracking-tight">Aegis AI</h3>
                <p className="text-xs text-white/70 font-medium">Intelligent Assistant</p>
              </div>
            </div>
            <div className="relative flex items-center space-x-1">
              {conversationId && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearConversation}
                  className="p-2 rounded-lg hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                  title="Clear conversation"
                >
                  <HiTrash className="w-4 h-4 text-white" />
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleAegis}
                className="p-2 rounded-lg hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
              >
                <HiX className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-5 bg-gray-50 dark:bg-gray-900/50">
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    {message.references && message.references.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                        <p className="text-xs font-semibold mb-3 text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Referenced Posts
                        </p>
                        <div className="space-y-2">
                          {message.references.map((ref, index) => (
                            <motion.div
                              key={index}
                              whileHover={{ scale: 1.02, x: 4 }}
                              onClick={() => handleReferenceClick(ref.postId)}
                              className="text-xs bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 p-3 rounded-xl cursor-pointer transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                    {ref.title}
                                  </p>
                                  {ref.category && (
                                    <span className="inline-block mt-1.5 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md text-[10px] font-medium">
                                      {ref.category}
                                    </span>
                                  )}
                                </div>
                                {ref.upvotes !== undefined && (
                                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap flex items-center gap-0.5">
                                    <span className="text-sm">↑</span> {ref.upvotes}
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] mt-2 opacity-60 font-medium">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <div
                        className="w-2 h-2 bg-pink-600 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
            <div className="flex items-end gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about Whistle..."
                className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-shadow"
              >
                <HiPaperAirplane className="w-5 h-5" />
              </motion.button>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 text-center">
              Powered by Gemini 2.5 Flash
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
