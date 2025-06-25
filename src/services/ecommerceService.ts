import type { Product, ShoppingSession } from '../types';

export class EcommerceIntegrationService {
  private readonly affiliateIds = {
    flipkart: 'your-flipkart-affiliate-id',
    amazon: 'your-amazon-affiliate-id',
    myntra: 'your-myntra-affiliate-id'
  };

  async fetchFromFlipkart(query: string): Promise<Product[]> {
    try {
      // In real implementation, use Flipkart Affiliate API
      const mockUrl = `https://affiliate-api.flipkart.net/affiliate/1.0/search.json?query=${encodeURIComponent(query)}`;
      
      // Mock response for demo
      return this.getMockFlipkartProducts();
    } catch (error) {
      console.error('Flipkart API error:', error);
      return [];
    }
  }

  async fetchFromAmazon(query: string): Promise<Product[]> {
    try {
      // In real implementation, use Amazon Product Advertising API
      const mockUrl = `https://webservices.amazon.in/paapi5/searchitems`;
      
      // Mock response for demo
      return this.getMockAmazonProducts();
    } catch (error) {
      console.error('Amazon API error:', error);
      return [];
    }
  }

  async fetchFromMyntra(query: string): Promise<Product[]> {
    try {
      // In real implementation, use Myntra API or web scraping
      const mockUrl = `https://www.myntra.com/gateway/v2/search/${encodeURIComponent(query)}`;
      
      // Mock response for demo
      return this.getMockMyntraProducts();
    } catch (error) {
      console.error('Myntra API error:', error);
      return [];
    }
  }

  async aggregateResults(query: string): Promise<Product[]> {
    const [flipkartResults, amazonResults, myntraResults] = await Promise.allSettled([
      this.fetchFromFlipkart(query),
      this.fetchFromAmazon(query),
      this.fetchFromMyntra(query)
    ]);

    const allProducts = [
      ...(flipkartResults.status === 'fulfilled' ? flipkartResults.value : []),
      ...(amazonResults.status === 'fulfilled' ? amazonResults.value : []),
      ...(myntraResults.status === 'fulfilled' ? myntraResults.value : [])
    ];

    return this.normalizeAndRank(allProducts);
  }

  async comparePrice(productName: string): Promise<Record<string, any>> {
    const [flipkart, amazon, myntra] = await Promise.all([
      this.fetchFromFlipkart(productName),
      this.fetchFromAmazon(productName),
      this.fetchFromMyntra(productName)
    ]);

    const comparison = {
      flipkart: flipkart[0] || null,
      amazon: amazon[0] || null,
      myntra: myntra[0] || null
    };

    const bestDeal = this.findBestDeal(comparison);

    return {
      comparison,
      bestDeal,
      savingsAmount: this.calculateSavings(comparison),
      lastUpdated: new Date()
    };
  }

  generateAffiliateLink(product: Product): string {
    const baseUrl = product.url;
    const affiliateId = this.affiliateIds[product.platform];

    switch (product.platform) {
      case 'flipkart':
        return `${baseUrl}?affid=${affiliateId}`;
      case 'amazon':
        return `${baseUrl}?tag=${affiliateId}`;
      case 'myntra':
        return `${baseUrl}?utm_source=${affiliateId}`;
      default:
        return baseUrl;
    }
  }

  private normalizeAndRank(products: Product[]): Product[] {
    // Remove duplicates based on name similarity
    const uniqueProducts = this.removeDuplicates(products);
    
    // Sort by relevance score (combination of rating, price, and availability)
    return uniqueProducts.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a);
      const scoreB = this.calculateRelevanceScore(b);
      return scoreB - scoreA;
    });
  }

  private removeDuplicates(products: Product[]): Product[] {
    const seen = new Set<string>();
    return products.filter(product => {
      const normalized = product.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  }

  private calculateRelevanceScore(product: Product): number {
    const ratingScore = (product.rating || 0) * 20;
    const priceScore = product.originalPrice 
      ? ((product.originalPrice - product.price) / product.originalPrice) * 100
      : 0;
    const reviewScore = Math.min((product.reviews || 0) / 100, 10);
    
    return ratingScore + priceScore + reviewScore;
  }

  private findBestDeal(comparison: Record<string, Product | null>): string {
    let bestPlatform = '';
    let bestPrice = Infinity;

    Object.entries(comparison).forEach(([platform, product]) => {
      if (product && product.price < bestPrice) {
        bestPrice = product.price;
        bestPlatform = platform;
      }
    });

    return bestPlatform;
  }

  private calculateSavings(comparison: Record<string, Product | null>): number {
    const prices = Object.values(comparison)
      .filter(product => product !== null)
      .map(product => product!.price);

    if (prices.length < 2) return 0;

    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    
    return maxPrice - minPrice;
  }

  // Mock data generators for demo
  private getMockFlipkartProducts(): Product[] {
    return [
      {
        id: 'fk-1',
        name: 'Flipkart Fashion Kurta',
        price: 1299,
        originalPrice: 2199,
        image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400',
        url: 'https://www.flipkart.com/fashion-kurta',
        category: 'ethnic-wear',
        brand: 'Libas',
        rating: 4.2,
        reviews: 1250,
        platform: 'flipkart',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Blue', 'Pink', 'White']
      }
    ];
  }

  private getMockAmazonProducts(): Product[] {
    return [
      {
        id: 'amz-1',
        name: 'Amazon Essentials Dress',
        price: 899,
        originalPrice: 1499,
        image: 'https://images.pexels.com/photos/7679732/pexels-photo-7679732.jpeg?auto=compress&cs=tinysrgb&w=400',
        url: 'https://www.amazon.in/essentials-dress',
        category: 'western-wear',
        brand: 'Amazon Essentials',
        rating: 4.0,
        reviews: 890,
        platform: 'amazon',
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['Black', 'Navy', 'Red']
      }
    ];
  }

  private getMockMyntraProducts(): Product[] {
    return [
      {
        id: 'myn-1',
        name: 'Myntra Studio Saree',
        price: 2599,
        originalPrice: 4999,
        image: 'https://images.pexels.com/photos/7679742/pexels-photo-7679742.jpeg?auto=compress&cs=tinysrgb&w=400',
        url: 'https://www.myntra.com/studio-saree',
        category: 'ethnic-wear',
        brand: 'Kalini',
        rating: 4.6,
        reviews: 2100,
        platform: 'myntra',
        sizes: ['Free Size'],
        colors: ['Golden', 'Silver', 'Maroon']
      }
    ];
  }
}

export class ProductDetectionService {
  detectCurrentProduct(url: string, dom?: Document): Product | null {
    const currentDoc = dom || document;

    if (url.includes('flipkart.com')) {
      return this.parseFlipkartProduct(currentDoc, url);
    } else if (url.includes('amazon.in')) {
      return this.parseAmazonProduct(currentDoc, url);
    } else if (url.includes('myntra.com')) {
      return this.parseMyntraProduct(currentDoc, url);
    }

    return null;
  }

  private parseFlipkartProduct(doc: Document, url: string): Product | null {
    try {
      const name = doc.querySelector('span.B_NuCI')?.textContent?.trim();
      const priceText = doc.querySelector('._30jeq3._16Jk6d')?.textContent?.trim();
      const originalPriceText = doc.querySelector('._3I9_wc._2p6lqe')?.textContent?.trim();
      const imageElement = doc.querySelector('img._396cs4') as HTMLImageElement;
      const ratingText = doc.querySelector('._3LWZlK')?.textContent?.trim();

      if (!name || !priceText) return null;

      return {
        id: `flipkart-${Date.now()}`,
        name,
        price: this.extractPrice(priceText),
        originalPrice: originalPriceText ? this.extractPrice(originalPriceText) : undefined,
        image: imageElement?.src || '',
        url,
        category: this.extractCategoryFromBreadcrumb(doc),
        brand: this.extractBrand(doc, 'flipkart'),
        rating: ratingText ? parseFloat(ratingText) : undefined,
        platform: 'flipkart'
      };
    } catch (error) {
      console.error('Error parsing Flipkart product:', error);
      return null;
    }
  }

  private parseAmazonProduct(doc: Document, url: string): Product | null {
    try {
      const name = doc.querySelector('#productTitle')?.textContent?.trim();
      const priceText = doc.querySelector('.a-price-whole')?.textContent?.trim();
      const imageElement = doc.querySelector('#landingImage') as HTMLImageElement;
      const ratingText = doc.querySelector('.a-icon-alt')?.textContent?.trim();

      if (!name || !priceText) return null;

      return {
        id: `amazon-${Date.now()}`,
        name,
        price: this.extractPrice(priceText),
        image: imageElement?.src || '',
        url,
        category: this.extractCategoryFromBreadcrumb(doc),
        brand: this.extractBrand(doc, 'amazon'),
        rating: ratingText ? this.extractRating(ratingText) : undefined,
        platform: 'amazon'
      };
    } catch (error) {
      console.error('Error parsing Amazon product:', error);
      return null;
    }
  }

  private parseMyntraProduct(doc: Document, url: string): Product | null {
    try {
      const name = doc.querySelector('.pdp-name')?.textContent?.trim();
      const priceText = doc.querySelector('.pdp-price')?.textContent?.trim();
      const imageElement = doc.querySelector('.image-grid-image') as HTMLImageElement;
      const ratingText = doc.querySelector('.index-overallRating')?.textContent?.trim();

      if (!name || !priceText) return null;

      return {
        id: `myntra-${Date.now()}`,
        name,
        price: this.extractPrice(priceText),
        image: imageElement?.src || '',
        url,
        category: this.extractCategoryFromBreadcrumb(doc),
        brand: this.extractBrand(doc, 'myntra'),
        rating: ratingText ? parseFloat(ratingText) : undefined,
        platform: 'myntra'
      };
    } catch (error) {
      console.error('Error parsing Myntra product:', error);
      return null;
    }
  }

  private extractPrice(priceText: string): number {
    const cleaned = priceText.replace(/[^\d.,]/g, '');
    const price = parseFloat(cleaned.replace(/,/g, ''));
    return isNaN(price) ? 0 : price;
  }

  private extractRating(ratingText: string): number {
    const rating = parseFloat(ratingText.split(' ')[0]);
    return isNaN(rating) ? 0 : rating;
  }

  private extractCategoryFromBreadcrumb(doc: Document): string {
    const breadcrumbs = doc.querySelectorAll('a[href*="category"], .breadcrumb a');
    if (breadcrumbs.length > 0) {
      const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
      return lastBreadcrumb.textContent?.trim().toLowerCase() || 'general';
    }
    return 'general';
  }

  private extractBrand(doc: Document, platform: string): string {
    let brandSelector = '';
    
    switch (platform) {
      case 'flipkart':
        brandSelector = '.G6XhBx, ._2L6AC7';
        break;
      case 'amazon':
        brandSelector = '#bylineInfo a, .po-brand .po-break-word';
        break;
      case 'myntra':
        brandSelector = '.pdp-title .pdp-name, .brand-name';
        break;
    }

    const brandElement = doc.querySelector(brandSelector);
    return brandElement?.textContent?.trim() || 'Unknown Brand';
  }
}