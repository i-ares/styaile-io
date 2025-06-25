import type { Product, UserPreferences, Recommendation, TrendData } from '../types';

interface PythonAIResponse {
  status: string;
  recommendations?: any[];
  advice?: string;
  trendData?: any;
  analysis?: string;
  error?: string;
}

export class PythonAIService {
  private baseUrl: string;
  private isServiceAvailable: boolean = false;
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 30000; // 30 seconds

  constructor() {
    // Python service URL - will be running on port 5000
    this.baseUrl = 'http://localhost:5000';
  }

  private async makeRequest(endpoint: string, data: any): Promise<PythonAIResponse> {
    try {
      console.log(`🐍 Making request to Python AI service: ${endpoint}`);
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Python AI service response received');
      
      return result;
    } catch (error) {
      console.error('❌ Python AI service error:', error);
      
      // If it's a network error, mark service as unavailable
      if (error instanceof TypeError && error.message.includes('fetch')) {
        this.isServiceAvailable = false;
      }
      
      throw error;
    }
  }

  async getPersonalizedRecommendations(
    userPreferences: UserPreferences,
    currentProduct?: Product,
    context: string = 'general'
  ): Promise<Recommendation[]> {
    try {
      // Check if service is available before making request
      if (!await this.checkServiceHealth()) {
        throw new Error('Python AI service is not available');
      }

      console.log('🤖 Getting AI recommendations from Python service...');
      
      const response = await this.makeRequest('/api/recommendations', {
        preferences: userPreferences,
        currentProduct,
        context
      });

      if (response.status === 'success' && response.recommendations) {
        const recommendations = response.recommendations.map((rec: any) => ({
          id: rec.id,
          product: {
            id: rec.product.id,
            name: rec.product.name,
            price: rec.product.price,
            originalPrice: rec.product.original_price,
            image: rec.product.image,
            url: rec.product.url,
            category: rec.product.category,
            brand: rec.product.brand,
            rating: rec.product.rating,
            platform: rec.product.platform,
            trendScore: rec.product.trend_score,
            styleCompatibility: rec.product.style_compatibility,
            colors: rec.product.colors,
            sizes: rec.product.sizes
          },
          reason: rec.reason,
          trendScore: rec.trend_score,
          compatibilityScore: rec.compatibility_score,
          context: rec.context,
          aiExplanation: rec.ai_explanation
        }));

        console.log(`✅ Received ${recommendations.length} AI recommendations from Python service`);
        return recommendations;
      }

      throw new Error(response.error || 'Failed to get recommendations');
    } catch (error) {
      console.error('❌ Python AI recommendations error:', error);
      throw error;
    }
  }

  async generateStyleAdvice(
    userInput: string,
    userPreferences: UserPreferences,
    currentProduct?: Product
  ): Promise<string> {
    try {
      // Check if service is available before making request
      if (!await this.checkServiceHealth()) {
        throw new Error('Python AI service is not available');
      }

      console.log('💭 Getting style advice from Python AI service...');
      
      const response = await this.makeRequest('/api/style-advice', {
        userInput,
        preferences: userPreferences,
        currentProduct
      });

      if (response.status === 'success' && response.advice) {
        console.log('✅ Style advice received from Python service');
        return response.advice;
      }

      throw new Error(response.error || 'Failed to get style advice');
    } catch (error) {
      console.error('❌ Python AI style advice error:', error);
      throw error;
    }
  }

  async analyzeFashionTrends(category: string): Promise<TrendData> {
    try {
      // Check if service is available before making request
      if (!await this.checkServiceHealth()) {
        throw new Error('Python AI service is not available');
      }

      console.log(`📈 Getting trend analysis from Python AI service for ${category}...`);
      
      const response = await this.makeRequest('/api/trend-analysis', {
        category,
        season: 'current'
      });

      if (response.status === 'success' && response.trendData) {
        const trendData = {
          category: response.trendData.category,
          trendingItems: response.trendData.trending_items,
          popularity: response.trendData.popularity,
          seasonality: response.trendData.seasonality,
          socialMentions: response.trendData.social_mentions,
          updatedAt: new Date(response.trendData.updated_at)
        };

        console.log(`✅ Trend analysis received from Python service for ${category}`);
        return trendData;
      }

      throw new Error(response.error || 'Failed to get trend analysis');
    } catch (error) {
      console.error('❌ Python AI trend analysis error:', error);
      throw error;
    }
  }

  async analyzeImageForStyle(imageDescription: string): Promise<string> {
    try {
      // Check if service is available before making request
      if (!await this.checkServiceHealth()) {
        throw new Error('Python AI service is not available');
      }

      console.log('🖼️ Getting image analysis from Python AI service...');
      
      const response = await this.makeRequest('/api/image-analysis', {
        imageDescription
      });

      if (response.status === 'success' && response.analysis) {
        console.log('✅ Image analysis received from Python service');
        return response.analysis;
      }

      throw new Error(response.error || 'Failed to analyze image');
    } catch (error) {
      console.error('❌ Python AI image analysis error:', error);
      throw error;
    }
  }

  async checkServiceHealth(): Promise<boolean> {
    const now = Date.now();
    
    // Use cached result if recent
    if (now - this.lastHealthCheck < this.healthCheckInterval && this.isServiceAvailable) {
      return this.isServiceAvailable;
    }

    try {
      console.log('🔍 Checking Python AI service health...');
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout for health check
      });
      
      this.isServiceAvailable = response.ok;
      this.lastHealthCheck = now;
      
      if (this.isServiceAvailable) {
        console.log('✅ Python AI service is healthy');
      } else {
        console.warn('⚠️ Python AI service health check failed');
      }
      
      return this.isServiceAvailable;
    } catch (error) {
      console.warn('⚠️ Python AI service is not available:', error instanceof Error ? error.message : 'Unknown error');
      this.isServiceAvailable = false;
      this.lastHealthCheck = now;
      return false;
    }
  }

  isAvailable(): boolean {
    return this.isServiceAvailable;
  }
}