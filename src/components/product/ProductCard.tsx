import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ExternalLink, Star, TrendingUp, Zap, Share, ShoppingCart, Tag } from 'lucide-react';
import type { Product, Recommendation } from '../../types';
import { useAppStore } from '../../store/appStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  recommendation?: Recommendation;
  compact?: boolean;
  showTrendScore?: boolean;
}

export function ProductCard({ 
  product, 
  recommendation, 
  compact = false, 
  showTrendScore = true 
}: ProductCardProps) {
  const { addToWishlist, wishlists } = useAppStore();

  const handleAddToWishlist = () => {
    if (wishlists.length === 0) {
      toast.error('Please create a wishlist first');
      return;
    }
    
    addToWishlist(wishlists[0].id, product);
    toast.success('Added to wishlist!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this ${product.name} from ${product.brand}`,
          url: product.affiliateLink || product.url
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(product.affiliateLink || product.url);
      toast.success('Product link copied to clipboard!');
    }
  };

  const handleBuyNow = () => {
    // Use affiliate link if available, otherwise use regular URL
    const buyUrl = product.affiliateLink || product.url;
    window.open(buyUrl, '_blank');
    
    // Track the click for analytics
    console.log(`🛒 User clicked buy for ${product.name} on ${product.platform}`);
    toast.success(`Redirecting to ${product.platform.charAt(0).toUpperCase() + product.platform.slice(1)}...`);
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'flipkart': return 'bg-yellow-600';
      case 'amazon': return 'bg-blue-600';
      case 'myntra': return 'bg-pink-600';
      default: return 'bg-gray-600';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-500 transition-all duration-500 overflow-hidden group ${
        compact ? 'p-3' : 'p-0'
      }`}
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Product Image */}
      <div className={`relative overflow-hidden ${compact ? 'h-40' : 'h-80'}`}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            // Fallback image if the original fails to load
            e.currentTarget.src = 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400';
          }}
        />
        
        {/* Platform Badge */}
        <div className={`absolute top-4 left-4 px-3 py-1 text-xs font-light tracking-wide text-white ${getPlatformColor(product.platform)}`}>
          {product.platform.charAt(0).toUpperCase() + product.platform.slice(1)}
        </div>

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-4 right-4 px-3 py-1 text-xs font-medium text-white bg-black dark:bg-gray-900">
            -{discountPercentage}%
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <motion.button
            onClick={handleAddToWishlist}
            className="p-3 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-red-500 transition-colors duration-300 shadow-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Add to Wishlist"
          >
            <Heart className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={handleShare}
            className="p-3 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-blue-500 transition-colors duration-300 shadow-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Share Product"
          >
            <Share className="w-4 h-4" />
          </motion.button>
        </div>

        {/* AI Badge */}
        {recommendation && (
          <div className="absolute bottom-4 left-4 px-3 py-1 text-xs font-light tracking-wide text-white bg-black flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>AI Pick</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className={`${compact ? 'mt-3 px-3 pb-3' : 'p-6'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className={`font-light text-black line-clamp-2 tracking-wide ${
              compact ? 'text-sm' : 'text-base'
            }`}>
              {product.name}
            </h3>
            <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'} mt-2 flex items-center space-x-2 font-light`}>
              <span>{product.brand}</span>
              {product.category && (
                <>
                  <span>•</span>
                  <span className="capitalize">{product.category.replace('-', ' ')}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Price */}
        <div className={`flex items-center space-x-3 ${compact ? 'mt-2' : 'mt-3'}`}>
          <span className={`font-light text-black ${compact ? 'text-base' : 'text-lg'}`}>
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className={`text-gray-500 line-through ${compact ? 'text-xs' : 'text-sm'} font-light`}>
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Rating */}
        {product.rating && !compact && (
          <div className="flex items-center mt-3 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            {product.reviews && (
              <span className="text-xs text-gray-500 ml-2 font-light">
                ({product.reviews.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {/* Trend Score & Compatibility */}
        {(showTrendScore || recommendation) && !compact && (
          <div className="flex items-center space-x-4 mt-3 mb-4">
            {showTrendScore && product.trendScore && (
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 font-light">
                  {Math.round(product.trendScore)}% Trending
                </span>
              </div>
            )}
            
            {recommendation && (
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600 font-light">
                  {Math.round(recommendation.compatibilityScore)}% Match
                </span>
              </div>
            )}
          </div>
        )}

        {/* AI Explanation */}
        {recommendation && !compact && (
          <div className="mt-3 mb-4 p-3 bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-700 font-light leading-relaxed">
              <span className="font-medium text-black">AI Insight:</span> {recommendation.aiExplanation}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex space-x-3 ${compact ? 'mt-2' : 'mt-4'}`}>
          <motion.button
            onClick={handleBuyNow}
            className={`flex-1 bg-black text-white font-light tracking-wide hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center space-x-2 ${
              compact ? 'py-2 text-xs' : 'py-3 text-sm'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>BUY NOW</span>
          </motion.button>
          
          <motion.button
            onClick={() => window.open(product.affiliateLink || product.url, '_blank')}
            className={`px-4 border border-gray-200 text-gray-700 font-light hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center ${
              compact ? 'py-2' : 'py-3'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="View Details"
          >
            <ExternalLink className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Platform Info */}
        {!compact && (
          <div className="text-center mt-3">
            <span className="text-xs text-gray-500 font-light">
              Available on {product.platform.charAt(0).toUpperCase() + product.platform.slice(1)}
              {product.affiliateLink && ' • Affiliate Link'}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}