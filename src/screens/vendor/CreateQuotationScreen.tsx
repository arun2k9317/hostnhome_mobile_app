import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaScrollView } from '../../components/ui/SafeAreaScrollView';
import {
  Text,
  TextInput,
  Button,
  Card,
  ActivityIndicator,
  IconButton,
  Snackbar,
  Divider,
  Menu,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { createQuotation } from '../../services/quotations';
import { getResorts } from '../../services/resorts';
import { Resort } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export function CreateQuotationScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [loadingResorts, setLoadingResorts] = useState(true);

  // Helper function to format date for input (YYYY-MM-DD)
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Property & Booking Details
    resortId: '',
    checkIn: formatDateForInput(new Date()),
    checkOut: formatDateForInput(getTomorrow()),
    rooms: '1',
    adults: '2',
    children: '0',
    // Step 2: Guest Details
    guestName: '',
    email: '',
    phone: '',
    notes: '',
    // Step 3: Pricing
    totalAmount: '0',
  });

  // Menu states
  const [resortMenuVisible, setResortMenuVisible] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadResorts();
  }, []);

  const loadResorts = async () => {
    try {
      setLoadingResorts(true);
      const { resorts: data } = await getResorts();
      setResorts(data || []);
    } catch (error) {
      console.error('Error loading resorts:', error);
      showSnackbar('Failed to load resorts');
    } finally {
      setLoadingResorts(false);
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const selectedResort = resorts.find((r) => String(r.id) === formData.resortId);

  // Calculate nights
  const getNights = (): number => {
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return 0;
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };
  const nights = getNights();

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.resortId) {
      newErrors.resortId = 'Please select a resort';
    }

    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    if (isNaN(checkIn.getTime())) {
      newErrors.checkIn = 'Please enter a valid check-in date';
    }
    if (isNaN(checkOut.getTime())) {
      newErrors.checkOut = 'Please enter a valid check-out date';
    } else if (!isNaN(checkIn.getTime()) && checkOut <= checkIn) {
      newErrors.checkOut = 'Check-out date must be after check-in date';
    }

    const rooms = parseInt(formData.rooms);
    if (!formData.rooms || isNaN(rooms) || rooms < 1) {
      newErrors.rooms = 'Number of rooms must be at least 1';
    }

    const adults = parseInt(formData.adults);
    if (!formData.adults || isNaN(adults) || adults < 1) {
      newErrors.adults = 'Number of adults must be at least 1';
    }

    const children = parseInt(formData.children);
    if (!formData.children || isNaN(children) || children < 0) {
      newErrors.children = 'Number of children cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.guestName.trim()) {
      newErrors.guestName = 'Guest name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    const totalAmount = parseFloat(formData.totalAmount);
    if (!formData.totalAmount || isNaN(totalAmount) || totalAmount < 0) {
      newErrors.totalAmount = 'Total amount must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) {
      showSnackbar('Please fix the errors in the form');
      return;
    }

    setSubmitting(true);
    try {
      const quotationData = {
        resort_id: formData.resortId,
        guest_name: formData.guestName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        check_in: new Date(formData.checkIn).toISOString(),
        check_out: new Date(formData.checkOut).toISOString(),
        adults: parseInt(formData.adults),
        children: parseInt(formData.children),
        rooms: parseInt(formData.rooms),
        total_amount: parseFloat(formData.totalAmount),
        notes: formData.notes.trim() || undefined,
        status: 'draft',
      };

      await createQuotation(quotationData);
      showSnackbar('Quotation created successfully!');

      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error: any) {
      console.error('Error creating quotation:', error);
      showSnackbar(error?.message || 'Failed to create quotation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleBack}
          iconColor={colors.text}
        />
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Create Quotation
        </Text>
        <View style={styles.headerRight}>
          <Text variant="bodySmall" style={styles.stepIndicator}>
            {currentStep}/3
          </Text>
        </View>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((step) => (
          <View key={step} style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                currentStep >= step && styles.progressDotActive,
              ]}
            />
            {step < 3 && (
              <View
                style={[
                  styles.progressLine,
                  currentStep > step && styles.progressLineActive,
                ]}
              />
            )}
          </View>
        ))}
        <View style={styles.progressLabels}>
          <Text variant="bodySmall" style={styles.progressLabel}>
            Details
          </Text>
          <Text variant="bodySmall" style={styles.progressLabel}>
            Guest
          </Text>
          <Text variant="bodySmall" style={styles.progressLabel}>
            Pricing
          </Text>
        </View>
      </View>

      <SafeAreaScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} bottomInset={false}>
        {/* Step 1: Property & Booking Details */}
        {currentStep === 1 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Property & Booking Details
              </Text>
              <Divider style={styles.divider} />

              {/* Resort Selection */}
              <View style={styles.inputContainer}>
                <Text variant="bodyMedium" style={styles.label}>
                  Resort *
                </Text>
                <Menu
                  visible={resortMenuVisible}
                  onDismiss={() => setResortMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setResortMenuVisible(true)}
                      style={styles.selectButton}
                      contentStyle={styles.selectButtonContent}
                    >
                      {selectedResort ? selectedResort.name : 'Select Resort'}
                    </Button>
                  }
                >
                  {resorts.map((resort) => (
                    <Menu.Item
                      key={resort.id}
                      onPress={() => {
                        setFormData((prev) => ({ ...prev, resortId: String(resort.id) }));
                        setResortMenuVisible(false);
                        if (errors.resortId) {
                          setErrors((prev) => ({ ...prev, resortId: '' }));
                        }
                      }}
                      title={resort.name}
                      titleStyle={{ color: colors.text }}
                    />
                  ))}
                </Menu>
                {errors.resortId && <Text style={styles.errorText}>{errors.resortId}</Text>}
              </View>

              {/* Check-in Date */}
              <TextInput
                label="Check-in Date * (YYYY-MM-DD)"
                value={formData.checkIn}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, checkIn: text }));
                  if (errors.checkIn) setErrors((prev) => ({ ...prev, checkIn: '' }));
                }}
                error={!!errors.checkIn}
                mode="outlined"
                style={styles.input}
                placeholder="2024-12-25"
                right={<TextInput.Icon icon="calendar" />}
              />
              {errors.checkIn && <Text style={styles.errorText}>{errors.checkIn}</Text>}

              {/* Check-out Date */}
              <TextInput
                label="Check-out Date * (YYYY-MM-DD)"
                value={formData.checkOut}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, checkOut: text }));
                  if (errors.checkOut) setErrors((prev) => ({ ...prev, checkOut: '' }));
                }}
                error={!!errors.checkOut}
                mode="outlined"
                style={styles.input}
                placeholder="2024-12-26"
                right={<TextInput.Icon icon="calendar" />}
              />
              {errors.checkOut && <Text style={styles.errorText}>{errors.checkOut}</Text>}
              {nights > 0 && (
                <Text variant="bodySmall" style={styles.helperText}>
                  {nights} night{nights !== 1 ? 's' : ''}
                </Text>
              )}

              {/* Rooms */}
              <TextInput
                label="Number of Rooms *"
                value={formData.rooms}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setFormData((prev) => ({ ...prev, rooms: cleaned }));
                  if (errors.rooms) setErrors((prev) => ({ ...prev, rooms: '' }));
                }}
                error={!!errors.rooms}
                mode="outlined"
                style={styles.input}
                keyboardType="number-pad"
              />
              {errors.rooms && <Text style={styles.errorText}>{errors.rooms}</Text>}

              {/* Adults */}
              <TextInput
                label="Number of Adults *"
                value={formData.adults}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setFormData((prev) => ({ ...prev, adults: cleaned }));
                  if (errors.adults) setErrors((prev) => ({ ...prev, adults: '' }));
                }}
                error={!!errors.adults}
                mode="outlined"
                style={styles.input}
                keyboardType="number-pad"
              />
              {errors.adults && <Text style={styles.errorText}>{errors.adults}</Text>}

              {/* Children */}
              <TextInput
                label="Number of Children"
                value={formData.children}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setFormData((prev) => ({ ...prev, children: cleaned }));
                  if (errors.children) setErrors((prev) => ({ ...prev, children: '' }));
                }}
                error={!!errors.children}
                mode="outlined"
                style={styles.input}
                keyboardType="number-pad"
              />
              {errors.children && <Text style={styles.errorText}>{errors.children}</Text>}
            </Card.Content>
          </Card>
        )}

        {/* Step 2: Guest Details */}
        {currentStep === 2 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Guest Information
              </Text>
              <Divider style={styles.divider} />

              <TextInput
                label="Guest Name *"
                value={formData.guestName}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, guestName: text }));
                  if (errors.guestName) setErrors((prev) => ({ ...prev, guestName: '' }));
                }}
                error={!!errors.guestName}
                mode="outlined"
                style={styles.input}
              />
              {errors.guestName && <Text style={styles.errorText}>{errors.guestName}</Text>}

              <TextInput
                label="Email *"
                value={formData.email}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, email: text }));
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                error={!!errors.email}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              <TextInput
                label="Phone Number *"
                value={formData.phone}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, '').slice(0, 10);
                  setFormData((prev) => ({ ...prev, phone: cleaned }));
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                error={!!errors.phone}
                mode="outlined"
                style={styles.input}
                keyboardType="phone-pad"
                placeholder="10-digit phone number"
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

              <TextInput
                label="Notes (Optional)"
                value={formData.notes}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, notes: text }))}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.input}
                placeholder="Additional notes or special requests..."
              />
            </Card.Content>
          </Card>
        )}

        {/* Step 3: Pricing & Review */}
        {currentStep === 3 && (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Pricing
                </Text>
                <Divider style={styles.divider} />

                <TextInput
                  label="Total Amount (₹) *"
                  value={formData.totalAmount}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9.]/g, '');
                    setFormData((prev) => ({ ...prev, totalAmount: cleaned }));
                    if (errors.totalAmount) setErrors((prev) => ({ ...prev, totalAmount: '' }));
                  }}
                  error={!!errors.totalAmount}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="decimal-pad"
                  left={<TextInput.Affix text="₹" />}
                />
                {errors.totalAmount && <Text style={styles.errorText}>{errors.totalAmount}</Text>}
              </Card.Content>
            </Card>

            {/* Review Summary */}
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Review Summary
                </Text>
                <Divider style={styles.divider} />

                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>
                    Resort:
                  </Text>
                  <Text variant="bodyMedium" style={styles.summaryValue}>
                    {selectedResort?.name || 'Not selected'}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>
                    Dates:
                  </Text>
                  <Text variant="bodyMedium" style={styles.summaryValue}>
                    {formData.checkIn} - {formData.checkOut} ({nights} nights)
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>
                    Guests:
                  </Text>
                  <Text variant="bodyMedium" style={styles.summaryValue}>
                    {formData.adults} adult{formData.adults !== '1' ? 's' : ''}
                    {formData.children !== '0' && `, ${formData.children} child${formData.children !== '1' ? 'ren' : ''}`}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>
                    Rooms:
                  </Text>
                  <Text variant="bodyMedium" style={styles.summaryValue}>
                    {formData.rooms}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>
                    Guest:
                  </Text>
                  <Text variant="bodyMedium" style={styles.summaryValue}>
                    {formData.guestName || 'Not provided'}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>
                    Total Amount:
                  </Text>
                  <Text variant="titleMedium" style={[styles.summaryValue, styles.amountValue]}>
                    {formatCurrency(parseFloat(formData.totalAmount) || 0)}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </>
        )}

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <Button
              mode="outlined"
              onPress={handleBack}
              style={[styles.button, styles.backButton]}
            >
              Back
            </Button>
          )}
          <Button
            mode="contained"
            onPress={currentStep === 3 ? handleSubmit : handleNext}
            loading={submitting}
            disabled={submitting || loadingResorts}
            style={[styles.button, currentStep > 1 ? styles.nextButton : styles.nextButtonFull]}
            contentStyle={styles.buttonContent}
          >
            {currentStep === 3 ? 'Create Quotation' : 'Next'}
          </Button>
        </View>
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
    alignItems: 'flex-end',
  },
  stepIndicator: {
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  progressContainer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: colors.textSecondary,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: colors.primary,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: 12,
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
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
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
    marginTop: 4,
    marginLeft: 12,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
  selectButton: {
    marginTop: 4,
  },
  selectButtonContent: {
    justifyContent: 'space-between',
  },
  dateButton: {
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    color: colors.textSecondary,
    flex: 1,
  },
  summaryValue: {
    color: colors.text,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  amountValue: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
  backButton: {
    flex: 0.5,
  },
  nextButton: {
    flex: 0.5,
  },
  nextButtonFull: {
    flex: 1,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

