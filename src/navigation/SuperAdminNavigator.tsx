import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SuperAdminStackParamList } from './types';

// Placeholder screens (will be created later)
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
        name="Dashboard" 
        component={SettingsScreen} // Placeholder
      />
      <Stack.Screen 
        name="Vendors" 
        component={SettingsScreen} // Placeholder
      />
      <Stack.Screen 
        name="VendorDetails" 
        component={SettingsScreen} // Placeholder
      />
      <Stack.Screen 
        name="Plans" 
        component={SettingsScreen} // Placeholder
      />
      <Stack.Screen 
        name="ActivityLogs" 
        component={SettingsScreen} // Placeholder
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
      />
    </Stack.Navigator>
  );
}

