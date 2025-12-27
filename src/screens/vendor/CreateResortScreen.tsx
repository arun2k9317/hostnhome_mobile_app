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
import { useTheme } from 'react-native-paper';
import { SafeAreaScrollView } from '../../components/ui/SafeAreaScrollView';
import { createResort, updateResort, getResortById } from '../../services/resorts';
import { Resort } from '../../types';

type RouteParams = {
  CreateResort: {
    resortId?: string;
  };
};

// Common amenities list
const COMMON_AMENITIES = [
  'WiFi',
  'Pool',
  'Restaurant',
  'Spa',
  'Gym',
  'Parking',
  'Air Conditioning',
  'TV',
  'Room Service',
  'Laundry',
  'Beach Access',
  'Garden',
  'Bar',
  'Breakfast',
  'Concierge',
];

export function CreateResortScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'CreateResort'>>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { resortId } = route.params || {};

  const isEditMode = !!resortId;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
    amenities: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode && resortId) {
      loadResort();
    }
  }, [isEditMode, resortId]);

  const loadResort = async () => {
    try {
      setLoading(true);
      const { resort } = await getResortById(resortId!);
      if (resort) {
        setFormData({
          name: resort.name || '',
          location: resort.location || '',
          description: resort.description || '',
          status: (resort.status || 'active') as 'active' | 'inactive',
          amenities: resort.amenities || [],
        });
      }
    } catch (error) {
      console.error('Error loading resort:', error);
      showSnackbar('Failed to load resort details');
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
      newErrors.name = 'Resort name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
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
      // Generate slug from name (simple version)
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const resortData = {
        name: formData.name.trim(),
        slug,
        location: formData.location.trim(),
        description: formData.description.trim() || undefined,
        amenities: formData.amenities.length > 0 ? formData.amenities : undefined,
        status: formData.status,
        images: [], // Images will be handled separately in future
      };

      if (isEditMode && resortId) {
        // For update, we don't need slug and can omit images if not changed
        const { slug, images, ...updateData } = resortData;
        await updateResort(resortId, updateData);
        showSnackbar('Resort updated successfully!');
      } else {
        await createResort(resortData);
        showSnackbar('Resort created successfully!');
      }

      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error: any) {
      console.error('Error saving resort:', error);
      showSnackbar(
        error?.message || (isEditMode ? 'Failed to update resort' : 'Failed to create resort')
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
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>Loading resort details...</Text>
      </View>
    );
  }

  return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline }]}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          iconColor={theme.colors.onSurface}
        />
        <Text variant="headlineSmall" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          {isEditMode ? 'Edit Resort' : 'Create Resort'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <SafeAreaScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} bottomInset={false}>
        {/* Basic Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Basic Information
            </Text>

            <TextInput
              label="Resort Name *"
              value={formData.name}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, name: text }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              error={!!errors.name}
              mode="outlined"
              style={styles.input}
            />
            {errors.name && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.name}</Text>}

            <TextInput
              label="Location *"
              value={formData.location}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, location: text }));
                if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
              }}
              error={!!errors.location}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., Goa, Karnataka"
            />
            {errors.location && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.location}</Text>}

            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
              placeholder="Describe your resort..."
            />
          </Card.Content>
        </Card>

        {/* Status */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Status
            </Text>
            <SegmentedButtons
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value as 'active' | 'inactive' }))
              }
              buttons={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </Card.Content>
        </Card>

        {/* Amenities */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Amenities
            </Text>
            <Text variant="bodySmall" style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Select amenities available at your resort
            </Text>
            <View style={styles.amenitiesContainer}>
              {COMMON_AMENITIES.map((amenity) => (
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
          {isEditMode ? 'Update Resort' : 'Create Resort'}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
    fontWeight: 'bold',
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
    marginBottom: 16,
  },
  sectionSubtitle: {
    marginBottom: 12,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 12,
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

