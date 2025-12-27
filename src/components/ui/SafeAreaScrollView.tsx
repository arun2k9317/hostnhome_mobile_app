import React from 'react';
import { ScrollView, ScrollViewProps, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  topInset?: boolean;
  bottomInset?: boolean;
}

/**
 * A ScrollView component that respects safe area insets
 * to prevent content from being covered by system UI elements
 * (notification bar, home indicator, etc.)
 */
export function SafeAreaScrollView({
  children,
  style,
  contentContainerStyle,
  topInset = true,
  bottomInset = true,
  ...props
}: SafeAreaScrollViewProps) {
  const insets = useSafeAreaInsets();

  const scrollViewStyle = [
    styles.container,
    topInset && { paddingTop: insets.top },
    bottomInset && { paddingBottom: insets.bottom },
    style,
  ];

  const contentStyle = [
    contentContainerStyle,
    // Add extra padding if needed for content
  ];

  return (
    <ScrollView
      style={scrollViewStyle}
      contentContainerStyle={contentStyle}
      {...props}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});


