import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Navigator
export type AuthStackParamList = {
  Login: undefined;
};

// Vendor/Staff Tab Navigator
export type VendorTabParamList = {
  Dashboard: undefined;
  Resorts: undefined;
  Bookings: undefined;
  Quotations: undefined;
  More: undefined;
};

// Vendor/Staff Stack Navigator (includes drawer)
export type VendorStackParamList = {
  MainTabs: NavigatorScreenParams<VendorTabParamList>;
  Rooms: { resortId: string };
  ResortDetail: { resortId: string | number };
  BookingDetails: { bookingId: string };
  QuotationDetails: { quotationId: string };
  CreateQuotation: undefined;
  Staff: undefined;
  Settings: undefined;
  Subscription: undefined;
  Reports: undefined;
};

// Super Admin Stack Navigator
export type SuperAdminStackParamList = {
  Dashboard: undefined;
  Vendors: undefined;
  VendorDetails: { vendorId: string };
  Plans: undefined;
  ActivityLogs: undefined;
  Settings: undefined;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Vendor: NavigatorScreenParams<VendorStackParamList>;
  SuperAdmin: NavigatorScreenParams<SuperAdminStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

