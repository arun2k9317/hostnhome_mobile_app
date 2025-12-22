export type UserRole = 'super_admin' | 'vendor' | 'staff' | 'public';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  vendorId?: string;
  staffId?: string;
}

export interface Vendor {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  slug: string;
  logo?: string;
  about?: string;
  createdAt: string;
  lastActivity?: string;
}

export interface Resort {
  id: string | number;
  vendor_id?: string | number;
  vendorId?: string | number;
  name: string;
  location: string;
  description?: string;
  images?: string[];
  slug: string;
  amenities?: string[];
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Room {
  id: string | number;
  resort_id?: string | number;
  resortId?: string | number;
  name: string;
  type: string;
  capacity?: number;
  maxGuests?: number;
  description?: string;
  images?: string[];
  price: number;
  size?: number;
  amenities?: string[];
  availability_status?: 'available' | 'booked' | 'maintenance';
  status?: 'available' | 'unavailable';
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Staff {
  id: string;
  vendorId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Quotation {
  id: string | number;
  vendor_id?: string | number;
  vendorId?: string | number;
  resort_id?: string | number;
  resortId?: string | number;
  guest_name?: string;
  guestName?: string;
  email: string;
  phone: string;
  check_in?: string;
  checkIn?: string;
  check_out?: string;
  checkOut?: string;
  adults: number;
  children: number;
  rooms: number;
  status: string;
  total_amount?: number;
  totalAmount?: number;
  notes?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

export interface Booking {
  id: string | number;
  vendor_id?: string | number;
  vendorId?: string | number;
  quotation_id?: string | number;
  quotationId?: string | number;
  resort_id?: string | number;
  resortId?: string | number;
  guest_name?: string;
  guestName?: string;
  email: string;
  phone: string;
  check_in?: string;
  checkIn?: string;
  check_out?: string;
  checkOut?: string;
  adults: number;
  children: number;
  rooms: number;
  status: string;
  total_amount?: number;
  totalAmount?: number;
  paid_amount?: number;
  paidAmount?: number;
  payment_status?: string;
  paymentStatus?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    resorts: number;
    rooms: number;
    bookings: number;
    staff: number;
  };
  status: 'active' | 'inactive';
}

export interface VendorSubscription {
  id: string;
  vendorId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export interface WebsiteSettings {
  id: string;
  vendorId: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  contactEmail: string;
  contactPhone: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Filter and query types
export interface DateRange {
  from: string;
  to: string;
}

export interface QuotationFilters {
  status?: string;
  dateRange?: DateRange;
  resortId?: string;
}

export interface BookingFilters {
  status?: string;
  dateRange?: DateRange;
  resortId?: string;
  paymentStatus?: string;
}

