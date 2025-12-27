import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Searchbar,
  Chip,
  IconButton,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { getBookings } from '../../services/bookings';
import { Booking } from '../../types';
import { formatCurrency, formatDate, formatDateRange } from '../../utils/formatters';

export function BookingsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchQuery, statusFilter, bookings]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const { bookings: data } = await getBookings();
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          (b.guestName || b.guest_name || '').toLowerCase().includes(query) ||
          b.email.toLowerCase().includes(query) ||
          b.phone.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const handleBookingPress = (booking: Booking) => {
    navigation.navigate('BookingDetails' as never, { bookingId: String(booking.id) } as never);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'cancelled':
        return colors.error;
      case 'completed':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search bookings..."
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
        {statusOptions.map((option) => (
          <Chip
            key={option.value}
            selected={statusFilter === option.value}
            onPress={() => setStatusFilter(option.value)}
            style={styles.chip}
          >
            {option.label} (
            {option.value === 'all'
              ? bookings.length
              : bookings.filter((b) => b.status === option.value).length}
            )
          </Chip>
        ))}
      </ScrollView>

      {/* Bookings List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="calendar-check-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text variant="titleLarge" style={styles.emptyTitle}>
              No bookings found
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Bookings will appear here once created'}
            </Text>
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onPress={() => handleBookingPress(booking)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
}

function BookingCard({ booking, onPress }: BookingCardProps) {
  const statusColor =
    booking.status === 'confirmed'
      ? colors.success
      : booking.status === 'pending'
      ? colors.warning
      : booking.status === 'cancelled'
      ? colors.error
      : colors.info;

  const guestName = booking.guestName || booking.guest_name || 'Unknown Guest';
  const checkIn = booking.checkIn || booking.check_in || '';
  const checkOut = booking.checkOut || booking.check_out || '';
  const totalAmount = booking.totalAmount || booking.total_amount || 0;
  const paidAmount = booking.paidAmount || booking.paid_amount || 0;
  const paymentStatus = booking.paymentStatus || booking.payment_status || 'pending';

  return (
    <Card style={styles.bookingCard} onPress={onPress}>
      <Card.Content style={styles.bookingCardContent}>
        <View style={styles.bookingHeader}>
          <View style={styles.bookingInfo}>
            <Text variant="titleMedium" style={styles.guestName}>
              {guestName}
            </Text>
            <Text variant="bodySmall" style={styles.bookingMeta}>
              {checkIn && checkOut ? formatDateRange(checkIn, checkOut) : 'Dates TBD'}
            </Text>
          </View>
          <Chip
            style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
            textStyle={{ color: statusColor, fontSize: 11 }}
            compact
          >
            {booking.status}
          </Chip>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.bookingDetailRow}>
            <MaterialCommunityIcons
              name="account"
              size={16}
              color={colors.textSecondary}
            />
            <Text variant="bodySmall" style={styles.bookingDetailText}>
              {booking.adults} adults, {booking.children} children
            </Text>
          </View>
          <View style={styles.bookingDetailRow}>
            <MaterialCommunityIcons
              name="home"
              size={16}
              color={colors.textSecondary}
            />
            <Text variant="bodySmall" style={styles.bookingDetailText}>
              {booking.rooms} room{booking.rooms !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.bookingDetailRow}>
            <MaterialCommunityIcons
              name="currency-usd"
              size={16}
              color={colors.textSecondary}
            />
            <Text variant="bodySmall" style={styles.bookingDetailText}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
        </View>

        <View style={styles.paymentInfo}>
          <Text variant="bodySmall" style={styles.paymentLabel}>
            Payment:
          </Text>
          <Text
            variant="bodySmall"
            style={[
              styles.paymentStatus,
              {
                color:
                  paymentStatus === 'paid'
                    ? colors.success
                    : paymentStatus === 'partial'
                    ? colors.warning
                    : colors.textSecondary,
              },
            ]}
          >
            {paymentStatus} ({formatCurrency(paidAmount)} / {formatCurrency(totalAmount)})
          </Text>
        </View>

        <View style={styles.bookingFooter}>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={colors.primary}
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
  bookingCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  bookingCardContent: {
    padding: 20,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  guestName: {
    fontWeight: '700',
    fontSize: 18,
    color: colors.text,
    marginBottom: 6,
    lineHeight: 24,
  },
  bookingMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  statusChip: {
    height: 28,
    borderRadius: 8,
  },
  bookingDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  bookingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookingDetailText: {
    color: colors.textSecondary,
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 8,
  },
  paymentLabel: {
    color: colors.textSecondary,
  },
  paymentStatus: {
    fontWeight: '600',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
