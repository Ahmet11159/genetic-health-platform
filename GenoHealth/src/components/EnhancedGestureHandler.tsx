import React from 'react';
import { View, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { HapticFeedbackService } from '../services/HapticFeedbackService';

export interface EnhancedGestureHandlerProps {
  children: React.ReactNode;
  onTap?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', event: GestureResponderEvent) => void;
  onPinch?: (scale: number, event: GestureResponderEvent) => void;
  onPan?: (translation: { x: number; y: number }, event: GestureResponderEvent) => void;
  gestureConfig?: {
    tap?: {
      enabled?: boolean;
      threshold?: number;
      hapticFeedback?: boolean;
    };
    longPress?: {
      enabled?: boolean;
      duration?: number;
      threshold?: number;
      hapticFeedback?: boolean;
    };
    swipe?: {
      enabled?: boolean;
      threshold?: number;
      velocity?: number;
      hapticFeedback?: boolean;
    };
    pinch?: {
      enabled?: boolean;
      threshold?: number;
      hapticFeedback?: boolean;
    };
    pan?: {
      enabled?: boolean;
      threshold?: number;
      hapticFeedback?: boolean;
    };
  };
  visualFeedback?: boolean;
  animationType?: 'scale' | 'opacity' | 'translate' | 'rotate' | 'none';
  disabled?: boolean;
  testID?: string;
}

export default function EnhancedGestureHandler({
  children,
  onTap,
  onLongPress,
  onSwipe,
  onPinch,
  onPan,
  gestureConfig = {},
  visualFeedback = true,
  animationType = 'scale',
  disabled = false,
  testID,
}: EnhancedGestureHandlerProps) {
  // Varsayılan konfigürasyon
  const defaultConfig = {
    tap: {
      enabled: true,
      threshold: 10,
      hapticFeedback: true,
      ...gestureConfig.tap,
    },
    longPress: {
      enabled: true,
      duration: 500,
      threshold: 10,
      hapticFeedback: true,
      ...gestureConfig.longPress,
    },
    swipe: {
      enabled: true,
      threshold: 50,
      velocity: 0.3,
      hapticFeedback: true,
      ...gestureConfig.swipe,
    },
    pinch: {
      enabled: true,
      threshold: 0.1,
      hapticFeedback: true,
      ...gestureConfig.pinch,
    },
    pan: {
      enabled: true,
      threshold: 20,
      hapticFeedback: false,
      ...gestureConfig.pan,
    },
  };

  // Tap handler
  const handlePress = (event: GestureResponderEvent) => {
    if (disabled || !defaultConfig.tap.enabled) return;

    if (defaultConfig.tap.hapticFeedback) {
      HapticFeedbackService.trigger('light');
    }

    if (onTap) {
      onTap(event);
    }
  };

  // Long press handler
  const handleLongPress = (event: GestureResponderEvent) => {
    if (disabled || !defaultConfig.longPress.enabled) return;

    if (defaultConfig.longPress.hapticFeedback) {
      HapticFeedbackService.trigger('medium');
    }

    if (onLongPress) {
      onLongPress(event);
    }
  };

  return (
    <View testID={testID}>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        disabled={disabled}
        activeOpacity={visualFeedback ? 0.7 : 1}
        style={{ flex: 1 }}
      >
        {children}
      </TouchableOpacity>
    </View>
  );
}

// Önceden tanımlanmış gesture handler'lar
export const TapHandler = (props: Omit<EnhancedGestureHandlerProps, 'gestureConfig'>) => (
  <EnhancedGestureHandler
    gestureConfig={{
      tap: { enabled: true },
      longPress: { enabled: false },
      swipe: { enabled: false },
      pinch: { enabled: false },
      pan: { enabled: false },
    }}
    {...props}
  />
);

export const SwipeHandler = (props: Omit<EnhancedGestureHandlerProps, 'gestureConfig'>) => (
  <EnhancedGestureHandler
    gestureConfig={{
      tap: { enabled: false },
      longPress: { enabled: false },
      swipe: { enabled: true },
      pinch: { enabled: false },
      pan: { enabled: false },
    }}
    {...props}
  />
);

export const PinchHandler = (props: Omit<EnhancedGestureHandlerProps, 'gestureConfig'>) => (
  <EnhancedGestureHandler
    gestureConfig={{
      tap: { enabled: false },
      longPress: { enabled: false },
      swipe: { enabled: false },
      pinch: { enabled: true },
      pan: { enabled: false },
    }}
    {...props}
  />
);

export const PanHandler = (props: Omit<EnhancedGestureHandlerProps, 'gestureConfig'>) => (
  <EnhancedGestureHandler
    gestureConfig={{
      tap: { enabled: false },
      longPress: { enabled: false },
      swipe: { enabled: false },
      pinch: { enabled: false },
      pan: { enabled: true },
    }}
    {...props}
  />
);

export const FullGestureHandler = (props: Omit<EnhancedGestureHandlerProps, 'gestureConfig'>) => (
  <EnhancedGestureHandler
    gestureConfig={{
      tap: { enabled: true },
      longPress: { enabled: true },
      swipe: { enabled: true },
      pinch: { enabled: true },
      pan: { enabled: true },
    }}
    {...props}
  />
);