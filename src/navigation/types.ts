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
  CreateResort: { resortId?: string };
  CreateRoom: { resortId: string; roomId?: string };
  BookingDetails: { bookingId: string };
  QuotationDetails: { quotationId: string };
  CreateQuotation: undefined;
  Staff: undefined;
  Settings: undefined;
  Subscription: undefined;
  Reports: undefined;
};

// Super Admin Tab Navigator
export type SuperAdminTabParamList = {
  Dashboard: undefined;
  Vendors: undefined;
  Plans: undefined;
  ActivityLogs: undefined;
  Settings: undefined;
};

// Super Admin Stack Navigator
export type SuperAdminStackParamList = {
  MainTabs: NavigatorScreenParams<SuperAdminTabParamList>;
  VendorDetails: { vendorId: string };
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

