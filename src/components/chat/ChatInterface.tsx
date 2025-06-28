import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Camera, Mic, Sparkles, User, Bot, Image as ImageIcon, Heart, Share, ShoppingCart, ExternalLink, Star } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { EnhancedChatService } from '../../services/enhancedChatService';
import type { ChatMessage, Product } from '../../types';
import toast from 'react-hot-toast';
import AdviceCard from './AdviceCard';

interface CleanProductCard {
  id: string;
  products: Product[];
}

export function ChatInterface({ initialUserMessage }: { initialUserMessage?: string }) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { messages, addMessage, preferences, currentProduct } = useAppStore();
  const enhancedChatService = new EnhancedChatService();

  // Auto-send initialUserMessage if provided and no user messages yet
  useEffect(() => {
    if (initialUserMessage && messages.filter(m => m.type === 'user').length === 0) {
      setInput(initialUserMessage);
      setTimeout(() => {
        handleSendMessageRef.current();
      }, 300);
    }
    // eslint-disable-next-line
  }, [initialUserMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome-msg',
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        recommendations: [
          {
            id: 'welcome-products',
            products: []
          }
        ] as any
      };
      addMessage(welcomeMessage);
    }
  }, [messages.length, addMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const normalizeUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return `${urlObj.hostname}${urlObj.pathname}`;
    } catch {
      return url;
    }
  };

  const determinePlatformFromUrl = (url: string): 'flipkart' | 'amazon' | 'myntra' => {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('amazon')) return 'amazon';
    if (urlLower.includes('myntra')) return 'myntra';
    if (urlLower.includes('flipkart')) return 'flipkart';
    
    // Default fallback
    return 'flipkart';
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: input,
      timestamp: new Date()
    };
    addMessage(userMessage);

    const userInput = input;
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:5000/get_recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: userInput,
          // You can pass more context from your app store if needed
          brand: currentProduct?.brand || '',
          category: currentProduct?.category || '',
          price: currentProduct?.price || 0
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.recommendations) {
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-recs`,
          type: 'assistant',
          content: `Here are some recommendations for "${userInput}":`,
          timestamp: new Date(),
          advice: data.recommendations,
        };
        addMessage(assistantMessage);
      } else {
        throw new Error(data.error || 'Failed to get recommendations from server.');
      }

    } catch (error) {
      console.error("Error fetching recommendations:", error);
      const err = error as Error;
      addMessage({
        id: `err-${Date.now()}`,
        type: 'assistant',
        content: `Sorry, I couldn't get recommendations. Error: ${err.message}`,
        timestamp: new Date()
      });
      toast.error("Could not connect to the recommendation service.");
    } finally {
      setIsLoading(false);
    }
  };

  // Create a ref to hold the latest version of handleSendMessage
  const handleSendMessageRef = useRef(handleSendMessage);
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        const userMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          type: 'user',
          content: 'Find products similar to this image',
          timestamp: new Date(),
          image: imageUrl
        };
        addMessage(userMessage);
        
        // Process image for product search
        setIsLoading(true);
        setIsSearching(true);
        
        try {
          const result = await enhancedChatService.processUserMessage(
            'Find fashion products similar to uploaded image',
            preferences!,
            currentProduct || undefined
          );
          
          const allProducts: Product[] = [];
          const seenUrls = new Set<string>();
          
          for (const card of result.recommendationCards) {
            for (const product of card.products) {
              const normalizedUrl = normalizeUrl(product.url);
              if (!seenUrls.has(normalizedUrl)) {
                seenUrls.add(normalizedUrl);
                allProducts.push({
                  ...product,
                  platform: determinePlatformFromUrl(product.url)
                });
              }
            }
          }

          const assistantMessage: ChatMessage = {
            id: `msg-${Date.now()}-image-products`,
            type: 'assistant',
            content: '',
            timestamp: new Date(),
            recommendations: [
              {
                id: 'image-products',
                products: allProducts
              }
            ] as any
          };
          addMessage(assistantMessage);
          toast.success(`🎨 Found ${allProducts.length} products similar to your image!`);
        } catch (error) {
          toast.error('Image analysis failed. Please try again.');
        } finally {
          setIsLoading(false);
          setIsSearching(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startVoiceRecording = () => {
    setIsListening(true);
    toast.success('🎤 Listening...');
    
    setTimeout(() => {
      setIsListening(false);
      const voiceQueries = [
        'Find trending ethnic wear with real shopping links',
        'Show me western outfits with actual buying links',
        'Search for formal wear with real prices',
        'Find budget-friendly fashion with shopping links',
        'Show me party wear with actual product links'
      ];
      const randomQuery = voiceQueries[Math.floor(Math.random() * voiceQueries.length)];
      setInput(randomQuery);
      toast.success('🎯 Voice captured!');
    }, 2000);
  };

  const ProductGrid = ({ products }: { products: Product[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-subtle overflow-hidden group border border-gray-200/80 dark:border-gray-700/60"
        >
          <div className="relative h-64 overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute top-2 right-2 flex gap-2">
              <button className="bg-white/20 backdrop-blur-sm text-white rounded-full p-2 hover:bg-white/30 transition-colors">
                <Heart size={18} />
              </button>
              <button className="bg-white/20 backdrop-blur-sm text-white rounded-full p-2 hover:bg-white/30 transition-colors">
                <Share size={18} />
              </button>
            </div>
            <div className={`absolute top-2 left-2`}>
              <img src={`/logos/${product.platform}-logo.png`} alt={product.platform} className="w-12 h-auto rounded-md" />
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate group-hover:text-fuchsia-600 transition-colors">{product.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{product.brand}</p>
            <div className="flex items-center justify-between mt-4">
              <p className="text-xl font-bold text-gray-900 dark:text-white">₹{formatPrice(product.price ?? 0)}</p>
              <div className="flex items-center gap-1 text-amber-400">
                <Star size={16} className="fill-current" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{product.rating?.toFixed(1) || '4.5'}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <a href={product.url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-fuchsia-600 text-white font-semibold py-2 px-4 rounded-lg text-center text-sm hover:bg-fuchsia-700 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2">
                <ShoppingCart size={16} />
                Buy Now
              </a>
              <a href={product.url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg text-center text-sm hover:bg-gray-300 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2">
                <ExternalLink size={16} />
                Visit
              </a>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-4xl w-full ${
                message.type === 'user' ? 'ml-auto' : 'mr-auto'
              }`}>
                <div className={`flex items-start space-x-4 ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ${
                    message.type === 'user'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <Bot className="w-5 h-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {/* User message */}
                    {message.type === 'user' && message.content && (
                      <div className="bg-black text-white px-8 py-6 mb-6">
                        {message.image && (
                          <div className="mb-4">
                            <img
                              src={message.image}
                              alt="Uploaded"
                              className="max-w-full h-64 object-cover"
                            />
                          </div>
                        )}
                        <div className="text-sm font-light whitespace-pre-line leading-relaxed tracking-wide">
                          {message.content}
                        </div>
                      </div>
                    )}
                    
                    {/* Product Cards */}
                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="w-full">
                        {message.recommendations.map((rec: any) => (
                          rec.products && rec.products.length > 0 && (
                            <div key={rec.id}>
                              <div className="flex items-center space-x-3 mb-6">
                                <Sparkles className="w-5 h-5 text-gray-600" />
                                <span className="text-lg font-light tracking-wide text-black">
                                  {rec.products.length} Products Found
                                </span>
                              </div>
                              <ProductGrid products={rec.products} />
                            </div>
                          )
                        ))}
                      </div>
                    )}
                    {/* Fashion Advice Card */}
                    {message.advice && (
                      <AdviceCard advice={message.advice} />
                    )}
                  </div>
                </div>

                {/* Timestamp */}
                <p className={`text-xs text-gray-500 mt-3 ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white border border-gray-200 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-sm font-light text-gray-600 tracking-wide">
                    {isSearching ? 'Searching for products...' : 'Processing...'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-8">
        <div className="flex items-center space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-black transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ImageIcon className="w-5 h-5" />
          </motion.button>

          <motion.button
            onClick={startVoiceRecording}
            className={`p-2 transition-colors duration-300 ${
              isListening ? 'text-red-500' : 'text-gray-500 hover:text-black'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
          </motion.button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Describe what you're looking for..."
              className="w-full px-6 py-4 border border-gray-300 focus:outline-none focus:border-black transition-colors duration-300 font-light text-black dark:text-white bg-white dark:bg-gray-800"
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <Sparkles className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          <motion.button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-black text-white p-4 hover:bg-gray-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Quick Suggestions */}
        <div className="flex flex-wrap gap-3 mt-4">
          {[
            'Find trending ethnic wear',
            'Show western outfits',
            'Search formal wear',
            'Budget-friendly fashion',
            'Party wear collection'
          ].map((suggestion) => (
            <motion.button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="px-4 py-2 text-sm font-light bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors duration-300 border border-gray-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}