export interface SpecificProductAnalysis {
  specificProductName: string;
  exactCategory: string;
  specificAttributes: {
    color?: string;
    material?: string;
    style?: string;
    occasion?: string;
    brand?: string;
    size?: string;
    pattern?: string;
  };
  searchPrecision: number;
  userIntent: 'specific_product' | 'category_browse' | 'style_advice';
  mandatoryKeywords: string[];
  excludeKeywords: string[];
}

export class ProductSpecificityAnalyzer {
  private specificProductPatterns = {
    // Exact product patterns
    'exact_product': [
      /(?:find|search|show|get|buy)\s+(?:me\s+)?(?:a\s+|an\s+|some\s+)?([a-zA-Z\s]{3,50})\s+(?:for|in|with|from)/gi,
      /(?:looking for|want|need)\s+(?:a\s+|an\s+|some\s+)?([a-zA-Z\s]{3,50})(?:\s+(?:that|which|with))/gi,
      /([a-zA-Z\s]{3,50})\s+(?:with|in|featuring)\s+([a-zA-Z\s]{3,30})/gi,
      /(?:specific|particular|exact)\s+([a-zA-Z\s]{3,50})/gi
    ],
    
    // Attribute-specific patterns
    'color_specific': [
      /(red|blue|green|yellow|black|white|pink|purple|orange|brown|grey|gray|navy|maroon|teal|gold|silver)\s+([a-zA-Z\s]{3,40})/gi,
      /([a-zA-Z\s]{3,40})\s+in\s+(red|blue|green|yellow|black|white|pink|purple|orange|brown|grey|gray|navy|maroon|teal|gold|silver)/gi
    ],
    
    // Material-specific patterns
    'material_specific': [
      /(cotton|silk|linen|wool|polyester|rayon|chiffon|georgette|crepe|satin|velvet|denim|leather)\s+([a-zA-Z\s]{3,40})/gi,
      /([a-zA-Z\s]{3,40})\s+(?:made of|in)\s+(cotton|silk|linen|wool|polyester|rayon|chiffon|georgette|crepe|satin|velvet|denim|leather)/gi
    ],
    
    // Style-specific patterns
    'style_specific': [
      /(casual|formal|party|wedding|festive|office|business|smart casual|bohemian|vintage|modern|classic)\s+([a-zA-Z\s]{3,40})/gi,
      /([a-zA-Z\s]{3,40})\s+for\s+(casual|formal|party|wedding|festive|office|business|work|date|night)/gi
    ],
    
    // Brand-specific patterns
    'brand_specific': [
      /(zara|h&m|uniqlo|nike|adidas|puma|levis|biba|libas|fabindia|myntra|amazon|flipkart)\s+([a-zA-Z\s]{3,40})/gi,
      /([a-zA-Z\s]{3,40})\s+from\s+(zara|h&m|uniqlo|nike|adidas|puma|levis|biba|libas|fabindia|myntra|amazon|flipkart)/gi
    ]
  };

  private exactProductKeywords = {
    'ethnic-wear': {
      'kurta': ['kurta', 'kurti', 'kurta set', 'straight kurta', 'a-line kurta', 'anarkali kurta'],
      'saree': ['saree', 'sari', 'silk saree', 'cotton saree', 'designer saree', 'party saree'],
      'lehenga': ['lehenga', 'lehenga choli', 'wedding lehenga', 'party lehenga', 'designer lehenga'],
      'palazzo': ['palazzo', 'palazzo pants', 'palazzo set', 'wide leg palazzo', 'printed palazzo'],
      'anarkali': ['anarkali', 'anarkali dress', 'anarkali suit', 'floor length anarkali'],
      'sharara': ['sharara', 'sharara set', 'sharara suit', 'gharara', 'gharara set']
    },
    'western-wear': {
      'dress': ['dress', 'midi dress', 'maxi dress', 'mini dress', 'shift dress', 'wrap dress', 'bodycon dress'],
      'jeans': ['jeans', 'skinny jeans', 'straight jeans', 'bootcut jeans', 'wide leg jeans', 'high waist jeans'],
      'top': ['top', 'crop top', 'tank top', 'blouse', 'shirt', 'tunic', 'peplum top'],
      'blazer': ['blazer', 'formal blazer', 'casual blazer', 'oversized blazer', 'fitted blazer'],
      'skirt': ['skirt', 'mini skirt', 'midi skirt', 'maxi skirt', 'pencil skirt', 'a-line skirt'],
      'jumpsuit': ['jumpsuit', 'romper', 'playsuit', 'overall', 'dungaree']
    },
    'footwear': {
      'heels': ['heels', 'high heels', 'stiletto', 'block heels', 'wedge heels', 'platform heels'],
      'flats': ['flats', 'ballet flats', 'pointed flats', 'loafers', 'slip-on'],
      'sneakers': ['sneakers', 'running shoes', 'casual shoes', 'white sneakers', 'canvas shoes'],
      'sandals': ['sandals', 'flat sandals', 'heeled sandals', 'strappy sandals', 'gladiator sandals'],
      'boots': ['boots', 'ankle boots', 'knee boots', 'combat boots', 'chelsea boots']
    },
    'accessories': {
      'earrings': ['earrings', 'studs', 'hoops', 'danglers', 'chandeliers', 'jhumkas'],
      'necklace': ['necklace', 'chain', 'pendant', 'choker', 'statement necklace', 'layered necklace'],
      'bag': ['bag', 'handbag', 'tote bag', 'crossbody bag', 'clutch', 'backpack', 'sling bag'],
      'watch': ['watch', 'smartwatch', 'analog watch', 'digital watch', 'sports watch'],
      'sunglasses': ['sunglasses', 'shades', 'aviators', 'wayfarers', 'cat eye sunglasses']
    }
  };

  private attributeKeywords = {
    colors: [
      'red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown',
      'grey', 'gray', 'navy', 'maroon', 'teal', 'turquoise', 'coral', 'mint', 'lavender',
      'gold', 'silver', 'rose gold', 'copper', 'bronze', 'multicolor', 'printed', 'solid'
    ],
    materials: [
      'cotton', 'silk', 'linen', 'wool', 'polyester', 'rayon', 'viscose', 'chiffon',
      'georgette', 'crepe', 'satin', 'velvet', 'denim', 'leather', 'suede', 'lace',
      'net', 'tulle', 'organza', 'brocade', 'jacquard', 'khadi', 'handloom'
    ],
    styles: [
      'casual', 'formal', 'party', 'wedding', 'festive', 'office', 'business',
      'smart casual', 'bohemian', 'vintage', 'retro', 'modern', 'contemporary',
      'classic', 'timeless', 'edgy', 'minimalist', 'maximalist', 'preppy',
      'grunge', 'romantic', 'sporty', 'athleisure', 'street style'
    ],
    occasions: [
      'work', 'office', 'party', 'wedding', 'festival', 'casual', 'date',
      'night out', 'brunch', 'vacation', 'travel', 'gym', 'sports', 'formal event',
      'cocktail', 'dinner', 'lunch', 'shopping', 'college', 'university'
    ],
    patterns: [
      'floral', 'striped', 'polka dot', 'geometric', 'abstract', 'paisley',
      'checkered', 'plaid', 'animal print', 'leopard', 'zebra', 'solid',
      'gradient', 'ombre', 'tie dye', 'embroidered', 'sequined', 'beaded'
    ],
    fits: [
      'slim fit', 'regular fit', 'loose fit', 'oversized', 'fitted', 'relaxed',
      'straight', 'skinny', 'wide leg', 'bootcut', 'flare', 'a-line',
      'bodycon', 'shift', 'wrap', 'empire waist', 'high waist', 'low waist'
    ]
  };

  analyzeProductSpecificity(userInput: string): SpecificProductAnalysis {
    console.log('🔍 ANALYZING PRODUCT SPECIFICITY for absolute specific products...');
    
    const inputLower = userInput.toLowerCase();
    let specificProductName = '';
    let exactCategory = 'fashion';
    let searchPrecision = 0;
    let userIntent: 'specific_product' | 'category_browse' | 'style_advice' = 'category_browse';
    
    const specificAttributes: SpecificProductAnalysis['specificAttributes'] = {};
    const mandatoryKeywords: string[] = [];
    const excludeKeywords: string[] = [];

    // Step 1: Detect if user is asking for a specific product
    const specificProductIndicators = [
      'find', 'search', 'show', 'get', 'buy', 'looking for', 'want', 'need',
      'specific', 'particular', 'exact', 'this type of', 'something like'
    ];

    const hasSpecificIntent = specificProductIndicators.some(indicator => 
      inputLower.includes(indicator)
    );

    if (hasSpecificIntent) {
      userIntent = 'specific_product';
      searchPrecision += 30;
      console.log('✅ SPECIFIC PRODUCT INTENT DETECTED');
    }

    // Step 2: Extract exact product name using patterns
    for (const [patternType, patterns] of Object.entries(this.specificProductPatterns)) {
      for (const pattern of patterns) {
        const matches = userInput.match(pattern);
        if (matches) {
          const extractedProduct = matches[1]?.trim();
          if (extractedProduct && extractedProduct.length > 2) {
            if (!specificProductName || extractedProduct.length > specificProductName.length) {
              specificProductName = extractedProduct;
              searchPrecision += 25;
              console.log(`🎯 EXTRACTED SPECIFIC PRODUCT: "${extractedProduct}" via ${patternType}`);
            }
          }
        }
      }
    }

    // Step 3: Identify exact category and subcategory
    for (const [category, subcategories] of Object.entries(this.exactProductKeywords)) {
      for (const [subcategory, variations] of Object.entries(subcategories)) {
        for (const variation of variations) {
          if (inputLower.includes(variation)) {
            exactCategory = category;
            if (!specificProductName) {
              specificProductName = variation;
            }
            mandatoryKeywords.push(variation);
            searchPrecision += 20;
            console.log(`📂 EXACT CATEGORY MATCH: ${category} -> ${subcategory} -> ${variation}`);
            break;
          }
        }
      }
    }

    // Step 4: Extract specific attributes
    // Color detection
    for (const color of this.attributeKeywords.colors) {
      if (inputLower.includes(color)) {
        specificAttributes.color = color;
        mandatoryKeywords.push(color);
        searchPrecision += 15;
        console.log(`🎨 COLOR DETECTED: ${color}`);
        break;
      }
    }

    // Material detection
    for (const material of this.attributeKeywords.materials) {
      if (inputLower.includes(material)) {
        specificAttributes.material = material;
        mandatoryKeywords.push(material);
        searchPrecision += 15;
        console.log(`🧵 MATERIAL DETECTED: ${material}`);
        break;
      }
    }

    // Style detection
    for (const style of this.attributeKeywords.styles) {
      if (inputLower.includes(style)) {
        specificAttributes.style = style;
        mandatoryKeywords.push(style);
        searchPrecision += 10;
        console.log(`✨ STYLE DETECTED: ${style}`);
        break;
      }
    }

    // Occasion detection
    for (const occasion of this.attributeKeywords.occasions) {
      if (inputLower.includes(occasion)) {
        specificAttributes.occasion = occasion;
        mandatoryKeywords.push(occasion);
        searchPrecision += 10;
        console.log(`🎉 OCCASION DETECTED: ${occasion}`);
        break;
      }
    }

    // Pattern detection
    for (const pattern of this.attributeKeywords.patterns) {
      if (inputLower.includes(pattern)) {
        specificAttributes.pattern = pattern;
        mandatoryKeywords.push(pattern);
        searchPrecision += 10;
        console.log(`🎨 PATTERN DETECTED: ${pattern}`);
        break;
      }
    }

    // Step 5: Generate final specific product name
    if (!specificProductName && mandatoryKeywords.length > 0) {
      specificProductName = mandatoryKeywords.join(' ');
    }

    // Step 6: Enhance product name with attributes
    if (specificProductName) {
      let enhancedName = specificProductName;
      
      if (specificAttributes.color && !enhancedName.toLowerCase().includes(specificAttributes.color)) {
        enhancedName = `${specificAttributes.color} ${enhancedName}`;
      }
      
      if (specificAttributes.material && !enhancedName.toLowerCase().includes(specificAttributes.material)) {
        enhancedName = `${specificAttributes.material} ${enhancedName}`;
      }
      
      if (specificAttributes.style && !enhancedName.toLowerCase().includes(specificAttributes.style)) {
        enhancedName = `${specificAttributes.style} ${enhancedName}`;
      }
      
      specificProductName = enhancedName.trim();
    }

    // Step 7: Add exclusion keywords for precision
    if (userIntent === 'specific_product') {
      // Add opposite gender exclusions if gender is detected
      const genderKeywords = {
        male: ['women', 'female', 'girls', 'ladies'],
        female: ['men', 'male', 'boys', 'gentlemen']
      };
      
      if (inputLower.includes('men') || inputLower.includes('male')) {
        excludeKeywords.push(...genderKeywords.male);
      } else if (inputLower.includes('women') || inputLower.includes('female')) {
        excludeKeywords.push(...genderKeywords.female);
      }
    }

    // Step 8: Calculate final precision score
    if (specificProductName.length > 0) searchPrecision += 20;
    if (Object.keys(specificAttributes).length > 2) searchPrecision += 15;
    if (mandatoryKeywords.length > 3) searchPrecision += 10;
    
    searchPrecision = Math.min(searchPrecision, 100);

    console.log(`📊 SPECIFICITY ANALYSIS COMPLETE:`);
    console.log(`   🎯 Product: "${specificProductName}"`);
    console.log(`   📂 Category: ${exactCategory}`);
    console.log(`   🎯 Precision: ${searchPrecision}%`);
    console.log(`   🔍 Intent: ${userIntent}`);
    console.log(`   ✅ Mandatory: [${mandatoryKeywords.join(', ')}]`);
    console.log(`   ❌ Exclude: [${excludeKeywords.join(', ')}]`);

    return {
      specificProductName: specificProductName || userInput.trim(),
      exactCategory,
      specificAttributes,
      searchPrecision,
      userIntent,
      mandatoryKeywords,
      excludeKeywords
    };
  }

  generatePreciseSearchQueries(analysis: SpecificProductAnalysis): string[] {
    const queries: string[] = [];
    const { specificProductName, specificAttributes, mandatoryKeywords } = analysis;

    console.log('🔍 GENERATING PRECISE SEARCH QUERIES for absolute specific products...');

    // Base query with exact product name
    queries.push(specificProductName);
    queries.push(`${specificProductName} buy online`);
    queries.push(`${specificProductName} shopping India`);

    // Attribute-enhanced queries
    if (specificAttributes.color) {
      queries.push(`${specificAttributes.color} ${specificProductName}`);
      queries.push(`${specificProductName} in ${specificAttributes.color}`);
      queries.push(`${specificProductName} ${specificAttributes.color} color`);
    }

    if (specificAttributes.material) {
      queries.push(`${specificAttributes.material} ${specificProductName}`);
      queries.push(`${specificProductName} ${specificAttributes.material}`);
      queries.push(`${specificProductName} made of ${specificAttributes.material}`);
    }

    if (specificAttributes.style) {
      queries.push(`${specificAttributes.style} ${specificProductName}`);
      queries.push(`${specificProductName} ${specificAttributes.style} style`);
      queries.push(`${specificProductName} for ${specificAttributes.style}`);
    }

    if (specificAttributes.occasion) {
      queries.push(`${specificProductName} for ${specificAttributes.occasion}`);
      queries.push(`${specificAttributes.occasion} ${specificProductName}`);
      queries.push(`${specificProductName} ${specificAttributes.occasion} wear`);
    }

    if (specificAttributes.pattern) {
      queries.push(`${specificAttributes.pattern} ${specificProductName}`);
      queries.push(`${specificProductName} with ${specificAttributes.pattern}`);
      queries.push(`${specificProductName} ${specificAttributes.pattern} design`);
    }

    // Brand-specific queries if brand is mentioned
    if (specificAttributes.brand) {
      queries.push(`${specificAttributes.brand} ${specificProductName}`);
      queries.push(`${specificProductName} from ${specificAttributes.brand}`);
      queries.push(`${specificAttributes.brand} brand ${specificProductName}`);
    }

    // Combination queries for maximum specificity
    const attributeValues = Object.values(specificAttributes).filter(Boolean);
    if (attributeValues.length >= 2) {
      queries.push(`${attributeValues.join(' ')} ${specificProductName}`);
      queries.push(`${specificProductName} ${attributeValues.join(' ')}`);
    }

    // Platform-specific queries
    const platforms = ['flipkart', 'amazon', 'myntra', 'ajio', 'nykaa'];
    for (const platform of platforms.slice(0, 2)) {
      queries.push(`${specificProductName} ${platform}`);
      queries.push(`${specificProductName} buy ${platform}`);
    }

    // Price-specific queries
    queries.push(`${specificProductName} price`);
    queries.push(`${specificProductName} cost`);
    queries.push(`${specificProductName} under 2000`);
    queries.push(`${specificProductName} best price`);

    // Remove duplicates and filter
    const uniqueQueries = [...new Set(queries)]
      .filter(query => query.length > 3 && query.length < 100)
      .slice(0, 20);

    console.log(`✅ Generated ${uniqueQueries.length} PRECISE search queries for absolute specific products`);
    return uniqueQueries;
  }

  validateProductSpecificity(productName: string, analysis: SpecificProductAnalysis): boolean {
    const productLower = productName.toLowerCase();
    const { mandatoryKeywords, excludeKeywords, specificAttributes } = analysis;

    // Check mandatory keywords
    const hasMandatoryKeywords = mandatoryKeywords.length === 0 || 
      mandatoryKeywords.some(keyword => productLower.includes(keyword.toLowerCase()));

    // Check exclusion keywords
    const hasExcludedKeywords = excludeKeywords.some(keyword => 
      productLower.includes(keyword.toLowerCase())
    );

    // Check specific attributes
    let attributeMatch = true;
    if (specificAttributes.color) {
      attributeMatch = attributeMatch && productLower.includes(specificAttributes.color.toLowerCase());
    }
    if (specificAttributes.material) {
      attributeMatch = attributeMatch && productLower.includes(specificAttributes.material.toLowerCase());
    }

    const isValid = hasMandatoryKeywords && !hasExcludedKeywords && attributeMatch;
    
    if (!isValid) {
      console.log(`❌ PRODUCT REJECTED: "${productName}" - Failed specificity validation`);
      console.log(`   Mandatory: ${hasMandatoryKeywords}, Excluded: ${hasExcludedKeywords}, Attributes: ${attributeMatch}`);
    } else {
      console.log(`✅ PRODUCT VALIDATED: "${productName}" - Meets all specificity requirements`);
    }

    return isValid;
  }

  enhanceProductNameWithSpecificity(
    originalName: string, 
    analysis: SpecificProductAnalysis
  ): string {
    let enhancedName = originalName;
    const { specificAttributes, mandatoryKeywords } = analysis;

    // Add missing mandatory keywords
    for (const keyword of mandatoryKeywords) {
      if (!enhancedName.toLowerCase().includes(keyword.toLowerCase())) {
        enhancedName = `${keyword} ${enhancedName}`;
      }
    }

    // Add missing specific attributes
    if (specificAttributes.color && !enhancedName.toLowerCase().includes(specificAttributes.color)) {
      enhancedName = `${specificAttributes.color} ${enhancedName}`;
    }

    if (specificAttributes.material && !enhancedName.toLowerCase().includes(specificAttributes.material)) {
      enhancedName = `${specificAttributes.material} ${enhancedName}`;
    }

    if (specificAttributes.style && !enhancedName.toLowerCase().includes(specificAttributes.style)) {
      enhancedName = `${specificAttributes.style} ${enhancedName}`;
    }

    return enhancedName.trim();
  }
}