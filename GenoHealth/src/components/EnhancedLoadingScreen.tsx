import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { H1, H2, BodyText, Caption } from './EnhancedText';

const { width, height } = Dimensions.get('window');

export interface EnhancedLoadingScreenProps {
  title?: string;
  subtitle?: string;
  message?: string;
  progress?: number;
  showProgress?: boolean;
  autoComplete?: boolean;
  autoCompleteDelay?: number;
  onComplete?: () => void;
  variant?: 'default' | 'dna' | 'health' | 'analysis';
  style?: any;
}

export default function EnhancedLoadingScreen({
  title = 'Yükleniyor',
  subtitle,
  message = 'Lütfen bekleyin...',
  progress = 0,
  showProgress = false,
  autoComplete = false,
  autoCompleteDelay = 3000,
  onComplete,
  variant = 'default',
  style,
}: EnhancedLoadingScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Başlangıç animasyonu
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotasyon animasyonu
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    // Pulse animasyonu
    const pulseAnimation = Animated.loop(
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
    );
    pulseAnimation.start();

    // Otomatik tamamlama
    if (autoComplete) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, autoCompleteDelay);
      return () => clearTimeout(timer);
    }
  }, [autoComplete, autoCompleteDelay, onComplete]);

  const getVariantConfig = () => {
    switch (variant) {
      case 'dna':
        return {
          icon: 'dna',
          colors: ['#4CAF50', '#66BB6A'],
          iconColor: '#4CAF50',
        };
      case 'health':
        return {
          icon: 'heart',
          colors: ['#E91E63', '#F06292'],
          iconColor: '#E91E63',
        };
      case 'analysis':
        return {
          icon: 'analytics',
          colors: ['#2196F3', '#64B5F6'],
          iconColor: '#2196F3',
        };
      default:
        return {
          icon: 'hourglass',
          colors: ['#9E9E9E', '#BDBDBD'],
          iconColor: '#9E9E9E',
        };
    }
  };

  const config = getVariantConfig();

  return (
    <View style={[styles.container, style]}>
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
          <Animated.View
            style={{
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            }}
          >
            <Ionicons name={config.icon as any} size={80} color="#fff" />
          </Animated.View>

          <H1 color="#fff" style={styles.title}>
            {title}
          </H1>

          {subtitle && (
            <H2 color="rgba(255, 255, 255, 0.9)" style={styles.subtitle}>
              {subtitle}
            </H2>
          )}

          <BodyText color="rgba(255, 255, 255, 0.8)" style={styles.message}>
            {message}
          </BodyText>

          {showProgress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, Math.max(0, progress))}%`,
                    },
                  ]}
                />
              </View>
              <Caption color="rgba(255, 255, 255, 0.7)" style={styles.progressText}>
                {Math.round(progress)}%
              </Caption>
            </View>
          )}
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

// Özel loading screen varyantları
export const DNALoadingScreen = (props: Omit<EnhancedLoadingScreenProps, 'variant'>) => (
  <EnhancedLoadingScreen variant="dna" {...props} />
);

export const HealthLoadingScreen = (props: Omit<EnhancedLoadingScreenProps, 'variant'>) => (
  <EnhancedLoadingScreen variant="health" {...props} />
);

export const AnalysisLoadingScreen = (props: Omit<EnhancedLoadingScreenProps, 'variant'>) => (
  <EnhancedLoadingScreen variant="analysis" {...props} />
);

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
    paddingHorizontal: 40,
  },
  title: {
    marginTop: 24,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  progressContainer: {
    marginTop: 32,
    width: 200,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  progressText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
});