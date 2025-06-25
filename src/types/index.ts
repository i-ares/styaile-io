export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: Date;
}

export interface UserPreferences {
  style: string[];
  colors: string[];
  sizes: Record<string, string>;
  budget: {
    min: number;
    max: number;
  };
  occasions: string[];
  gender: 'male' | 'female' | 'unisex';
  age: number;
  brandPreferences: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  url: string;
  affiliateLink?: string; // Added affiliate link support
  category: string;
  brand: string;
  rating?: number;
  reviews?: number;
  description?: string;
  sizes?: string[];
  colors?: string[];
  platform: 'flipkart' | 'amazon' | 'myntra';
  trendScore?: number;
  styleCompatibility?: number;
}

export interface Recommendation {
  id: string;
  product: Product;
  reason: string;
  trendScore: number;
  compatibilityScore: number;
  context: 'complement' | 'alternative' | 'trending' | 'similar';
  aiExplanation: string;
}

export interface RecommendationCard {
  id: string;
  title: string;
  content: string;
  category: string;
  trendScore?: number;
  priceRange?: string;
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  recommendations?: Recommendation[] | RecommendationCard[];
  image?: string;
}

export interface TrendData {
  category: string;
  trendingItems: string[];
  popularity: number;
  seasonality: number;
  socialMentions: number;
  updatedAt: Date;
}

export interface ShoppingSession {
  id: string;
  userId?: string;
  currentProduct?: Product;
  browsedProducts: Product[];
  recommendations: Recommendation[];
  startTime: Date;
  platform: string;
  url: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  products: Product[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PicaConfig {
  apiKey: string;
  connectors: string[];
  authkit: boolean;
}

export interface ExtensionMessage {
  type: 'PRODUCT_DETECTED' | 'GET_RECOMMENDATIONS' | 'UPDATE_PREFERENCES' | 'SYNC_DATA';
  data: any;
}

export interface BrowserExtensionState {
  isActive: boolean;
  currentProduct?: Product;
  recommendations: Recommendation[];
  userPreferences?: UserPreferences;
  isLoading: boolean;
}