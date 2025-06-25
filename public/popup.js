// Popup script for AI Fashion Assistant
class PopupController {
  constructor() {
    this.currentProduct = null;
    this.isActive = false;
    
    this.init();
  }

  async init() {
    await this.loadState();
    this.setupEventListeners();
    this.updateUI();
  }

  async loadState() {
    try {
      const data = await chrome.storage.local.get([
        'isActive',
        'currentProduct',
        'preferences'
      ]);
      
      this.isActive = data.isActive || false;
      this.currentProduct = data.currentProduct || null;
      this.preferences = data.preferences || {};
    } catch (error) {
      console.error('Error loading state:', error);
    }
  }

  setupEventListeners() {
    // Get Style Complements button
    document.getElementById('getComplementsBtn').addEventListener('click', () => {
      this.getStyleComplements();
    });

    // Get Recommendations button
    document.getElementById('getRecommendationsBtn').addEventListener('click', () => {
      this.getRecommendations();
    });

    // Open Web App button
    document.getElementById('openWebAppBtn').addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://your-web-app-url.com' });
    });

    // Quick Actions
    document.getElementById('trendingBtn').addEventListener('click', () => {
      this.openTrendingPage();
    });

    document.getElementById('wishlistBtn').addEventListener('click', () => {
      this.openWishlist();
    });

    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.openSettings();
    });

    document.getElementById('helpBtn').addEventListener('click', () => {
      this.openHelp();
    });
  }

  updateUI() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const currentProductSection = document.getElementById('currentProductSection');

    // Update status
    if (this.isActive) {
      statusDot.classList.remove('inactive');
      statusText.textContent = 'Active on supported sites';
    } else {
      statusDot.classList.add('inactive');
      statusText.textContent = 'Inactive - Visit supported sites';
    }

    // Update current product
    if (this.currentProduct) {
      currentProductSection.style.display = 'block';
      document.getElementById('productImage').src = this.currentProduct.image || '';
      document.getElementById('productName').textContent = this.currentProduct.name || 'Unknown Product';
      document.getElementById('productPrice').textContent = `₹${(this.currentProduct.price || 0).toLocaleString()}`;
    } else {
      currentProductSection.style.display = 'none';
    }
  }

  async getStyleComplements() {
    const btn = document.getElementById('getComplementsBtn');
    const originalText = btn.textContent;
    
    btn.textContent = '🎨 Analyzing style...';
    btn.disabled = true;

    try {
      if (!this.currentProduct) {
        this.showNotification('Please visit a product page first to get style complements.', 'info');
        return;
      }

      const response = await chrome.runtime.sendMessage({
        type: 'GET_COMPLEMENT_RECOMMENDATIONS',
        data: { product: this.currentProduct }
      });

      if (response.recommendations && response.recommendations.length > 0) {
        // Send complement recommendations to current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        chrome.tabs.sendMessage(tab.id, {
          type: 'SHOW_COMPLEMENT_RECOMMENDATIONS',
          product: this.currentProduct,
          recommendations: response.recommendations
        });

        this.showNotification(`🎨 Found ${response.recommendations.length} perfect style complements!`, 'success');
        window.close(); // Close popup
      } else {
        this.showNotification('No style complements found. Try a different product.', 'info');
      }
    } catch (error) {
      console.error('Error getting style complements:', error);
      this.showNotification('Failed to get style complements. Please try again.', 'error');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }

  async getRecommendations() {
    const btn = document.getElementById('getRecommendationsBtn');
    const originalText = btn.textContent;
    
    btn.textContent = '✨ Getting recommendations...';
    btn.disabled = true;

    try {
      if (!this.currentProduct) {
        this.showNotification('No product detected. Visit a product page on Flipkart, Amazon, or Myntra.', 'info');
        return;
      }

      const response = await chrome.runtime.sendMessage({
        type: 'GET_RECOMMENDATIONS',
        data: { product: this.currentProduct }
      });

      if (response.recommendations && response.recommendations.length > 0) {
        // Send recommendations to current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        chrome.tabs.sendMessage(tab.id, {
          type: 'SHOW_RECOMMENDATIONS',
          product: this.currentProduct,
          recommendations: response.recommendations
        });

        this.showNotification('Recommendations loaded!', 'success');
        window.close(); // Close popup
      } else {
        this.showNotification('No recommendations found. Try again later.', 'info');
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      this.showNotification('Failed to get recommendations. Please try again.', 'error');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }

  openTrendingPage() {
    chrome.tabs.create({ url: 'https://your-web-app-url.com/trending' });
  }

  openWishlist() {
    chrome.tabs.create({ url: 'https://your-web-app-url.com/wishlist' });
  }

  openSettings() {
    chrome.tabs.create({ url: 'https://your-web-app-url.com/settings' });
  }

  openHelp() {
    chrome.tabs.create({ url: 'https://your-web-app-url.com/help' });
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      padding: 12px;
      border-radius: 8px;
      color: white;
      font-size: 12px;
      font-weight: 500;
      z-index: 1000;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s ease;
    `;

    // Set background color based on type
    switch (type) {
      case 'success':
        notification.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
        break;
      case 'error':
        notification.style.background = 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
        break;
      default:
        notification.style.background = 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)';
    }

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 10);

    // Hide notification
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});