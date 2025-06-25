// Background script for AI Fashion Assistant
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Fashion Assistant extension installed');
  
  // Initialize extension settings
  chrome.storage.local.set({
    isActive: true,
    preferences: {
      style: ['trendy', 'casual'],
      colors: ['blue', 'black', 'white'],
      budget: { min: 500, max: 5000 }
    }
  });
});

// Tab update listener for supported e-commerce sites
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const supportedSites = ['flipkart.com', 'amazon.in', 'myntra.com', 'ajio.com', 'nykaa.com'];
    const isSupported = supportedSites.some(site => tab.url.includes(site));
    
    if (isSupported) {
      // Inject content script
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }).catch(err => {
        console.log('Script injection failed:', err);
      });
      
      // Inject CSS
      chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ['content.css']
      }).catch(err => {
        console.log('CSS injection failed:', err);
      });
    }
  }
});

// Message handling between content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'PRODUCT_DETECTED':
      handleProductDetection(message.data, sender.tab);
      sendResponse({ success: true });
      break;
      
    case 'GET_COMPLEMENT_RECOMMENDATIONS':
      handleComplementRecommendationRequest(message.data)
        .then(recommendations => sendResponse({ recommendations }))
        .catch(error => sendResponse({ error: error.message }));
      return true; // Keep message channel open for async response
      
    case 'GET_RECOMMENDATIONS':
      handleRecommendationRequest(message.data)
        .then(recommendations => sendResponse({ recommendations }))
        .catch(error => sendResponse({ error: error.message }));
      return true; // Keep message channel open for async response
      
    case 'UPDATE_PREFERENCES':
      chrome.storage.local.set({ preferences: message.data });
      sendResponse({ success: true });
      break;
      
    case 'SYNC_DATA':
      syncDataWithWebApp(message.data);
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ error: 'Unknown message type' });
  }
});

async function handleProductDetection(productData, tab) {
  console.log('🔍 Product detected:', productData);
  
  // Store current product
  await chrome.storage.local.set({
    currentProduct: productData,
    currentTab: tab.id,
    lastActivity: Date.now()
  });
  
  // Automatically analyze for complement recommendations
  try {
    console.log('🤖 Auto-analyzing product for complement recommendations...');
    const complementRecommendations = await getComplementRecommendations(productData);
    
    // Send to content script to show complement recommendations
    chrome.tabs.sendMessage(tab.id, {
      type: 'SHOW_COMPLEMENT_RECOMMENDATIONS',
      product: productData,
      recommendations: complementRecommendations
    }).catch(err => console.log('Failed to send complement recommendations:', err));
    
  } catch (error) {
    console.error('Failed to get complement recommendations:', error);
  }
}

async function handleComplementRecommendationRequest(requestData) {
  try {
    console.log('🎯 Getting complement recommendations for current product...');
    
    // Get current product from storage
    const { currentProduct } = await chrome.storage.local.get('currentProduct');
    
    if (!currentProduct) {
      throw new Error('No current product found. Please visit a product page first.');
    }
    
    return await getComplementRecommendations(currentProduct);
    
  } catch (error) {
    console.error('Error getting complement recommendations:', error);
    throw error;
  }
}

async function getComplementRecommendations(currentProduct) {
  console.log('🧠 AI analyzing product for complement recommendations:', currentProduct.name);
  
  // Get user preferences
  const { preferences } = await chrome.storage.local.get('preferences');
  
  // Analyze the current product to determine what would complement it
  const complementAnalysis = analyzeProductForComplements(currentProduct);
  
  console.log('📊 Complement analysis:', complementAnalysis);
  
  // Generate complement recommendations based on the analysis
  const complementRecommendations = generateComplementRecommendations(
    currentProduct, 
    complementAnalysis, 
    preferences
  );
  
  console.log(`✅ Generated ${complementRecommendations.length} complement recommendations`);
  
  return complementRecommendations;
}

function analyzeProductForComplements(product) {
  const productName = product.name.toLowerCase();
  const category = product.category || detectCategoryFromName(productName);
  
  console.log(`🔍 Analyzing ${category} product: ${product.name}`);
  
  // Define complement rules based on fashion styling principles
  const complementRules = {
    // Ethnic wear complements
    'ethnic-wear': {
      'kurta': ['palazzo', 'churidar', 'leggings', 'ethnic jewelry', 'juttis', 'dupatta'],
      'saree': ['blouse', 'petticoat', 'ethnic jewelry', 'heels', 'clutch'],
      'lehenga': ['choli', 'dupatta', 'ethnic jewelry', 'heels', 'clutch'],
      'palazzo': ['kurta', 'crop top', 'ethnic top', 'sandals', 'jewelry'],
      'anarkali': ['churidar', 'leggings', 'dupatta', 'ethnic jewelry', 'heels'],
      'dupatta': ['kurta', 'suit set', 'ethnic jewelry', 'hair accessories']
    },
    
    // Western wear complements
    'western-wear': {
      'jeans': ['t-shirt', 'shirt', 'top', 'blazer', 'sneakers', 'boots', 'belt'],
      'dress': ['heels', 'flats', 'jacket', 'cardigan', 'jewelry', 'handbag'],
      'shirt': ['jeans', 'trousers', 'skirt', 'blazer', 'formal shoes', 'belt'],
      'top': ['jeans', 'skirt', 'shorts', 'cardigan', 'jacket', 'accessories'],
      'blazer': ['shirt', 'trousers', 'dress', 'formal shoes', 'handbag'],
      'skirt': ['top', 'blouse', 'shirt', 'heels', 'flats', 'accessories'],
      'shorts': ['t-shirt', 'tank top', 'sneakers', 'sandals', 'cap'],
      'jumpsuit': ['heels', 'sandals', 'jacket', 'jewelry', 'belt']
    },
    
    // Formal wear complements
    'formal-wear': {
      'formal shirt': ['formal pants', 'suit', 'tie', 'formal shoes', 'belt', 'watch'],
      'blazer': ['formal shirt', 'trousers', 'formal shoes', 'tie', 'pocket square'],
      'formal dress': ['heels', 'blazer', 'jewelry', 'handbag', 'watch'],
      'suit': ['formal shirt', 'tie', 'formal shoes', 'belt', 'watch', 'cufflinks'],
      'formal pants': ['formal shirt', 'blazer', 'formal shoes', 'belt']
    },
    
    // Footwear complements
    'footwear': {
      'heels': ['dress', 'skirt', 'formal wear', 'handbag', 'jewelry'],
      'sneakers': ['jeans', 'casual wear', 'athleisure', 'backpack', 'cap'],
      'formal shoes': ['formal wear', 'suit', 'blazer', 'belt', 'watch'],
      'sandals': ['casual wear', 'summer dress', 'shorts', 'sunglasses'],
      'boots': ['jeans', 'jacket', 'casual wear', 'scarf', 'bag']
    },
    
    // Accessories complements
    'accessories': {
      'handbag': ['dress', 'formal wear', 'heels', 'jewelry', 'sunglasses'],
      'jewelry': ['dress', 'ethnic wear', 'formal wear', 'heels'],
      'watch': ['formal wear', 'casual wear', 'shirt', 'blazer'],
      'sunglasses': ['casual wear', 'summer dress', 'hat', 'bag'],
      'belt': ['jeans', 'trousers', 'dress', 'formal wear'],
      'scarf': ['jacket', 'coat', 'casual wear', 'boots']
    }
  };
  
  // Detect specific product type from name
  let productType = 'general';
  let complementItems = [];
  
  // Find the most specific product type match
  for (const [cat, types] of Object.entries(complementRules)) {
    for (const [type, complements] of Object.entries(types)) {
      if (productName.includes(type)) {
        productType = type;
        complementItems = complements;
        category = cat;
        break;
      }
    }
    if (complementItems.length > 0) break;
  }
  
  // If no specific match, use category-based general complements
  if (complementItems.length === 0) {
    const generalComplements = {
      'ethnic-wear': ['ethnic jewelry', 'ethnic footwear', 'dupatta', 'ethnic bag'],
      'western-wear': ['accessories', 'footwear', 'outerwear', 'bag'],
      'formal-wear': ['formal accessories', 'formal shoes', 'belt', 'watch'],
      'footwear': ['matching outfit', 'accessories', 'bag'],
      'accessories': ['matching outfit', 'coordinating accessories']
    };
    
    complementItems = generalComplements[category] || ['accessories', 'footwear'];
  }
  
  // Analyze color for color coordination
  const colorAnalysis = analyzeProductColor(product);
  
  // Analyze occasion suitability
  const occasionAnalysis = analyzeProductOccasion(product);
  
  return {
    category,
    productType,
    complementItems,
    colorAnalysis,
    occasionAnalysis,
    styleContext: determineStyleContext(product)
  };
}

function analyzeProductColor(product) {
  const productName = product.name.toLowerCase();
  
  // Extract colors mentioned in product name
  const colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 
                 'orange', 'brown', 'grey', 'gray', 'navy', 'maroon', 'gold', 'silver'];
  
  const detectedColors = colors.filter(color => productName.includes(color));
  
  // Color coordination rules
  const colorComplements = {
    'black': ['white', 'gold', 'silver', 'red', 'pink'],
    'white': ['black', 'navy', 'blue', 'any color'],
    'navy': ['white', 'cream', 'gold', 'pink'],
    'blue': ['white', 'cream', 'yellow', 'orange'],
    'red': ['black', 'white', 'gold', 'cream'],
    'pink': ['white', 'black', 'gold', 'navy'],
    'green': ['white', 'cream', 'gold', 'brown'],
    'yellow': ['white', 'blue', 'navy', 'black'],
    'purple': ['white', 'silver', 'gold', 'cream'],
    'brown': ['cream', 'white', 'gold', 'green'],
    'gold': ['black', 'white', 'navy', 'red'],
    'silver': ['black', 'white', 'blue', 'purple']
  };
  
  let recommendedColors = [];
  if (detectedColors.length > 0) {
    const primaryColor = detectedColors[0];
    recommendedColors = colorComplements[primaryColor] || ['neutral colors'];
  } else {
    recommendedColors = ['neutral colors', 'matching colors'];
  }
  
  return {
    detectedColors,
    recommendedColors,
    colorHarmony: detectedColors.length > 0 ? 'specific' : 'flexible'
  };
}

function analyzeProductOccasion(product) {
  const productName = product.name.toLowerCase();
  
  // Occasion keywords
  const occasionKeywords = {
    'formal': ['formal', 'office', 'business', 'professional', 'work'],
    'casual': ['casual', 'everyday', 'relaxed', 'comfortable'],
    'party': ['party', 'evening', 'night', 'cocktail', 'celebration'],
    'wedding': ['wedding', 'bridal', 'festive', 'ceremony'],
    'ethnic': ['ethnic', 'traditional', 'cultural', 'festival'],
    'sports': ['sports', 'gym', 'athletic', 'running', 'workout']
  };
  
  let detectedOccasions = [];
  for (const [occasion, keywords] of Object.entries(occasionKeywords)) {
    if (keywords.some(keyword => productName.includes(keyword))) {
      detectedOccasions.push(occasion);
    }
  }
  
  // If no specific occasion detected, infer from category
  if (detectedOccasions.length === 0) {
    const category = product.category || detectCategoryFromName(productName);
    const categoryOccasions = {
      'ethnic-wear': ['ethnic', 'festive', 'cultural'],
      'formal-wear': ['formal', 'office', 'business'],
      'western-wear': ['casual', 'everyday'],
      'party-wear': ['party', 'evening'],
      'sports-wear': ['sports', 'casual']
    };
    
    detectedOccasions = categoryOccasions[category] || ['versatile'];
  }
  
  return {
    primaryOccasions: detectedOccasions,
    versatility: detectedOccasions.length > 1 ? 'high' : 'specific'
  };
}

function determineStyleContext(product) {
  const productName = product.name.toLowerCase();
  
  const styleKeywords = {
    'traditional': ['traditional', 'ethnic', 'classic', 'heritage'],
    'modern': ['modern', 'contemporary', 'trendy', 'latest'],
    'casual': ['casual', 'relaxed', 'comfortable', 'everyday'],
    'formal': ['formal', 'professional', 'business', 'elegant'],
    'bohemian': ['boho', 'bohemian', 'free', 'artistic'],
    'minimalist': ['minimal', 'simple', 'clean', 'basic'],
    'glamorous': ['glamorous', 'party', 'evening', 'sparkle']
  };
  
  for (const [style, keywords] of Object.entries(styleKeywords)) {
    if (keywords.some(keyword => productName.includes(keyword))) {
      return style;
    }
  }
  
  return 'versatile';
}

function generateComplementRecommendations(currentProduct, analysis, preferences) {
  console.log('🎨 Generating complement recommendations...');
  
  const recommendations = [];
  const { complementItems, colorAnalysis, occasionAnalysis, styleContext } = analysis;
  
  // Generate recommendations for each complement item
  for (let i = 0; i < Math.min(complementItems.length, 6); i++) {
    const complementItem = complementItems[i];
    
    // Create a realistic recommendation
    const recommendation = {
      id: `complement-${Date.now()}-${i}`,
      name: generateComplementProductName(complementItem, currentProduct, colorAnalysis, styleContext),
      price: generateComplementPrice(complementItem, currentProduct.price),
      originalPrice: null,
      image: getComplementProductImage(complementItem, analysis.category),
      url: generateComplementProductUrl(complementItem, currentProduct.platform),
      category: determineComplementCategory(complementItem),
      brand: generateComplementBrand(complementItem),
      rating: 4.0 + Math.random() * 1.0,
      platform: currentProduct.platform,
      trendScore: 80 + Math.random() * 15,
      styleCompatibility: 90 + Math.random() * 8,
      complementReason: generateComplementReason(complementItem, currentProduct, analysis),
      stylingTip: generateStylingTip(complementItem, currentProduct, analysis)
    };
    
    recommendations.push(recommendation);
  }
  
  return recommendations;
}

function generateComplementProductName(complementItem, currentProduct, colorAnalysis, styleContext) {
  const productName = currentProduct.name;
  const colors = colorAnalysis.recommendedColors;
  const primaryColor = colors[0] || 'neutral';
  
  // Style-appropriate adjectives
  const styleAdjectives = {
    'traditional': ['Classic', 'Traditional', 'Elegant', 'Timeless'],
    'modern': ['Modern', 'Contemporary', 'Trendy', 'Stylish'],
    'casual': ['Comfortable', 'Casual', 'Relaxed', 'Everyday'],
    'formal': ['Professional', 'Formal', 'Sophisticated', 'Business'],
    'glamorous': ['Glamorous', 'Party', 'Evening', 'Statement'],
    'versatile': ['Versatile', 'Stylish', 'Fashionable', 'Chic']
  };
  
  const adjectives = styleAdjectives[styleContext] || styleAdjectives['versatile'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  
  // Generate appropriate product names
  const productNames = {
    'palazzo': `${adjective} ${primaryColor} Palazzo Pants`,
    'churidar': `${adjective} Churidar Set`,
    'leggings': `${primaryColor} Cotton Leggings`,
    'ethnic jewelry': `${adjective} Ethnic Jewelry Set`,
    'juttis': `${adjective} Ethnic Juttis`,
    'dupatta': `${primaryColor} Silk Dupatta`,
    'blouse': `${adjective} Designer Blouse`,
    'heels': `${adjective} Block Heels`,
    'clutch': `${primaryColor} Evening Clutch`,
    'jeans': `${adjective} High-Waist Jeans`,
    't-shirt': `${primaryColor} Cotton T-Shirt`,
    'shirt': `${adjective} Cotton Shirt`,
    'blazer': `${adjective} Formal Blazer`,
    'sneakers': `${primaryColor} Casual Sneakers`,
    'boots': `${adjective} Ankle Boots`,
    'belt': `${primaryColor} Leather Belt`,
    'handbag': `${adjective} ${primaryColor} Handbag`,
    'jewelry': `${adjective} Fashion Jewelry`,
    'watch': `${adjective} Wrist Watch`,
    'sunglasses': `${adjective} Sunglasses`,
    'scarf': `${primaryColor} Silk Scarf`
  };
  
  return productNames[complementItem] || `${adjective} ${complementItem}`;
}

function generateComplementPrice(complementItem, currentProductPrice) {
  // Price ranges based on complement item type
  const priceRanges = {
    'palazzo': [800, 2000],
    'churidar': [600, 1500],
    'leggings': [300, 800],
    'ethnic jewelry': [500, 2500],
    'juttis': [800, 2000],
    'dupatta': [400, 1200],
    'blouse': [600, 1800],
    'heels': [1000, 3000],
    'clutch': [800, 2500],
    'jeans': [1200, 3000],
    't-shirt': [400, 1200],
    'shirt': [800, 2500],
    'blazer': [1500, 4000],
    'sneakers': [1500, 4000],
    'boots': [2000, 5000],
    'belt': [500, 1500],
    'handbag': [1000, 4000],
    'jewelry': [300, 2000],
    'watch': [1000, 5000],
    'sunglasses': [800, 2500],
    'scarf': [400, 1200]
  };
  
  const [minPrice, maxPrice] = priceRanges[complementItem] || [500, 2000];
  
  // Adjust price based on current product price (complementary items should be in similar range)
  const adjustmentFactor = currentProductPrice > 2000 ? 1.2 : 0.8;
  const adjustedMin = Math.round(minPrice * adjustmentFactor);
  const adjustedMax = Math.round(maxPrice * adjustmentFactor);
  
  return adjustedMin + Math.floor(Math.random() * (adjustedMax - adjustedMin));
}

function getComplementProductImage(complementItem, category) {
  // Category-based images for complement items
  const imageMap = {
    'ethnic-wear': 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400',
    'western-wear': 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
    'accessories': 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=400',
    'footwear': 'https://images.pexels.com/photos/1454177/pexels-photo-1454177.jpeg?auto=compress&cs=tinysrgb&w=400',
    'jewelry': 'https://images.pexels.com/photos/1454173/pexels-photo-1454173.jpeg?auto=compress&cs=tinysrgb&w=400'
  };
  
  // Specific item images
  const specificImages = {
    'palazzo': 'https://images.pexels.com/photos/7679732/pexels-photo-7679732.jpeg?auto=compress&cs=tinysrgb&w=400',
    'jeans': 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
    'heels': 'https://images.pexels.com/photos/1454177/pexels-photo-1454177.jpeg?auto=compress&cs=tinysrgb&w=400',
    'jewelry': 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=400',
    'handbag': 'https://images.pexels.com/photos/1454172/pexels-photo-1454172.jpeg?auto=compress&cs=tinysrgb&w=400'
  };
  
  return specificImages[complementItem] || imageMap[category] || imageMap['accessories'];
}

function generateComplementProductUrl(complementItem, platform) {
  const platformUrls = {
    'flipkart': 'https://www.flipkart.com',
    'amazon': 'https://www.amazon.in',
    'myntra': 'https://www.myntra.com',
    'ajio': 'https://www.ajio.com',
    'nykaa': 'https://www.nykaa.com'
  };
  
  const baseUrl = platformUrls[platform] || platformUrls['myntra'];
  const productSlug = complementItem.replace(/\s+/g, '-').toLowerCase();
  const productId = Math.floor(Math.random() * 1000000);
  
  return `${baseUrl}/${productSlug}/${productId}?ref=ai-fashion-assistant`;
}

function determineComplementCategory(complementItem) {
  const categoryMap = {
    'palazzo': 'ethnic-wear',
    'churidar': 'ethnic-wear',
    'leggings': 'western-wear',
    'ethnic jewelry': 'accessories',
    'juttis': 'footwear',
    'dupatta': 'ethnic-wear',
    'blouse': 'ethnic-wear',
    'heels': 'footwear',
    'clutch': 'accessories',
    'jeans': 'western-wear',
    't-shirt': 'western-wear',
    'shirt': 'western-wear',
    'blazer': 'formal-wear',
    'sneakers': 'footwear',
    'boots': 'footwear',
    'belt': 'accessories',
    'handbag': 'accessories',
    'jewelry': 'accessories',
    'watch': 'accessories',
    'sunglasses': 'accessories',
    'scarf': 'accessories'
  };
  
  return categoryMap[complementItem] || 'accessories';
}

function generateComplementBrand(complementItem) {
  const brandMap = {
    'ethnic-wear': ['Libas', 'Biba', 'W for Woman', 'Global Desi', 'Aurelia'],
    'western-wear': ['H&M', 'Zara', 'Vero Moda', 'AND', 'Forever 21'],
    'footwear': ['Metro', 'Bata', 'Inc.5', 'Steve Madden', 'Aldo'],
    'accessories': ['Accessorize', 'Hidesign', 'Zaveri Pearls', 'Fossil', 'Titan']
  };
  
  const category = determineComplementCategory(complementItem);
  const brands = brandMap[category] || brandMap['accessories'];
  
  return brands[Math.floor(Math.random() * brands.length)];
}

function generateComplementReason(complementItem, currentProduct, analysis) {
  const reasons = [
    `Perfect complement to your ${currentProduct.name}`,
    `Completes the look with your ${analysis.productType}`,
    `Ideal styling partner for ${analysis.occasionAnalysis.primaryOccasions.join(' and ')} occasions`,
    `Matches the ${analysis.styleContext} aesthetic of your outfit`,
    `Essential piece to complete this ${analysis.category} look`,
    `Trending complement that pairs beautifully with your selection`
  ];
  
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function generateStylingTip(complementItem, currentProduct, analysis) {
  const tips = [
    `Style with your ${currentProduct.name} for a complete coordinated look`,
    `Perfect for ${analysis.occasionAnalysis.primaryOccasions.join(' and ')} occasions`,
    `Pair with ${analysis.colorAnalysis.recommendedColors.slice(0, 2).join(' or ')} colors for best results`,
    `Essential for achieving the perfect ${analysis.styleContext} style`,
    `Complete your outfit by adding this ${complementItem}`,
    `Mix and match with your existing wardrobe for versatile styling`
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
}

function detectCategoryFromName(productName) {
  const categoryKeywords = {
    'ethnic-wear': ['kurta', 'saree', 'lehenga', 'anarkali', 'palazzo', 'ethnic', 'traditional'],
    'western-wear': ['dress', 'jeans', 'shirt', 'top', 'blazer', 'skirt', 'western'],
    'formal-wear': ['formal', 'suit', 'office', 'business', 'professional'],
    'footwear': ['shoes', 'sandals', 'heels', 'sneakers', 'boots', 'footwear'],
    'accessories': ['bag', 'jewelry', 'watch', 'belt', 'sunglasses', 'accessory']
  };
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => productName.includes(keyword))) {
      return category;
    }
  }
  
  return 'fashion';
}

async function handleRecommendationRequest(requestData) {
  try {
    // Get user preferences
    const { preferences } = await chrome.storage.local.get('preferences');
    
    // Mock AI recommendations (replace with actual API calls)
    const mockRecommendations = [
      {
        id: 'rec-1',
        name: 'Designer Ethnic Kurta Set',
        price: 2499,
        originalPrice: 3999,
        image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400',
        platform: 'myntra',
        trendScore: 92,
        compatibilityScore: 95,
        reason: 'Perfect for festive occasions'
      },
      {
        id: 'rec-2',
        name: 'Cotton Palazzo Set',
        price: 899,
        originalPrice: 1299,
        image: 'https://images.pexels.com/photos/7679732/pexels-photo-7679732.jpeg?auto=compress&cs=tinysrgb&w=400',
        platform: 'amazon',
        trendScore: 85,
        compatibilityScore: 88,
        reason: 'Comfortable and stylish'
      }
    ];
    
    return mockRecommendations;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
}

async function syncDataWithWebApp(data) {
  // Sync extension data with web application
  console.log('Syncing data with web app:', data);
  
  // Store in extension storage
  await chrome.storage.local.set({
    syncedData: data,
    lastSync: Date.now()
  });
}

// Periodic cleanup of old data
setInterval(async () => {
  const { lastActivity } = await chrome.storage.local.get('lastActivity');
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  
  if (lastActivity && lastActivity < oneHourAgo) {
    // Clear old session data
    chrome.storage.local.remove(['currentProduct', 'currentTab']);
  }
}, 60 * 60 * 1000); // Run every hour