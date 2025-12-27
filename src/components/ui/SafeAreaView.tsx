import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaViewProps extends ViewProps {
  children: React.ReactNode;
  topInset?: boolean;
  bottomInset?: boolean;
  leftInset?: boolean;
  rightInset?: boolean;
}

/**
 * A View component that respects safe area insets
 * to prevent content from being covered by system UI elements
 */
export function SafeAreaView({
  children,
  style,
  topInset = true,
  bottomInset = true,
  leftInset = false,
  rightInset = false,
  ...props
}: SafeAreaViewProps) {
  const insets = useSafeAreaInsets();

  const viewStyle = [
    styles.container,
    topInset && { paddingTop: insets.top },
    bottomInset && { paddingBottom: insets.bottom },
    leftInset && { paddingLeft: insets.left },
    rightInset && { paddingRight: insets.right },
    style,
  ];

  return (
    <View style={viewStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});


