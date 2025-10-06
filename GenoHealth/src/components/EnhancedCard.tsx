import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { H1, H2, H3, H4, H5, H6, BodyText, Caption, Label } from './EnhancedText';

export interface EnhancedCardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  variant?: 'elevated' | 'outlined' | 'filled' | 'gradient';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'none';
  footer?: React.ReactNode;
  header?: React.ReactNode;
}

export default function EnhancedCard({
  children,
  title,
  subtitle,
  description,
  icon,
  iconColor = '#4CAF50',
  variant = 'elevated',
  shadow = 'medium',
  style,
  onPress,
  disabled = false,
  testID,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'none',
  footer,
  header,
}: EnhancedCardProps) {
  const cardStyle = [
    styles.base,
    styles[variant],
    shadow !== 'none' && styles[`shadow${shadow.charAt(0).toUpperCase() + shadow.slice(1)}`],
    disabled && styles.disabled,
    style,
  ];

  const CardContent = () => (
    <View style={styles.content}>
      {header}
      
      {(title || icon) && (
        <View style={styles.header}>
          {icon && (
            <Ionicons 
              name={icon as any} 
              size={24} 
              color={iconColor} 
              style={styles.icon}
            />
          )}
          <View style={styles.titleContainer}>
            {title && <H4 color="#333" style={styles.title}>{title}</H4>}
            {subtitle && <Caption color="#666" style={styles.subtitle}>{subtitle}</Caption>}
          </View>
        </View>
      )}
      
      {description && (
        <BodyText color="#666" style={styles.description}>
          {description}
        </BodyText>
      )}
      
      {children && (
        <View style={styles.children}>
          {children}
        </View>
      )}
      
      {footer && (
        <View style={styles.footer}>
          {footer}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        disabled={disabled}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      <CardContent />
    </View>
  );
}

// Özel card varyantları
export const GeneticInfoCard = (props: Omit<EnhancedCardProps, 'variant'>) => (
  <EnhancedCard
    variant="elevated"
    iconColor="#4CAF50"
    {...props}
  />
);

export const HealthMetricCard = (props: Omit<EnhancedCardProps, 'variant'>) => (
  <EnhancedCard
    variant="outlined"
    iconColor="#2196F3"
    {...props}
  />
);

export const NutritionCard = (props: Omit<EnhancedCardProps, 'variant'>) => (
  <EnhancedCard
    variant="filled"
    iconColor="#FF9800"
    {...props}
  />
);

export const ExerciseCard = (props: Omit<EnhancedCardProps, 'variant'>) => (
  <EnhancedCard
    variant="gradient"
    iconColor="#9C27B0"
    {...props}
  />
);

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  elevated: {
    backgroundColor: '#fff',
  },
  outlined: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filled: {
    backgroundColor: '#F5F5F5',
  },
  gradient: {
    backgroundColor: '#fff',
  },
  shadowSmall: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  shadowMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  shadowLarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginTop: 2,
  },
  description: {
    marginBottom: 12,
    lineHeight: 20,
  },
  children: {
    marginBottom: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginTop: 12,
  },
});