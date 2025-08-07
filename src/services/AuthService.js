// Basic Authentication Service for Metapayd MVP
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockUser } from '../data/mockData';

export class AuthService {
  static TOKEN_KEY = '@metapayd_token';
  static USER_KEY = '@metapayd_user';

  /**
   * Simulate login with email and password
   * @param {string} email 
   * @param {string} password 
   * @returns {Object} Login response
   */
  static async login(email, password) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Demo credentials for MVP
      const validCredentials = [
        { email: 'demo@metapayd.com', password: 'demo123' },
        { email: 'alex@metapayd.com', password: 'password' },
        { email: 'user@example.com', password: '123456' }
      ];

      const isValid = validCredentials.some(
        cred => cred.email.toLowerCase() === email.toLowerCase() && cred.password === password
      );

      if (!isValid) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Generate mock JWT token
      const token = this.generateMockToken(email);
      
      // Store token and user data
      await AsyncStorage.setItem(this.TOKEN_KEY, token);
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(mockUser));

      return {
        success: true,
        token,
        user: mockUser
      };

    } catch (error) {
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  }

  /**
   * Create account with email and password
   * @param {string} email 
   * @param {string} password 
   * @param {string} name 
   * @returns {Object} Registration response
   */
  static async register(email, password, name) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          error: 'Please enter a valid email address'
        };
      }

      // Password validation
      if (password.length < 6) {
        return {
          success: false,
          error: 'Password must be at least 6 characters long'
        };
      }

      // Create new user object
      const newUser = {
        ...mockUser,
        id: `user_${Date.now()}`,
        email: email.toLowerCase(),
        name: name,
        createdAt: new Date().toISOString(),
        totalSavings: 0
      };

      // Generate token
      const token = this.generateMockToken(email);
      
      // Store token and user data
      await AsyncStorage.setItem(this.TOKEN_KEY, token);
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(newUser));

      return {
        success: true,
        token,
        user: newUser
      };

    } catch (error) {
      return {
        success: false,
        error: 'Registration failed. Please try again.'
      };
    }
  }

  /**
   * Logout user and clear stored data
   */
  static async logout() {
    try {
      await AsyncStorage.multiRemove([this.TOKEN_KEY, this.USER_KEY]);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  }

  /**
   * Check if user is authenticated
   * @returns {Object} Authentication status
   */
  static async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem(this.TOKEN_KEY);
      const userStr = await AsyncStorage.getItem(this.USER_KEY);
      
      if (!token || !userStr) {
        return { authenticated: false };
      }

      // Verify token is not expired (in real app, check with server)
      const tokenData = this.parseToken(token);
      if (tokenData.exp < Date.now()) {
        // Token expired, logout
        await this.logout();
        return { authenticated: false };
      }

      const user = JSON.parse(userStr);
      return {
        authenticated: true,
        user,
        token
      };

    } catch (error) {
      return { authenticated: false };
    }
  }

  /**
   * Get current user from storage
   */
  static async getCurrentUser() {
    try {
      const userStr = await AsyncStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Update user profile
   * @param {Object} updates 
   */
  static async updateUserProfile(updates) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not found' };
      }

      const updatedUser = { ...currentUser, ...updates };
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));

      return {
        success: true,
        user: updatedUser
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update profile'
      };
    }
  }

  /**
   * Reset password (simulate email sent)
   * @param {string} email 
   */
  static async resetPassword(email) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, this would send an email
      return {
        success: true,
        message: 'Password reset instructions sent to your email'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to send reset email'
      };
    }
  }

  /**
   * Generate mock JWT token for demo
   * @private
   */
  static generateMockToken(email) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      email,
      exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      iat: Date.now()
    }));
    const signature = btoa('mock_signature');
    
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Parse mock JWT token
   * @private
   */
  static parseToken(token) {
    try {
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      return { exp: 0 };
    }
  }

  /**
   * Simulate biometric authentication check
   */
  static async checkBiometricAvailability() {
    // In a real app, this would check device biometric capabilities
    return {
      available: true,
      biometryType: 'fingerprint', // or 'face', 'none'
      error: null
    };
  }

  /**
   * Simulate biometric authentication
   */
  static async authenticateWithBiometric() {
    try {
      // Simulate biometric auth delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo, randomly succeed/fail
      const success = Math.random() > 0.2; // 80% success rate
      
      if (success) {
        return {
          success: true,
          message: 'Biometric authentication successful'
        };
      } else {
        return {
          success: false,
          error: 'Biometric authentication failed'
        };
      }
         } catch (error) {
       return {
         success: false,
         error: error.code === 'UserCancel' ? 'Authentication cancelled' : 'Biometric authentication failed'
       };
     }
  }
} 