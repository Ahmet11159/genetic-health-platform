import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

interface PremiumToastProps {
  visible: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onHide: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const { width } = Dimensions.get('window');

export default function PremiumToast({
  visible,
  type,
  title,
  message,
  duration = 3000,
  onHide,
  action
}: PremiumToastProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const { triggerSuccess, triggerError, triggerWarning, triggerLight } = useHapticFeedback();

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      switch (type) {
        case 'success':
          triggerSuccess();
          break;
        case 'error':
          triggerError();
          break;
        case 'warning':
          triggerWarning();
          break;
        default:
          triggerLight();
      }

      // Show animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        })
      ]).start();

      // Auto hide
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, type]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      onHide();
    });
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          gradient: ['#4CAF50', '#66BB6A'],
          iconColor: '#fff',
        };
      case 'error':
        return {
          icon: 'close-circle',
          gradient: ['#F44336', '#EF5350'],
          iconColor: '#fff',
        };
      case 'warning':
        return {
          icon: 'warning',
          gradient: ['#FF9800', '#FFB74D'],
          iconColor: '#fff',
        };
      case 'info':
        return {
          icon: 'information-circle',
          gradient: ['#2196F3', '#42A5F5'],
          iconColor: '#fff',
        };
      default:
        return {
          icon: 'information-circle',
          gradient: ['#9E9E9E', '#BDBDBD'],
          iconColor: '#fff',
        };
    }
  };

  const config = getTypeConfig();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
          opacity: fadeAnim,
        }
      ]}
    >
      <LinearGradient
        colors={config.gradient}
        style={styles.toast}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name={config.icon as any} size={24} color={config.iconColor} />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.message}>{message}</Text>}
          </View>

          <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
            <Ionicons name="close" size={20} color="rgba(255, 255, 255, 0.8)" />
          </TouchableOpacity>
        </View>

        {action && (
          <TouchableOpacity style={styles.actionButton} onPress={action.onPress}>
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  toast: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    margin: 16,
    marginTop: 0,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});


