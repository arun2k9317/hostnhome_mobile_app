import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

export function ActivityLogsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      // TODO: Implement activity logs fetching service
      setLogs([]);
    } catch (error) {
      console.error('Error loading activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>Loading activity logs...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
            Activity Logs
          </Text>

          {logs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="file-document-multiple-outline"
                size={64}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="titleLarge" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                No activity logs
              </Text>
              <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                Platform activity will be logged here
              </Text>
            </View>
          ) : (
            logs.map((log) => (
              <Card key={log.id} style={[styles.logCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                  <Text variant="bodyMedium" style={[styles.logText, { color: theme.colors.onSurface }]}>
                    {log.description}
                  </Text>
                  <Text variant="bodySmall" style={[styles.logDate, { color: theme.colors.onSurfaceVariant }]}>
                    {log.created_at}
                  </Text>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
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
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  logCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
  },
  logText: {
    marginBottom: 4,
  },
  logDate: {
    fontSize: 12,
  },
});

