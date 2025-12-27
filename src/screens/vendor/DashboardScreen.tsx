import React, { useState, useEffect } from 'react';
import { View, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, ActivityIndicator, Surface, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaScrollView } from '../../components/ui/SafeAreaScrollView';
import { colors } from '../../theme/colors';
import { getResorts } from '../../services/resorts';
import { getBookings } from '../../services/bookings';
import { getQuotations } from '../../services/quotations';
import { getVendorProfile } from '../../services/vendor';
import { formatCurrency } from '../../utils/formatters';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalResorts: number;
  activeResorts: number;
  totalRooms: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalQuotations: number;
  newQuotations: number;
  revenueThisMonth: number;
}

export function DashboardScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState<DashboardStats>({
    totalResorts: 0,
    activeResorts: 0,
    totalRooms: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalQuotations: 0,
    newQuotations: 0,
    revenueThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load resorts
      const { resorts } = await getResorts();
      const activeResorts = resorts.filter((r: any) => r.status === 'active');

      // Count total rooms (simplified - in real app, you'd fetch all rooms)
      let totalRooms = 0;
      // For now, we'll estimate or fetch separately

      // Load bookings
      const { bookings } = await getBookings();
      const confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed');
      const pendingBookings = bookings.filter((b: any) => b.status === 'pending');

      // Load quotations
      const { quotations } = await getQuotations();
      const newQuotations = quotations.filter((q: any) => 
        q.status === 'draft' || q.status === 'sent' || q.status === 'new'
      );

      // Calculate revenue (sum of confirmed bookings)
      const revenue = bookings
        .filter((b: any) => b.status === 'confirmed')
        .reduce((sum: number, b: any) => sum + (b.total_amount || b.totalAmount || 0), 0);

      setStats({
        totalResorts: resorts.length,
        activeResorts: activeResorts.length,
        totalRooms,
        totalBookings: bookings.length,
        confirmedBookings: confirmedBookings.length,
        pendingBookings: pendingBookings.length,
        totalQuotations: quotations.length,
        newQuotations: newQuotations.length,
        revenueThisMonth: revenue,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaScrollView
      style={styles.container}
      bottomInset={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Dashboard
        </Text>
      </View>

      <View style={styles.content}>
        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Resorts"
            value={stats.totalResorts.toString()}
            subtitle={`${stats.activeResorts} active`}
            icon="home"
            color={colors.primary}
            onPress={() => navigation.navigate('Resorts' as never)}
          />
          <StatCard
            title="Bookings"
            value={stats.totalBookings.toString()}
            subtitle={`${stats.confirmedBookings} confirmed`}
            icon="calendar-check"
            color={colors.info}
            onPress={() => navigation.navigate('Bookings' as never)}
          />
          <StatCard
            title="Quotations"
            value={stats.totalQuotations.toString()}
            subtitle={`${stats.newQuotations} new`}
            icon="file-document-outline"
            color={colors.warning}
            onPress={() => navigation.navigate('Quotations' as never)}
          />
          <StatCard
            title="Revenue"
            value={formatCurrency(stats.revenueThisMonth)}
            subtitle="This month"
            icon="currency-usd"
            color={colors.success}
          />
        </View>

        {/* Booking Status Cards */}
        <Card style={styles.card}>
          <Card.Title
            title="Bookings Overview"
            left={(props) => <MaterialCommunityIcons name="calendar" {...props} />}
          />
          <Card.Content>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Text variant="headlineSmall" style={styles.statusValue}>
                  {stats.confirmedBookings}
                </Text>
                <Text variant="bodySmall" style={styles.statusLabel}>
                  Confirmed
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Text variant="headlineSmall" style={[styles.statusValue, { color: colors.warning }]}>
                  {stats.pendingBookings}
                </Text>
                <Text variant="bodySmall" style={styles.statusLabel}>
                  Pending
                </Text>
              </View>
            </View>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Bookings' as never)}
              style={styles.viewAllButton}
            >
              View All Bookings
            </Button>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Title
            title="Quick Actions"
            left={(props) => <MaterialCommunityIcons name="lightning-bolt" {...props} />}
          />
          <Card.Content>
            <View style={styles.actionsGrid}>
              <QuickAction
                icon="plus-circle"
                label="New Resort"
                onPress={() => navigation.navigate('Resorts' as never)}
              />
              <QuickAction
                icon="file-document-plus"
                label="New Quotation"
                onPress={() => navigation.navigate('Quotations' as never)}
              />
              <QuickAction
                icon="calendar-plus"
                label="New Booking"
                onPress={() => navigation.navigate('Bookings' as never)}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Welcome Message */}
        <Surface style={styles.welcomeCard} elevation={2}>
          <MaterialCommunityIcons name="hand-wave" size={32} color={colors.primary} />
          <Text variant="titleLarge" style={styles.welcomeTitle}>
            Welcome back!
          </Text>
          <Text variant="bodyMedium" style={styles.welcomeText}>
            Manage your resorts, bookings, and quotations all in one place.
          </Text>
        </Surface>
      </View>
    </SafeAreaScrollView>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  color: string;
  onPress?: () => void;
}

function StatCard({ title, value, subtitle, icon, color, onPress }: StatCardProps) {
  return (
    <Card
      style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}
      onPress={onPress}
    >
      <Card.Content style={styles.statCardContent}>
        <View style={styles.statCardHeader}>
          <MaterialCommunityIcons name={icon as any} size={24} color={color} />
          <Text variant="bodySmall" style={styles.statCardTitle}>
            {title}
          </Text>
        </View>
        <Text variant="headlineSmall" style={[styles.statCardValue, { color }]}>
          {value}
        </Text>
        {subtitle && (
          <Text variant="bodySmall" style={styles.statCardSubtitle}>
            {subtitle}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
}

interface QuickActionProps {
  icon: string;
  label: string;
  onPress: () => void;
}

function QuickAction({ icon, label, onPress }: QuickActionProps) {
  return (
    <Card style={styles.actionCard} onPress={onPress}>
      <Card.Content style={styles.actionContent}>
        <MaterialCommunityIcons name={icon as any} size={32} color={colors.primary} />
        <Text variant="bodySmall" style={styles.actionLabel}>
          {label}
        </Text>
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
  header: {
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    marginHorizontal: -8,
  },
  statCard: {
    width: (width - 48) / 2,
    margin: 8,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  statCardContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statCardTitle: {
    marginLeft: 8,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statCardValue: {
    fontWeight: '700',
    fontSize: 24,
    marginBottom: 4,
    lineHeight: 32,
  },
  statCardSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusValue: {
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statusLabel: {
    color: colors.textSecondary,
  },
  viewAllButton: {
    marginTop: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  actionContent: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  actionLabel: {
    marginTop: 8,
    textAlign: 'center',
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  welcomeCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  welcomeTitle: {
    marginTop: 12,
    marginBottom: 8,
    fontWeight: 'bold',
    color: colors.text,
  },
  welcomeText: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
});
