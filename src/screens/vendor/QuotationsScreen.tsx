import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Searchbar,
  Chip,
  FAB,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { getQuotations } from '../../services/quotations';
import { Quotation } from '../../types';
import { formatCurrency, formatDate, formatDateRange } from '../../utils/formatters';

export function QuotationsScreen() {
  const navigation = useNavigation();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadQuotations();
  }, []);

  useEffect(() => {
    filterQuotations();
  }, [searchQuery, statusFilter, quotations]);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const { quotations: data } = await getQuotations();
      setQuotations(data || []);
    } catch (error) {
      console.error('Error loading quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuotations = () => {
    let filtered = [...quotations];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((q) => q.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          (q.guestName || q.guest_name || '').toLowerCase().includes(query) ||
          q.email.toLowerCase().includes(query) ||
          q.phone.toLowerCase().includes(query)
      );
    }

    setFilteredQuotations(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQuotations();
    setRefreshing(false);
  };

  const handleQuotationPress = (quotation: Quotation) => {
    // Navigate to quotation details (to be implemented)
    console.log('Quotation pressed:', quotation.id);
  };

  const handleCreateQuotation = () => {
    // Navigate to create quotation (to be implemented)
    console.log('Create quotation pressed');
  };

  const statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Draft', value: 'draft' },
    { label: 'Sent', value: 'sent' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Rejected', value: 'rejected' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading quotations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search quotations..."
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
              ? quotations.length
              : quotations.filter((q) => q.status === option.value).length}
            )
          </Chip>
        ))}
      </ScrollView>

      {/* Quotations List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredQuotations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text variant="titleLarge" style={styles.emptyTitle}>
              No quotations found
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first quotation to get started'}
            </Text>
          </View>
        ) : (
          filteredQuotations.map((quotation) => (
            <QuotationCard
              key={quotation.id}
              quotation={quotation}
              onPress={() => handleQuotationPress(quotation)}
            />
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateQuotation}
        label="New Quotation"
      />
    </View>
  );
}

interface QuotationCardProps {
  quotation: Quotation;
  onPress: () => void;
}

function QuotationCard({ quotation, onPress }: QuotationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
      case 'accepted':
        return colors.success;
      case 'draft':
        return colors.textSecondary;
      case 'rejected':
      case 'expired':
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const statusColor = getStatusColor(quotation.status);
  const guestName = quotation.guestName || quotation.guest_name || 'Unknown Guest';
  const checkIn = quotation.checkIn || quotation.check_in || '';
  const checkOut = quotation.checkOut || quotation.check_out || '';
  const totalAmount = quotation.totalAmount || quotation.total_amount || 0;
  const createdAt = quotation.createdAt || quotation.created_at || new Date().toISOString();

  return (
    <Card style={styles.quotationCard} onPress={onPress}>
      <Card.Content>
        <View style={styles.quotationHeader}>
          <View style={styles.quotationInfo}>
            <Text variant="titleMedium" style={styles.guestName}>
              {guestName}
            </Text>
            <Text variant="bodySmall" style={styles.quotationMeta}>
              {checkIn && checkOut ? formatDateRange(checkIn, checkOut) : 'Dates TBD'}
            </Text>
          </View>
          <Chip
            style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
            textStyle={{ color: statusColor, fontSize: 11 }}
            compact
          >
            {quotation.status}
          </Chip>
        </View>

        <View style={styles.quotationDetails}>
          <View style={styles.quotationDetailRow}>
            <MaterialCommunityIcons
              name="account"
              size={16}
              color={colors.textSecondary}
            />
            <Text variant="bodySmall" style={styles.quotationDetailText}>
              {quotation.adults} adults, {quotation.children} children
            </Text>
          </View>
          <View style={styles.quotationDetailRow}>
            <MaterialCommunityIcons
              name="home"
              size={16}
              color={colors.textSecondary}
            />
            <Text variant="bodySmall" style={styles.quotationDetailText}>
              {quotation.rooms} room{quotation.rooms !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <View style={styles.amountRow}>
          <Text variant="bodySmall" style={styles.amountLabel}>
            Total Amount:
          </Text>
          <Text variant="titleMedium" style={styles.amountValue}>
            {formatCurrency(totalAmount)}
          </Text>
        </View>

        {quotation.notes && (
          <Text variant="bodySmall" style={styles.notes} numberOfLines={2}>
            Note: {quotation.notes}
          </Text>
        )}

        <View style={styles.quotationFooter}>
          <Text variant="bodySmall" style={styles.createdDate}>
            Created {formatDate(createdAt)}
          </Text>
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
  quotationCard: {
    marginBottom: 16,
    elevation: 2,
  },
  quotationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quotationInfo: {
    flex: 1,
  },
  guestName: {
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  quotationMeta: {
    color: colors.textSecondary,
  },
  statusChip: {
    height: 24,
  },
  quotationDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  quotationDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quotationDetailText: {
    color: colors.textSecondary,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 8,
  },
  amountLabel: {
    color: colors.textSecondary,
  },
  amountValue: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  notes: {
    marginTop: 8,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  quotationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  createdDate: {
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});
