import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SuperAdminStackParamList } from './types';
import { SuperAdminTabNavigator } from './SuperAdminTabNavigator';

// Placeholder for vendor details (will be created later)
import { SettingsScreen } from '../screens/vendor/SettingsScreen';

const Stack = createStackNavigator<SuperAdminStackParamList>();

export function SuperAdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={SuperAdminTabNavigator}
      />
      <Stack.Screen 
        name="VendorDetails" 
        component={SettingsScreen} // Placeholder - will be replaced with VendorDetailScreen
      />
    </Stack.Navigator>
  );
}

