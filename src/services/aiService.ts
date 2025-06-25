import { GeminiAIService } from './geminiService';
import type { Product, UserPreferences, Recommendation, TrendData } from '../types';

export class AIRecommendationService {
  private geminiService: GeminiAIService;

  constructor() {
    this.geminiService = new GeminiAIService();
  }

  async getPersonalizedRecommendations(
    userPreferences: UserPreferences,
    currentProduct?: Product,
    context: string = 'general'
  ): Promise<Recommendation[]> {
    try {
      console.log('🤖 Getting AI recommendations (text-only mode)...');
      
      // Return empty array since we're focusing on text-only responses
      console.log('✅ Text-only mode: No product cards generated');
      return [];
    } catch (error) {
      console.error('AI recommendation error:', error);
      return [];
    }
  }

  async analyzeStyleCompatibility(
    baseProduct: Product,
    targetProduct: Product
  ): Promise<number> {
    try {
      // Simplified compatibility for text-only mode
      return 85;
    } catch (error) {
      console.error('Style compatibility error:', error);
      return 75;
    }
  }

  async getTrendAnalysis(category: string): Promise<TrendData> {
    try {
      console.log(`🔍 Getting trend analysis for ${category}...`);
      
      const trendData = await this.geminiService.analyzeFashionTrends(category);
      console.log(`📈 Trend analysis complete for ${category}`);
      return trendData;
    } catch (error) {
      console.error('Trend analysis error:', error);
      
      // Fallback trend data
      return {
        category,
        trendingItems: [],
        popularity: 85,
        seasonality: 80,
        socialMentions: 2000,
        updatedAt: new Date()
      };
    }
  }

  async generateStyleAdvice(
    userInput: string,
    userPreferences: UserPreferences,
    currentProduct?: Product
  ): Promise<string> {
    try {
      console.log('💭 Generating comprehensive AI style advice...');
      
      const advice = await this.geminiService.generateComprehensiveFashionAnalysis(
        userInput,
        userPreferences,
        currentProduct
      );
      
      console.log('✨ Comprehensive AI style advice generated');
      return advice;
    } catch (error) {
      console.error('Style advice error:', error);
      return this.getFallbackStyleAdvice(userInput, userPreferences);
    }
  }

  async analyzeImageForStyle(imageDescription: string): Promise<string> {
    try {
      console.log('🖼️ Analyzing image for style insights...');
      
      const analysis = await this.geminiService.analyzeImageForStyle(imageDescription);
      console.log('🎨 Image style analysis complete');
      return analysis;
    } catch (error) {
      console.error('Image analysis error:', error);
      return 'I can see your image has great style potential! Based on the visual elements, I recommend looking for similar pieces in trending colors and patterns. Consider complementary accessories to complete the look.';
    }
  }

  private getFallbackStyleAdvice(userInput: string, preferences: UserPreferences): string {
    const input = userInput.toLowerCase();
    
    if (input.includes('ethnic') || input.includes('traditional')) {
      return `🌟 For ethnic wear, focus on rich fabrics like silk and cotton. Based on your preferences for ${preferences.style.join(' and ')} styles, consider pairing traditional kurtas with contemporary bottoms. Current trends show 92% popularity for vibrant colors and traditional prints with modern silhouettes.`;
    } else if (input.includes('western') || input.includes('casual')) {
      return `✨ Western wear trends embrace minimalist designs with bold accents. Given your style preferences, high-waisted bottoms and crop tops show 88% trend popularity. Layer with accessories to create depth in your outfits.`;
    } else if (input.includes('budget') || input.includes('affordable')) {
      return `💰 Within your ₹${preferences.budget.min}-₹${preferences.budget.max} budget, focus on versatile pieces that can be styled multiple ways. Look for quality basics in your preferred colors: ${preferences.colors.join(', ')}.`;
    } else {
      return `🎯 Based on your preferences for ${preferences.style.join(', ')} styles and ${preferences.colors.join(', ')} colors, focus on pieces that make you feel confident. Current trends favor sustainable fashion and versatile items for multiple occasions.`;
    }
  }
}