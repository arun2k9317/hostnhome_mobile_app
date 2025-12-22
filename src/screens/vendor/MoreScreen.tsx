import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../../theme/colors';

export function MoreScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">More</Text>
      <Text variant="bodyMedium">More options screen coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
});

