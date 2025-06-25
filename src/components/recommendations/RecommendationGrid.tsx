import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, SortAsc, TrendingUp, Heart, Zap, Grid, List, Sparkles, BarChart3, ArrowRight } from 'lucide-react';
import { ProductCard } from '../product/ProductCard';
import { useAppStore } from '../../store/appStore';
import { AIRecommendationService } from '../../services/aiService';
import type { Recommendation, TrendData } from '../../types';
import toast from 'react-hot-toast';

export function RecommendationGrid() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'trend' | 'price' | 'compatibility' | 'rating'>('trend');
  const [filterBy, setFilterBy] = useState<'all' | 'complement' | 'trending' | 'alternative'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [isAnalyzingTrends, setIsAnalyzingTrends] = useState(false);
  
  const { 
    recommendations, 
    setRecommendations, 
    preferences, 
    currentProduct,
    isLoadingRecommendations 
  } = useAppStore();
  
  const aiService = new AIRecommendationService();

  useEffect(() => {
    loadRecommendations();
    analyzeTrends();
  }, [preferences, currentProduct]);

  const loadRecommendations = async () => {
    if (!preferences) return;
    
    setIsLoading(true);
    try {
      console.log('🤖 Loading AI-powered recommendations...');
      
      const newRecommendations = await aiService.getPersonalizedRecommendations(
        preferences,
        currentProduct || undefined,
        'trending'
      );
      
      setRecommendations(newRecommendations);
      toast.success(`✨ Loaded ${newRecommendations.length} AI recommendations!`);
      
      console.log(`✅ Successfully loaded ${newRecommendations.length} recommendations`);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      toast.error('Failed to load recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeTrends = async () => {
    setIsAnalyzingTrends(true);
    try {
      console.log('📈 Analyzing fashion trends...');
      
      const category = currentProduct?.category || 'ethnic-wear';
      const trends = await aiService.getTrendAnalysis(category);
      
      setTrendData(trends);
      console.log(`📊 Trend analysis complete for ${category}`);
    } catch (error) {
      console.error('Trend analysis failed:', error);
    } finally {
      setIsAnalyzingTrends(false);
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (filterBy === 'all') return true;
    return rec.context === filterBy;
  });

  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    switch (sortBy) {
      case 'trend':
        return b.trendScore - a.trendScore;
      case 'price':
        return a.product.price - b.product.price;
      case 'compatibility':
        return b.compatibilityScore - a.compatibilityScore;
      case 'rating':
        return (b.product.rating || 0) - (a.product.rating || 0);
      default:
        return 0;
    }
  });

  const getFilterCount = (filter: string) => {
    if (filter === 'all') return recommendations.length;
    return recommendations.filter(rec => rec.context === filter).length;
  };

  const handleRefreshRecommendations = async () => {
    await loadRecommendations();
    await analyzeTrends();
  };

  if (isLoading || isLoadingRecommendations) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Sparkles className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-2xl font-light tracking-wide text-black mb-4">
              AI is analyzing fashion trends...
            </h3>
            <p className="text-base font-light text-gray-600 mb-6 max-w-md mx-auto">
              Finding the perfect recommendations for your style preferences
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 font-light">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <span>Powered by AI • Fashion Intelligence</span>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Trend Insights */}
      {trendData && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-gray-600" />
            <h3 className="text-2xl font-light tracking-wide text-black">AI Trend Analysis</h3>
            {isAnalyzingTrends && (
              <span className="text-sm text-gray-500 font-light">• Updating...</span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-light text-black mb-2">{trendData.popularity}%</div>
              <div className="text-sm text-gray-600 font-light tracking-wide">Popularity Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-black mb-2">{trendData.seasonality}%</div>
              <div className="text-sm text-gray-600 font-light tracking-wide">Seasonal Relevance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-black mb-2">{trendData.socialMentions.toLocaleString()}</div>
              <div className="text-sm text-gray-600 font-light tracking-wide">Social Mentions</div>
            </div>
          </div>
          
          {trendData.trendingItems.length > 0 && (
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-700 mb-3 tracking-wide">Trending Items:</h4>
              <div className="flex flex-wrap gap-3">
                {trendData.trendingItems.map((item, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-white border border-gray-200 text-sm text-gray-700 font-light"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Filters and Sort */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        {/* Filter Options */}
        <div className={`flex items-center space-x-3 overflow-x-auto pb-2`}>
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-300 flex-shrink-0" />
          {[
            { key: 'all', label: 'ALL', icon: null },
            { key: 'complement', label: 'COMPLEMENTS', icon: Heart },
            { key: 'trending', label: 'TRENDING', icon: TrendingUp },
            { key: 'alternative', label: 'ALTERNATIVES', icon: Zap }
          ].map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              onClick={() => setFilterBy(key as any)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-light tracking-wide transition-all duration-300 whitespace-nowrap ${
                filterBy === key
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {Icon && <Icon className="w-3 h-3" />}
              <span>{label}</span>
              <span className={`px-1.5 py-0.5 text-xs ${
                filterBy === key ? 'bg-white/20 dark:bg-black/20' : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {getFilterCount(key)}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          {/* Refresh Button */}
          <motion.button
            onClick={handleRefreshRecommendations}
            className="flex items-center space-x-2 px-6 py-2 bg-black text-white text-sm font-light tracking-wide hover:bg-gray-800 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="w-4 h-4" />
            <span>REFRESH AI</span>
          </motion.button>

          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <SortAsc className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors duration-300 bg-white font-light"
            >
              <option value="trend">AI Trend Score</option>
              <option value="compatibility">AI Compatibility</option>
              <option value="price">Price: Low to High</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-50 dark:bg-gray-900 p-1">
            <motion.button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Grid className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <List className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Recommendations Grid */}
      <AnimatePresence mode="wait">
        {sortedRecommendations.length > 0 ? (
          <motion.div
            key={`${viewMode}-${filterBy}-${sortBy}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
                : 'space-y-6'
            }
          >
            {sortedRecommendations.map((recommendation, index) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard
                  product={recommendation.product}
                  recommendation={recommendation}
                  compact={viewMode === 'list'}
                  showTrendScore={true}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-2xl font-light tracking-wide text-black mb-4">
              No AI recommendations found
            </h3>
            <p className="text-base font-light text-gray-600 mb-8 max-w-md mx-auto">
              Try adjusting your filters or refresh for new AI insights
            </p>
            <motion.button
              onClick={handleRefreshRecommendations}
              className="bg-black text-white px-8 py-3 text-sm font-light tracking-wide hover:bg-gray-800 transition-colors duration-300 flex items-center space-x-3 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-5 h-5" />
              <span>GET AI RECOMMENDATIONS</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load More Button */}
      {sortedRecommendations.length > 0 && sortedRecommendations.length >= 12 && (
        <div className="text-center">
          <motion.button
            onClick={handleRefreshRecommendations}
            className="inline-flex items-center space-x-3 text-sm font-light tracking-[0.15em] uppercase border-b border-black pb-1 hover:border-gray-600 transition-colors group"
            whileHover={{ y: -2 }}
          >
            <span>DISCOVER MORE AI STYLES</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      )}

      {/* AI Attribution */}
      <div className="text-center py-8 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400 font-light tracking-wide">
          <Sparkles className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <span>Powered by AI • Real-time fashion analysis</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}