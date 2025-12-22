import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Searchbar,
  FAB,
  Chip,
  IconButton,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { getResorts } from '../../services/resorts';
import { Resort } from '../../types';
import { formatDate } from '../../utils/formatters';

export function ResortsScreen() {
  const navigation = useNavigation();
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [filteredResorts, setFilteredResorts] = useState<Resort[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadResorts();
  }, []);

  useEffect(() => {
    filterResorts();
  }, [searchQuery, statusFilter, resorts]);

  const loadResorts = async () => {
    try {
      setLoading(true);
      const { resorts: data } = await getResorts();
      setResorts(data || []);
    } catch (error) {
      console.error('Error loading resorts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResorts = () => {
    let filtered = [...resorts];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (r) => r.status === statusFilter
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.location.toLowerCase().includes(query) ||
          (r.description || '').toLowerCase().includes(query)
      );
    }

    setFilteredResorts(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadResorts();
    setRefreshing(false);
  };

  const handleResortPress = (resort: Resort) => {
    // Navigate to resort details
    navigation.navigate('Rooms' as never, { resortId: String(resort.id) } as never);
  };

  const handleAddResort = () => {
    // Navigate to add resort screen (to be implemented)
    console.log('Add resort pressed');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading resorts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search resorts..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {/* Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <Chip
          selected={statusFilter === 'all'}
          onPress={() => setStatusFilter('all')}
          style={styles.chip}
        >
          All ({resorts.length})
        </Chip>
        <Chip
          selected={statusFilter === 'active'}
          onPress={() => setStatusFilter('active')}
          style={styles.chip}
        >
          Active ({resorts.filter((r) => r.status === 'active').length})
        </Chip>
        <Chip
          selected={statusFilter === 'inactive'}
          onPress={() => setStatusFilter('inactive')}
          style={styles.chip}
        >
          Inactive ({resorts.filter((r) => r.status === 'inactive').length})
        </Chip>
      </ScrollView>

      {/* Resorts List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredResorts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="home-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text variant="titleLarge" style={styles.emptyTitle}>
              No resorts found
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first resort'}
            </Text>
          </View>
        ) : (
          filteredResorts.map((resort) => (
            <ResortCard
              key={resort.id}
              resort={resort}
              onPress={() => handleResortPress(resort)}
            />
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddResort}
        label="Add Resort"
      />
    </View>
  );
}

interface ResortCardProps {
  resort: Resort;
  onPress: () => void;
}

function ResortCard({ resort, onPress }: ResortCardProps) {
  const statusColor =
    resort.status === 'active' ? colors.success : colors.textSecondary;

  return (
    <Card style={styles.resortCard} onPress={onPress}>
      <Card.Content>
        <View style={styles.resortHeader}>
          <View style={styles.resortInfo}>
            <Text variant="titleLarge" style={styles.resortName}>
              {resort.name}
            </Text>
            <View style={styles.resortMeta}>
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color={colors.textSecondary}
              />
              <Text variant="bodySmall" style={styles.resortLocation}>
                {resort.location}
              </Text>
            </View>
          </View>
          <Chip
            style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
            textStyle={{ color: statusColor, fontSize: 12 }}
          >
            {resort.status === 'active' ? 'Active' : 'Inactive'}
          </Chip>
        </View>

        {resort.description && (
          <Text
            variant="bodyMedium"
            style={styles.resortDescription}
            numberOfLines={2}
          >
            {resort.description}
          </Text>
        )}

        {resort.amenities && resort.amenities.length > 0 && (
          <View style={styles.amenitiesContainer}>
            {resort.amenities.slice(0, 3).map((amenity, index) => (
              <Chip key={index} style={styles.amenityChip} compact>
                {amenity}
              </Chip>
            ))}
            {resort.amenities.length > 3 && (
              <Text variant="bodySmall" style={styles.moreAmenities}>
                +{resort.amenities.length - 3} more
              </Text>
            )}
          </View>
        )}

        <View style={styles.resortFooter}>
          <IconButton
            icon="chevron-right"
            size={20}
            iconColor={colors.primary}
            onPress={onPress}
          />
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: colors.surface,
  },
  searchbar: {
    elevation: 2,
  },
  filterContainer: {
    maxHeight: 60,
    backgroundColor: colors.surface,
    paddingBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
  listContainer: {
    flex: 1,
    padding: 16,
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
    color: colors.text,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    paddingHorizontal: 32,
  },
  resortCard: {
    marginBottom: 16,
    elevation: 2,
  },
  resortHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resortInfo: {
    flex: 1,
    marginRight: 8,
  },
  resortName: {
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  resortMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resortLocation: {
    marginLeft: 4,
    color: colors.textSecondary,
  },
  statusChip: {
    height: 24,
  },
  resortDescription: {
    color: colors.textSecondary,
    marginBottom: 12,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
  },
  amenityChip: {
    marginRight: 4,
    marginBottom: 4,
    height: 24,
  },
  moreAmenities: {
    color: colors.textSecondary,
    marginLeft: 4,
  },
  resortFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});
