import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../constants/Theme';

interface InteractiveElementProps {
  title: string;
  content: string | string[];
  maxLines?: number;
  expandText?: string;
  collapseText?: string;
  icon?: string;
  style?: any;
  contentStyle?: any;
  onPress?: () => void;
  animated?: boolean;
}

export default function InteractiveElement({
  title,
  content,
  maxLines = 3,
  expandText = 'Devamını oku',
  collapseText = 'Daha az göster',
  icon = 'chevron-down',
  style,
  contentStyle,
  onPress,
  animated = true,
}: InteractiveElementProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rotation] = useState(new Animated.Value(0));

  const shouldShowExpandButton = Array.isArray(content) 
    ? content.length > maxLines 
    : content.length > maxLines * 50; // Approximate character count

  const handleToggle = () => {
    if (onPress) {
      onPress();
    } else {
      setIsExpanded(!isExpanded);
      
      if (animated) {
        Animated.timing(rotation, {
          toValue: isExpanded ? 0 : 1,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const renderContent = () => {
    if (Array.isArray(content)) {
      const visibleItems = isExpanded ? content : content.slice(0, maxLines);
      return visibleItems.map((item, index) => (
        <Text key={index} style={[styles.contentText, contentStyle]}>
          {item}
        </Text>
      ));
    } else {
      return (
        <Text 
          style={[styles.contentText, contentStyle]} 
          numberOfLines={isExpanded ? undefined : maxLines}
        >
          {content}
        </Text>
      );
    }
  };

  return (
    <View style={[styles.container, style]}>
      {title && (
        <Text style={styles.title}>{title}</Text>
      )}
      
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
      
      {shouldShowExpandButton && (
        <TouchableOpacity 
          style={styles.expandButton}
          onPress={handleToggle}
          activeOpacity={0.7}
        >
          <Text style={styles.expandText}>
            {isExpanded ? collapseText : expandText}
          </Text>
          <Animated.View
            style={{
              transform: [{
                rotate: rotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg'],
                })
              }]
            }}
          >
            <Ionicons 
              name={icon as any} 
              size={16} 
              color={Theme.colors.primary[600]} 
            />
          </Animated.View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  contentContainer: {
    marginBottom: Theme.spacing.sm,
  },
  contentText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    lineHeight: Theme.typography.lineHeight.normal * Theme.typography.fontSize.base,
    marginBottom: Theme.spacing.xs,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.primary[50],
    borderRadius: Theme.borderRadius.lg,
    gap: Theme.spacing.xs,
  },
  expandText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.primary[600],
    fontWeight: Theme.typography.fontWeight.semibold,
  },
});
