import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { VendorStackParamList } from './types';
import { VendorTabNavigator } from './VendorTabNavigator';
import { SettingsScreen } from '../screens/vendor/SettingsScreen';
import { ResortDetailScreen } from '../screens/vendor/ResortDetailScreen';

const Stack = createStackNavigator<VendorStackParamList>();

export function VendorNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={VendorTabNavigator} />
      {/* Additional stack screens for details, forms, etc. */}
      <Stack.Screen 
        name="Rooms" 
        component={ResortDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ headerShown: true, title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}

