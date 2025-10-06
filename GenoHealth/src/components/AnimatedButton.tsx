import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  icon?: string;
  gradient?: string[];
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

const { width } = Dimensions.get('window');

export default function AnimatedButton({
  title,
  onPress,
  icon,
  gradient,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style
}: AnimatedButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (loading) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [loading, pulseAnim]);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(rippleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const getGradientColors = () => {
    if (gradient) return gradient;
    
    switch (variant) {
      case 'primary': return ['#4CAF50', '#66BB6A'];
      case 'secondary': return ['#2196F3', '#42A5F5'];
      case 'success': return ['#4CAF50', '#66BB6A'];
      case 'warning': return ['#FF9800', '#FFB74D'];
      case 'danger': return ['#F44336', '#EF5350'];
      default: return ['#4CAF50', '#66BB6A'];
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small': return { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 };
      case 'medium': return { paddingVertical: 12, paddingHorizontal: 24, fontSize: 16 };
      case 'large': return { paddingVertical: 16, paddingHorizontal: 32, fontSize: 18 };
      default: return { paddingVertical: 12, paddingHorizontal: 24, fontSize: 16 };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { scale: loading ? pulseAnim : 1 }
          ],
          opacity: disabled ? 0.6 : 1
        },
        style
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        <LinearGradient
          colors={getGradientColors()}
          style={[styles.gradient, { paddingVertical: sizeStyles.paddingVertical }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Ripple Effect */}
          <Animated.View
            style={[
              styles.ripple,
              {
                opacity: rippleAnim,
                transform: [
                  {
                    scale: rippleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1.5]
                    })
                  }
                ]
              }
            ]}
          />
          
          {/* Content */}
          <View style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Animated.View style={styles.loadingDot} />
                <Animated.View style={[styles.loadingDot, { animationDelay: 200 }]} />
                <Animated.View style={[styles.loadingDot, { animationDelay: 400 }]} />
              </View>
            ) : (
              <>
                {icon && (
                  <Ionicons 
                    name={icon as any} 
                    size={sizeStyles.fontSize} 
                    color="#fff" 
                    style={styles.icon}
                  />
                )}
                <Text style={[styles.text, { fontSize: sizeStyles.fontSize }]}>
                  {title}
                </Text>
              </>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  touchable: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    paddingHorizontal: 24,
    borderRadius: 12,
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginHorizontal: 2,
  },
});


