import type { UserPreferences } from '../types';

interface ExtractedProduct {
  name: string;
  category: string;
  searchTerms: string[];
  confidence: number;
  context: string;
  gender?: 'male' | 'female' | 'unisex';
}

interface AnalysisResult {
  extractedProducts: ExtractedProduct[];
  searchQueries: string[];
  totalProducts: number;
  analysisConfidence: number;
  detectedGender?: 'male' | 'female' | 'unisex';
}

export class ProductNameAnalyzer {
  private fashionKeywords = {
    'ethnic-wear': [
      'kurta', 'kurti', 'saree', 'lehenga', 'anarkali', 'palazzo', 'churidar', 
      'dupatta', 'sharara', 'gharara', 'salwar', 'kameez', 'ethnic', 'traditional',
      'handloom', 'silk', 'cotton', 'bandhani', 'block print', 'embroidered',
      'dhoti', 'lungi', 'sherwani', 'nehru jacket', 'pathani', 'bandhgala'
    ],
    'western-wear': [
      'dress', 'jeans', 'top', 'shirt', 'blouse', 'blazer', 'jacket', 'skirt',
      'trousers', 'pants', 'shorts', 'jumpsuit', 'romper', 'cardigan', 'sweater',
      'hoodie', 'tshirt', 't-shirt', 'crop top', 'midi', 'maxi', 'mini',
      'polo', 'chinos', 'cargo', 'formal shirt', 'casual shirt'
    ],
    'accessories': [
      'earrings', 'necklace', 'bracelet', 'ring', 'jewelry', 'bag', 'handbag',
      'purse', 'clutch', 'wallet', 'belt', 'scarf', 'stole', 'watch', 'sunglasses',
      'hair accessories', 'headband', 'clips', 'ties', 'brooch', 'pendant',
      'cufflinks', 'tie pin', 'pocket square', 'backpack', 'messenger bag'
    ],
    'footwear': [
      'shoes', 'sandals', 'heels', 'flats', 'sneakers', 'boots', 'slippers',
      'chappals', 'juttis', 'kolhapuri', 'stiletto', 'wedges', 'pumps', 'loafers',
      'oxfords', 'ballet flats', 'ankle boots', 'knee boots', 'running shoes',
      'formal shoes', 'casual shoes', 'sports shoes', 'dress shoes'
    ],
    'formal-wear': [
      'formal', 'office', 'professional', 'business', 'corporate', 'suit',
      'formal shirt', 'formal pants', 'formal dress', 'blazer', 'tie', 'bow tie',
      'waistcoat', 'vest', 'tuxedo', 'dinner jacket'
    ],
    'party-wear': [
      'party', 'evening', 'cocktail', 'gown', 'sequin', 'metallic', 'shimmer',
      'glitter', 'embellished', 'party dress', 'evening wear', 'night out'
    ]
  };

  // ENHANCED gender keywords with higher specificity
  private genderKeywords = {
    male: [
      // Direct male references (weight: 10)
      'for male', 'for men', 'male only', 'men only', 'boys only',
      'for boys', 'for him', 'for gentleman', 'for gents',
      
      // Strong male indicators (weight: 8)
      'men', 'man', 'male', 'boy', 'boys', 'mens', "men's", 'masculine',
      'guys', 'gentleman', 'gents', 'masculine style', 'male fashion',
      
      // Contextual male terms (weight: 5)
      'menswear', 'manly', 'masculine wear', 'gentlemen', 'dude', 'bro',
      'sir', 'mister', 'mr', 'father', 'dad', 'husband', 'boyfriend'
    ],
    female: [
      // Direct female references (weight: 10)
      'for female', 'for women', 'female only', 'women only', 'girls only',
      'for girls', 'for her', 'for lady', 'for ladies',
      
      // Strong female indicators (weight: 8)
      'women', 'woman', 'female', 'girl', 'girls', 'womens', "women's", 'feminine',
      'ladies', 'lady', 'feminine style', 'female fashion',
      
      // Contextual female terms (weight: 5)
      'womenswear', 'girly', 'feminine wear', 'miss', 'mrs', 'ms',
      'mother', 'mom', 'wife', 'girlfriend', 'sister', 'daughter'
    ],
    unisex: [
      'unisex', 'gender neutral', 'for all', 'everyone', 'universal',
      'both men and women', 'all genders', 'gender free', 'non-binary'
    ]
  };

  // STRICT gender-specific items
  private maleSpecificItems = [
    'shirt', 'formal shirt', 'polo shirt', 'tie', 'bow tie', 'suit', 'blazer',
    'trousers', 'formal pants', 'chinos', 'cargo pants', 'vest', 'waistcoat',
    'tuxedo', 'sherwani', 'pathani', 'nehru jacket', 'dhoti', 'lungi',
    'formal shoes', 'oxfords', 'loafers', 'dress shoes', 'cufflinks',
    'beard oil', 'aftershave', 'cologne', 'wallet', 'briefcase'
  ];

  private femaleSpecificItems = [
    'dress', 'skirt', 'blouse', 'saree', 'lehenga', 'kurti', 'anarkali',
    'crop top', 'midi dress', 'maxi dress', 'mini dress', 'gown',
    'heels', 'stiletto', 'pumps', 'ballet flats', 'handbag', 'purse',
    'clutch', 'earrings', 'necklace', 'bracelet', 'makeup', 'lipstick',
    'foundation', 'mascara', 'nail polish', 'hair clips', 'hair bands'
  ];

  private brandKeywords = [
    'zara', 'h&m', 'uniqlo', 'forever 21', 'mango', 'vero moda', 'only', 'and',
    'libas', 'biba', 'w for woman', 'fabindia', 'global desi', 'aurelia',
    'nike', 'adidas', 'puma', 'reebok', 'converse', 'vans', 'new balance',
    'levis', 'wrangler', 'pepe jeans', 'flying machine', 'lee', 'diesel',
    'arrow', 'van heusen', 'peter england', 'louis philippe', 'allen solly',
    'blackberrys', 'raymond', 'park avenue'
  ];

  private styleDescriptors = [
    'trendy', 'stylish', 'fashionable', 'chic', 'elegant', 'sophisticated',
    'casual', 'formal', 'smart casual', 'bohemian', 'vintage', 'retro',
    'modern', 'contemporary', 'classic', 'timeless', 'edgy', 'minimalist',
    'maximalist', 'preppy', 'grunge', 'romantic', 'sporty', 'athleisure'
  ];

  private colorKeywords = [
    'red', 'blue', 'green', 'yellow', 'black', 'white', 'grey', 'gray',
    'pink', 'purple', 'orange', 'brown', 'beige', 'cream', 'navy', 'maroon',
    'teal', 'turquoise', 'coral', 'mint', 'lavender', 'gold', 'silver',
    'rose gold', 'copper', 'bronze', 'multicolor', 'printed', 'solid'
  ];

  private fabricKeywords = [
    'cotton', 'silk', 'linen', 'wool', 'polyester', 'rayon', 'viscose',
    'chiffon', 'georgette', 'crepe', 'satin', 'velvet', 'denim', 'leather',
    'suede', 'lace', 'net', 'tulle', 'organza', 'brocade', 'jacquard'
  ];

  analyzeGPT4oResponse(gptResponse: string, userPreferences: UserPreferences): AnalysisResult {
    console.log('🔍 ENHANCED: Analyzing GPT-4o response for STRICT gender-specific product recommendations...');
    
    const extractedProducts: ExtractedProduct[] = [];
    const searchQueries: string[] = [];
    
    // Clean and normalize the response
    const cleanResponse = this.cleanText(gptResponse);
    
    // ENHANCED gender detection with weighted scoring
    const detectedGender = this.detectGenderWithWeightedScoring(cleanResponse);
    console.log(`👤 STRICT GENDER DETECTION: ${detectedGender.toUpperCase()}`);
    
    // Apply ZERO TOLERANCE gender filtering
    if (detectedGender !== 'unisex') {
      console.log(`🚫 ZERO TOLERANCE FILTER ACTIVE: ONLY ${detectedGender.toUpperCase()} PRODUCTS ALLOWED`);
    }
    
    // Extract products using multiple methods with STRICT gender awareness
    const methods = [
      () => this.extractFromStructuredRecommendations(cleanResponse, detectedGender),
      () => this.extractFromBulletPoints(cleanResponse, detectedGender),
      () => this.extractFromNumberedLists(cleanResponse, detectedGender),
      () => this.extractFromSentences(cleanResponse, detectedGender),
      () => this.extractFromHeadings(cleanResponse, detectedGender),
      () => this.extractFromProductMentions(cleanResponse, detectedGender)
    ];
    
    for (const method of methods) {
      const products = method();
      extractedProducts.push(...products);
    }
    
    // Remove duplicates and apply ZERO TOLERANCE gender filtering
    const uniqueProducts = this.removeDuplicateProducts(extractedProducts);
    const strictGenderFilteredProducts = this.applyZeroToleranceGenderFilter(uniqueProducts, detectedGender);
    const enhancedProducts = this.enhanceProductsWithStrictGenderContext(strictGenderFilteredProducts, userPreferences, detectedGender);
    
    // Generate MANDATORY gender-specific search queries
    const queries = this.generateMandatoryGenderSpecificSearchQueries(enhancedProducts, userPreferences, detectedGender);
    searchQueries.push(...queries);
    
    // Calculate analysis confidence
    const confidence = this.calculateAnalysisConfidence(enhancedProducts, cleanResponse);
    
    console.log(`✅ STRICT FILTERING COMPLETE: ${enhancedProducts.length} ${detectedGender.toUpperCase()}-ONLY products with ${confidence}% confidence`);
    console.log(`🔍 Generated ${searchQueries.length} MANDATORY gender-specific search queries`);
    
    if (detectedGender !== 'unisex') {
      console.log(`🎯 ZERO TOLERANCE GUARANTEE: ALL PRODUCTS ARE EXCLUSIVELY FOR ${detectedGender.toUpperCase()}`);
    }
    
    return {
      extractedProducts: enhancedProducts,
      searchQueries: searchQueries,
      totalProducts: enhancedProducts.length,
      analysisConfidence: confidence,
      detectedGender
    };
  }

  private detectGenderWithWeightedScoring(text: string): 'male' | 'female' | 'unisex' {
    const textLower = text.toLowerCase();
    
    let maleScore = 0;
    let femaleScore = 0;
    let unisexScore = 0;
    
    console.log('🔍 ENHANCED GENDER DETECTION with weighted scoring...');
    
    // ENHANCED male keyword detection with weighted scoring
    for (const keyword of this.genderKeywords.male) {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        let weight = 2; // Base weight
        
        // Higher weights for explicit gender phrases
        if (keyword.startsWith('for ') || keyword.includes(' only')) weight = 10;
        else if (keyword.includes('male') || keyword.includes('men')) weight = 8;
        else if (keyword.length > 6) weight = 5;
        else if (keyword.length > 4) weight = 3;
        
        const score = matches.length * weight;
        maleScore += score;
        console.log(`🔵 MALE: "${keyword}" found ${matches.length} times (weight: ${weight}, score: +${score})`);
      }
    }
    
    // ENHANCED female keyword detection with weighted scoring
    for (const keyword of this.genderKeywords.female) {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        let weight = 2; // Base weight
        
        // Higher weights for explicit gender phrases
        if (keyword.startsWith('for ') || keyword.includes(' only')) weight = 10;
        else if (keyword.includes('female') || keyword.includes('women')) weight = 8;
        else if (keyword.length > 6) weight = 5;
        else if (keyword.length > 4) weight = 3;
        
        const score = matches.length * weight;
        femaleScore += score;
        console.log(`🔴 FEMALE: "${keyword}" found ${matches.length} times (weight: ${weight}, score: +${score})`);
      }
    }
    
    // Unisex keyword detection
    for (const keyword of this.genderKeywords.unisex) {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        const score = matches.length * 5;
        unisexScore += score;
        console.log(`🟡 UNISEX: "${keyword}" found ${matches.length} times (score: +${score})`);
      }
    }
    
    // ENHANCED gender-specific item detection with higher weights
    for (const item of this.maleSpecificItems) {
      if (textLower.includes(item)) {
        maleScore += 8; // Higher weight for specific items
        console.log(`🔵 MALE ITEM: "${item}" detected (+8 points)`);
      }
    }
    
    for (const item of this.femaleSpecificItems) {
      if (textLower.includes(item)) {
        femaleScore += 8; // Higher weight for specific items
        console.log(`🔴 FEMALE ITEM: "${item}" detected (+8 points)`);
      }
    }
    
    console.log(`📊 FINAL WEIGHTED SCORES - Male: ${maleScore}, Female: ${femaleScore}, Unisex: ${unisexScore}`);
    
    // STRICT threshold for gender detection (minimum score of 5)
    const threshold = 5;
    
    if (maleScore >= threshold && maleScore > femaleScore && maleScore > unisexScore) {
      console.log(`✅ STRICT GENDER DETECTED: MALE (Score: ${maleScore})`);
      return 'male';
    } else if (femaleScore >= threshold && femaleScore > maleScore && femaleScore > unisexScore) {
      console.log(`✅ STRICT GENDER DETECTED: FEMALE (Score: ${femaleScore})`);
      return 'female';
    } else if (unisexScore > Math.max(maleScore, femaleScore)) {
      console.log(`✅ STRICT GENDER DETECTED: UNISEX (Score: ${unisexScore})`);
      return 'unisex';
    } else {
      console.log(`⚪ NO CLEAR GENDER PREFERENCE - Defaulting to UNISEX`);
      return 'unisex';
    }
  }

  private applyZeroToleranceGenderFilter(products: ExtractedProduct[], detectedGender: 'male' | 'female' | 'unisex'): ExtractedProduct[] {
    if (detectedGender === 'unisex') {
      console.log('🟡 No gender filter applied - showing all products');
      return products;
    }
    
    console.log(`🚫 APPLYING ZERO TOLERANCE ${detectedGender.toUpperCase()} FILTER`);
    
    const filteredProducts = products.filter(product => {
      const productName = product.name.toLowerCase();
      const searchTerms = product.searchTerms.join(' ').toLowerCase();
      const combinedText = productName + ' ' + searchTerms;
      
      // Check if product is explicitly for the OPPOSITE gender (IMMEDIATE REJECTION)
      const oppositeGender = detectedGender === 'male' ? 'female' : 'male';
      const isForOppositeGender = this.genderKeywords[oppositeGender].some(keyword => 
        combinedText.includes(keyword)
      );
      
      const isOppositeGenderSpecificItem = detectedGender === 'male'
        ? this.femaleSpecificItems.some(item => combinedText.includes(item))
        : this.maleSpecificItems.some(item => combinedText.includes(item));
      
      // ZERO TOLERANCE: Immediate rejection for opposite gender
      if (isForOppositeGender || isOppositeGenderSpecificItem) {
        console.log(`❌ REJECTED (opposite gender): ${product.name}`);
        return false;
      }
      
      // Check if product is explicitly for the detected gender (IMMEDIATE ACCEPTANCE)
      const isForDetectedGender = this.genderKeywords[detectedGender].some(keyword => 
        combinedText.includes(keyword)
      );
      
      const isGenderSpecificItem = detectedGender === 'male' 
        ? this.maleSpecificItems.some(item => combinedText.includes(item))
        : this.femaleSpecificItems.some(item => combinedText.includes(item));
      
      if (isForDetectedGender || isGenderSpecificItem) {
        console.log(`✅ ACCEPTED (matches gender): ${product.name}`);
        return true;
      }
      
      // For neutral items, apply additional checks
      const neutralCategories = ['accessories', 'footwear'];
      if (neutralCategories.includes(product.category)) {
        // Even neutral items get gender context added
        console.log(`⚪ ACCEPTED (neutral, will add gender context): ${product.name}`);
        return true;
      }
      
      // Default: Accept but add mandatory gender context
      console.log(`⚪ ACCEPTED (will add mandatory gender context): ${product.name}`);
      return true;
    });
    
    console.log(`📊 ZERO TOLERANCE FILTER RESULTS: ${products.length} → ${filteredProducts.length} products`);
    return filteredProducts;
  }

  private enhanceProductsWithStrictGenderContext(
    products: ExtractedProduct[], 
    preferences: UserPreferences, 
    detectedGender: 'male' | 'female' | 'unisex'
  ): ExtractedProduct[] {
    return products.map(product => {
      const productGender = product.gender || detectedGender;
      
      // MANDATORY gender context addition
      let enhancedName = product.name;
      if (productGender !== 'unisex') {
        const genderPrefix = productGender === 'male' ? 'Men\'s' : 'Women\'s';
        const hasGenderContext = enhancedName.toLowerCase().includes('men') || 
                                enhancedName.toLowerCase().includes('women') ||
                                enhancedName.toLowerCase().includes('male') ||
                                enhancedName.toLowerCase().includes('female');
        
        if (!hasGenderContext) {
          enhancedName = `${genderPrefix} ${enhancedName}`;
          console.log(`🏷️ Added gender context: ${product.name} → ${enhancedName}`);
        }
      }
      
      // MANDATORY gender-specific search terms
      const enhancedSearchTerms = [...product.searchTerms];
      
      if (productGender !== 'unisex') {
        const genderWord = productGender === 'male' ? 'men' : 'women';
        const genderWordAlt = productGender === 'male' ? 'male' : 'female';
        
        // Add MULTIPLE mandatory gender terms
        enhancedSearchTerms.push(
          genderWord,
          `for ${genderWordAlt}`,
          `${genderWordAlt} only`,
          `${genderWord} only`,
          `${genderWord} fashion`,
          `${genderWordAlt} wear`,
          `${genderWord} clothing`,
          `${genderWordAlt} style`
        );
      }
      
      // Add user preferences
      if (preferences.colors.length > 0) {
        enhancedSearchTerms.push(...preferences.colors.slice(0, 2));
      }
      
      if (preferences.style.length > 0) {
        enhancedSearchTerms.push(...preferences.style.slice(0, 2));
      }
      
      // Add budget context
      if (preferences.budget.max < 2000) {
        enhancedSearchTerms.push('budget', 'affordable');
      } else if (preferences.budget.max > 5000) {
        enhancedSearchTerms.push('premium', 'designer');
      }
      
      // Add occasion context
      if (preferences.occasions.length > 0) {
        enhancedSearchTerms.push(...preferences.occasions.slice(0, 2));
      }
      
      return {
        ...product,
        name: enhancedName,
        gender: productGender,
        searchTerms: [...new Set(enhancedSearchTerms)].slice(0, 20) // Remove duplicates and limit
      };
    });
  }

  private generateMandatoryGenderSpecificSearchQueries(
    products: ExtractedProduct[], 
    preferences: UserPreferences, 
    detectedGender: 'male' | 'female' | 'unisex'
  ): string[] {
    const queries: string[] = [];
    
    for (const product of products) {
      const productGender = product.gender || detectedGender;
      
      // Base queries
      const baseQueries = [
        product.name,
        `${product.name} ${product.category.replace('-', ' ')}`,
        `${product.searchTerms.slice(0, 3).join(' ')}`,
        `${product.name} buy online India`
      ];
      
      // MANDATORY gender-specific queries for detected gender
      if (productGender !== 'unisex') {
        const genderWord = productGender === 'male' ? 'men' : 'women';
        const genderWordAlt = productGender === 'male' ? 'male' : 'female';
        
        // Add EXTENSIVE gender-specific variations to ensure ZERO opposite gender results
        const genderQueries = [
          `${genderWord} ${product.name}`,
          `${product.name} for ${genderWordAlt}`,
          `${genderWord} ${product.category.replace('-', ' ')}`,
          `${product.name} ${genderWord} only`,
          `${genderWordAlt} ${product.name} online`,
          `${genderWord} only ${product.name}`,
          `${product.name} ${genderWordAlt} exclusive`,
          `${genderWord} fashion ${product.name}`,
          `${genderWordAlt} wear ${product.name}`,
          `${product.name} ${genderWord} clothing`,
          `${genderWord} style ${product.name}`,
          `${product.name} for ${genderWord} only`
        ];
        
        baseQueries.push(...genderQueries);
        
        // Add category-specific gender queries
        if (product.category === 'ethnic-wear') {
          baseQueries.push(
            `${genderWord} ethnic wear ${product.name}`,
            `${product.name} ${genderWord} traditional`,
            `${genderWordAlt} ethnic ${product.name}`,
            `${genderWord} traditional wear ${product.name}`
          );
        } else if (product.category === 'western-wear') {
          baseQueries.push(
            `${genderWord} western wear ${product.name}`,
            `${product.name} ${genderWord} casual`,
            `${genderWordAlt} western ${product.name}`,
            `${genderWord} casual wear ${product.name}`
          );
        } else if (product.category === 'formal-wear') {
          baseQueries.push(
            `${genderWord} formal wear ${product.name}`,
            `${product.name} ${genderWord} office`,
            `${genderWordAlt} formal ${product.name}`,
            `${genderWord} office wear ${product.name}`
          );
        }
      }
      
      // Add preference-enhanced queries with MANDATORY gender
      if (preferences.colors.length > 0) {
        baseQueries.push(`${product.name} ${preferences.colors[0]}`);
        if (productGender !== 'unisex') {
          const genderWord = productGender === 'male' ? 'men' : 'women';
          baseQueries.push(
            `${genderWord} ${product.name} ${preferences.colors[0]}`,
            `${preferences.colors[0]} ${product.name} for ${productGender}`
          );
        }
      }
      
      if (preferences.budget.max < 2000) {
        baseQueries.push(`${product.name} under ${preferences.budget.max}`);
        if (productGender !== 'unisex') {
          const genderWord = productGender === 'male' ? 'men' : 'women';
          baseQueries.push(
            `${genderWord} ${product.name} budget`,
            `affordable ${product.name} for ${productGender}`
          );
        }
      }
      
      queries.push(...baseQueries);
    }
    
    // Remove duplicates and filter
    const uniqueQueries = [...new Set(queries)]
      .filter(query => query.length > 5 && query.length < 120)
      .slice(0, 100); // Increased limit for extensive gender-specific queries
    
    console.log(`🔍 Generated ${uniqueQueries.length} MANDATORY gender-specific search queries`);
    return uniqueQueries;
  }

  // Keep all existing methods but enhance them with strict gender awareness
  private cleanText(text: string): string {
    return text
      .replace(/#{1,6}\s*/g, '') // Remove markdown headers
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '') // Remove italic markdown
      .replace(/`/g, '') // Remove code markdown
      .replace(/^\s*[-•]\s*/gm, '') // Remove bullet points
      .replace(/^\s*\d+\.\s*/gm, '') // Remove numbered lists
      .replace(/\n{3,}/g, '\n\n') // Reduce multiple line breaks
      .trim();
  }

  private extractFromStructuredRecommendations(text: string, gender: 'male' | 'female' | 'unisex'): ExtractedProduct[] {
    const products: ExtractedProduct[] = [];
    
    // Look for structured recommendations like "1. Product Name: Description"
    const structuredPattern = /(?:^|\n)(?:\d+\.|•|\*|\-)\s*\*?\*?([^:\n]{10,80})(?::\*?\*?|\*?\*?:?)\s*([\s\S]*?)(?=(?:\n(?:\d+\.|•|\*|\-)|$))/g;
    
    let match;
    while ((match = structuredPattern.exec(text)) !== null) {
      const title = match[1].trim();
      const description = match[2].trim();
      
      if (this.isProductMention(title)) {
        const product = this.createProductFromText(title, description, 'structured', gender);
        if (product) {
          products.push(product);
        }
      }
    }
    
    return products;
  }

  private extractFromBulletPoints(text: string, gender: 'male' | 'female' | 'unisex'): ExtractedProduct[] {
    const products: ExtractedProduct[] = [];
    
    // Extract from bullet points and lists
    const bulletPattern = /(?:^|\n)(?:[-•*]|\d+\.)\s*([^\n]{10,100})/g;
    
    let match;
    while ((match = bulletPattern.exec(text)) !== null) {
      const item = match[1].trim();
      
      if (this.isProductMention(item)) {
        const product = this.createProductFromText(item, '', 'bullet', gender);
        if (product) {
          products.push(product);
        }
      }
    }
    
    return products;
  }

  private extractFromNumberedLists(text: string, gender: 'male' | 'female' | 'unisex'): ExtractedProduct[] {
    const products: ExtractedProduct[] = [];
    
    // Extract from numbered lists with detailed descriptions
    const numberedPattern = /(?:^|\n)(\d+)\.\s*\*?\*?([^:\n]{5,80})(?::\*?\*?|\*?\*?:?)?\s*([\s\S]*?)(?=(?:\n\d+\.|$))/g;
    
    let match;
    while ((match = numberedPattern.exec(text)) !== null) {
      const number = match[1];
      const title = match[2].trim();
      const description = match[3].trim();
      
      if (this.isProductMention(title)) {
        const product = this.createProductFromText(title, description, 'numbered', gender);
        if (product) {
          products.push(product);
        }
      }
    }
    
    return products;
  }

  private extractFromSentences(text: string, gender: 'male' | 'female' | 'unisex'): ExtractedProduct[] {
    const products: ExtractedProduct[] = [];
    
    // Extract products mentioned in sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    for (const sentence of sentences) {
      const productMentions = this.findProductMentionsInSentence(sentence, gender);
      products.push(...productMentions);
    }
    
    return products;
  }

  private extractFromHeadings(text: string, gender: 'male' | 'female' | 'unisex'): ExtractedProduct[] {
    const products: ExtractedProduct[] = [];
    
    // Extract from headings and subheadings
    const headingPattern = /(?:^|\n)(#{1,6}\s*)?([^:\n]{10,80})(?:\n|$)/g;
    
    let match;
    while ((match = headingPattern.exec(text)) !== null) {
      const heading = match[2].trim();
      
      if (this.isProductMention(heading)) {
        const product = this.createProductFromText(heading, '', 'heading', gender);
        if (product) {
          products.push(product);
        }
      }
    }
    
    return products;
  }

  private extractFromProductMentions(text: string, gender: 'male' | 'female' | 'unisex'): ExtractedProduct[] {
    const products: ExtractedProduct[] = [];
    
    // Look for specific product patterns with gender awareness
    const productPatterns = [
      /(?:designer|trendy|stylish|elegant|modern|classic)\s+([a-zA-Z\s]{5,40})(?:\s+(?:set|collection|piece|wear|dress|top|bottom))/gi,
      /([a-zA-Z\s]{3,30})\s+(?:kurta|saree|dress|jeans|top|shirt|blazer|jacket|shoes|sandals|bag|jewelry)/gi,
      /(?:silk|cotton|linen|chiffon|georgette)\s+([a-zA-Z\s]{3,30})/gi,
      /([a-zA-Z\s]{3,30})\s+(?:with|featuring|in)\s+(?:embroidery|print|pattern|design)/gi,
      /(?:men|women|male|female|boys|girls)\s+([a-zA-Z\s]{3,40})(?:\s+(?:wear|clothing|fashion|style))/gi
    ];
    
    for (const pattern of productPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const productName = match[1].trim();
        
        if (productName.length > 3 && this.isValidProductName(productName)) {
          const product = this.createProductFromText(productName, '', 'pattern', gender);
          if (product) {
            products.push(product);
          }
        }
      }
    }
    
    return products;
  }

  private isProductMention(text: string): boolean {
    const textLower = text.toLowerCase();
    
    // Check if text contains fashion keywords
    for (const category of Object.values(this.fashionKeywords)) {
      if (category.some(keyword => textLower.includes(keyword))) {
        return true;
      }
    }
    
    // Check for style descriptors
    if (this.styleDescriptors.some(style => textLower.includes(style))) {
      return true;
    }
    
    // Check for color mentions
    if (this.colorKeywords.some(color => textLower.includes(color))) {
      return true;
    }
    
    // Check for fabric mentions
    if (this.fabricKeywords.some(fabric => textLower.includes(fabric))) {
      return true;
    }
    
    return false;
  }

  private isValidProductName(name: string): boolean {
    const nameLower = name.toLowerCase();
    
    // Filter out common non-product words
    const excludeWords = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
      'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
      'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
    ];
    
    const words = nameLower.split(' ').filter(word => word.length > 2);
    const validWords = words.filter(word => !excludeWords.includes(word));
    
    return validWords.length >= 1 && name.length >= 3 && name.length <= 100;
  }

  private createProductFromText(
    title: string, 
    description: string, 
    context: string, 
    gender: 'male' | 'female' | 'unisex'
  ): ExtractedProduct | null {
    const titleLower = title.toLowerCase();
    const descriptionLower = description.toLowerCase();
    const combinedText = (title + ' ' + description).toLowerCase();
    
    // Determine category with gender awareness
    let category = 'fashion';
    let maxMatches = 0;
    
    for (const [cat, keywords] of Object.entries(this.fashionKeywords)) {
      const matches = keywords.filter(keyword => combinedText.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        category = cat;
      }
    }
    
    // Generate search terms with STRICT gender specificity
    const searchTerms = this.generateStrictGenderSpecificSearchTerms(title, description, category, gender);
    
    // Calculate confidence based on keyword matches and context
    let confidence = 50; // Base confidence
    
    if (maxMatches > 0) confidence += Math.min(maxMatches * 15, 40);
    if (context === 'structured') confidence += 20;
    if (context === 'numbered') confidence += 15;
    if (context === 'heading') confidence += 10;
    
    // Boost confidence for specific product mentions
    if (this.brandKeywords.some(brand => combinedText.includes(brand))) confidence += 15;
    if (this.colorKeywords.some(color => combinedText.includes(color))) confidence += 10;
    if (this.fabricKeywords.some(fabric => combinedText.includes(fabric))) confidence += 10;
    
    // MAJOR boost for gender-specific mentions
    const genderKeywords = this.genderKeywords[gender] || [];
    if (genderKeywords.some(keyword => combinedText.includes(keyword))) confidence += 30;
    
    // Boost for gender-specific items
    const genderSpecificItems = gender === 'male' ? this.maleSpecificItems : this.femaleSpecificItems;
    if (genderSpecificItems.some(item => combinedText.includes(item))) confidence += 25;
    
    confidence = Math.min(confidence, 95); // Cap at 95%
    
    if (confidence < 30) return null; // Filter out low-confidence extractions
    
    // Clean and improve product name to match search query with MANDATORY gender context
    const improvedName = this.improveProductNameForSearchWithGender(title, gender, category);
    
    return {
      name: improvedName,
      category,
      searchTerms,
      confidence,
      context: context + (description ? ' with description' : ''),
      gender
    };
  }

  private improveProductNameForSearchWithGender(title: string, gender: 'male' | 'female' | 'unisex', category: string): string {
    let improvedName = this.cleanProductName(title);
    
    // MANDATORY gender prefix if not already present and gender is specified
    if (gender !== 'unisex') {
      const genderWord = gender === 'male' ? 'Men\'s' : 'Women\'s';
      const hasGenderWord = improvedName.toLowerCase().includes('men') || 
                           improvedName.toLowerCase().includes('women') ||
                           improvedName.toLowerCase().includes('male') ||
                           improvedName.toLowerCase().includes('female');
      
      if (!hasGenderWord) {
        improvedName = `${genderWord} ${improvedName}`;
        console.log(`🏷️ MANDATORY gender prefix added: ${title} → ${improvedName}`);
      }
    }
    
    // Ensure category context is clear
    const categoryWords = {
      'ethnic-wear': ['ethnic', 'traditional'],
      'western-wear': ['western', 'casual'],
      'formal-wear': ['formal', 'office'],
      'party-wear': ['party', 'evening'],
      'accessories': ['accessory'],
      'footwear': ['shoes', 'footwear']
    };
    
    const categoryKeywords = categoryWords[category] || [];
    const hasCategoryContext = categoryKeywords.some(keyword => 
      improvedName.toLowerCase().includes(keyword)
    );
    
    if (!hasCategoryContext && category !== 'fashion') {
      const categoryName = category.replace('-', ' ');
      improvedName = `${improvedName} ${categoryName}`;
    }
    
    return improvedName.trim();
  }

  private generateStrictGenderSpecificSearchTerms(
    title: string, 
    description: string, 
    category: string, 
    gender: 'male' | 'female' | 'unisex'
  ): string[] {
    const terms: string[] = [];
    const combinedText = (title + ' ' + description).toLowerCase();
    
    // Add the main title as a search term with MANDATORY gender
    const cleanTitle = this.cleanProductName(title);
    terms.push(cleanTitle);
    
    // MANDATORY gender-specific versions for detected gender
    if (gender !== 'unisex') {
      const genderWord = gender === 'male' ? 'men' : 'women';
      const genderWordAlt = gender === 'male' ? 'male' : 'female';
      
      // EXTENSIVE gender-specific variations to ensure strict filtering
      terms.push(
        `${cleanTitle} for ${genderWordAlt}`,
        `${genderWord} ${cleanTitle}`,
        `${cleanTitle} ${genderWord}`,
        `${genderWordAlt} ${cleanTitle}`,
        `${cleanTitle} ${genderWordAlt} only`,
        `${genderWord} only ${cleanTitle}`,
        `${cleanTitle} for ${genderWord}`,
        `${genderWordAlt} exclusive ${cleanTitle}`,
        `${genderWord} fashion ${cleanTitle}`,
        `${cleanTitle} ${genderWord} wear`,
        `${genderWordAlt} style ${cleanTitle}`,
        `${cleanTitle} ${genderWord} clothing`
      );
    }
    
    // Extract specific fashion keywords with gender
    for (const keyword of this.fashionKeywords[category] || []) {
      if (combinedText.includes(keyword)) {
        terms.push(keyword);
        if (gender !== 'unisex') {
          const genderWord = gender === 'male' ? 'men' : 'women';
          const genderWordAlt = gender === 'male' ? 'male' : 'female';
          terms.push(
            `${genderWord} ${keyword}`,
            `${keyword} for ${genderWordAlt}`,
            `${genderWordAlt} ${keyword}`,
            `${keyword} ${genderWord} only`
          );
        }
      }
    }
    
    // Add color keywords
    for (const color of this.colorKeywords) {
      if (combinedText.includes(color)) {
        terms.push(color);
      }
    }
    
    // Add fabric keywords
    for (const fabric of this.fabricKeywords) {
      if (combinedText.includes(fabric)) {
        terms.push(fabric);
      }
    }
    
    // Add brand keywords
    for (const brand of this.brandKeywords) {
      if (combinedText.includes(brand)) {
        terms.push(brand);
      }
    }
    
    // Add category-specific terms with MANDATORY gender
    const categoryTerm = category.replace('-', ' ');
    terms.push(categoryTerm);
    if (gender !== 'unisex') {
      const genderWord = gender === 'male' ? 'men' : 'women';
      const genderWordAlt = gender === 'male' ? 'male' : 'female';
      terms.push(
        `${genderWord} ${categoryTerm}`,
        `${categoryTerm} for ${genderWordAlt}`,
        `${genderWordAlt} ${categoryTerm}`,
        `${categoryTerm} ${genderWord} only`
      );
    }
    
    return [...new Set(terms)].slice(0, 20); // Remove duplicates and limit
  }

  private cleanProductName(name: string): string {
    return name
      .replace(/^\d+\.\s*/, '') // Remove numbering
      .replace(/^[-•*]\s*/, '') // Remove bullet points
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '') // Remove italic markdown
      .replace(/#{1,6}\s*/, '') // Remove headers
      .trim()
      .substring(0, 100); // Limit length
  }

  private findProductMentionsInSentence(sentence: string, gender: 'male' | 'female' | 'unisex'): ExtractedProduct[] {
    const products: ExtractedProduct[] = [];
    const sentenceLower = sentence.toLowerCase();
    
    // Look for product patterns in sentences with STRICT gender awareness
    const patterns = [
      /(?:buy|get|find|search|look for|recommend|suggest)\s+([a-zA-Z\s]{5,50})(?:\s+(?:online|from|at))/gi,
      /(?:trending|popular|best|top|latest)\s+([a-zA-Z\s]{5,50})(?:\s+(?:for|in|this))/gi,
      /([a-zA-Z\s]{5,50})\s+(?:are|is)\s+(?:trending|popular|recommended|perfect)/gi,
      /(?:men|women|male|female|boys|girls)\s+([a-zA-Z\s]{5,50})/gi
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(sentence)) !== null) {
        const productName = match[1].trim();
        
        if (this.isValidProductName(productName) && this.isProductMention(productName)) {
          const product = this.createProductFromText(productName, sentence, 'sentence', gender);
          if (product) {
            products.push(product);
          }
        }
      }
    }
    
    return products;
  }

  private removeDuplicateProducts(products: ExtractedProduct[]): ExtractedProduct[] {
    const unique: ExtractedProduct[] = [];
    const seen = new Set<string>();
    
    for (const product of products) {
      // Create a normalized key for deduplication
      const key = product.name.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (!seen.has(key) && key.length > 3) {
        seen.add(key);
        unique.push(product);
      }
    }
    
    // Sort by confidence and take top products
    return unique
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 30); // Increased limit for better gender filtering
  }

  private calculateAnalysisConfidence(products: ExtractedProduct[], originalText: string): number {
    if (products.length === 0) return 0;
    
    const avgProductConfidence = products.reduce((sum, p) => sum + p.confidence, 0) / products.length;
    
    // Factors that increase confidence
    let confidence = avgProductConfidence;
    
    // More products found = higher confidence
    if (products.length > 5) confidence += 10;
    if (products.length > 10) confidence += 10;
    
    // Structured text = higher confidence
    if (originalText.includes('1.') || originalText.includes('•')) confidence += 10;
    
    // Fashion-specific content = higher confidence
    const fashionWordCount = Object.values(this.fashionKeywords)
      .flat()
      .filter(keyword => originalText.toLowerCase().includes(keyword))
      .length;
    
    confidence += Math.min(fashionWordCount * 2, 20);
    
    // Gender-specific content = MAJOR confidence boost
    const genderWordCount = Object.values(this.genderKeywords)
      .flat()
      .filter(keyword => originalText.toLowerCase().includes(keyword))
      .length;
    
    confidence += Math.min(genderWordCount * 8, 35); // Increased weight for gender detection
    
    return Math.min(Math.round(confidence), 95);
  }

  // Method to get search queries for a specific category with STRICT gender awareness
  getSearchQueriesForCategory(
    category: string, 
    preferences: UserPreferences, 
    gender?: 'male' | 'female' | 'unisex'
  ): string[] {
    const categoryKeywords = this.fashionKeywords[category] || [];
    const queries: string[] = [];
    const targetGender = gender || preferences.gender || 'unisex';
    
    for (const keyword of categoryKeywords.slice(0, 5)) {
      queries.push(keyword);
      queries.push(`${keyword} online shopping India`);
      
      // Add STRICT gender-specific queries
      if (targetGender !== 'unisex') {
        const genderWord = targetGender === 'male' ? 'men' : 'women';
        const genderWordAlt = targetGender === 'male' ? 'male' : 'female';
        queries.push(
          `${genderWord} ${keyword}`,
          `${keyword} for ${targetGender}`,
          `${genderWordAlt} ${keyword} only`,
          `${genderWord} only ${keyword}`,
          `${keyword} ${genderWord} exclusive`,
          `${genderWordAlt} ${keyword} fashion`,
          `${genderWord} ${keyword} wear`,
          `${keyword} for ${genderWord} only`
        );
      }
      
      if (preferences.colors.length > 0) {
        queries.push(`${keyword} ${preferences.colors[0]}`);
        if (targetGender !== 'unisex') {
          const genderWord = targetGender === 'male' ? 'men' : 'women';
          queries.push(
            `${genderWord} ${keyword} ${preferences.colors[0]}`,
            `${preferences.colors[0]} ${keyword} for ${targetGender}`
          );
        }
      }
      
      if (preferences.budget.max < 2000) {
        queries.push(`${keyword} under ${preferences.budget.max}`);
      }
    }
    
    return queries.slice(0, 30); // Increased for gender-specific queries
  }

  // Method to extract brand mentions
  extractBrandMentions(text: string): string[] {
    const textLower = text.toLowerCase();
    const mentionedBrands: string[] = [];
    
    for (const brand of this.brandKeywords) {
      if (textLower.includes(brand)) {
        mentionedBrands.push(brand);
      }
    }
    
    return [...new Set(mentionedBrands)];
  }

  // Method to extract price mentions
  extractPriceMentions(text: string): string[] {
    const pricePattern = /₹[\d,]+(?:\s*-\s*₹[\d,]+)?|Rs\.?\s*[\d,]+(?:\s*-\s*Rs\.?\s*[\d,]+)?/g;
    const matches = text.match(pricePattern) || [];
    return [...new Set(matches)];
  }
}