// Web-compatible storage service that mimics AsyncStorage
export class WebStorage {
  static async getItem(key) {
    try {
      const item = localStorage.getItem(key);
      return item;
    } catch (error) {
      console.error('WebStorage getItem error:', error);
      return null;
    }
  }

  static async setItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('WebStorage setItem error:', error);
      return false;
    }
  }

  static async removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('WebStorage removeItem error:', error);
      return false;
    }
  }

  static async clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('WebStorage clear error:', error);
      return false;
    }
  }

  static async getAllKeys() {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('WebStorage getAllKeys error:', error);
      return [];
    }
  }
}

// Export default to match AsyncStorage import pattern
export default WebStorage;