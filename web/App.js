import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import screens - using relative paths to the original source
import LoginScreen from '../src/screens/LoginScreen';
import HomeScreen from '../src/screens/HomeScreen';
import NFCPayScreen from '../src/screens/NFCPayScreen';
import AnalyticsScreen from '../src/screens/AnalyticsScreen';

// Import services
import { AuthService } from '../src/services/AuthService';

// Import our custom navigation
import { createBottomTabNavigator } from './navigation/TabNavigation';

const Tab = createBottomTabNavigator();

// Custom Tab Icon Component
const TabIcon = ({ icon, color, focused }) => (
  <View style={{ 
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: focused ? 1.1 : 1 }]
  }}>
    <Text style={{ 
      fontSize: 24, 
      color: color,
      opacity: focused ? 1 : 0.7
    }}>
      {icon}
    </Text>
  </View>
);

// Main Tab Navigation for Web
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#1A1A1A',
          borderTopWidth: 1,
          borderTopColor: '#333333',
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="🏠" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="SmartPay"
        component={NFCPayScreen}
        options={{
          tabBarLabel: 'Pay',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="📱" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="📊" color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Loading Screen Component
const LoadingScreen = () => (
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    height: '100vh'
  }}>
    <Text style={{ 
      fontSize: 32, 
      fontWeight: 'bold',
      color: '#4A90E2',
      marginBottom: 16 
    }}>
      Metapayd
    </Text>
    <Text style={{ 
      fontSize: 16, 
      color: '#CCCCCC',
      marginBottom: 8 
    }}>
      AI-Powered Smart Wallet
    </Text>
    <Text style={{ 
      fontSize: 14, 
      color: '#666666' 
    }}>
      Initializing...
    </Text>
  </View>
);

// Main App Component for Web
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // For demo purposes, let's auto-authenticate after a short delay
      setTimeout(() => {
        setIsAuthenticated(true);
        setUser({ name: 'Demo User', email: 'demo@metapayd.com' });
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoading(false);
    }
  };

  const handleLogin = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000000', height: '100vh' }}>
      <Routes>
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? (
              <LoginScreen onLogin={handleLogin} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/*" 
          element={
            isAuthenticated ? (
              <MainTabs />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </View>
  );
};

export default App;