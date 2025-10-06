import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface PremiumLoadingScreenProps {
  title: string;
  subtitle: string;
  progress: number;
  currentStep: string;
  totalSteps: number;
}

const { width, height } = Dimensions.get('window');

export default function PremiumLoadingScreen({
  title,
  subtitle,
  progress,
  currentStep,
  totalSteps
}: PremiumLoadingScreenProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Başlangıç animasyonları
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();

    // Dönen DNA animasyonu
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
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
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Progress animasyonu
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();

    return () => {
      rotateAnimation.stop();
      pulseAnimation.stop();
    };
  }, [progress]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, width * 0.8],
  });

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* DNA İkonu */}
        <View style={styles.dnaContainer}>
          <Animated.View
            style={[
              styles.dnaIcon,
              {
                transform: [
                  { rotate: rotateInterpolate },
                  { scale: pulseAnim }
                ]
              }
            ]}
          >
            <Ionicons name="dna" size={80} color="#4CAF50" />
          </Animated.View>
          
          {/* Orbiting dots */}
          <Animated.View
            style={[
              styles.orbitDot1,
              {
                transform: [
                  { rotate: rotateInterpolate }
                ]
              }
            ]}
          >
            <View style={styles.dot} />
          </Animated.View>
          <Animated.View
            style={[
              styles.orbitDot2,
              {
                transform: [
                  { rotate: rotateInterpolate }
                ]
              }
            ]}
          >
            <View style={styles.dot} />
          </Animated.View>
        </View>

        {/* Başlık */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressWidth,
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>

        {/* Current Step */}
        <View style={styles.stepContainer}>
          <Text style={styles.stepText}>{currentStep}</Text>
          <Text style={styles.stepCounter}>
            {totalSteps > 0 ? `Adım ${totalSteps}` : ''}
          </Text>
        </View>

        {/* Loading Dots */}
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, styles.loadingDot1]} />
          <Animated.View style={[styles.dot, styles.loadingDot2]} />
          <Animated.View style={[styles.dot, styles.loadingDot3]} />
        </View>

        {/* Premium Badge */}
        <View style={styles.premiumBadge}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.premiumText}>PREMIUM ANALİZ</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  dnaContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  dnaIcon: {
    position: 'absolute',
  },
  orbitDot1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  orbitDot2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#B0BEC5',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  stepContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  stepText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepCounter: {
    fontSize: 12,
    color: '#B0BEC5',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  loadingDot1: {
    marginRight: 8,
    animationDelay: '0ms',
  },
  loadingDot2: {
    marginRight: 8,
    animationDelay: '200ms',
  },
  loadingDot3: {
    animationDelay: '400ms',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  premiumText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});


