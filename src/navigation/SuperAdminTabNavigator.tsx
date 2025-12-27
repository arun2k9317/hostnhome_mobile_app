import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { SuperAdminTabParamList } from './types';

// Super Admin Screens
import { SuperAdminDashboardScreen } from '../screens/super-admin/DashboardScreen';
import { VendorsScreen } from '../screens/super-admin/VendorsScreen';
import { PlansScreen } from '../screens/super-admin/PlansScreen';
import { ActivityLogsScreen } from '../screens/super-admin/ActivityLogsScreen';
import { SettingsScreen } from '../screens/vendor/SettingsScreen';

const Tab = createBottomTabNavigator<SuperAdminTabParamList>();

export function SuperAdminTabNavigator() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          paddingBottom: Math.max(insets.bottom, 8),
          height: 60 + Math.max(insets.bottom, 8),
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={SuperAdminDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={Number(size) || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Vendors"
        component={VendorsScreen}
        options={{
          tabBarLabel: 'Vendors',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="office-building" size={Number(size) || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Plans"
        component={PlansScreen}
        options={{
          tabBarLabel: 'Plans',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="package-variant" size={Number(size) || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ActivityLogs"
        component={ActivityLogsScreen}
        options={{
          tabBarLabel: 'Logs',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document-multiple" size={Number(size) || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={Number(size) || 24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

