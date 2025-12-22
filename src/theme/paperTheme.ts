import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { colors } from './colors';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.accent,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    error: colors.error,
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onBackground: colors.text,
    onSurface: colors.text,
    onError: '#ffffff',
    outline: colors.border,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.accent,
    background: colors.dark.background,
    surface: colors.dark.surface,
    error: colors.error,
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onBackground: colors.dark.text,
    onSurface: colors.dark.text,
    onError: '#ffffff',
  },
};

