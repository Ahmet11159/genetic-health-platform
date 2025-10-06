import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../constants/Theme';

interface ProfessionalButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: string[];
}

export default function ProfessionalButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  gradient = [Theme.colors.primary[500], Theme.colors.primary[600]],
}: ProfessionalButtonProps) {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button_${size}`]];
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }
    
    if (disabled || loading) {
      baseStyle.push(styles.disabled);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`text_${size}`], styles[`text_${variant}`]];
    
    if (disabled || loading) {
      baseStyle.push(styles.textDisabled);
    }
    
    return baseStyle;
  };

  const getIconColor = () => {
    if (disabled || loading) {
      return Theme.colors.text.disabled;
    }
    
    switch (variant) {
      case 'primary':
      case 'gradient':
        return Theme.colors.text.inverse;
      case 'secondary':
        return Theme.colors.text.inverse;
      case 'outline':
      case 'ghost':
        return Theme.colors.primary[500];
      default:
        return Theme.colors.text.inverse;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'md':
        return 20;
      case 'lg':
        return 24;
      default:
        return 20;
    }
  };

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getIconColor()}
          style={styles.loadingIndicator}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon as any}
              size={getIconSize()}
              color={getIconColor()}
              style={styles.iconLeft}
            />
          )}
          
          <Text style={[getTextStyle(), textStyle]} numberOfLines={1}>
            {title}
          </Text>
          
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon as any}
              size={getIconSize()}
              color={getIconColor()}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </>
  );

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradient}
          style={styles.gradientContent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[getButtonStyle(), styles[`button_${variant}`], style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.borderRadius.lg,
  },
  button_sm: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    minHeight: 36,
  },
  button_md: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    minHeight: 48,
  },
  button_lg: {
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xl,
    minHeight: 56,
  },
  button_primary: {
    backgroundColor: Theme.colors.primary[500],
    ...Theme.shadows.sm,
  },
  button_secondary: {
    backgroundColor: Theme.colors.secondary[500],
    ...Theme.shadows.sm,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Theme.colors.primary[500],
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  button_gradient: {
    // Gradient handled by LinearGradient component
  },
  gradientContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.borderRadius.xl,
  },
  text: {
    fontWeight: Theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  text_sm: {
    fontSize: Theme.typography.fontSize.sm,
  },
  text_md: {
    fontSize: Theme.typography.fontSize.base,
  },
  text_lg: {
    fontSize: Theme.typography.fontSize.lg,
  },
  text_primary: {
    color: Theme.colors.text.inverse,
  },
  text_secondary: {
    color: Theme.colors.text.inverse,
  },
  text_outline: {
    color: Theme.colors.primary[500],
  },
  text_ghost: {
    color: Theme.colors.primary[500],
  },
  text_gradient: {
    color: Theme.colors.text.inverse,
  },
  textDisabled: {
    color: Theme.colors.text.disabled,
  },
  iconLeft: {
    marginRight: Theme.spacing.sm,
  },
  iconRight: {
    marginLeft: Theme.spacing.sm,
  },
  loadingIndicator: {
    marginRight: Theme.spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});
