import type { Product, UserPreferences } from '../types';

interface FlipkartProduct {
  productId: string;
  productName: string;
  productPrice: string;
  productImage: string;
  productUrl: string;
  productBrand?: string;
  productRating?: string;
}

interface AmazonProduct {
  asin: string;
  title: string;
  price: string;
  image: string;
  url: string;
  brand?: string;
  rating?: string;
}

interface MyntraProduct {
  id: string;
  name: string;
  price: string;
  image: string;
  url: string;
  brand?: string;
  rating?: string;
}

export class ProductService {
  private readonly affiliateIds = {
    flipkart: 'fashionai',
    amazon: 'fashionai-21',
    myntra: 'fashionai'
  };

  async searchProducts(query: string, preferences: UserPreferences): Promise<Product[]> {
    try {
      console.log(`🔍 Searching for products: ${query}`);
      
      // For demo purposes, we'll use curated product data
      // In production, you would integrate with actual APIs
      const products = await this.getCuratedProducts(query, preferences);
      
      console.log(`✅ Found ${products.length} products`);
      return products;
    } catch (error) {
      console.error('Product search error:', error);
      return this.getFallbackProducts(query, preferences);
    }
  }

  async getRecommendationsForCategory(
    category: string, 
    preferences: UserPreferences,
    count: number = 6
  ): Promise<Product[]> {
    try {
      console.log(`🛍️ Getting recommendations for category: ${category}`);
      
      const products = await this.getCuratedProductsByCategory(category, preferences, count);
      
      console.log(`✅ Generated ${products.length} product recommendations`);
      return products;
    } catch (error) {
      console.error('Category recommendations error:', error);
      return this.getFallbackProducts(category, preferences);
    }
  }

  private async getCuratedProducts(query: string, preferences: UserPreferences): Promise<Product[]> {
    const queryLower = query.toLowerCase();
    
    // Determine category from query
    let category = 'ethnic-wear';
    if (queryLower.includes('western') || queryLower.includes('dress') || queryLower.includes('jeans')) {
      category = 'western-wear';
    } else if (queryLower.includes('accessory') || queryLower.includes('jewelry') || queryLower.includes('bag')) {
      category = 'accessories';
    } else if (queryLower.includes('shoe') || queryLower.includes('sandal') || queryLower.includes('heel')) {
      category = 'footwear';
    }
    
    return this.getCuratedProductsByCategory(category, preferences);
  }

  private async getCuratedProductsByCategory(
    category: string, 
    preferences: UserPreferences,
    count: number = 6
  ): Promise<Product[]> {
    const productDatabase = this.getProductDatabase();
    const categoryProducts = productDatabase[category] || productDatabase['ethnic-wear'];
    
    // Filter by budget
    const budgetFiltered = categoryProducts.filter(product => 
      product.price >= preferences.budget.min && product.price <= preferences.budget.max
    );
    
    // If no products in budget, show closest ones
    const finalProducts = budgetFiltered.length > 0 ? budgetFiltered : categoryProducts;
    
    // Shuffle and take requested count
    const shuffled = this.shuffleArray([...finalProducts]);
    return shuffled.slice(0, count).map(product => ({
      ...product,
      affiliateLink: this.generateAffiliateLink(product)
    }));
  }

  private getProductDatabase(): Record<string, Product[]> {
    return {
      'ethnic-wear': [
        {
          id: 'ethnic-1',
          name: 'Anarkali Cotton Kurta Set with Palazzo',
          price: 1299,
          originalPrice: 2199,
          image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.myntra.com/kurta-sets/libas/libas-women-pink-printed-anarkali-kurta-with-palazzos--dupatta/15503092/buy',
          category: 'ethnic-wear',
          brand: 'Libas',
          rating: 4.3,
          reviews: 2847,
          platform: 'myntra',
          trendScore: 92,
          styleCompatibility: 95,
          colors: ['pink', 'white'],
          sizes: ['S', 'M', 'L', 'XL', 'XXL']
        },
        {
          id: 'ethnic-2',
          name: 'Silk Blend Saree with Blouse',
          price: 2499,
          originalPrice: 4999,
          image: 'https://images.pexels.com/photos/8839887/pexels-photo-8839887.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.flipkart.com/sarees/pr?sid=clo%2C8on&q=silk+saree',
          category: 'ethnic-wear',
          brand: 'Kanchipuram Silk',
          rating: 4.5,
          reviews: 1234,
          platform: 'flipkart',
          trendScore: 89,
          styleCompatibility: 93,
          colors: ['gold', 'red'],
          sizes: ['Free Size']
        },
        {
          id: 'ethnic-3',
          name: 'Designer Embroidered Lehenga Choli',
          price: 3999,
          originalPrice: 7999,
          image: 'https://images.pexels.com/photos/9558618/pexels-photo-9558618.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.amazon.in/dp/B08XYZKJ9L',
          category: 'ethnic-wear',
          brand: 'Inddus',
          rating: 4.2,
          reviews: 856,
          platform: 'amazon',
          trendScore: 94,
          styleCompatibility: 97,
          colors: ['blue', 'gold'],
          sizes: ['S', 'M', 'L', 'XL']
        },
        {
          id: 'ethnic-4',
          name: 'Cotton Straight Kurta with Dupatta',
          price: 899,
          originalPrice: 1599,
          image: 'https://images.pexels.com/photos/8839888/pexels-photo-8839888.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.myntra.com/kurtas/w/w-women-navy-blue-yoke-design-straight-kurta/13826126/buy',
          category: 'ethnic-wear',
          brand: 'W for Woman',
          rating: 4.1,
          reviews: 1567,
          platform: 'myntra',
          trendScore: 87,
          styleCompatibility: 90,
          colors: ['navy', 'white'],
          sizes: ['XS', 'S', 'M', 'L', 'XL']
        },
        {
          id: 'ethnic-5',
          name: 'Bandhani Print Palazzo Set',
          price: 1599,
          originalPrice: 2999,
          image: 'https://images.pexels.com/photos/8839889/pexels-photo-8839889.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.flipkart.com/clothing-and-accessories/ethnic-wear/pr?sid=clo%2C8on&q=palazzo+set',
          category: 'ethnic-wear',
          brand: 'Biba',
          rating: 4.4,
          reviews: 923,
          platform: 'flipkart',
          trendScore: 91,
          styleCompatibility: 88,
          colors: ['multicolor'],
          sizes: ['S', 'M', 'L', 'XL']
        },
        {
          id: 'ethnic-6',
          name: 'Chanderi Silk Kurta with Pants',
          price: 2199,
          originalPrice: 3999,
          image: 'https://images.pexels.com/photos/8839890/pexels-photo-8839890.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.amazon.in/dp/B08XYZABC1',
          category: 'ethnic-wear',
          brand: 'Fabindia',
          rating: 4.6,
          reviews: 1789,
          platform: 'amazon',
          trendScore: 93,
          styleCompatibility: 96,
          colors: ['cream', 'gold'],
          sizes: ['S', 'M', 'L', 'XL', 'XXL']
        }
      ],
      'western-wear': [
        {
          id: 'western-1',
          name: 'High-Waisted Skinny Jeans',
          price: 1499,
          originalPrice: 2499,
          image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.myntra.com/jeans/levis/levis-women-blue-skinny-fit-high-rise-clean-look-stretchable-jeans/2532901/buy',
          category: 'western-wear',
          brand: 'Levis',
          rating: 4.3,
          reviews: 3456,
          platform: 'myntra',
          trendScore: 88,
          styleCompatibility: 92,
          colors: ['blue'],
          sizes: ['26', '28', '30', '32', '34']
        },
        {
          id: 'western-2',
          name: 'Floral Print Midi Dress',
          price: 1299,
          originalPrice: 2199,
          image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.amazon.in/dp/B08XYZDEF2',
          category: 'western-wear',
          brand: 'Vero Moda',
          rating: 4.2,
          reviews: 1876,
          platform: 'amazon',
          trendScore: 90,
          styleCompatibility: 89,
          colors: ['floral', 'multicolor'],
          sizes: ['XS', 'S', 'M', 'L']
        },
        {
          id: 'western-3',
          name: 'Crop Top with Puff Sleeves',
          price: 799,
          originalPrice: 1299,
          image: 'https://images.pexels.com/photos/1536620/pexels-photo-1536620.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.flipkart.com/clothing-and-accessories/topwear/pr?sid=clo%2Cclo&q=crop+top',
          category: 'western-wear',
          brand: 'H&M',
          rating: 4.0,
          reviews: 2134,
          platform: 'flipkart',
          trendScore: 85,
          styleCompatibility: 87,
          colors: ['white', 'black'],
          sizes: ['XS', 'S', 'M', 'L', 'XL']
        },
        {
          id: 'western-4',
          name: 'Formal Blazer for Women',
          price: 2499,
          originalPrice: 4999,
          image: 'https://images.pexels.com/photos/1536621/pexels-photo-1536621.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.myntra.com/blazers/and/and-women-navy-blue-solid-single-breasted-blazer/11430992/buy',
          category: 'western-wear',
          brand: 'AND',
          rating: 4.4,
          reviews: 987,
          platform: 'myntra',
          trendScore: 86,
          styleCompatibility: 94,
          colors: ['navy', 'black'],
          sizes: ['S', 'M', 'L', 'XL']
        },
        {
          id: 'western-5',
          name: 'Pleated Mini Skirt',
          price: 999,
          originalPrice: 1799,
          image: 'https://images.pexels.com/photos/1536622/pexels-photo-1536622.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.amazon.in/dp/B08XYZGHI3',
          category: 'western-wear',
          brand: 'Forever 21',
          rating: 4.1,
          reviews: 1456,
          platform: 'amazon',
          trendScore: 83,
          styleCompatibility: 85,
          colors: ['black', 'navy'],
          sizes: ['XS', 'S', 'M', 'L']
        },
        {
          id: 'western-6',
          name: 'Denim Jacket Oversized',
          price: 1799,
          originalPrice: 2999,
          image: 'https://images.pexels.com/photos/1536623/pexels-photo-1536623.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.flipkart.com/clothing-and-accessories/winterwear/pr?sid=clo%2Cqvw&q=denim+jacket',
          category: 'western-wear',
          brand: 'Zara',
          rating: 4.5,
          reviews: 2345,
          platform: 'flipkart',
          trendScore: 89,
          styleCompatibility: 91,
          colors: ['blue', 'light blue'],
          sizes: ['S', 'M', 'L', 'XL']
        }
      ],
      'accessories': [
        {
          id: 'acc-1',
          name: 'Statement Gold Plated Jhumkas',
          price: 599,
          originalPrice: 999,
          image: 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.myntra.com/earrings/zaveri-pearls/zaveri-pearls-gold-plated-traditional-jhumkas/11234567/buy',
          category: 'accessories',
          brand: 'Zaveri Pearls',
          rating: 4.3,
          reviews: 1876,
          platform: 'myntra',
          trendScore: 92,
          styleCompatibility: 95,
          colors: ['gold'],
          sizes: ['One Size']
        },
        {
          id: 'acc-2',
          name: 'Leather Crossbody Bag',
          price: 1999,
          originalPrice: 3499,
          image: 'https://images.pexels.com/photos/1454172/pexels-photo-1454172.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.amazon.in/dp/B08XYZJKL4',
          category: 'accessories',
          brand: 'Hidesign',
          rating: 4.4,
          reviews: 2134,
          platform: 'amazon',
          trendScore: 87,
          styleCompatibility: 90,
          colors: ['brown', 'black'],
          sizes: ['One Size']
        },
        {
          id: 'acc-3',
          name: 'Layered Chain Necklace Set',
          price: 799,
          originalPrice: 1299,
          image: 'https://images.pexels.com/photos/1454173/pexels-photo-1454173.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.flipkart.com/jewellery/necklaces-chains/pr?sid=mcr%2C96o&q=layered+necklace',
          category: 'accessories',
          brand: 'Accessorize',
          rating: 4.1,
          reviews: 987,
          platform: 'flipkart',
          trendScore: 85,
          styleCompatibility: 88,
          colors: ['gold', 'silver'],
          sizes: ['One Size']
        },
        {
          id: 'acc-4',
          name: 'Designer Sunglasses',
          price: 1299,
          originalPrice: 2199,
          image: 'https://images.pexels.com/photos/1454174/pexels-photo-1454174.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.myntra.com/sunglasses/ray-ban/ray-ban-unisex-aviator-sunglasses/1234567/buy',
          category: 'accessories',
          brand: 'Ray-Ban',
          rating: 4.5,
          reviews: 3456,
          platform: 'myntra',
          trendScore: 88,
          styleCompatibility: 92,
          colors: ['black', 'brown'],
          sizes: ['One Size']
        },
        {
          id: 'acc-5',
          name: 'Silk Printed Scarf',
          price: 899,
          originalPrice: 1599,
          image: 'https://images.pexels.com/photos/1454175/pexels-photo-1454175.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.amazon.in/dp/B08XYZMNO5',
          category: 'accessories',
          brand: 'Satya Paul',
          rating: 4.2,
          reviews: 1234,
          platform: 'amazon',
          trendScore: 83,
          styleCompatibility: 86,
          colors: ['multicolor'],
          sizes: ['One Size']
        },
        {
          id: 'acc-6',
          name: 'Smart Watch for Women',
          price: 2999,
          originalPrice: 4999,
          image: 'https://images.pexels.com/photos/1454176/pexels-photo-1454176.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.flipkart.com/wearable-smart-devices/smart-watches/pr?sid=ajy%2Cbuh&q=women+smart+watch',
          category: 'accessories',
          brand: 'Apple',
          rating: 4.6,
          reviews: 5678,
          platform: 'flipkart',
          trendScore: 91,
          styleCompatibility: 89,
          colors: ['rose gold', 'silver'],
          sizes: ['38mm', '42mm']
        }
      ],
      'footwear': [
        {
          id: 'foot-1',
          name: 'Block Heel Sandals',
          price: 1599,
          originalPrice: 2799,
          image: 'https://images.pexels.com/photos/1454177/pexels-photo-1454177.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.myntra.com/heels/metro/metro-women-nude-coloured-solid-block-heels/1234567/buy',
          category: 'footwear',
          brand: 'Metro',
          rating: 4.2,
          reviews: 1876,
          platform: 'myntra',
          trendScore: 87,
          styleCompatibility: 90,
          colors: ['nude', 'black'],
          sizes: ['5', '6', '7', '8', '9']
        },
        {
          id: 'foot-2',
          name: 'White Sneakers',
          price: 2499,
          originalPrice: 3999,
          image: 'https://images.pexels.com/photos/1454178/pexels-photo-1454178.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.amazon.in/dp/B08XYZPQR6',
          category: 'footwear',
          brand: 'Adidas',
          rating: 4.4,
          reviews: 4567,
          platform: 'amazon',
          trendScore: 92,
          styleCompatibility: 94,
          colors: ['white'],
          sizes: ['5', '6', '7', '8', '9', '10']
        },
        {
          id: 'foot-3',
          name: 'Ethnic Kolhapuri Chappals',
          price: 899,
          originalPrice: 1499,
          image: 'https://images.pexels.com/photos/1454179/pexels-photo-1454179.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.flipkart.com/footwear/womens-footwear/pr?sid=osp%2Ccil&q=kolhapuri+chappal',
          category: 'footwear',
          brand: 'Kolhapuri Centre',
          rating: 4.1,
          reviews: 987,
          platform: 'flipkart',
          trendScore: 85,
          styleCompatibility: 93,
          colors: ['brown', 'tan'],
          sizes: ['5', '6', '7', '8', '9']
        },
        {
          id: 'foot-4',
          name: 'Ankle Boots',
          price: 2999,
          originalPrice: 4999,
          image: 'https://images.pexels.com/photos/1454180/pexels-photo-1454180.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.myntra.com/boots/clarks/clarks-women-brown-solid-mid-top-flat-boots/1234567/buy',
          category: 'footwear',
          brand: 'Clarks',
          rating: 4.3,
          reviews: 1456,
          platform: 'myntra',
          trendScore: 88,
          styleCompatibility: 91,
          colors: ['brown', 'black'],
          sizes: ['5', '6', '7', '8', '9']
        },
        {
          id: 'foot-5',
          name: 'Strappy Flat Sandals',
          price: 1299,
          originalPrice: 2199,
          image: 'https://images.pexels.com/photos/1454181/pexels-photo-1454181.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.amazon.in/dp/B08XYZSTU7',
          category: 'footwear',
          brand: 'Bata',
          rating: 4.0,
          reviews: 2134,
          platform: 'amazon',
          trendScore: 83,
          styleCompatibility: 87,
          colors: ['tan', 'black'],
          sizes: ['5', '6', '7', '8', '9']
        },
        {
          id: 'foot-6',
          name: 'Stiletto Heels',
          price: 1999,
          originalPrice: 3499,
          image: 'https://images.pexels.com/photos/1454182/pexels-photo-1454182.jpeg?auto=compress&cs=tinysrgb&w=400',
          url: 'https://www.flipkart.com/footwear/womens-footwear/heels/pr?sid=osp%2Ccil%2C1cu&q=stiletto+heels',
          category: 'footwear',
          brand: 'Steve Madden',
          rating: 4.2,
          reviews: 1789,
          platform: 'flipkart',
          trendScore: 86,
          styleCompatibility: 89,
          colors: ['black', 'nude'],
          sizes: ['5', '6', '7', '8', '9']
        }
      ]
    };
  }

  private getFallbackProducts(query: string, preferences: UserPreferences): Product[] {
    // Return a subset of curated products as fallback
    const allProducts = Object.values(this.getProductDatabase()).flat();
    const budgetFiltered = allProducts.filter(product => 
      product.price >= preferences.budget.min && product.price <= preferences.budget.max
    );
    
    const finalProducts = budgetFiltered.length > 0 ? budgetFiltered : allProducts;
    return this.shuffleArray([...finalProducts]).slice(0, 6);
  }

  private generateAffiliateLink(product: Product): string {
    const affiliateId = this.affiliateIds[product.platform];
    
    switch (product.platform) {
      case 'flipkart':
        return `${product.url}?affid=${affiliateId}`;
      case 'amazon':
        return `${product.url}?tag=${affiliateId}`;
      case 'myntra':
        return `${product.url}?utm_source=${affiliateId}`;
      default:
        return product.url;
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async getProductsByBrand(brand: string, preferences: UserPreferences): Promise<Product[]> {
    const allProducts = Object.values(this.getProductDatabase()).flat();
    const brandProducts = allProducts.filter(product => 
      product.brand.toLowerCase().includes(brand.toLowerCase())
    );
    
    return this.shuffleArray(brandProducts).slice(0, 6);
  }

  async getProductsByPriceRange(min: number, max: number): Promise<Product[]> {
    const allProducts = Object.values(this.getProductDatabase()).flat();
    const priceFiltered = allProducts.filter(product => 
      product.price >= min && product.price <= max
    );
    
    return this.shuffleArray(priceFiltered).slice(0, 6);
  }

  async getTrendingProducts(preferences: UserPreferences): Promise<Product[]> {
    const allProducts = Object.values(this.getProductDatabase()).flat();
    const trending = allProducts
      .filter(product => (product.trendScore || 0) >= 85)
      .sort((a, b) => (b.trendScore || 0) - (a.trendScore || 0));
    
    return trending.slice(0, 6);
  }
}