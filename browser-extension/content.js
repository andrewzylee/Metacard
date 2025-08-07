// Metapayd Browser Extension Content Script
// Handles payment form detection and auto-fill functionality

(function() {
  'use strict';

  class MetapaydContentScript {
    constructor() {
      this.paymentSelectors = {
        // Credit card number fields
        cardNumber: [
          'input[name*="card"]', 
          'input[id*="card"]',
          'input[name*="number"]',
          'input[id*="number"]',
          'input[placeholder*="card"]',
          'input[placeholder*="number"]',
          'input[autocomplete="cc-number"]',
          '[data-testid*="card"]',
          '[data-qa*="card"]'
        ],
        
        // Expiry fields
        expiry: [
          'input[name*="exp"]',
          'input[id*="exp"]', 
          'input[name*="date"]',
          'input[placeholder*="mm/yy"]',
          'input[placeholder*="expir"]',
          'input[autocomplete="cc-exp"]'
        ],
        
        // CVV fields
        cvv: [
          'input[name*="cvv"]',
          'input[id*="cvv"]',
          'input[name*="cvc"]',
          'input[name*="security"]',
          'input[placeholder*="cvv"]',
          'input[placeholder*="cvc"]',
          'input[autocomplete="cc-csc"]'
        ],
        
        // Name on card
        name: [
          'input[name*="name"]',
          'input[id*="name"]',
          'input[placeholder*="name"]',
          'input[autocomplete="cc-name"]'
        ]
      };

      this.detectedForms = [];
      this.init();
    }

    init() {
      // Set up message listener for popup communication
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        this.handleMessage(message, sender, sendResponse);
      });

      // Detect payment forms on page load
      this.detectPaymentForms();
      
      // Monitor for dynamically added forms
      this.observeFormChanges();
      
      // Inject notification styles
      this.injectStyles();
    }

    handleMessage(message, sender, sendResponse) {
      switch (message.action) {
        case 'fillCardInfo':
          this.fillCardInformation(message.card);
          sendResponse({ success: true });
          break;
          
        case 'detectForms':
          this.detectPaymentForms();
          sendResponse({ formsFound: this.detectedForms.length });
          break;
          
        case 'highlightForms':
          this.highlightPaymentForms();
          sendResponse({ success: true });
          break;
          
        default:
          sendResponse({ error: 'Unknown action' });
      }
    }

    detectPaymentForms() {
      this.detectedForms = [];
      
      // Look for forms containing payment fields
      const forms = document.querySelectorAll('form');
      
      forms.forEach(form => {
        const paymentFields = this.findPaymentFields(form);
        
        if (paymentFields.cardNumber || paymentFields.expiry || paymentFields.cvv) {
          this.detectedForms.push({
            form: form,
            fields: paymentFields,
            confidence: this.calculateConfidence(paymentFields)
          });
        }
      });

      // Also check for payment fields outside of forms (some SPAs)
      const paymentFields = this.findPaymentFields(document);
      if (paymentFields.cardNumber || paymentFields.expiry || paymentFields.cvv) {
        this.detectedForms.push({
          form: null,
          fields: paymentFields,
          confidence: this.calculateConfidence(paymentFields)
        });
      }

      // Sort by confidence
      this.detectedForms.sort((a, b) => b.confidence - a.confidence);
    }

    findPaymentFields(container) {
      const fields = {};
      
      Object.keys(this.paymentSelectors).forEach(fieldType => {
        const selectors = this.paymentSelectors[fieldType];
        
        for (const selector of selectors) {
          const element = container.querySelector(selector);
          if (element && this.isVisible(element)) {
            fields[fieldType] = element;
            break;
          }
        }
      });
      
      return fields;
    }

    calculateConfidence(fields) {
      let confidence = 0;
      
      if (fields.cardNumber) confidence += 40;
      if (fields.expiry) confidence += 30;
      if (fields.cvv) confidence += 20;
      if (fields.name) confidence += 10;
      
      return confidence;
    }

    isVisible(element) {
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             style.opacity !== '0' &&
             element.offsetWidth > 0 && 
             element.offsetHeight > 0;
    }

    fillCardInformation(card) {
      if (this.detectedForms.length === 0) {
        this.showNotification('No payment form detected on this page', 'error');
        return;
      }

      const bestForm = this.detectedForms[0];
      const fields = bestForm.fields;
      
      try {
        // Fill card number
        if (fields.cardNumber) {
          this.fillField(fields.cardNumber, this.formatCardNumber(card.network));
        }
        
        // Fill expiry (use mock expiry for demo)
        if (fields.expiry) {
          this.fillField(fields.expiry, '12/26');
        }
        
        // Fill CVV (use mock CVV for demo)
        if (fields.cvv) {
          this.fillField(fields.cvv, '123');
        }
        
        // Fill name (use mock name for demo)
        if (fields.name) {
          this.fillField(fields.name, 'Alex Johnson');
        }

        this.showNotification(`✅ ${card.name} information filled successfully!`, 'success');
        
        // Highlight filled fields briefly
        this.highlightFilledFields(fields);
        
      } catch (error) {
        console.error('Error filling card information:', error);
        this.showNotification('❌ Failed to fill card information', 'error');
      }
    }

    fillField(field, value) {
      // Focus the field
      field.focus();
      
      // Clear existing value
      field.value = '';
      
      // Set new value
      field.value = value;
      
      // Trigger events to notify the page
      const events = ['input', 'change', 'keyup', 'blur'];
      events.forEach(eventType => {
        const event = new Event(eventType, { bubbles: true });
        field.dispatchEvent(event);
      });
    }

    formatCardNumber(network) {
      // Return mock card numbers for demo (in real app, would use tokenized data)
      const mockNumbers = {
        'Visa': '4532 1234 5678 9012',
        'Mastercard': '5555 1234 5678 9012', 
        'American Express': '3782 123456 78901',
        'Discover': '6011 1234 5678 9012'
      };
      
      return mockNumbers[network] || '4532 1234 5678 9012';
    }

    highlightPaymentForms() {
      this.detectedForms.forEach(formData => {
        Object.values(formData.fields).forEach(field => {
          if (field) {
            field.style.outline = '2px solid #4A90E2';
            field.style.outlineOffset = '2px';
            
            setTimeout(() => {
              field.style.outline = '';
              field.style.outlineOffset = '';
            }, 3000);
          }
        });
      });
    }

    highlightFilledFields(fields) {
      Object.values(fields).forEach(field => {
        if (field) {
          field.style.backgroundColor = '#E8F5E8';
          field.style.border = '2px solid #4CAF50';
          
          setTimeout(() => {
            field.style.backgroundColor = '';
            field.style.border = '';
          }, 2000);
        }
      });
    }

    observeFormChanges() {
      const observer = new MutationObserver((mutations) => {
        let shouldRedetect = false;
        
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'FORM' || node.querySelector && node.querySelector('form')) {
                  shouldRedetect = true;
                }
              }
            });
          }
        });
        
        if (shouldRedetect) {
          setTimeout(() => this.detectPaymentForms(), 500);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    injectStyles() {
      const styles = `
        .metapayd-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          border-radius: 8px;
          padding: 16px 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          max-width: 300px;
          border-left: 4px solid #4A90E2;
          animation: slideInRight 0.3s ease-out;
        }
        
        .metapayd-notification.success {
          border-left-color: #4CAF50;
        }
        
        .metapayd-notification.error {
          border-left-color: #F44336;
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .metapayd-form-indicator {
          position: absolute;
          top: -30px;
          left: 0;
          background: #4A90E2;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          z-index: 1000;
        }
      `;
      
      const styleSheet = document.createElement('style');
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }

    showNotification(message, type = 'info') {
      // Remove existing notifications
      const existing = document.querySelectorAll('.metapayd-notification');
      existing.forEach(el => el.remove());
      
      // Create new notification
      const notification = document.createElement('div');
      notification.className = `metapayd-notification ${type}`;
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      // Auto-remove after 4 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 4000);
    }

    // Public method to get form detection status
    getDetectionStatus() {
      return {
        formsDetected: this.detectedForms.length,
        bestConfidence: this.detectedForms.length > 0 ? this.detectedForms[0].confidence : 0,
        pageUrl: window.location.href,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Initialize content script
  const metapaydScript = new MetapaydContentScript();
  
  // Make available globally for debugging
  window.metapaydScript = metapaydScript;

})(); 