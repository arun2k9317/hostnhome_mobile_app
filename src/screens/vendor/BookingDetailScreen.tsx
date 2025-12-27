import React, { useState, useEffect } from 'react';
import { View, StyleSheet, RefreshControl, Linking } from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  IconButton,
  Chip,
  Button,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaScrollView } from '../../components/ui/SafeAreaScrollView';
import { colors } from '../../theme/colors';
import { getBookingById, updateBooking } from '../../services/bookings';
import { Booking } from '../../types';
import { formatCurrency, formatDate, formatDateRange } from '../../utils/formatters';

type RouteParams = {
  BookingDetails: {
    bookingId: string;
  };
};

export function BookingDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'BookingDetails'>>();
  const insets = useSafeAreaInsets();
  const { bookingId } = route.params;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const { booking: data } = await getBookingById(bookingId);
      setBooking(data);
    } catch (error) {
      console.error('Error loading booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBooking();
    setRefreshing(false);
  };

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
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

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return colors.success;
      case 'partial':
        return colors.warning;
      case 'pending':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
        <Text variant="titleLarge" style={styles.errorText}>
          Booking not found
        </Text>
        <Text variant="bodyMedium" style={styles.errorSubtext}>
          The booking you're looking for doesn't exist or has been removed.
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.backButton}>
          Go Back
        </Button>
      </View>
    );
  }

  const statusColor = getStatusColor(booking.status);
  const paymentStatusColor = getPaymentStatusColor(booking.paymentStatus || booking.payment_status || 'pending');
  const guestName = booking.guestName || booking.guest_name || 'Unknown Guest';
  const checkIn = booking.checkIn || booking.check_in || '';
  const checkOut = booking.checkOut || booking.check_out || '';
  const totalAmount = booking.totalAmount || booking.total_amount || 0;
  const paidAmount = booking.paidAmount || booking.paid_amount || 0;
  const paymentStatus = booking.paymentStatus || booking.payment_status || 'pending';
  const balance = totalAmount - paidAmount;

  // Calculate nights
  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          iconColor={colors.text}
        />
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Booking #{booking.id}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <SafeAreaScrollView
        style={styles.scrollView}
        bottomInset={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status Badge */}
        <Card style={styles.statusCard}>
          <Card.Content style={styles.statusContent}>
            <View style={styles.statusRow}>
              <Text variant="titleMedium" style={styles.statusLabel}>
                Status:
              </Text>
              <Chip
                style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
                textStyle={{ color: statusColor, fontWeight: 'bold' }}
              >
                {booking.status}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Guest Information */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="account"
                size={24}
                color={colors.primary}
              />
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Guest Information
              </Text>
            </View>
            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Name
              </Text>
              <Text variant="bodyLarge" style={styles.value}>
                {guestName}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Phone
              </Text>
              <Button
                mode="text"
                onPress={() => handlePhonePress(booking.phone)}
                icon="phone"
                textColor={colors.primary}
              >
                {booking.phone}
              </Button>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Email
              </Text>
              <Button
                mode="text"
                onPress={() => handleEmailPress(booking.email)}
                icon="email"
                textColor={colors.primary}
              >
                {booking.email}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Booking Details */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={24}
                color={colors.primary}
              />
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Booking Details
              </Text>
            </View>
            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Check-in
              </Text>
              <Text variant="bodyLarge" style={styles.value}>
                {checkIn ? formatDate(checkIn, 'dd MMM yyyy, hh:mm a') : 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Check-out
              </Text>
              <Text variant="bodyLarge" style={styles.value}>
                {checkOut ? formatDate(checkOut, 'dd MMM yyyy, hh:mm a') : 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Duration
              </Text>
              <Text variant="bodyLarge" style={styles.value}>
                {nights} night{nights !== 1 ? 's' : ''}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Rooms
              </Text>
              <Text variant="bodyLarge" style={styles.value}>
                {booking.rooms}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Guests
              </Text>
              <Text variant="bodyLarge" style={styles.value}>
                {booking.adults} adult{booking.adults !== 1 ? 's' : ''}
                {booking.children > 0 && `, ${booking.children} child${booking.children !== 1 ? 'ren' : ''}`}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Payment Information */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="credit-card"
                size={24}
                color={colors.primary}
              />
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Payment Information
              </Text>
            </View>
            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Payment Status
              </Text>
              <Chip
                style={[styles.paymentStatusChip, { backgroundColor: paymentStatusColor + '20' }]}
                textStyle={{ color: paymentStatusColor, fontSize: 12 }}
                compact
              >
                {paymentStatus}
              </Chip>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Total Amount
              </Text>
              <Text variant="titleMedium" style={[styles.value, styles.amountText]}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Paid Amount
              </Text>
              <Text variant="bodyLarge" style={[styles.value, { color: colors.success }]}>
                {formatCurrency(paidAmount)}
              </Text>
            </View>

            {balance > 0 && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Balance
                </Text>
                <Text variant="bodyLarge" style={[styles.value, { color: colors.warning }]}>
                  {formatCurrency(balance)}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Booking Metadata */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="information"
                size={24}
                color={colors.primary}
              />
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Additional Information
              </Text>
            </View>
            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Booking ID
              </Text>
              <Text variant="bodyLarge" style={styles.value}>
                #{booking.id}
              </Text>
            </View>

            {booking.quotationId || booking.quotation_id ? (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Quotation ID
                </Text>
                <Text variant="bodyLarge" style={styles.value}>
                  #{booking.quotationId || booking.quotation_id}
                </Text>
              </View>
            ) : null}

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Created
              </Text>
              <Text variant="bodyLarge" style={styles.value}>
                {booking.createdAt || booking.created_at
                  ? formatDate(booking.createdAt || booking.created_at || '', 'dd MMM yyyy, hh:mm a')
                  : 'N/A'}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </SafeAreaScrollView>
    </View>
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
    marginBottom: 24,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
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
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  statusCard: {
    margin: 16,
    marginBottom: 8,
  },
  statusContent: {
    paddingVertical: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontWeight: 'bold',
    color: colors.text,
  },
  statusChip: {
    height: 32,
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: colors.text,
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    color: colors.textSecondary,
    flex: 1,
  },
  value: {
    color: colors.text,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  amountText: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  paymentStatusChip: {
    height: 28,
  },
});

