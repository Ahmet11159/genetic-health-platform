import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../constants/Theme';

interface AdvancedLoadingScreenProps {
  message?: string;
  progress?: number;
  showProgress?: boolean;
  type?: 'dna' | 'analysis' | 'general' | 'premium';
  onComplete?: () => void;
}

const { width, height } = Dimensions.get('window');

export default function AdvancedLoadingScreen({
  message = 'Yükleniyor...',
  progress = 0,
  showProgress = false,
  type = 'general',
  onComplete,
}: AdvancedLoadingScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startAnimations();
  }, []);

  useEffect(() => {
    if (showProgress) {
      Animated.timing(progressAnim, {
        toValue: progress / 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, showProgress]);

  useEffect(() => {
    if (progress >= 100 && onComplete) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [progress, onComplete]);

  const startAnimations = () => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const getLoadingConfig = () => {
    switch (type) {
      case 'dna':
        return {
          icon: 'dna',
          title: 'DNA Analizi',
          subtitle: 'Genetik verileriniz analiz ediliyor...',
          colors: [Theme.colors.primary[500], Theme.colors.primary[700]],
          iconColor: Theme.colors.primary[600],
        };
      case 'analysis':
        return {
          icon: 'analytics',
          title: 'Analiz Tamamlanıyor',
          subtitle: 'Sonuçlarınız hazırlanıyor...',
          colors: [Theme.colors.accent.purple, Theme.colors.accent.pink],
          iconColor: Theme.colors.accent.purple,
        };
      case 'premium':
        return {
          icon: 'diamond',
          title: 'Premium Yükleniyor',
          subtitle: 'Gelişmiş özellikler hazırlanıyor...',
          colors: [Theme.colors.accent.gold, Theme.colors.accent.amber],
          iconColor: Theme.colors.accent.gold,
        };
      default:
        return {
          icon: 'hourglass',
          title: 'Yükleniyor',
          subtitle: 'Lütfen bekleyin...',
          colors: [Theme.colors.primary[500], Theme.colors.primary[700]],
          iconColor: Theme.colors.primary[600],
        };
    }
  };

  const config = getLoadingConfig();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={config.colors[0]} />
      
      <LinearGradient
        colors={config.colors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { scale: pulseAnim },
              ],
            },
          ]}
        >
          {/* Animated Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name={config.icon as any} size={80} color="#fff" />
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>{config.title}</Text>
          
          {/* Subtitle */}
          <Text style={styles.subtitle}>{config.subtitle}</Text>
          
          {/* Custom Message */}
          {message && message !== config.subtitle && (
            <Text style={styles.message}>{message}</Text>
          )}

          {/* Progress Bar */}
          {showProgress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
          )}

          {/* Loading Dots */}
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.1],
                      outputRange: [0.3, 1],
                    }),
                    transform: [
                      {
                        scale: pulseAnim.interpolate({
                          inputRange: [1, 1.1],
                          outputRange: [0.8, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: Theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: Theme.typography.fontSize['3xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#fff',
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
    lineHeight: Theme.typography.lineHeight.normal * Theme.typography.fontSize.lg,
  },
  message: {
    fontSize: Theme.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    lineHeight: Theme.typography.lineHeight.normal * Theme.typography.fontSize.base,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: Theme.spacing.xl,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressText: {
    fontSize: Theme.typography.fontSize.sm,
    color: '#fff',
    textAlign: 'center',
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});
