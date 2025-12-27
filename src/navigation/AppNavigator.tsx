import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from './types';

// Navigators
import { AuthNavigator } from './AuthNavigator';
import { VendorNavigator } from './VendorNavigator';
import { SuperAdminNavigator } from './SuperAdminNavigator';

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  // Debug logging
  if (user) {
    console.log('🚀 AppNavigator - User:', {
      id: user.id,
      email: user.email,
      role: user.role,
    });
    console.log('🚀 AppNavigator - Is super_admin?', user.role === 'super_admin');
    console.log('🚀 AppNavigator - Will route to:', user.role === 'super_admin' ? 'SuperAdmin' : 'Vendor');
  } else {
    console.log('🚀 AppNavigator - No user, routing to Auth');
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : user.role === 'super_admin' ? (
          <Stack.Screen name="SuperAdmin" component={SuperAdminNavigator} />
        ) : (
          <Stack.Screen name="Vendor" component={VendorNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

