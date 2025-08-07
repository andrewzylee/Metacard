// Metapayd Browser Extension Background Service Worker

class MetapaydBackground {
  constructor() {
    this.init();
  }

  init() {
    // Set up extension event listeners
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstall(details);
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });

    chrome.action.onClicked.addListener((tab) => {
      this.handleActionClick(tab);
    });

    // Message handling from content scripts and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });

    // Set up periodic sync with mobile app (if available)
    this.setupPeriodicSync();
  }

  handleInstall(details) {
    if (details.reason === 'install') {
      // First-time installation
      this.setDefaultSettings();
      this.showWelcomeNotification();
    } else if (details.reason === 'update') {
      // Extension updated
      console.log('Metapayd extension updated to version', chrome.runtime.getManifest().version);
    }
  }

  async setDefaultSettings() {
    const defaultSettings = {
      primaryGoal: 'cashback',
      alertsEnabled: true,
      autoOptimize: true,
      monthlyRewards: 0,
      optimizationRate: 0,
      totalSavings: 0,
      installDate: new Date().toISOString(),
      version: chrome.runtime.getManifest().version
    };

    await chrome.storage.sync.set(defaultSettings);
  }

  showWelcomeNotification() {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Metapayd Smart Selector',
      message: 'Welcome! Click the extension icon while shopping to get optimal card recommendations.'
    });
  }

  handleTabUpdate(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url) {
      // Check if this is a shopping site
      this.analyzePageForShopping(tab);
    }
  }

  async analyzePageForShopping(tab) {
    const shoppingIndicators = [
      'cart', 'checkout', 'buy', 'purchase', 'shop', 'store', 
      'payment', 'billing', 'order', 'amazon', 'target', 
      'walmart', 'bestbuy', 'ebay'
    ];

    const url = tab.url.toLowerCase();
    const title = tab.title?.toLowerCase() || '';
    
    const isShopping = shoppingIndicators.some(indicator => 
      url.includes(indicator) || title.includes(indicator)
    );

    if (isShopping) {
      // Update badge to indicate shopping context
      chrome.action.setBadgeText({
        tabId: tab.id,
        text: '💳'
      });
      
      chrome.action.setBadgeBackgroundColor({
        tabId: tab.id,
        color: '#4A90E2'
      });

      // Check user settings for auto-notifications
      const settings = await chrome.storage.sync.get(['alertsEnabled', 'autoOptimize']);
      
      if (settings.alertsEnabled) {
        // Inject content script if not already present
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
        } catch (error) {
          // Content script might already be injected
          console.log('Content script injection skipped:', error.message);
        }
      }
    } else {
      // Clear badge for non-shopping sites
      chrome.action.setBadgeText({
        tabId: tab.id,
        text: ''
      });
    }
  }

  handleActionClick(tab) {
    // Open popup (this is handled automatically by manifest)
    // But we can track the interaction
    this.trackEvent('popup_opened', {
      url: tab.url,
      title: tab.title,
      timestamp: new Date().toISOString()
    });
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'syncWithMobileApp':
        this.syncWithMobileApp();
        sendResponse({ success: true });
        break;
        
      case 'trackEvent':
        this.trackEvent(message.event, message.data);
        sendResponse({ success: true });
        break;
        
      case 'getAnalytics':
        this.getAnalytics().then(data => sendResponse(data));
        return true; // Keep channel open for async response
        
      case 'updateSettings':
        this.updateSettings(message.settings).then(() => 
          sendResponse({ success: true })
        );
        return true;
        
      default:
        sendResponse({ error: 'Unknown action' });
    }
  }

  async syncWithMobileApp() {
    // In a real implementation, this would:
    // 1. Check if mobile app is available on the same network
    // 2. Sync card data, preferences, and transaction history
    // 3. Update local storage with latest data
    
    try {
      // Simulate sync process
      const syncData = await this.prepareSyncData();
      
      // For MVP, we'll just update local analytics
      await this.updateLocalAnalytics(syncData);
      
      console.log('Sync with mobile app completed');
      
      // Notify user of successful sync
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png', 
        title: 'Metapayd Sync',
        message: 'Successfully synced with mobile app!'
      });
      
    } catch (error) {
      console.error('Mobile app sync failed:', error);
    }
  }

  async prepareSyncData() {
    const data = await chrome.storage.sync.get([
      'monthlyRewards',
      'optimizationRate', 
      'totalSavings',
      'primaryGoal',
      'alertsEnabled'
    ]);
    
    return {
      ...data,
      browserUsage: await this.getBrowserUsageStats(),
      lastSync: new Date().toISOString()
    };
  }

  async getBrowserUsageStats() {
    // Get usage statistics from chrome storage
    const stats = await chrome.storage.local.get(['usage_stats']) || {};
    
    return {
      sessionsThisMonth: stats.sessionsThisMonth || 0,
      cardsRecommended: stats.cardsRecommended || 0, 
      formsAutofilled: stats.formsAutofilled || 0,
      sitesVisited: stats.sitesVisited || []
    };
  }

  async updateLocalAnalytics(syncData) {
    // Update analytics based on mobile app data
    const currentData = await chrome.storage.sync.get([
      'monthlyRewards',
      'optimizationRate',
      'totalSavings'
    ]);
    
    // Merge data (in real app, this would be more sophisticated)
    const updated = {
      monthlyRewards: Math.max(currentData.monthlyRewards || 0, syncData.monthlyRewards || 0),
      optimizationRate: syncData.optimizationRate || currentData.optimizationRate || 0,
      totalSavings: Math.max(currentData.totalSavings || 0, syncData.totalSavings || 0)
    };
    
    await chrome.storage.sync.set(updated);
  }

  async trackEvent(eventName, eventData = {}) {
    // Store analytics events for later processing
    const events = await chrome.storage.local.get(['analytics_events']) || { analytics_events: [] };
    
    events.analytics_events.push({
      event: eventName,
      data: eventData,
      timestamp: new Date().toISOString(),
      url: eventData.url || 'unknown'
    });
    
    // Keep only last 100 events to prevent storage bloat
    if (events.analytics_events.length > 100) {
      events.analytics_events = events.analytics_events.slice(-100);
    }
    
    await chrome.storage.local.set(events);
  }

  async getAnalytics() {
    const syncData = await chrome.storage.sync.get([
      'monthlyRewards',
      'optimizationRate', 
      'totalSavings'
    ]);
    
    const localData = await chrome.storage.local.get([
      'analytics_events',
      'usage_stats'
    ]);
    
    return {
      ...syncData,
      events: localData.analytics_events || [],
      usage: localData.usage_stats || {},
      generated: new Date().toISOString()
    };
  }

  async updateSettings(settings) {
    await chrome.storage.sync.set(settings);
    
    // Apply settings immediately
    if (settings.alertsEnabled === false) {
      // Clear any existing badges
      const tabs = await chrome.tabs.query({});
      tabs.forEach(tab => {
        chrome.action.setBadgeText({ tabId: tab.id, text: '' });
      });
    }
  }

  setupPeriodicSync() {
    // Set up alarm for periodic sync (every 4 hours)
    chrome.alarms.create('periodicSync', { 
      delayInMinutes: 240,
      periodInMinutes: 240 
    });
    
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'periodicSync') {
        this.syncWithMobileApp();
      }
    });
  }

  // Clean up old data periodically
  async cleanupOldData() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const events = await chrome.storage.local.get(['analytics_events']) || { analytics_events: [] };
    
    const filteredEvents = events.analytics_events.filter(event => 
      new Date(event.timestamp) > oneWeekAgo
    );
    
    await chrome.storage.local.set({ analytics_events: filteredEvents });
  }
}

// Initialize background service
const metapaydBackground = new MetapaydBackground();

// Make available for debugging
self.metapaydBackground = metapaydBackground; 