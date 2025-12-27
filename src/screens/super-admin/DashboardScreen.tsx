import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { SafeAreaScrollView } from '../../components/ui/SafeAreaScrollView';

export function SuperAdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <SafeAreaScrollView style={styles.scrollView} bottomInset={false}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
            Super Admin Dashboard
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Platform management and analytics
          </Text>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.statCardContent}>
                <MaterialCommunityIcons name="office-building" size={32} color={theme.colors.primary} />
                <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  0
                </Text>
                <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Total Vendors
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.statCardContent}>
                <MaterialCommunityIcons name="package-variant" size={32} color={theme.colors.primary} />
                <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  0
                </Text>
                <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Subscription Plans
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.statCardContent}>
                <MaterialCommunityIcons name="home-group" size={32} color={theme.colors.primary} />
                <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  0
                </Text>
                <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Total Resorts
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.statCardContent}>
                <MaterialCommunityIcons name="account-group" size={32} color={theme.colors.primary} />
                <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  0
                </Text>
                <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Total Staff
                </Text>
              </Card.Content>
            </Card>
          </View>

          {/* Quick Actions */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Quick Actions
              </Text>
              <View style={styles.actionsContainer}>
                <Surface style={[styles.actionItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <MaterialCommunityIcons name="office-building-plus" size={24} color={theme.colors.primary} />
                  <Text variant="bodySmall" style={[styles.actionLabel, { color: theme.colors.onSurface }]}>
                    Manage Vendors
                  </Text>
                </Surface>
                <Surface style={[styles.actionItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <MaterialCommunityIcons name="package-variant-closed" size={24} color={theme.colors.primary} />
                  <Text variant="bodySmall" style={[styles.actionLabel, { color: theme.colors.onSurface }]}>
                    Manage Plans
                  </Text>
                </Surface>
                <Surface style={[styles.actionItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <MaterialCommunityIcons name="file-document-multiple" size={24} color={theme.colors.primary} />
                  <Text variant="bodySmall" style={[styles.actionLabel, { color: theme.colors.onSurface }]}>
                    Activity Logs
                  </Text>
                </Surface>
              </View>
            </Card.Content>
          </Card>

          {/* Welcome Message */}
          <Surface style={[styles.welcomeCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons name="shield-crown" size={32} color={theme.colors.primary} />
            <Text variant="titleLarge" style={[styles.welcomeTitle, { color: theme.colors.onPrimaryContainer }]}>
              Welcome, Super Admin!
            </Text>
            <Text variant="bodyMedium" style={[styles.welcomeText, { color: theme.colors.onPrimaryContainer }]}>
              Manage vendors, subscription plans, and monitor platform activity.
            </Text>
          </Surface>
        </View>
      </SafeAreaScrollView>
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
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    marginHorizontal: -8,
  },
  statCard: {
    width: '47%',
    margin: 8,
    borderRadius: 16,
    elevation: 2,
  },
  statCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '700',
  },
  statLabel: {
    textAlign: 'center',
    fontSize: 12,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  actionItem: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
  },
  actionLabel: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
  },
  welcomeCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  welcomeTitle: {
    marginTop: 12,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  welcomeText: {
    textAlign: 'center',
  },
});

