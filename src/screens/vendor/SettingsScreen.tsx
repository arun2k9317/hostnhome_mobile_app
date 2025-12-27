import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, List, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { useTheme as useThemeContext } from '../../theme/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import type { ThemeMode } from '../../theme/ThemeContext';

const APP_VERSION = '1.0.0'; // From package.json

export function SettingsScreen() {
  const { signOut } = useAuth();
  const theme = useTheme();
  const themeContext = useThemeContext();
  const insets = useSafeAreaInsets();

  // Safely get theme values with fallback
  const themeMode = themeContext?.themeMode || 'auto';
  const setThemeMode = themeContext?.setThemeMode || (() => {});

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Settings
        </Text>

        {/* Appearance Section */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Appearance
            </Text>
            <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
            
            <List.Item
              title="Theme"
              description={themeMode === 'auto' ? 'Follow system' : themeMode === 'dark' ? 'Dark' : 'Light'}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={() => (
                    <MaterialCommunityIcons
                      name="theme-light-dark"
                      size={24}
                      color={theme.colors.primary}
                    />
                  )}
                />
              )}
              titleStyle={{ color: theme.colors.onSurface }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              style={styles.listItem}
            />
            
            <View style={styles.themeOptions}>
              <Button
                mode={themeMode === 'light' ? 'contained' : 'outlined'}
                onPress={() => handleThemeChange('light')}
                compact
                style={styles.themeButton}
                buttonColor={themeMode === 'light' ? theme.colors.primary : undefined}
              >
                Light
              </Button>
              <Button
                mode={themeMode === 'dark' ? 'contained' : 'outlined'}
                onPress={() => handleThemeChange('dark')}
                compact
                style={styles.themeButton}
                buttonColor={themeMode === 'dark' ? theme.colors.primary : undefined}
              >
                Dark
              </Button>
              <Button
                mode={themeMode === 'auto' ? 'contained' : 'outlined'}
                onPress={() => handleThemeChange('auto')}
                compact
                style={styles.themeButton}
                buttonColor={themeMode === 'auto' ? theme.colors.primary : undefined}
              >
                Auto
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Account Section */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Account
            </Text>
            <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
            
            <Button
              mode="contained"
              onPress={handleLogout}
              buttonColor={theme.colors.error}
              textColor={theme.colors.onError}
              style={styles.logoutButton}
              icon="logout"
              contentStyle={styles.logoutButtonContent}
            >
              Logout
            </Button>
          </Card.Content>
        </Card>

        {/* App Info Section */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              App Information
            </Text>
            <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
            
            <List.Item
              title="Version"
              description={APP_VERSION}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={() => (
                    <MaterialCommunityIcons
                      name="information"
                      size={24}
                      color={theme.colors.primary}
                    />
                  )}
                />
              )}
              titleStyle={{ color: theme.colors.onSurface }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  divider: {
    marginBottom: 16,
    marginTop: 8,
  },
  listItem: {
    paddingVertical: 4,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    justifyContent: 'center',
  },
  themeButton: {
    minWidth: 70,
    flex: 1,
  },
  logoutButton: {
    marginTop: 8,
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
});

