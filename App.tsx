import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import 'react-native-gesture-handler';
// Note: react-native-reanimated is not compatible with Expo Go
// It requires a development build. Navigation will work with reduced animations.

export default function App() {
  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}
