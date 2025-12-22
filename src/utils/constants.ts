// App Constants

export const APP_NAME = 'HostnHome';

// User Roles
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  VENDOR: 'vendor',
  STAFF: 'staff',
  PUBLIC: 'public',
} as const;

// Booking Statuses
export const BOOKING_STATUSES = {
  ENQUIRY: 'enquiry',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

// Quotation Statuses
export const QUOTATION_STATUSES = {
  DRAFT: 'draft',
  SENT: 'sent',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  CONVERTED: 'converted',
} as const;

// Room Statuses
export const ROOM_STATUSES = {
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
  BOOKED: 'booked',
  MAINTENANCE: 'maintenance',
} as const;

// Payment Statuses
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
  REFUNDED: 'refunded',
} as const;

// Date Range Presets
export const DATE_RANGES = {
  TODAY: 'today',
  WEEK: '7days',
  MONTH: '30days',
  QUARTER: '90days',
  YEAR: '12months',
  CUSTOM: 'custom',
} as const;

