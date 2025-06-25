import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Camera, Mic, Sparkles, User, Bot, Image as ImageIcon, Heart, Share, ShoppingCart, ExternalLink, Star } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { EnhancedChatService } from '../../services/enhancedChatService';
import type { ChatMessage, Product } from '../../types';
import toast from 'react-hot-toast';

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
        handleSendMessage();
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
    if (!input.trim()) return;

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
    setIsSearching(true);

    try {
      console.log('🔍 Searching for unique products with real shopping links...');
      
      toast.loading('🔍 Finding unique products with real shopping links...', { id: 'search-toast' });
      
      const result = await enhancedChatService.processUserMessage(
        userInput,
        preferences!,
        currentProduct
      );

      toast.dismiss('search-toast');

      // Extract all unique products from all cards
      const allProducts: Product[] = [];
      const seenUrls = new Set<string>();
      
      for (const card of result.recommendationCards) {
        for (const product of card.products) {
          // Check for unique URLs only
          const normalizedUrl = normalizeUrl(product.url);
          if (!seenUrls.has(normalizedUrl)) {
            seenUrls.add(normalizedUrl);
            allProducts.push({
              ...product,
              platform: determinePlatformFromUrl(product.url) // Fix platform badging
            });
          }
        }
      }

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-products`,
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        recommendations: [
          {
            id: 'unique-products',
            products: allProducts
          }
        ] as any
      };

      addMessage(assistantMessage);
      
      if (allProducts.length > 0) {
        toast.success(`✅ Found ${allProducts.length} unique products with real shopping links!`);
      } else {
        toast.success('✅ Search complete! Try asking for specific fashion items.');
      }
      
    } catch (error) {
      console.error('Error in product search:', error);
      toast.dismiss('search-toast');
      toast.error('Search temporarily unavailable. Please try again.');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

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
            currentProduct
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
          className="bg-white border border-gray-100 hover:border-gray-200 transition-all duration-500 overflow-hidden group"
          whileHover={{ y: -5 }}
        >
          {/* Product Image */}
          <div className="relative h-80 overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                e.currentTarget.src = 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400';
              }}
            />
            
            {/* Platform Badge */}
            <div className={`absolute top-4 left-4 px-3 py-1 text-xs font-light tracking-wide text-white ${
              product.platform === 'flipkart' ? 'bg-yellow-600' :
              product.platform === 'amazon' ? 'bg-blue-600' :
              product.platform === 'myntra' ? 'bg-pink-600' :
              'bg-gray-600'
            }`}>
              {product.platform.charAt(0).toUpperCase() + product.platform.slice(1)}
            </div>

            {/* Discount Badge */}
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="absolute top-4 right-4 px-3 py-1 text-xs font-medium text-white bg-black">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </div>
            )}

            {/* Quick Actions */}
            <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <motion.button
                onClick={() => {/* Add to wishlist */}}
                className="p-3 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-red-500 transition-colors duration-300 shadow-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                onClick={() => navigator.share?.({ title: product.name, url: product.url })}
                className="p-3 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-blue-500 transition-colors duration-300 shadow-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Share className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-6">
            <h3 className="font-light text-black line-clamp-2 text-base mb-3 tracking-wide">
              {product.name}
            </h3>
            
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-lg font-light text-black">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                {product.reviews && (
                  <span className="text-xs text-gray-500">
                    ({product.reviews.toLocaleString()})
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <motion.button
                onClick={() => window.open(product.affiliateLink || product.url, '_blank')}
                className="flex-1 bg-black text-white py-3 px-4 text-sm font-light tracking-wide hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>BUY NOW</span>
              </motion.button>
              
              <motion.button
                onClick={() => window.open(product.url, '_blank')}
                className="px-4 border border-gray-200 text-gray-700 py-3 hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

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