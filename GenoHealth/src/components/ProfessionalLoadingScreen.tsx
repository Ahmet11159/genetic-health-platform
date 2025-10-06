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

const { width, height } = Dimensions.get('window');

interface ProfessionalLoadingScreenProps {
  title?: string;
  subtitle?: string;
  progress?: number;
  showProgress?: boolean;
}

export default function ProfessionalLoadingScreen({
  title = 'GenoHealth',
  subtitle = 'DNA Analizi & Sağlık',
  progress = 0,
  showProgress = false,
}: ProfessionalLoadingScreenProps) {
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Başlatma animasyonları
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

    // DNA helix rotasyon animasyonu
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    // Pulse animasyonu
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Progress animasyonu
    if (showProgress) {
      Animated.timing(progressAnim, {
        toValue: progress / 100,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, showProgress]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.primary[800]} />
      
      <LinearGradient
        colors={[Theme.colors.primary[800], Theme.colors.primary[600], Theme.colors.primary[500]]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* DNA Helix Animation */}
          <Animated.View
            style={[
              styles.dnaContainer,
              {
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                  { scale: pulseAnim },
                ],
              },
            ]}
          >
            <Ionicons name="dna" size={80} color={Theme.colors.background.primary} />
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

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
          <View style={styles.loadingDots}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>

          {/* Scientific Info */}
          <View style={styles.scientificInfo}>
            <Text style={styles.scientificText}>
              Bilimsel DNA Analizi • QWEN AI • %99 Güvenilirlik
            </Text>
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
  dnaContainer: {
    marginBottom: Theme.spacing['2xl'],
  },
  title: {
    fontSize: Theme.typography.fontSize['4xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.inverse,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: Theme.spacing['2xl'],
  },
  progressContainer: {
    width: width * 0.7,
    marginBottom: Theme.spacing['2xl'],
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
    marginBottom: Theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.full,
  },
  progressText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.inverse,
    textAlign: 'center',
    opacity: 0.8,
  },
  loadingDots: {
    flexDirection: 'row',
    marginBottom: Theme.spacing['2xl'],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.background.primary,
    marginHorizontal: Theme.spacing.xs,
  },
  scientificInfo: {
    position: 'absolute',
    bottom: Theme.spacing['3xl'],
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scientificText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.inverse,
    opacity: 0.7,
    textAlign: 'center',
  },
});

