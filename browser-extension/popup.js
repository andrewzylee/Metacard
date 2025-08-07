// Metapayd Browser Extension Popup Logic

// Mock data for demonstration
const mockCards = [
  {
    id: 'card_001',
    name: 'Chase Freedom Unlimited',
    lastFour: '4532',
    network: 'Visa',
    color: '#1f4788',
    rewards: {
      defaultRate: 1.5,
      categories: {
        '5411': 3.0, // Grocery stores
        '5812': 2.0, // Restaurants
        '5541': 5.0  // Gas stations
      },
      type: 'cashback'
    }
  },
  {
    id: 'card_002',
    name: 'American Express Gold',
    lastFour: '7891',
    network: 'American Express',
    color: '#d4af37',
    rewards: {
      defaultRate: 1.0,
      categories: {
        '5812': 4.0, // Restaurants
        '5411': 4.0, // Supermarkets
        '3000': 3.0  // Airlines
      },
      type: 'points',
      pointValue: 0.02
    }
  },
  {
    id: 'card_003',
    name: 'Citi Double Cash',
    lastFour: '2468',
    network: 'Mastercard',
    color: '#c41e3a',
    rewards: {
      defaultRate: 2.0,
      categories: {},
      type: 'cashback'
    }
  }
];

const merchantDatabase = {
  'amazon.com': { category: 'Shopping', mcc: '5999', icon: '📦' },
  'target.com': { category: 'Department Stores', mcc: '5311', icon: '🎯' },
  'walmart.com': { category: 'Department Stores', mcc: '5311', icon: '🛒' },
  'bestbuy.com': { category: 'Electronics', mcc: '5732', icon: '📱' },
  'doordash.com': { category: 'Restaurants', mcc: '5812', icon: '🍕' },
  'ubereats.com': { category: 'Restaurants', mcc: '5812', icon: '🍔' },
  'instacart.com': { category: 'Grocery', mcc: '5411', icon: '🥬' },
  'shell.com': { category: 'Gas Stations', mcc: '5541', icon: '⛽' },
  'expedia.com': { category: 'Travel', mcc: '4722', icon: '✈️' },
  'booking.com': { category: 'Travel', mcc: '7011', icon: '🏨' }
};

class PopupController {
  constructor() {
    this.currentSite = null;
    this.recommendedCard = null;
    this.userSettings = null;
    this.init();
  }

  async init() {
    try {
      await this.loadUserSettings();
      await this.analyzCurrentSite();
      this.setupEventListeners();
      this.updateUI();
    } catch (error) {
      console.error('Popup initialization failed:', error);
      this.showStatus('Failed to load extension', 'error');
    }
  }

  async loadUserSettings() {
    // Load settings from chrome storage
    const settings = await chrome.storage.sync.get([
      'primaryGoal',
      'alertsEnabled', 
      'autoOptimize',
      'monthlyRewards',
      'optimizationRate',
      'totalSavings'
    ]);

    this.userSettings = {
      primaryGoal: settings.primaryGoal || 'cashback',
      alertsEnabled: settings.alertsEnabled !== false,
      autoOptimize: settings.autoOptimize !== false,
      monthlyRewards: settings.monthlyRewards || 0,
      optimizationRate: settings.optimizationRate || 0,
      totalSavings: settings.totalSavings || 0
    };
  }

  async analyzCurrentSite() {
    try {
      // Get current tab information
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = new URL(tab.url);
      const domain = url.hostname.replace('www.', '');

      this.currentSite = {
        domain: domain,
        title: tab.title,
        url: tab.url,
        ...this.getMerchantInfo(domain)
      };

      // Calculate card recommendation
      this.recommendedCard = this.calculateOptimalCard(this.currentSite.mcc || '5999');
      
    } catch (error) {
      console.error('Site analysis failed:', error);
      this.currentSite = {
        domain: 'unknown',
        title: 'Current Site',
        category: 'Shopping',
        mcc: '5999',
        icon: '🛒'
      };
      this.recommendedCard = this.calculateOptimalCard('5999');
    }
  }

  getMerchantInfo(domain) {
    const merchant = merchantDatabase[domain];
    if (merchant) {
      return merchant;
    }

    // Default categorization based on domain keywords
    if (domain.includes('food') || domain.includes('restaurant') || domain.includes('pizza')) {
      return { category: 'Restaurants', mcc: '5812', icon: '🍽️' };
    } else if (domain.includes('gas') || domain.includes('fuel')) {
      return { category: 'Gas Stations', mcc: '5541', icon: '⛽' };
    } else if (domain.includes('grocery') || domain.includes('market')) {
      return { category: 'Grocery', mcc: '5411', icon: '🥬' };
    } else if (domain.includes('travel') || domain.includes('hotel') || domain.includes('flight')) {
      return { category: 'Travel', mcc: '4722', icon: '✈️' };
    }

    return { category: 'Shopping', mcc: '5999', icon: '🛒' };
  }

  calculateOptimalCard(mcc, amount = 100) {
    let bestCard = null;
    let bestReward = 0;
    const alternatives = [];

    mockCards.forEach(card => {
      const rate = card.rewards.categories[mcc] || card.rewards.defaultRate;
      let reward = (amount * rate) / 100;

      if (card.rewards.type === 'points' && card.rewards.pointValue) {
        reward = reward * card.rewards.pointValue;
      }

      if (reward > bestReward) {
        if (bestCard) alternatives.push({ card: bestCard, reward: bestReward, rate: bestReward/amount*100 });
        bestCard = card;
        bestReward = reward;
      } else {
        alternatives.push({ card, reward, rate: reward/amount*100 });
      }
    });

    return {
      card: bestCard,
      reward: bestReward,
      rate: bestReward/amount*100,
      alternatives: alternatives.sort((a, b) => b.reward - a.reward)
    };
  }

  setupEventListeners() {
    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.toggleSettings();
    });

    document.getElementById('closeSettings').addEventListener('click', () => {
      this.toggleSettings();
    });

    // Card selection buttons
    document.getElementById('selectCardBtn').addEventListener('click', () => {
      this.selectRecommendedCard();
    });

    document.getElementById('manualSelectBtn').addEventListener('click', () => {
      this.showCardOptions();
    });

    // Auto-fill toggle
    document.getElementById('autoFillToggle').addEventListener('change', (e) => {
      this.updateAutoFillSetting(e.target.checked);
    });

    // Settings form
    document.getElementById('saveSettings').addEventListener('click', () => {
      this.saveSettings();
    });

    // Alternative card clicks  
    document.addEventListener('click', (e) => {
      if (e.target.closest('.alternative-card')) {
        const cardId = e.target.closest('.alternative-card').dataset.cardId;
        this.selectAlternativeCard(cardId);
      }
    });
  }

  updateUI() {
    // Update site information
    document.getElementById('siteName').textContent = this.currentSite.title;
    document.getElementById('siteCategory').textContent = this.currentSite.category;
    document.getElementById('siteIcon').textContent = this.currentSite.icon;

    // Update recommended card
    if (this.recommendedCard) {
      const card = this.recommendedCard.card;
      document.getElementById('cardName').textContent = card.name;
      document.getElementById('cardNumber').textContent = `•••• ${card.lastFour}`;
      document.getElementById('rewardRate').textContent = `${this.recommendedCard.rate.toFixed(1)}%`;
      document.getElementById('expectedReward').textContent = `$${this.recommendedCard.reward.toFixed(2)}`;
      
      // Update card visual color
      const cardElement = document.getElementById('recommendedCard');
      cardElement.style.background = `linear-gradient(135deg, ${card.color}, ${this.darkenColor(card.color, 20)})`;

      // Update reasoning
      document.getElementById('reasoning').textContent = this.generateReasoning(card, this.currentSite.mcc);

      // Update alternatives
      this.updateAlternatives();
    }

    // Update statistics
    document.getElementById('monthlyRewards').textContent = `$${this.userSettings.monthlyRewards.toFixed(2)}`;
    document.getElementById('optimizationRate').textContent = `${this.userSettings.optimizationRate}%`;
    document.getElementById('totalSavings').textContent = `$${this.userSettings.totalSavings.toFixed(2)}`;

    // Update settings
    document.getElementById('primaryGoal').value = this.userSettings.primaryGoal;
    document.getElementById('alertsEnabled').checked = this.userSettings.alertsEnabled;
    document.getElementById('autoOptimize').checked = this.userSettings.autoOptimize;
    document.getElementById('autoFillToggle').checked = this.userSettings.autoOptimize;
  }

  updateAlternatives() {
    const container = document.getElementById('alternativesList');
    container.innerHTML = '';

    this.recommendedCard.alternatives.slice(0, 2).forEach(alt => {
      const altElement = document.createElement('div');
      altElement.className = 'alternative-card';
      altElement.dataset.cardId = alt.card.id;
      
      altElement.innerHTML = `
        <div class="alternative-info">
          <div class="alternative-name">${alt.card.name}</div>
          <div class="alternative-rate">${alt.rate.toFixed(1)}% rewards</div>
        </div>
        <div class="alternative-reward">$${alt.reward.toFixed(2)}</div>
      `;
      
      container.appendChild(altElement);
    });
  }

  generateReasoning(card, mcc) {
    const rate = card.rewards.categories[mcc] || card.rewards.defaultRate;
    const hasBonus = card.rewards.categories[mcc] > card.rewards.defaultRate;
    
    let reasoning = hasBonus 
      ? `Earns ${rate}% rewards on ${this.currentSite.category.toLowerCase()}`
      : `Best available rate of ${rate}% for this purchase`;

    if (this.userSettings.primaryGoal === 'cashback' && card.rewards.type === 'cashback') {
      reasoning += ' • Aligns with your cashback goal';
    } else if (this.userSettings.primaryGoal === 'travel' && card.rewards.type === 'points') {
      reasoning += ' • Aligns with your travel goal';
    }

    return reasoning;
  }

  toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  }

  async selectRecommendedCard() {
    this.showStatus('Filling card information...', 'success');
    
    try {
      // Send message to content script to fill form
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, {
        action: 'fillCardInfo',
        card: this.recommendedCard.card
      });

      // Update statistics
      this.userSettings.monthlyRewards += this.recommendedCard.reward;
      await this.saveUserSettings();
      
      this.showStatus('Card information filled successfully!', 'success');
      setTimeout(() => window.close(), 1500);
      
    } catch (error) {
      console.error('Card selection failed:', error);
      this.showStatus('Failed to fill card information', 'error');
    }
  }

  showCardOptions() {
    // Create a simple card selection modal
    const options = mockCards.map(card => 
      `${card.name} (${card.lastFour})`
    ).join('\n');
    
    alert(`Available cards:\n\n${options}\n\nClick "Select This Card" to use the recommended option, or manage your cards in the Metapayd mobile app.`);
  }

  selectAlternativeCard(cardId) {
    const altCard = this.recommendedCard.alternatives.find(alt => alt.card.id === cardId);
    if (altCard) {
      // Update recommendation to selected alternative
      this.recommendedCard = {
        card: altCard.card,
        reward: altCard.reward,
        rate: altCard.rate,
        alternatives: this.recommendedCard.alternatives.filter(alt => alt.card.id !== cardId)
      };
      
      this.updateUI();
      this.showStatus(`Selected ${altCard.card.name}`, 'success');
    }
  }

  async updateAutoFillSetting(enabled) {
    this.userSettings.autoOptimize = enabled;
    await this.saveUserSettings();
  }

  async saveSettings() {
    this.userSettings.primaryGoal = document.getElementById('primaryGoal').value;
    this.userSettings.alertsEnabled = document.getElementById('alertsEnabled').checked;
    this.userSettings.autoOptimize = document.getElementById('autoOptimize').checked;
    
    await this.saveUserSettings();
    this.showStatus('Settings saved!', 'success');
    this.toggleSettings();
    
    // Recalculate recommendation with new settings
    this.recommendedCard = this.calculateOptimalCard(this.currentSite.mcc || '5999');
    this.updateUI();
  }

  async saveUserSettings() {
    await chrome.storage.sync.set(this.userSettings);
  }

  showStatus(message, type = 'info') {
    const statusEl = document.getElementById('statusMessage');
    const iconEl = document.getElementById('statusIcon');
    const textEl = document.getElementById('statusText');
    
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌'
    };
    
    iconEl.textContent = icons[type] || icons.info;
    textEl.textContent = message;
    statusEl.className = `status-message ${type}`;
    statusEl.style.display = 'flex';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  }

  darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const B = (num >> 8 & 0x00FF) - amt;
    const G = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
        (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + 
        (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
}); 