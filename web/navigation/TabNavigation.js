import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigate, useLocation } from 'react-router-dom';

// Mock Tab Navigator that mimics React Navigation behavior
export const createBottomTabNavigator = () => {
  return {
    Navigator: ({ children, screenOptions }) => {
      const navigate = useNavigate();
      const location = useLocation();
      
      // Extract screens from children
      const screens = React.Children.toArray(children);
      const currentPath = location.pathname;
      
      return (
        <View style={{ flex: 1, backgroundColor: '#000000' }}>
          {/* Content Area */}
          <View style={{ flex: 1 }}>
            {screens.map((screen) => {
              const routePath = getPathFromScreenName(screen.props.name);
              if (currentPath === routePath || (currentPath === '/' && screen.props.name === 'Home')) {
                return React.createElement(screen.props.component, { key: screen.props.name });
              }
              return null;
            })}
          </View>
          
          {/* Tab Bar */}
          <View style={[{
            flexDirection: 'row',
            backgroundColor: '#1A1A1A',
            borderTopWidth: 1,
            borderTopColor: '#333333',
            height: 65,
            paddingBottom: 10,
            paddingTop: 10,
          }, screenOptions?.tabBarStyle]}>
            {screens.map((screen) => {
              const routePath = getPathFromScreenName(screen.props.name);
              const isActive = currentPath === routePath || (currentPath === '/' && screen.props.name === 'Home');
              const tabBarLabel = screen.props.options?.tabBarLabel || screen.props.name;
              
              return (
                <TouchableOpacity
                  key={screen.props.name}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => navigate(routePath)}
                >
                  {screen.props.options?.tabBarIcon && 
                    screen.props.options.tabBarIcon({
                      color: isActive ? '#4A90E2' : '#666666',
                      focused: isActive
                    })
                  }
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: isActive ? '#4A90E2' : '#666666',
                    marginTop: 4
                  }}>
                    {tabBarLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      );
    },
    Screen: ({ name, component, options }) => null, // Placeholder - handled by Navigator
  };
};

// Helper function to convert screen names to paths
const getPathFromScreenName = (screenName) => {
  const pathMap = {
    'Home': '/',
    'SmartPay': '/pay',
    'Analytics': '/analytics'
  };
  return pathMap[screenName] || `/${screenName.toLowerCase()}`;
};