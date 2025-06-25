import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  User, 
  UserPreferences, 
  Product, 
  Recommendation, 
  ChatMessage, 
  Wishlist,
  ShoppingSession 
} from '../types';

interface AppState {
  // User & Authentication
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // User Preferences
  preferences: UserPreferences | null;
  
  // Shopping Session
  currentSession: ShoppingSession | null;
  currentProduct: Product | null;
  browsedProducts: Product[];
  
  // Recommendations
  recommendations: Recommendation[];
  isLoadingRecommendations: boolean;
  
  // Chat
  messages: ChatMessage[];
  
  // Wishlist
  wishlists: Wishlist[];
  
  // Extension State
  extensionState: {
    isActive: boolean;
    isConnected: boolean;
    currentTab?: string;
  };

  // Actions
  setUser: (user: User | null) => void;
  setPreferences: (preferences: UserPreferences) => void;
  setCurrentProduct: (product: Product | null) => void;
  addBrowsedProduct: (product: Product) => void;
  setRecommendations: (recommendations: Recommendation[]) => void;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  addToWishlist: (wishlistId: string, product: Product) => void;
  createWishlist: (name: string) => void;
  setExtensionState: (state: Partial<AppState['extensionState']>) => void;
  startShoppingSession: (url: string, platform: string) => void;
  endShoppingSession: () => void;
  reset: () => void;
}

const initialPreferences: UserPreferences = {
  style: [],
  colors: [],
  sizes: {},
  budget: { min: 500, max: 5000 },
  occasions: [],
  gender: 'unisex',
  age: 25,
  brandPreferences: []
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      preferences: initialPreferences,
      currentSession: null,
      currentProduct: null,
      browsedProducts: [],
      recommendations: [],
      isLoadingRecommendations: false,
      messages: [],
      wishlists: [],
      extensionState: {
        isActive: false,
        isConnected: false
      },

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setPreferences: (preferences) => set({ preferences }),
      
      setCurrentProduct: (product) => {
        set({ currentProduct: product });
        if (product) {
          get().addBrowsedProduct(product);
        }
      },
      
      addBrowsedProduct: (product) => set((state) => ({
        browsedProducts: [
          product,
          ...state.browsedProducts.filter(p => p.id !== product.id)
        ].slice(0, 50) // Keep last 50 products
      })),
      
      setRecommendations: (recommendations) => set({ 
        recommendations,
        isLoadingRecommendations: false 
      }),
      
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
      })),
      
      clearMessages: () => set({ messages: [] }),
      
      addToWishlist: (wishlistId, product) => set((state) => ({
        wishlists: state.wishlists.map(wishlist =>
          wishlist.id === wishlistId
            ? {
                ...wishlist,
                products: [...wishlist.products, product],
                updatedAt: new Date()
              }
            : wishlist
        )
      })),
      
      createWishlist: (name) => {
        const newWishlist: Wishlist = {
          id: `wishlist-${Date.now()}`,
          userId: get().user?.id || 'guest',
          name,
          products: [],
          isPublic: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set((state) => ({
          wishlists: [...state.wishlists, newWishlist]
        }));
      },
      
      setExtensionState: (newState) => set((state) => ({
        extensionState: { ...state.extensionState, ...newState }
      })),
      
      startShoppingSession: (url, platform) => {
        const session: ShoppingSession = {
          id: `session-${Date.now()}`,
          userId: get().user?.id,
          currentProduct: get().currentProduct,
          browsedProducts: [],
          recommendations: [],
          startTime: new Date(),
          platform,
          url
        };
        
        set({ currentSession: session });
      },
      
      endShoppingSession: () => set({ currentSession: null }),
      
      reset: () => set({
        user: null,
        isAuthenticated: false,
        preferences: initialPreferences,
        currentSession: null,
        currentProduct: null,
        browsedProducts: [],
        recommendations: [],
        messages: [],
        extensionState: { isActive: false, isConnected: false }
      })
    }),
    {
      name: 'ai-fashion-assistant-store',
      partialize: (state) => ({
        user: state.user,
        preferences: state.preferences,
        wishlists: state.wishlists,
        browsedProducts: state.browsedProducts.slice(0, 10) // Persist only recent products
      })
    }
  )
);