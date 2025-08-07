import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  Alert,
  Platform,
  View,
  Text
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import NFCPayScreen from './screens/NFCPayScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';

// Services
import { AuthService } from './services/AuthService';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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

// Dark theme configuration
const darkTheme = {
  dark: true,
  colors: {
    primary: '#4A90E2',
    background: '#000000',
    card: '#1A1A1A',
    text: '#FFFFFF',
    border: '#333333',
    notification: '#4A90E2',
  },
};

// Main Tab Navigation
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
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
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

// App Navigation Stack
const AppStack = ({ user, onLogout }) => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#000000' }
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen 
        name="NFCPay" 
        component={NFCPayScreen} 
        options={{ 
          presentation: 'modal',
          cardStyle: { backgroundColor: '#000000' }
        }}
      />
      <Stack.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{ 
          presentation: 'card',
          cardStyle: { backgroundColor: '#000000' }
        }}
      />
    </Stack.Navigator>
  );
};

// Loading Screen Component
const LoadingScreen = () => (
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000'
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

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authResult = await AuthService.isAuthenticated();
      
      if (authResult.authenticated) {
        setIsAuthenticated(true);
        setUser(authResult.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your Metapayd account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const result = await AuthService.logout();
            if (result.success) {
              setIsAuthenticated(false);
              setUser(null);
            }
          }
        }
      ]
    );
  };

  // Show loading screen while checking auth
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={darkTheme}>
      <StatusBar
        barStyle="light-content" // White text for dark theme
        backgroundColor="#000000"
        translucent={false}
      />
      
      {isAuthenticated ? (
        <AppStack user={user} onLogout={handleLogout} />
      ) : (
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            cardStyle: { backgroundColor: '#000000' }
          }}
        >
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default App; 