// Content script for AI Fashion Assistant
class AIFashionAssistant {
  constructor() {
    this.isInitialized = false;
    this.currentProduct = null;
    this.recommendations = [];
    this.complementRecommendations = [];
    this.widget = null;
    this.complementWidget = null;
    
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    
    console.log('AI Fashion Assistant: Initializing on', window.location.hostname);
    
    // Wait for page to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.isInitialized = true;
    
    // Detect current product
    this.detectProduct();
    
    // Listen for page changes (SPA navigation)
    this.observePageChanges();
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });
    
    // Add floating action button
    this.createFloatingButton();
    
    // Auto-detect product changes
    this.startProductDetection();
  }

  startProductDetection() {
    // Monitor for product page changes
    let lastUrl = window.location.href;
    let lastProductName = '';
    
    const checkForProductChanges = () => {
      const currentUrl = window.location.href;
      
      // Check if URL changed or if we're on a product page
      if (currentUrl !== lastUrl || this.isProductPage()) {
        lastUrl = currentUrl;
        
        setTimeout(() => {
          const detectedProduct = this.detectProduct();
          if (detectedProduct && detectedProduct.name !== lastProductName) {
            lastProductName = detectedProduct.name;
            console.log('🔍 New product detected:', detectedProduct.name);
            
            // Show complement analysis notification
            this.showComplementAnalysisNotification(detectedProduct);
          }
        }, 2000); // Wait for page content to load
      }
    };
    
    // Check every 3 seconds
    setInterval(checkForProductChanges, 3000);
    
    // Also check on scroll (for infinite scroll pages)
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(checkForProductChanges, 1000);
    });
  }

  isProductPage() {
    const url = window.location.href;
    
    // Check if current page is a product page
    const productPagePatterns = [
      '/p/', '/dp/', '/buy', '/product/', '/item/'
    ];
    
    return productPagePatterns.some(pattern => url.includes(pattern));
  }

  showComplementAnalysisNotification(product) {
    // Show a subtle notification that complement analysis is available
    const notification = document.createElement('div');
    notification.className = 'ai-complement-notification';
    notification.innerHTML = `
      <div class="ai-complement-notification-content">
        <div class="ai-complement-icon">🎨</div>
        <div class="ai-complement-text">
          <div class="ai-complement-title">AI Style Assistant</div>
          <div class="ai-complement-subtitle">Found items that complement this ${product.category || 'product'}!</div>
        </div>
        <button class="ai-complement-view-btn" onclick="this.parentElement.parentElement.remove()">
          View Suggestions
        </button>
      </div>
    `;
    
    // Add click handler to view button
    const viewBtn = notification.querySelector('.ai-complement-view-btn');
    viewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showComplementRecommendations();
      notification.remove();
    });
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 8000);
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.add('ai-complement-notification-show');
    }, 100);
  }

  detectProduct() {
    const url = window.location.href;
    let product = null;

    try {
      if (url.includes('flipkart.com') && url.includes('/p/')) {
        product = this.parseFlipkartProduct();
      } else if (url.includes('amazon.in') && url.includes('/dp/')) {
        product = this.parseAmazonProduct();
      } else if (url.includes('myntra.com') && url.match(/\/\d+\/buy/)) {
        product = this.parseMyntraProduct();
      } else if (url.includes('ajio.com') && url.includes('/p/')) {
        product = this.parseAjioProduct();
      } else if (url.includes('nykaa.com') && url.includes('/p/')) {
        product = this.parseNykaaProduct();
      }

      if (product) {
        this.currentProduct = product;
        this.notifyProductDetection(product);
      }
    } catch (error) {
      console.error('Error detecting product:', error);
    }

    return product;
  }

  parseFlipkartProduct() {
    const name = document.querySelector('span.B_NuCI, h1.yhB1nd')?.textContent?.trim();
    const priceElement = document.querySelector('._30jeq3._16Jk6d, .Nx9bqj.CxhGGd');
    const imageElement = document.querySelector('img._396cs4, img._2r_T1I');
    const ratingElement = document.querySelector('._3LWZlK, .XQDdHH');

    if (!name || !priceElement) return null;

    const price = this.extractPrice(priceElement.textContent);
    
    return {
      id: `flipkart-${Date.now()}`,
      name,
      price,
      image: imageElement?.src || '',
      url: window.location.href,
      platform: 'flipkart',
      category: this.extractCategoryFromBreadcrumb(),
      rating: ratingElement ? parseFloat(ratingElement.textContent) : null
    };
  }

  parseAmazonProduct() {
    const name = document.querySelector('#productTitle, h1.a-size-large')?.textContent?.trim();
    const priceElement = document.querySelector('.a-price-whole, .a-offscreen');
    const imageElement = document.querySelector('#landingImage, .a-dynamic-image');
    const ratingElement = document.querySelector('.a-icon-alt, .reviewCountTextLinkedHistogram');

    if (!name || !priceElement) return null;

    const price = this.extractPrice(priceElement.textContent);

    return {
      id: `amazon-${Date.now()}`,
      name,
      price,
      image: imageElement?.src || '',
      url: window.location.href,
      platform: 'amazon',
      category: this.extractCategoryFromBreadcrumb(),
      rating: ratingElement ? this.extractRating(ratingElement.textContent) : null
    };
  }

  parseMyntraProduct() {
    const name = document.querySelector('.pdp-name, h1.pdp-name')?.textContent?.trim();
    const priceElement = document.querySelector('.pdp-price strong, .pdp-price .pdp-price-info strong');
    const imageElement = document.querySelector('.image-grid-image, .image-grid-square img');
    const ratingElement = document.querySelector('.index-overallRating, .pdp-rating-section .index-overallRating div');

    if (!name || !priceElement) return null;

    const price = this.extractPrice(priceElement.textContent);

    return {
      id: `myntra-${Date.now()}`,
      name,
      price,
      image: imageElement?.src || '',
      url: window.location.href,
      platform: 'myntra',
      category: this.extractCategoryFromBreadcrumb(),
      rating: ratingElement ? parseFloat(ratingElement.textContent) : null
    };
  }

  parseAjioProduct() {
    const name = document.querySelector('.pdp-product-name, h1')?.textContent?.trim();
    const priceElement = document.querySelector('.pdp-price, .price-current');
    const imageElement = document.querySelector('.pdp-image img, .product-image img');
    const ratingElement = document.querySelector('.pdp-rating, .rating');

    if (!name || !priceElement) return null;

    const price = this.extractPrice(priceElement.textContent);

    return {
      id: `ajio-${Date.now()}`,
      name,
      price,
      image: imageElement?.src || '',
      url: window.location.href,
      platform: 'ajio',
      category: this.extractCategoryFromBreadcrumb(),
      rating: ratingElement ? parseFloat(ratingElement.textContent) : null
    };
  }

  parseNykaaProduct() {
    const name = document.querySelector('.product-title, h1')?.textContent?.trim();
    const priceElement = document.querySelector('.product-price, .price');
    const imageElement = document.querySelector('.product-image img, .main-image img');
    const ratingElement = document.querySelector('.rating, .product-rating');

    if (!name || !priceElement) return null;

    const price = this.extractPrice(priceElement.textContent);

    return {
      id: `nykaa-${Date.now()}`,
      name,
      price,
      image: imageElement?.src || '',
      url: window.location.href,
      platform: 'nykaa',
      category: this.extractCategoryFromBreadcrumb(),
      rating: ratingElement ? parseFloat(ratingElement.textContent) : null
    };
  }

  extractPrice(priceText) {
    if (!priceText) return 0;
    const cleaned = priceText.replace(/[^\d.,]/g, '');
    const price = parseFloat(cleaned.replace(/,/g, ''));
    return isNaN(price) ? 0 : price;
  }

  extractRating(ratingText) {
    if (!ratingText) return null;
    const match = ratingText.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : null;
  }

  extractCategoryFromBreadcrumb() {
    const breadcrumbs = document.querySelectorAll('.breadcrumb a, ._2whKao a, #wayfinding-breadcrumbs_feature_div a');
    if (breadcrumbs.length > 1) {
      const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 2]; // Second to last is usually the category
      return lastBreadcrumb?.textContent?.trim().toLowerCase() || 'general';
    }
    return 'general';
  }

  notifyProductDetection(product) {
    chrome.runtime.sendMessage({
      type: 'PRODUCT_DETECTED',
      data: product
    }).catch(err => console.log('Failed to send product detection message:', err));
  }

  createFloatingButton() {
    // Remove existing button if any
    const existingButton = document.getElementById('ai-fashion-assistant-fab');
    if (existingButton) {
      existingButton.remove();
    }

    const fab = document.createElement('div');
    fab.id = 'ai-fashion-assistant-fab';
    fab.innerHTML = `
      <div class="ai-fab-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
        </svg>
      </div>
    `;

    fab.addEventListener('click', () => {
      this.showMainMenu();
    });

    document.body.appendChild(fab);
  }

  showMainMenu() {
    // Create main menu with options
    const menu = document.createElement('div');
    menu.id = 'ai-fashion-main-menu';
    menu.innerHTML = `
      <div class="ai-menu-container">
        <div class="ai-menu-header">
          <div class="ai-menu-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
            AI Fashion Assistant
          </div>
          <button class="ai-menu-close" onclick="this.closest('#ai-fashion-main-menu').remove()">×</button>
        </div>
        <div class="ai-menu-content">
          <div class="ai-menu-options">
            <button class="ai-menu-option" id="complement-analysis-btn">
              <div class="ai-menu-option-icon">🎨</div>
              <div class="ai-menu-option-content">
                <div class="ai-menu-option-title">Style Complements</div>
                <div class="ai-menu-option-desc">Find items that go with this product</div>
              </div>
            </button>
            
            <button class="ai-menu-option" id="general-recommendations-btn">
              <div class="ai-menu-option-icon">✨</div>
              <div class="ai-menu-option-content">
                <div class="ai-menu-option-title">General Recommendations</div>
                <div class="ai-menu-option-desc">Discover trending fashion items</div>
              </div>
            </button>
            
            <button class="ai-menu-option" id="open-web-app-btn">
              <div class="ai-menu-option-icon">🌐</div>
              <div class="ai-menu-option-content">
                <div class="ai-menu-option-title">Open Web App</div>
                <div class="ai-menu-option-desc">Full AI fashion assistant experience</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    menu.querySelector('#complement-analysis-btn').addEventListener('click', () => {
      menu.remove();
      this.showComplementRecommendations();
    });

    menu.querySelector('#general-recommendations-btn').addEventListener('click', () => {
      menu.remove();
      this.toggleRecommendationWidget();
    });

    menu.querySelector('#open-web-app-btn').addEventListener('click', () => {
      window.open('https://your-web-app-url.com', '_blank');
      menu.remove();
    });

    document.body.appendChild(menu);

    // Add animation
    setTimeout(() => {
      menu.classList.add('ai-menu-show');
    }, 10);
  }

  async showComplementRecommendations() {
    if (!this.currentProduct) {
      this.showNotification('Please visit a product page to get complement recommendations', 'info');
      return;
    }

    this.showNotification('🎨 Analyzing product for style complements...', 'info');

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_COMPLEMENT_RECOMMENDATIONS',
        data: { product: this.currentProduct }
      });

      if (response.recommendations) {
        this.complementRecommendations = response.recommendations;
        this.createComplementWidget();
        this.showNotification('✨ Found perfect style complements!', 'success');
      } else {
        this.showNotification('No complement recommendations available', 'error');
      }
    } catch (error) {
      console.error('Error getting complement recommendations:', error);
      this.showNotification('Failed to get complement recommendations', 'error');
    }
  }

  createComplementWidget() {
    // Remove existing widget
    if (this.complementWidget) {
      this.complementWidget.remove();
    }

    this.complementWidget = document.createElement('div');
    this.complementWidget.id = 'ai-fashion-complement-widget';
    this.complementWidget.innerHTML = `
      <div class="ai-widget-container">
        <div class="ai-widget-header">
          <div class="ai-widget-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
            Style Complements
          </div>
          <button class="ai-widget-close" onclick="this.closest('#ai-fashion-complement-widget').remove()">×</button>
        </div>
        <div class="ai-widget-content">
          <div class="ai-widget-current-product">
            <img src="${this.currentProduct.image}" alt="${this.currentProduct.name}" />
            <div class="ai-widget-product-info">
              <h4>${this.currentProduct.name}</h4>
              <p>₹${this.currentProduct.price.toLocaleString()}</p>
            </div>
          </div>
          <div class="ai-widget-complement-intro">
            <p>🎨 <strong>AI Style Analysis:</strong> Here are items that perfectly complement your selected ${this.currentProduct.category || 'product'}:</p>
          </div>
          <div class="ai-widget-recommendations">
            <div class="ai-widget-recommendations-grid">
              ${this.complementRecommendations.map(rec => `
                <div class="ai-widget-recommendation-card ai-complement-card">
                  <img src="${rec.image}" alt="${rec.name}" />
                  <div class="ai-widget-card-content">
                    <h5>${rec.name}</h5>
                    <p class="ai-widget-price">₹${rec.price.toLocaleString()}</p>
                    <div class="ai-widget-scores">
                      <span class="ai-widget-compatibility-score">🎯 ${rec.styleCompatibility}% Match</span>
                    </div>
                    <p class="ai-widget-reason">${rec.complementReason}</p>
                    <p class="ai-widget-styling-tip">💡 <strong>Styling Tip:</strong> ${rec.stylingTip}</p>
                    <button class="ai-widget-view-btn" onclick="window.open('${rec.url}', '_blank')">
                      View Product
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="ai-widget-footer">
            <p class="ai-widget-footer-text">
              🤖 <strong>AI-Powered Styling:</strong> These recommendations are based on fashion styling principles and color coordination analysis.
            </p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.complementWidget);

    // Add animation
    setTimeout(() => {
      this.complementWidget.classList.add('ai-widget-show');
    }, 10);
  }

  toggleRecommendationWidget() {
    if (this.widget && document.body.contains(this.widget)) {
      this.hideRecommendationWidget();
    } else {
      this.showRecommendationWidget();
    }
  }

  async showRecommendationWidget() {
    if (!this.currentProduct) {
      this.showNotification('No product detected on this page', 'info');
      return;
    }

    // Get recommendations
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_RECOMMENDATIONS',
        data: { product: this.currentProduct }
      });

      if (response.recommendations) {
        this.recommendations = response.recommendations;
        this.createRecommendationWidget();
      } else {
        this.showNotification('Failed to get recommendations', 'error');
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      this.showNotification('Failed to connect to AI assistant', 'error');
    }
  }

  createRecommendationWidget() {
    // Remove existing widget
    if (this.widget) {
      this.widget.remove();
    }

    this.widget = document.createElement('div');
    this.widget.id = 'ai-fashion-assistant-widget';
    this.widget.innerHTML = `
      <div class="ai-widget-container">
        <div class="ai-widget-header">
          <div class="ai-widget-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
            AI Fashion Assistant
          </div>
          <button class="ai-widget-close" onclick="this.closest('#ai-fashion-assistant-widget').remove()">×</button>
        </div>
        <div class="ai-widget-content">
          <div class="ai-widget-current-product">
            <img src="${this.currentProduct.image}" alt="${this.currentProduct.name}" />
            <div class="ai-widget-product-info">
              <h4>${this.currentProduct.name}</h4>
              <p>₹${this.currentProduct.price.toLocaleString()}</p>
            </div>
          </div>
          <div class="ai-widget-recommendations">
            <h3>AI Recommendations</h3>
            <div class="ai-widget-recommendations-grid">
              ${this.recommendations.map(rec => `
                <div class="ai-widget-recommendation-card">
                  <img src="${rec.image}" alt="${rec.name}" />
                  <div class="ai-widget-card-content">
                    <h5>${rec.name}</h5>
                    <p class="ai-widget-price">₹${rec.price.toLocaleString()}</p>
                    <div class="ai-widget-scores">
                      <span class="ai-widget-trend-score">🔥 ${rec.trendScore}%</span>
                      <span class="ai-widget-compatibility-score">✨ ${rec.compatibilityScore}%</span>
                    </div>
                    <p class="ai-widget-reason">${rec.reason}</p>
                    <button class="ai-widget-view-btn" onclick="window.open('${rec.url || '#'}', '_blank')">
                      View Product
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.widget);

    // Add animation
    setTimeout(() => {
      this.widget.classList.add('ai-widget-show');
    }, 10);
  }

  hideRecommendationWidget() {
    if (this.widget) {
      this.widget.classList.remove('ai-widget-show');
      setTimeout(() => {
        if (this.widget && document.body.contains(this.widget)) {
          this.widget.remove();
        }
      }, 300);
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `ai-notification ai-notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('ai-notification-show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('ai-notification-show');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }

  observePageChanges() {
    // Observer for SPA navigation
    let lastUrl = window.location.href;
    
    const observer = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        setTimeout(() => {
          this.detectProduct();
        }, 1000); // Wait for page content to load
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'SHOW_RECOMMENDATIONS':
        this.currentProduct = message.product;
        this.showRecommendationWidget();
        sendResponse({ success: true });
        break;
        
      case 'SHOW_COMPLEMENT_RECOMMENDATIONS':
        this.currentProduct = message.product;
        this.complementRecommendations = message.recommendations || [];
        this.createComplementWidget();
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ error: 'Unknown message type' });
    }
  }
}

// Initialize the assistant
const aiAssistant = new AIFashionAssistant();