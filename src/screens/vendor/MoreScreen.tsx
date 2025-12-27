import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, List, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

export function MoreScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const menuItems = [
    {
      id: 'settings',
      title: 'Settings',
      icon: 'cog',
      onPress: () => navigation.navigate('Settings' as never),
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          More
        </Text>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.cardContent}>
            {menuItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <List.Item
                  title={item.title}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon={() => <MaterialCommunityIcons name={item.icon as any} size={24} color={theme.colors.primary} />}
                    />
                  )}
                  right={(props) => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.onSurfaceVariant}
                    />
                  )}
                  onPress={item.onPress}
                  titleStyle={{ color: theme.colors.onSurface }}
                  style={styles.listItem}
                />
                {index < menuItems.length - 1 && (
                  <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
                )}
              </React.Fragment>
            ))}
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
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    paddingVertical: 8,
  },
  listItem: {
    paddingVertical: 4,
  },
  divider: {
    marginVertical: 4,
  },
});

