import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  IconButton,
  Chip,
  FAB,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { getResortById, getRoomsByResort } from '../../services/resorts';
import { Resort, Room } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

type RouteParams = {
  Rooms: {
    resortId: string | number;
  };
};

export function ResortDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'Rooms'>>();
  const { resortId } = route.params;

  const [resort, setResort] = useState<Resort | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [resortId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [{ resort: resortData }, { rooms: roomsData }] = await Promise.all([
        getResortById(String(resortId)),
        getRoomsByResort(String(resortId)),
      ]);
      setResort(resortData);
      setRooms(roomsData || []);
    } catch (error) {
      console.error('Error loading resort details:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddRoom = () => {
    // Navigate to add room (to be implemented)
    console.log('Add room pressed');
  };

  const handleRoomPress = (room: Room) => {
    // Navigate to room details/edit (to be implemented)
    console.log('Room pressed:', room.id);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading resort details...</Text>
      </View>
    );
  }

  if (!resort) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
        <Text variant="titleLarge" style={styles.errorText}>
          Resort not found
        </Text>
        <Text variant="bodyMedium" style={styles.errorSubtext}>
          The resort you're looking for doesn't exist or has been removed.
        </Text>
      </View>
    );
  }

  const statusColor = resort.status === 'active' ? colors.success : colors.textSecondary;
  const availableRooms = rooms.filter((r) => r.availability_status === 'available').length;
  const bookedRooms = rooms.filter((r) => r.availability_status === 'booked').length;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            iconColor={colors.text}
          />
          <Text variant="headlineSmall" style={styles.headerTitle}>
            {resort.name}
          </Text>
          <View style={styles.headerRight}>
            <Chip
              style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
              textStyle={{ color: statusColor, fontSize: 12 }}
            >
              {resort.status === 'active' ? 'Active' : 'Inactive'}
            </Chip>
          </View>
        </View>

        {/* Resort Images */}
        {resort.images && resort.images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imagesContainer}
            contentContainerStyle={styles.imagesContent}
          >
            {resort.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.resortImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        {/* Resort Info */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color={colors.textSecondary}
              />
              <Text variant="bodyMedium" style={styles.location}>
                {resort.location}
              </Text>
            </View>

            {resort.description && (
              <>
                <Divider style={styles.divider} />
                <Text variant="bodyMedium" style={styles.description}>
                  {resort.description}
                </Text>
              </>
            )}

            {resort.amenities && resort.amenities.length > 0 && (
              <>
                <Divider style={styles.divider} />
                <Text variant="titleSmall" style={styles.sectionTitle}>
                  Amenities
                </Text>
                <View style={styles.amenitiesContainer}>
                  {resort.amenities.map((amenity, index) => (
                    <Chip key={index} style={styles.amenityChip} compact>
                      {amenity}
                    </Chip>
                  ))}
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Rooms Stats */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Room Statistics
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={styles.statValue}>
                  {rooms.length}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Total Rooms
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text
                  variant="headlineSmall"
                  style={[styles.statValue, { color: colors.success }]}
                >
                  {availableRooms}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Available
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text
                  variant="headlineSmall"
                  style={[styles.statValue, { color: colors.info }]}
                >
                  {bookedRooms}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Booked
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Rooms List */}
        <Card style={styles.roomsCard}>
          <Card.Title
            title="Rooms"
            subtitle={`${rooms.length} room${rooms.length !== 1 ? 's' : ''} available`}
            right={(props) => (
              <IconButton
                {...props}
                icon="plus"
                size={24}
                iconColor={colors.primary}
                onPress={handleAddRoom}
              />
            )}
          />
          <Card.Content>
            {rooms.length === 0 ? (
              <View style={styles.emptyRoomsContainer}>
                <MaterialCommunityIcons
                  name="home-outline"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text variant="bodyMedium" style={styles.emptyRoomsText}>
                  No rooms added yet
                </Text>
                <Text variant="bodySmall" style={styles.emptyRoomsSubtext}>
                  Add your first room to get started
                </Text>
              </View>
            ) : (
              rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onPress={() => handleRoomPress(room)}
                />
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddRoom}
        label="Add Room"
      />
    </View>
  );
}

interface RoomCardProps {
  room: Room;
  onPress: () => void;
}

function RoomCard({ room, onPress }: RoomCardProps) {
  const statusColor =
    room.availability_status === 'available'
      ? colors.success
      : room.availability_status === 'booked'
      ? colors.info
      : colors.warning;

  const statusText =
    room.availability_status === 'available'
      ? 'Available'
      : room.availability_status === 'booked'
      ? 'Booked'
      : 'Maintenance';

  return (
    <Card style={styles.roomCard} onPress={onPress}>
      <Card.Content>
        <View style={styles.roomHeader}>
          <View style={styles.roomInfo}>
            <Text variant="titleMedium" style={styles.roomName}>
              {room.name}
            </Text>
            <Text variant="bodySmall" style={styles.roomType}>
              {room.type}
            </Text>
          </View>
          <Chip
            style={[styles.roomStatusChip, { backgroundColor: statusColor + '20' }]}
            textStyle={{ color: statusColor, fontSize: 11 }}
            compact
          >
            {statusText}
          </Chip>
        </View>

        <View style={styles.roomDetails}>
          <View style={styles.roomDetailItem}>
            <MaterialCommunityIcons
              name="currency-usd"
              size={16}
              color={colors.textSecondary}
            />
            <Text variant="bodySmall" style={styles.roomDetailText}>
              {formatCurrency(room.price)}
            </Text>
          </View>
          <View style={styles.roomDetailItem}>
            <MaterialCommunityIcons
              name="account-group"
              size={16}
              color={colors.textSecondary}
            />
            <Text variant="bodySmall" style={styles.roomDetailText}>
              {room.capacity || room.maxGuests || 2} guests
            </Text>
          </View>
        </View>

        {room.description && (
          <Text
            variant="bodySmall"
            style={styles.roomDescription}
            numberOfLines={2}
          >
            {room.description}
          </Text>
        )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.background,
  },
  errorText: {
    marginTop: 16,
    color: colors.text,
    fontWeight: 'bold',
  },
  errorSubtext: {
    marginTop: 8,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  headerRight: {
    marginRight: 8,
  },
  statusChip: {
    height: 24,
  },
  imagesContainer: {
    maxHeight: 200,
  },
  imagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resortImage: {
    width: 300,
    height: 180,
    borderRadius: 12,
    marginRight: 12,
  },
  infoCard: {
    margin: 16,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    marginLeft: 8,
    color: colors.text,
  },
  divider: {
    marginVertical: 12,
  },
  description: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    marginBottom: 4,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    marginTop: 4,
    color: colors.textSecondary,
  },
  roomsCard: {
    margin: 16,
    marginBottom: 80,
  },
  emptyRoomsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyRoomsText: {
    marginTop: 16,
    color: colors.text,
  },
  emptyRoomsSubtext: {
    marginTop: 8,
    color: colors.textSecondary,
  },
  roomCard: {
    marginBottom: 12,
    elevation: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontWeight: 'bold',
    color: colors.text,
  },
  roomType: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  roomStatusChip: {
    height: 22,
  },
  roomDetails: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  roomDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roomDetailText: {
    color: colors.textSecondary,
  },
  roomDescription: {
    marginTop: 8,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});

