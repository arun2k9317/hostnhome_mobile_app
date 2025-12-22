import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { lightTheme } from '../theme/paperTheme';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from './types';

// Navigators
import { AuthNavigator } from './AuthNavigator';
import { VendorNavigator } from './VendorNavigator';
import { SuperAdminNavigator } from './SuperAdminNavigator';

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={lightTheme.colors.primary} />
      </View>
    );
  }

  return (
    <PaperProvider theme={lightTheme}>
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
    </PaperProvider>
  );
}

