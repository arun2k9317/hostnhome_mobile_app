import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VendorTabParamList } from './types';
import { lightTheme } from '../theme/paperTheme';

// Screens (will be created)
import { DashboardScreen } from '../screens/vendor/DashboardScreen';
import { ResortsScreen } from '../screens/vendor/ResortsScreen';
import { BookingsScreen } from '../screens/vendor/BookingsScreen';
import { QuotationsScreen } from '../screens/vendor/QuotationsScreen';
import { MoreScreen } from '../screens/vendor/MoreScreen';

const Tab = createBottomTabNavigator<VendorTabParamList>();

export function VendorTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: lightTheme.colors.primary,
        tabBarInactiveTintColor: lightTheme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: lightTheme.colors.surface,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={Number(size) || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Resorts"
        component={ResortsScreen}
        options={{
          tabBarLabel: 'Resorts',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={Number(size) || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-check" size={Number(size) || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Quotations"
        component={QuotationsScreen}
        options={{
          tabBarLabel: 'Quotations',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document-outline" size={Number(size) || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="menu" size={Number(size) || 24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

