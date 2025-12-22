# HostnHome Mobile App

React Native Expo mobile application for the HostnHome Property Management System.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (installed globally: `npm install -g expo-cli`)
- Expo Go app on your phone (for testing)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Start the development server:
```bash
npm start
```

### Running on Devices

- **Android**: Press `a` in the terminal or scan QR code with Expo Go app
- **iOS**: Press `i` in the terminal or scan QR code with Expo Go app
- **Web**: Press `w` in the terminal

## 📱 Features

### Vendor/Staff App
- ✅ Authentication (Login/Logout)
- ✅ Dashboard with analytics
- ✅ Resort management
- ✅ Room management
- ✅ Booking management
- ✅ Quotation system
- ✅ Reports & analytics
- ✅ Staff management (Vendor only)
- ✅ Settings & subscription

### Super Admin App
- ✅ Vendor management
- ✅ Subscription plans
- ✅ Platform analytics
- ✅ Activity logs

## 🏗️ Project Structure

```
src/
├── components/       # Reusable UI components
├── screens/          # Screen components
│   ├── auth/        # Authentication screens
│   ├── vendor/      # Vendor/Staff screens
│   └── super-admin/ # Super Admin screens
├── navigation/       # Navigation setup
├── services/         # API & business logic
│   ├── supabase.ts  # Supabase client
│   ├── auth.ts      # Auth service
│   └── storage.ts   # Storage service
├── hooks/           # Custom React hooks
├── types/           # TypeScript types
├── utils/           # Utility functions
└── theme/           # Theme configuration
```

## 🛠️ Tech Stack

- **Framework**: React Native (Expo)
- **UI Library**: React Native Paper
- **Navigation**: React Navigation (Stack, Tabs, Drawer)
- **Database**: Supabase (PostgreSQL)
- **Language**: TypeScript
- **State Management**: React Hooks & Context

## 📦 Key Dependencies

- `expo` - Expo SDK
- `react-native-paper` - UI component library
- `@react-navigation/native` - Navigation
- `@supabase/supabase-js` - Supabase client
- `expo-secure-store` - Secure storage
- `expo-image-picker` - Image picker
- `react-native-chart-kit` - Charts
- `date-fns` - Date utilities

## 🔐 Authentication

The app uses Supabase Authentication:
- Email/Password authentication
- Secure token storage
- Session management
- Role-based access control

## 📝 Development Notes

### Adding New Screens

1. Create screen component in `src/screens/`
2. Add route in appropriate navigator (`src/navigation/`)
3. Update navigation types (`src/navigation/types.ts`)

### Styling

- Use React Native Paper components
- Theme colors defined in `src/theme/colors.ts`
- Paper theme in `src/theme/paperTheme.ts`

### API Integration

- Supabase client: `src/services/supabase.ts`
- Service functions: `src/services/`
- Types: `src/types/index.ts`

## 🚧 Current Status

**Phase 1 Complete**: ✅
- Project setup
- Authentication flow
- Navigation structure
- Basic screens

**Phase 2 In Progress**: 🔄
- Dashboard implementation
- Resort & Room management
- Booking & Quotation flows

## 📄 License

Private - HostnHome Platform

