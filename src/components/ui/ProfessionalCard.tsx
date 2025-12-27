import React, { ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ProfessionalCardProps {
  title: string;
  subtitle?: string;
  image?: ImageSourcePropType | { uri: string };
  price?: string;
  priceLabel?: string;
  onPress?: () => void;
  children?: ReactNode;
  badge?: {
    label: string;
    color: string;
    backgroundColor: string;
  };
  footer?: ReactNode;
  icon?: string;
  iconColor?: string;
}

/**
 * Professional card component with modern styling
 * Matches the design style from the reference image
 */
export function ProfessionalCard({
  title,
  subtitle,
  image,
  price,
  priceLabel,
  onPress,
  children,
  badge,
  footer,
  icon,
  iconColor,
}: ProfessionalCardProps) {
  const theme = useTheme();

  const CardContent = (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {image && (
        <View style={styles.imageContainer}>
          <Image source={image} style={styles.image} resizeMode="cover" />
          {price && (
            <View style={[styles.priceOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
              <Text variant="labelLarge" style={styles.priceText}>
                {price}
              </Text>
              {priceLabel && (
                <Text variant="bodySmall" style={styles.priceLabel}>
                  {priceLabel}
                </Text>
              )}
            </View>
          )}
          {badge && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: badge.backgroundColor,
                },
              ]}
            >
              <Text
                variant="labelSmall"
                style={[styles.badgeText, { color: badge.color }]}
              >
                {badge.label}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
              <MaterialCommunityIcons
                name={icon as any}
                size={20}
                color={iconColor || theme.colors.primary}
              />
            </View>
          )}
          <View style={styles.titleContainer}>
            <Text
              variant="titleMedium"
              style={[styles.title, { color: theme.colors.onSurface }]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <View style={styles.subtitleContainer}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={14}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  variant="bodySmall"
                  style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              </View>
            )}
          </View>
        </View>

        {children && <View style={styles.childrenContainer}>{children}</View>}

        {footer && <View style={styles.footer}>{footer}</View>}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={styles.touchable}
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
          {CardContent}
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      {CardContent}
    </Card>
  );
}

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  priceOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  priceText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  priceLabel: {
    color: '#ffffff',
    fontSize: 10,
    opacity: 0.9,
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontWeight: '600',
    fontSize: 11,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 4,
    lineHeight: 24,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  subtitle: {
    marginLeft: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  childrenContainer: {
    marginTop: 8,
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
});


