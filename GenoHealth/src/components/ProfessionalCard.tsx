import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../constants/Theme';

interface ProfessionalCardProps {
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  gradient?: string[];
  onPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  children?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'outlined' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export default function ProfessionalCard({
  title,
  subtitle,
  description,
  icon,
  iconColor = Theme.colors.primary[500],
  gradient = [Theme.colors.primary[500], Theme.colors.primary[600]],
  onPress,
  style,
  titleStyle,
  subtitleStyle,
  descriptionStyle,
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
}: ProfessionalCardProps) {
  const CardComponent = onPress ? TouchableOpacity : View;

  const getCardStyle = () => {
    const baseStyle = [styles.card, styles[`card_${size}`]];
    
    switch (variant) {
      case 'gradient':
        return [...baseStyle, styles.cardGradient];
      case 'outlined':
        return [...baseStyle, styles.cardOutlined];
      case 'elevated':
        return [...baseStyle, styles.cardElevated];
      default:
        return [...baseStyle, styles.cardDefault];
    }
  };

  const getContent = () => {
    if (children) {
      return children;
    }

    return (
      <>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons name={icon as any} size={32} color={iconColor} />
          </View>
        )}
        
        {title && (
          <Text style={[styles.title, titleStyle]} numberOfLines={2}>
            {title}
          </Text>
        )}
        
        {subtitle && (
          <Text style={[styles.subtitle, subtitleStyle]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        
        {description && (
          <Text style={[styles.description, descriptionStyle]} numberOfLines={3}>
            {description}
          </Text>
        )}
      </>
    );
  };

  if (variant === 'gradient') {
    return (
      <CardComponent
        style={[getCardStyle(), style, disabled && styles.disabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradient}
          style={styles.gradientContent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {getContent()}
        </LinearGradient>
      </CardComponent>
    );
  }

  return (
    <CardComponent
      style={[getCardStyle(), style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {getContent()}
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
  },
  card_sm: {
    padding: Theme.spacing.sm,
    minHeight: 80,
  },
  card_md: {
    padding: Theme.spacing.md,
    minHeight: 120,
  },
  card_lg: {
    padding: Theme.spacing.lg,
    minHeight: 160,
  },
  cardDefault: {
    backgroundColor: Theme.colors.background.primary,
    ...Theme.shadows.sm,
  },
  cardGradient: {
    borderRadius: Theme.borderRadius['2xl'],
    overflow: 'hidden',
  },
  cardOutlined: {
    backgroundColor: Theme.colors.background.primary,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
  },
  cardElevated: {
    backgroundColor: Theme.colors.background.primary,
    ...Theme.shadows.lg,
  },
  gradientContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Theme.borderRadius['2xl'],
  },
  iconContainer: {
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  description: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.regular,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: Theme.typography.lineHeight.normal * Theme.typography.fontSize.sm,
  },
  disabled: {
    opacity: 0.5,
  },
});
