import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  ActivityIndicator,
  IconButton,
  Chip,
  SegmentedButtons,
  Snackbar,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaScrollView } from '../../components/ui/SafeAreaScrollView';
import { colors } from '../../theme/colors';
import { createRoom, updateRoom, getRoomById } from '../../services/resorts';
import { Room } from '../../types';

type RouteParams = {
  CreateRoom: {
    resortId: string;
    roomId?: string;
  };
};

// Common room amenities
const ROOM_AMENITIES = [
  'WiFi',
  'TV',
  'AC',
  'Mini Bar',
  'Safe',
  'Balcony',
  'Ocean View',
  'Mountain View',
  'Private Pool',
  'Jacuzzi',
  'Kitchen',
  'Work Desk',
];

// Room types
const ROOM_TYPES = [
  'Standard',
  'Deluxe',
  'Suite',
  'Villa',
  'Family Room',
  'Studio',
  'Apartment',
  'Penthouse',
];

export function CreateRoomScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'CreateRoom'>>();
  const insets = useSafeAreaInsets();
  const { resortId, roomId } = route.params;

  const isEditMode = !!roomId;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'Standard',
    description: '',
    price: '',
    capacity: '2',
    availability_status: 'available' as 'available' | 'booked' | 'maintenance',
    amenities: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode && roomId) {
      loadRoom();
    }
  }, [isEditMode, roomId]);

  const loadRoom = async () => {
    try {
      setLoading(true);
      const { room } = await getRoomById(roomId!);
      if (room) {
        setFormData({
          name: room.name || '',
          type: room.type || 'Standard',
          description: room.description || '',
          price: String(room.price || ''),
          capacity: String(room.capacity || room.maxGuests || '2'),
          availability_status: (room.availability_status || 'available') as 'available' | 'booked' | 'maintenance',
          amenities: room.amenities || [],
        });
      }
    } catch (error) {
      console.error('Error loading room:', error);
      showSnackbar('Failed to load room details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Room name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Room type is required';
    }

    const price = parseFloat(formData.price);
    if (!formData.price.trim() || isNaN(price) || price < 0) {
      newErrors.price = 'Valid price is required';
    }

    const capacity = parseInt(formData.capacity);
    if (!formData.capacity.trim() || isNaN(capacity) || capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showSnackbar('Please fix the errors in the form');
      return;
    }

    setSubmitting(true);
    try {
      const roomData = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        capacity: parseInt(formData.capacity),
        availability_status: formData.availability_status,
        amenities: formData.amenities.length > 0 ? formData.amenities : undefined,
        images: [], // Images will be handled separately in future
      };

      if (isEditMode && roomId) {
        await updateRoom(roomId, roomData);
        showSnackbar('Room updated successfully!');
      } else {
        await createRoom({ ...roomData, resort_id: resortId });
        showSnackbar('Room created successfully!');
      }

      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error: any) {
      console.error('Error saving room:', error);
      showSnackbar(
        error?.message || (isEditMode ? 'Failed to update room' : 'Failed to create room')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading room details...</Text>
      </View>
    );
  }

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
          {isEditMode ? 'Edit Room' : 'Create Room'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <SafeAreaScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} bottomInset={false}>
        {/* Basic Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Basic Information
            </Text>

            <TextInput
              label="Room Name *"
              value={formData.name}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, name: text }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              error={!!errors.name}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., Ocean View Suite"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            {/* Room Type - Using a simple dropdown approach with chips */}
            <Text variant="bodyMedium" style={styles.label}>
              Room Type *
            </Text>
            <View style={styles.typeContainer}>
              {ROOM_TYPES.map((type) => (
                <Chip
                  key={type}
                  selected={formData.type === type}
                  onPress={() => {
                    setFormData((prev) => ({ ...prev, type }));
                    if (errors.type) setErrors((prev) => ({ ...prev, type: '' }));
                  }}
                  style={styles.typeChip}
                  mode={formData.type === type ? 'flat' : 'outlined'}
                >
                  {type}
                </Chip>
              ))}
            </View>
            {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}

            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              placeholder="Describe the room..."
            />
          </Card.Content>
        </Card>

        {/* Pricing & Capacity */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Pricing & Capacity
            </Text>

            <TextInput
              label="Price per Night (₹) *"
              value={formData.price}
              onChangeText={(text) => {
                // Only allow numbers and decimal point
                const cleaned = text.replace(/[^0-9.]/g, '');
                setFormData((prev) => ({ ...prev, price: cleaned }));
                if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
              }}
              error={!!errors.price}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
              placeholder="0"
            />
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}

            <TextInput
              label="Capacity (Max Guests) *"
              value={formData.capacity}
              onChangeText={(text) => {
                // Only allow numbers
                const cleaned = text.replace(/[^0-9]/g, '');
                setFormData((prev) => ({ ...prev, capacity: cleaned }));
                if (errors.capacity) setErrors((prev) => ({ ...prev, capacity: '' }));
              }}
              error={!!errors.capacity}
              mode="outlined"
              style={styles.input}
              keyboardType="number-pad"
              placeholder="2"
            />
            {errors.capacity && <Text style={styles.errorText}>{errors.capacity}</Text>}
          </Card.Content>
        </Card>

        {/* Status */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Availability Status
            </Text>
            <SegmentedButtons
              value={formData.availability_status}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  availability_status: value as 'available' | 'booked' | 'maintenance',
                }))
              }
              buttons={[
                { value: 'available', label: 'Available' },
                { value: 'booked', label: 'Booked' },
                { value: 'maintenance', label: 'Maintenance' },
              ]}
            />
          </Card.Content>
        </Card>

        {/* Amenities */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Room Amenities
            </Text>
            <Text variant="bodySmall" style={styles.sectionSubtitle}>
              Select amenities available in this room
            </Text>
            <View style={styles.amenitiesContainer}>
              {ROOM_AMENITIES.map((amenity) => (
                <Chip
                  key={amenity}
                  selected={formData.amenities.includes(amenity)}
                  onPress={() => toggleAmenity(amenity)}
                  style={styles.amenityChip}
                  mode={formData.amenities.includes(amenity) ? 'flat' : 'outlined'}
                >
                  {amenity}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          {isEditMode ? 'Update Room' : 'Create Room'}
        </Button>
      </SafeAreaScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    marginBottom: 12,
  },
  label: {
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  typeChip: {
    marginBottom: 8,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  amenityChip: {
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
});

