import { ProductNameAnalyzer } from './productNameAnalyzer';
import { ProductSpecificityAnalyzer, type SpecificProductAnalysis } from './productSpecificityAnalyzer';
import { GoogleProductSearchService } from './googleProductSearchService';
import { GeminiAIService } from './geminiService';
import type { UserPreferences, Product } from '../types';

interface EnhancedRecommendationCard {
  id: string;
  title: string;
  content: string;
  category: string;
  trendScore?: number;
  priceRange?: string;
  tags?: string[];
  products: Product[];
  searchQuery: string;
  analysisConfidence: number;
  extractedProductNames: string[];
  specificityAnalysis?: SpecificProductAnalysis;
}

interface ChatAnalysisResult {
  recommendationCards: EnhancedRecommendationCard[];
  totalProductsFound: number;
  totalSearchQueries: number;
  overallConfidence: number;
  processingTime: number;
  specificityScore: number;
}

interface GeminiProductAnalysis {
  recommendedProducts: string[];
  category: string;
  gender: 'male' | 'female' | 'unisex';
  context: string;
  confidence: number;
}

export class EnhancedChatService {
  private productAnalyzer: ProductNameAnalyzer;
  private specificityAnalyzer: ProductSpecificityAnalyzer;
  private googleSearchService: GoogleProductSearchService;
  private aiService: GeminiAIService;

  constructor() {
    this.productAnalyzer = new ProductNameAnalyzer();
    this.specificityAnalyzer = new ProductSpecificityAnalyzer();
    this.googleSearchService = new GoogleProductSearchService();
    this.aiService = new GeminiAIService();
  }

  async processUserMessage(
    userInput: string,
    userPreferences: UserPreferences,
    currentProduct?: Product
  ): Promise<ChatAnalysisResult> {
    const startTime = Date.now();
    
    console.log('🚀 PROCESSING: Analyzing user request for specific product terms...');
    console.log(`📝 User Input: "${userInput}"`);

    try {
      // Step 1: Get Gemini 2.5 Flash analysis to extract specific product terms
      console.log('🤖 Step 1: Getting Gemini 2.5 Flash analysis for specific product recommendations...');
      const geminiAnalysis = await this.getGeminiProductAnalysis(userInput, userPreferences);
      
      console.log(`📊 GEMINI 2.5 FLASH ANALYSIS RESULTS:`);
      console.log(`   🎯 Recommended Products: [${geminiAnalysis.recommendedProducts.join(', ')}]`);
      console.log(`   📂 Category: ${geminiAnalysis.category}`);
      console.log(`   👤 Gender: ${geminiAnalysis.gender}`);
      console.log(`   🎯 Confidence: ${geminiAnalysis.confidence}%`);

      // Step 2: Search for each specific product term
      console.log('🔍 Step 2: Searching for each specific product term...');
      const allProducts = await this.searchForSpecificProductTerms(
        geminiAnalysis.recommendedProducts,
        geminiAnalysis.gender,
        userPreferences
      );

      // Step 3: Create product cards organized by product type
      console.log('📋 Step 3: Creating product cards organized by product type...');
      const recommendationCards = await this.createProductTypeCards(
        geminiAnalysis,
        allProducts,
        userPreferences
      );

      // Step 4: Calculate results
      const totalProductsFound = recommendationCards.reduce((total, card) => total + card.products.length, 0);
      const processingTime = Date.now() - startTime;

      console.log(`✅ SPECIFIC PRODUCT TERM PROCESSING COMPLETE:`);
      console.log(`   📊 ${recommendationCards.length} product type cards created`);
      console.log(`   🛍️ ${totalProductsFound} specific products found`);
      console.log(`   🎯 Analysis Confidence: ${geminiAnalysis.confidence}%`);
      console.log(`   ⏱️ Processing time: ${processingTime}ms`);

      return {
        recommendationCards,
        totalProductsFound,
        totalSearchQueries: geminiAnalysis.recommendedProducts.length,
        overallConfidence: geminiAnalysis.confidence,
        processingTime,
        specificityScore: geminiAnalysis.confidence
      };

    } catch (error) {
      console.error('❌ Specific product term processing error:', error);
      
      // Fallback: Try basic search with user input
      const fallbackCards = await this.createFallbackProductCards(userInput, userPreferences);
      
      return {
        recommendationCards: fallbackCards,
        totalProductsFound: fallbackCards.reduce((total, card) => total + card.products.length, 0),
        totalSearchQueries: 1,
        overallConfidence: 50,
        processingTime: Date.now() - startTime,
        specificityScore: 30
      };
    }
  }

  private async getGeminiProductAnalysis(
    userInput: string,
    userPreferences: UserPreferences
  ): Promise<GeminiProductAnalysis> {
    console.log('🤖 Requesting Gemini 2.5 Flash to analyze and extract specific product terms...');
    
    const analysisPrompt = `Analyze this user request and extract SPECIFIC PRODUCT TERMS that I should search for: "${userInput}"

TASK: Extract the exact product names/terms that should be searched for on e-commerce websites.

EXAMPLE:
User: "formal clothes for men"
Your response should identify: blazers, formal shirts, dress pants, formal shoes, ties

User: "ethnic wear for women"  
Your response should identify: kurtas, sarees, lehengas, palazzo sets, ethnic tops

User: "casual outfits for weekend"
Your response should identify: jeans, t-shirts, sneakers, casual dresses, hoodies

INSTRUCTIONS:
1. Extract 3-6 SPECIFIC product terms that match the user's request
2. Each term should be a searchable product name (like "blazer", "kurta", "sneakers")
3. Consider the gender context if mentioned
4. Focus on the main product categories the user is asking about
5. Make terms specific enough to find real products

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
PRODUCTS: [product1, product2, product3, product4]
CATEGORY: [main category like ethnic-wear, western-wear, footwear, accessories]
GENDER: [male/female/unisex based on the request]
CONTEXT: [brief explanation of what the user is looking for]

Analyze: "${userInput}"`;

    try {
      const geminiResponse = await this.aiService.generateComprehensiveFashionAnalysis(
        analysisPrompt,
        userPreferences
      );

      console.log('📄 Gemini 2.5 Flash Raw Response:', geminiResponse);

      // Parse the structured response
      const analysis = this.parseGeminiProductAnalysis(geminiResponse, userInput);
      
      console.log('✅ Gemini 2.5 Flash analysis parsed successfully');
      return analysis;

    } catch (error) {
      console.error('❌ Gemini 2.5 Flash analysis failed, using fallback extraction:', error);
      return this.getFallbackProductAnalysis(userInput, userPreferences);
    }
  }

  private parseGeminiProductAnalysis(geminiResponse: string, originalInput: string): GeminiProductAnalysis {
    console.log('🔍 Parsing Gemini 2.5 Flash response for specific product terms...');
    
    let recommendedProducts: string[] = [];
    let category = 'fashion';
    let gender: 'male' | 'female' | 'unisex' = 'unisex';
    let context = originalInput;
    let confidence = 70;

    try {
      // Extract PRODUCTS line
      const productsMatch = geminiResponse.match(/PRODUCTS:\s*\[(.*?)\]/i);
      if (productsMatch) {
        const productsStr = productsMatch[1];
        recommendedProducts = productsStr
          .split(',')
          .map(p => p.trim().replace(/['"]/g, ''))
          .filter(p => p.length > 0);
        
        console.log(`🎯 Extracted products: [${recommendedProducts.join(', ')}]`);
        confidence += 20;
      }

      // Extract CATEGORY line
      const categoryMatch = geminiResponse.match(/CATEGORY:\s*\[(.*?)\]/i);
      if (categoryMatch) {
        category = categoryMatch[1].trim().replace(/['"]/g, '');
        console.log(`📂 Extracted category: ${category}`);
        confidence += 10;
      }

      // Extract GENDER line
      const genderMatch = geminiResponse.match(/GENDER:\s*\[(.*?)\]/i);
      if (genderMatch) {
        const genderStr = genderMatch[1].trim().replace(/['"]/g, '').toLowerCase();
        if (['male', 'female', 'unisex'].includes(genderStr)) {
          gender = genderStr as 'male' | 'female' | 'unisex';
          console.log(`👤 Extracted gender: ${gender}`);
          confidence += 15;
        }
      }

      // Extract CONTEXT line
      const contextMatch = geminiResponse.match(/CONTEXT:\s*\[(.*?)\]/i);
      if (contextMatch) {
        context = contextMatch[1].trim().replace(/['"]/g, '');
        console.log(`📝 Extracted context: ${context}`);
        confidence += 5;
      }

      // If no structured format found, try to extract products from the response
      if (recommendedProducts.length === 0) {
        console.log('⚠️ No structured format found, extracting products from response text...');
        recommendedProducts = this.extractProductsFromText(geminiResponse, originalInput);
        confidence = 60;
      }

    } catch (error) {
      console.error('❌ Error parsing Gemini response:', error);
      recommendedProducts = this.extractProductsFromText(geminiResponse, originalInput);
      confidence = 50;
    }

    // Ensure we have at least some products
    if (recommendedProducts.length === 0) {
      console.log('⚠️ No products extracted, using fallback based on input...');
      recommendedProducts = this.getFallbackProductsFromInput(originalInput);
      confidence = 40;
    }

    console.log(`✅ Final extracted products: [${recommendedProducts.join(', ')}]`);
    
    return {
      recommendedProducts: recommendedProducts.slice(0, 6), // Limit to 6 products
      category,
      gender,
      context,
      confidence: Math.min(confidence, 95)
    };
  }

  private extractProductsFromText(text: string, originalInput: string): string[] {
    const products: string[] = [];
    const textLower = text.toLowerCase();
    
    // Common fashion product terms
    const productTerms = [
      // Ethnic wear
      'kurta', 'kurti', 'saree', 'lehenga', 'anarkali', 'palazzo', 'churidar', 'dupatta',
      'sharara', 'gharara', 'salwar', 'kameez', 'dhoti', 'sherwani', 'nehru jacket',
      
      // Western wear
      'dress', 'jeans', 'shirt', 'blouse', 'top', 'blazer', 'jacket', 'skirt',
      'trousers', 'pants', 'shorts', 'jumpsuit', 'romper', 'cardigan', 'sweater',
      'hoodie', 't-shirt', 'tshirt', 'crop top', 'tank top', 'polo',
      
      // Formal wear
      'formal shirt', 'dress shirt', 'formal pants', 'dress pants', 'suit', 'tie',
      'bow tie', 'waistcoat', 'vest', 'tuxedo', 'formal dress', 'business suit',
      
      // Footwear
      'shoes', 'sandals', 'heels', 'flats', 'sneakers', 'boots', 'slippers',
      'formal shoes', 'casual shoes', 'running shoes', 'dress shoes', 'loafers',
      'oxfords', 'stiletto', 'wedges', 'pumps', 'ballet flats', 'ankle boots',
      
      // Accessories
      'bag', 'handbag', 'purse', 'clutch', 'backpack', 'wallet', 'belt',
      'watch', 'sunglasses', 'earrings', 'necklace', 'bracelet', 'ring',
      'scarf', 'stole', 'hat', 'cap'
    ];

    // Find product terms mentioned in the text
    for (const term of productTerms) {
      if (textLower.includes(term)) {
        products.push(term);
      }
    }

    // If no products found in text, analyze the original input
    if (products.length === 0) {
      return this.getFallbackProductsFromInput(originalInput);
    }

    return [...new Set(products)].slice(0, 6);
  }

  private getFallbackProductsFromInput(input: string): string[] {
    const inputLower = input.toLowerCase();
    
    // Analyze input for context and suggest relevant products
    if (inputLower.includes('formal') || inputLower.includes('office') || inputLower.includes('business')) {
      if (inputLower.includes('men') || inputLower.includes('male')) {
        return ['formal shirt', 'dress pants', 'blazer', 'formal shoes', 'tie'];
      } else if (inputLower.includes('women') || inputLower.includes('female')) {
        return ['blazer', 'formal dress', 'dress pants', 'formal shoes', 'blouse'];
      } else {
        return ['blazer', 'formal shirt', 'dress pants', 'formal shoes'];
      }
    }
    
    if (inputLower.includes('ethnic') || inputLower.includes('traditional')) {
      if (inputLower.includes('men') || inputLower.includes('male')) {
        return ['kurta', 'dhoti', 'nehru jacket', 'formal shoes'];
      } else if (inputLower.includes('women') || inputLower.includes('female')) {
        return ['kurta', 'saree', 'lehenga', 'palazzo', 'ethnic jewelry'];
      } else {
        return ['kurta', 'saree', 'palazzo', 'ethnic wear'];
      }
    }
    
    if (inputLower.includes('casual') || inputLower.includes('weekend')) {
      return ['jeans', 't-shirt', 'sneakers', 'casual dress', 'hoodie'];
    }
    
    if (inputLower.includes('party') || inputLower.includes('evening')) {
      return ['party dress', 'heels', 'clutch', 'jewelry', 'blazer'];
    }
    
    if (inputLower.includes('shoes') || inputLower.includes('footwear')) {
      return ['sneakers', 'formal shoes', 'sandals', 'boots', 'heels'];
    }
    
    if (inputLower.includes('accessories')) {
      return ['handbag', 'watch', 'sunglasses', 'jewelry', 'belt'];
    }
    
    // Default fallback
    return ['shirt', 'pants', 'shoes', 'accessories'];
  }

  private getFallbackProductAnalysis(input: string, preferences: UserPreferences): GeminiProductAnalysis {
    console.log('🔄 Using fallback product analysis...');
    
    const products = this.getFallbackProductsFromInput(input);
    const inputLower = input.toLowerCase();
    
    let category = 'fashion';
    if (inputLower.includes('ethnic') || inputLower.includes('traditional')) category = 'ethnic-wear';
    else if (inputLower.includes('formal') || inputLower.includes('office')) category = 'formal-wear';
    else if (inputLower.includes('casual') || inputLower.includes('western')) category = 'western-wear';
    else if (inputLower.includes('shoes') || inputLower.includes('footwear')) category = 'footwear';
    else if (inputLower.includes('accessories')) category = 'accessories';
    
    let gender: 'male' | 'female' | 'unisex' = 'unisex';
    if (inputLower.includes('men') || inputLower.includes('male')) gender = 'male';
    else if (inputLower.includes('women') || inputLower.includes('female')) gender = 'female';
    
    return {
      recommendedProducts: products,
      category,
      gender,
      context: `Fallback analysis for: ${input}`,
      confidence: 60
    };
  }

  private async searchForSpecificProductTerms(
    productTerms: string[],
    gender: 'male' | 'female' | 'unisex',
    userPreferences: UserPreferences
  ): Promise<Record<string, Product[]>> {
    const productResults: Record<string, Product[]> = {};
    
    console.log(`🔍 Searching for ${productTerms.length} specific product terms...`);

    for (const productTerm of productTerms) {
      console.log(`🔍 Searching for: "${productTerm}"`);
      
      try {
        // Create gender-specific search query
        let searchQuery = productTerm;
        if (gender !== 'unisex') {
          const genderWord = gender === 'male' ? 'men' : 'women';
          searchQuery = `${genderWord} ${productTerm}`;
        }
        
        // Add additional context for better results
        searchQuery += ' buy online India';
        
        console.log(`🔍 Enhanced search query: "${searchQuery}"`);
        
        const googleResults = await this.googleSearchService.searchAndAnalyze(searchQuery);
        const products = this.googleSearchService.convertToProducts(
          googleResults.products,
          this.determineCategory(productTerm),
          gender
        );

        // Filter and enhance product names to match the search term
        const relevantProducts = products
          .filter(product => this.isProductRelevantToTerm(product.name, productTerm))
          .map(product => ({
            ...product,
            name: this.enhanceProductNameWithTerm(product.name, productTerm, gender)
          }))
          .slice(0, 4); // Max 4 products per term

        productResults[productTerm] = relevantProducts;
        
        console.log(`✅ Found ${relevantProducts.length} products for "${productTerm}"`);

      } catch (error) {
        console.error(`❌ Search failed for "${productTerm}":`, error);
        productResults[productTerm] = [];
      }
    }

    return productResults;
  }

  private isProductRelevantToTerm(productName: string, searchTerm: string): boolean {
    const productLower = productName.toLowerCase();
    const termLower = searchTerm.toLowerCase();
    
    // Direct match
    if (productLower.includes(termLower)) return true;
    
    // Synonym matching
    const synonyms: Record<string, string[]> = {
      'shirt': ['shirt', 'top', 'blouse'],
      'pants': ['pants', 'trousers', 'jeans'],
      'shoes': ['shoes', 'footwear', 'sneakers', 'boots'],
      'dress': ['dress', 'gown', 'frock'],
      'kurta': ['kurta', 'kurti', 'tunic'],
      'blazer': ['blazer', 'jacket', 'coat'],
      'bag': ['bag', 'handbag', 'purse', 'clutch'],
      'jewelry': ['jewelry', 'earrings', 'necklace', 'bracelet']
    };
    
    const termSynonyms = synonyms[termLower] || [termLower];
    return termSynonyms.some(synonym => productLower.includes(synonym));
  }

  private enhanceProductNameWithTerm(
    originalName: string,
    searchTerm: string,
    gender: 'male' | 'female' | 'unisex'
  ): string {
    let enhancedName = originalName;
    
    // Ensure the search term is prominently featured
    const termLower = searchTerm.toLowerCase();
    const nameLower = enhancedName.toLowerCase();
    
    if (!nameLower.includes(termLower)) {
      // Add the search term to make it more relevant
      enhancedName = `${searchTerm} - ${enhancedName}`;
    }
    
    // Ensure gender context is clear
    if (gender !== 'unisex') {
      const genderWord = gender === 'male' ? 'Men\'s' : 'Women\'s';
      if (!nameLower.includes('men') && !nameLower.includes('women')) {
        enhancedName = `${genderWord} ${enhancedName}`;
      }
    }
    
    return enhancedName;
  }

  private determineCategory(productTerm: string): string {
    const termLower = productTerm.toLowerCase();
    
    const categoryMap: Record<string, string> = {
      // Ethnic wear
      'kurta': 'ethnic-wear', 'kurti': 'ethnic-wear', 'saree': 'ethnic-wear',
      'lehenga': 'ethnic-wear', 'anarkali': 'ethnic-wear', 'palazzo': 'ethnic-wear',
      'dhoti': 'ethnic-wear', 'sherwani': 'ethnic-wear',
      
      // Western wear
      'dress': 'western-wear', 'jeans': 'western-wear', 'shirt': 'western-wear',
      'blouse': 'western-wear', 'top': 'western-wear', 'blazer': 'western-wear',
      'jacket': 'western-wear', 'skirt': 'western-wear', 'pants': 'western-wear',
      'trousers': 'western-wear', 't-shirt': 'western-wear', 'hoodie': 'western-wear',
      
      // Footwear
      'shoes': 'footwear', 'sandals': 'footwear', 'heels': 'footwear',
      'sneakers': 'footwear', 'boots': 'footwear', 'flats': 'footwear',
      
      // Accessories
      'bag': 'accessories', 'handbag': 'accessories', 'purse': 'accessories',
      'watch': 'accessories', 'sunglasses': 'accessories', 'jewelry': 'accessories',
      'earrings': 'accessories', 'necklace': 'accessories', 'belt': 'accessories'
    };
    
    return categoryMap[termLower] || 'fashion';
  }

  private async createProductTypeCards(
    geminiAnalysis: GeminiProductAnalysis,
    productResults: Record<string, Product[]>,
    userPreferences: UserPreferences
  ): Promise<EnhancedRecommendationCard[]> {
    const cards: EnhancedRecommendationCard[] = [];
    
    console.log('📋 Creating product type cards...');

    for (const [productTerm, products] of Object.entries(productResults)) {
      if (products.length === 0) continue;
      
      const cardTitle = this.generateCardTitle(productTerm, geminiAnalysis.gender);
      const cardContent = this.generateCardContent(productTerm, products, geminiAnalysis);
      const tags = this.generateCardTags(productTerm, products, geminiAnalysis);
      
      const card: EnhancedRecommendationCard = {
        id: `product-type-${Date.now()}-${productTerm.replace(/\s+/g, '-')}`,
        title: cardTitle,
        content: cardContent,
        category: this.determineCategory(productTerm),
        trendScore: this.calculateTrendScore(products),
        priceRange: this.calculatePriceRange(products),
        tags,
        products,
        searchQuery: productTerm,
        analysisConfidence: geminiAnalysis.confidence,
        extractedProductNames: [productTerm]
      };
      
      cards.push(card);
      console.log(`✅ Created card for "${productTerm}" with ${products.length} products`);
    }

    // If no cards created, create a summary card with all products
    if (cards.length === 0) {
      const allProducts = Object.values(productResults).flat();
      if (allProducts.length > 0) {
        cards.push({
          id: 'summary-products',
          title: geminiAnalysis.context,
          content: `Found ${allProducts.length} products matching your request.`,
          category: geminiAnalysis.category,
          tags: ['All Products', 'Mixed Results'],
          products: allProducts.slice(0, 8),
          searchQuery: geminiAnalysis.context,
          analysisConfidence: geminiAnalysis.confidence,
          extractedProductNames: geminiAnalysis.recommendedProducts
        });
      }
    }

    console.log(`✅ Created ${cards.length} product type cards`);
    return cards;
  }

  private generateCardTitle(productTerm: string, gender: 'male' | 'female' | 'unisex'): string {
    const capitalizedTerm = productTerm.charAt(0).toUpperCase() + productTerm.slice(1);
    
    if (gender !== 'unisex') {
      const genderWord = gender === 'male' ? 'Men\'s' : 'Women\'s';
      return `${genderWord} ${capitalizedTerm}`;
    }
    
    return capitalizedTerm;
  }

  private generateCardContent(
    productTerm: string,
    products: Product[],
    geminiAnalysis: GeminiProductAnalysis
  ): string {
    const priceRange = this.calculatePriceRange(products);
    const platforms = [...new Set(products.map(p => p.platform))].join(', ');
    const avgRating = products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length;
    
    return `Found ${products.length} ${productTerm} options based on Gemini 2.5 Flash analysis.

Price Range: ${priceRange}
Average Rating: ${avgRating.toFixed(1)}/5 stars
Available on: ${platforms}

All products have verified shopping links and real prices from major e-commerce platforms.`;
  }

  private generateCardTags(
    productTerm: string,
    products: Product[],
    geminiAnalysis: GeminiProductAnalysis
  ): string[] {
    const tags = ['Gemini AI Recommended', 'Real Products'];
    
    if (geminiAnalysis.confidence >= 80) tags.push('High Confidence');
    if (geminiAnalysis.gender !== 'unisex') tags.push(`${geminiAnalysis.gender} Specific`);
    
    tags.push(`${products.length} Options`);
    
    const category = this.determineCategory(productTerm);
    tags.push(category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()));
    
    const platforms = [...new Set(products.map(p => p.platform))];
    if (platforms.length === 1) {
      tags.push(platforms[0].charAt(0).toUpperCase() + platforms[0].slice(1));
    }
    
    return tags.slice(0, 6);
  }

  private calculateTrendScore(products: Product[]): number {
    if (products.length === 0) return 70;
    const avgTrendScore = products.reduce((sum, p) => sum + (p.trendScore || 70), 0) / products.length;
    return Math.round(avgTrendScore);
  }

  private calculatePriceRange(products: Product[]): string {
    if (products.length === 0) return 'Price varies';
    const prices = products.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`;
  }

  private async createFallbackProductCards(
    userInput: string,
    userPreferences: UserPreferences
  ): Promise<EnhancedRecommendationCard[]> {
    console.log('🔄 Creating fallback product cards...');
    
    try {
      const basicSearchQuery = userInput.trim();
      const googleResults = await this.googleSearchService.searchAndAnalyze(basicSearchQuery);
      const products = this.googleSearchService.convertToProducts(googleResults.products, 'fashion');

      if (products.length > 0) {
        return [{
          id: 'fallback-products',
          title: `Products for "${userInput}"`,
          content: `Found ${products.length} products related to your search.`,
          category: 'fashion',
          tags: ['Search Results', 'Related Products'],
          products: products.slice(0, 8),
          searchQuery: basicSearchQuery,
          analysisConfidence: 50,
          extractedProductNames: [userInput]
        }];
      }
    } catch (error) {
      console.error('Fallback search failed:', error);
    }

    return [{
      id: 'no-results',
      title: 'Search Help',
      content: `I couldn't find specific products for "${userInput}". Try being more specific with product names or categories.`,
      category: 'help',
      tags: ['Search Help', 'Try Again'],
      products: [],
      searchQuery: userInput,
      analysisConfidence: 30,
      extractedProductNames: []
    }];
  }

  // Keep existing helper methods for compatibility
  async getQuickProductSuggestions(category: string, preferences: UserPreferences): Promise<Product[]> {
    const searchQueries = this.productAnalyzer.getSearchQueriesForCategory(category, preferences);
    const allProducts: Product[] = [];
    
    for (const query of searchQueries.slice(0, 3)) {
      try {
        const results = await this.googleSearchService.searchAndAnalyze(query);
        const products = this.googleSearchService.convertToProducts(results.products, category);
        allProducts.push(...products);
      } catch (error) {
        console.error(`Failed to search for ${query}:`, error);
      }
    }
    
    return allProducts.slice(0, 8);
  }

  analyzeProductMentions(text: string): {
    brands: string[];
    prices: string[];
    categories: string[];
    confidence: number;
  } {
    return {
      brands: this.productAnalyzer.extractBrandMentions(text),
      prices: this.productAnalyzer.extractPriceMentions(text),
      categories: Object.keys(this.productAnalyzer['fashionKeywords']).filter(category =>
        text.toLowerCase().includes(category.replace('-', ' '))
      ),
      confidence: text.length > 100 ? 80 : 60
    };
  }
}