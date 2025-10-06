// Gelişmiş mikro etkileşim servisi - UX odaklı
import { Animated, Easing, Dimensions } from 'react-native';
import { HapticFeedbackService } from './HapticFeedbackService';

const { width, height } = Dimensions.get('window');

export interface MicroInteractionConfig {
  duration: number;
  easing: string;
  delay?: number;
  useNativeDriver?: boolean;
  hapticFeedback?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
}

export interface AnimationPreset {
  name: string;
  config: MicroInteractionConfig;
  transform: (animatedValue: Animated.Value) => any;
}

export interface GestureConfig {
  threshold: number;
  velocity: number;
  hapticFeedback: boolean;
  visualFeedback: boolean;
  soundFeedback: boolean;
}

export class EnhancedMicroInteractionService {
  private static isInitialized = false;
  private static animationPresets: Map<string, AnimationPreset> = new Map();
  private static gestureConfigs: Map<string, GestureConfig> = new Map();
  private static activeAnimations: Set<string> = new Set();

  /**
   * Servisi başlatır
   */
  static initialize(): void {
    if (this.isInitialized) return;

    this.initializeAnimationPresets();
    this.initializeGestureConfigs();

    this.isInitialized = true;
    console.log('Enhanced Micro Interaction Service initialized!');
  }

  /**
   * Animasyon presetlerini başlatır
   */
  private static initializeAnimationPresets(): void {
    // Temel animasyonlar
    this.animationPresets.set('fadeIn', {
      name: 'fadeIn',
      config: {
        duration: 300,
        easing: 'ease-out',
        useNativeDriver: true,
        hapticFeedback: false,
      },
      transform: (animatedValue: Animated.Value) => ({
        opacity: animatedValue,
      }),
    });

    this.animationPresets.set('fadeOut', {
      name: 'fadeOut',
      config: {
        duration: 200,
        easing: 'ease-in',
        useNativeDriver: true,
        hapticFeedback: false,
      },
      transform: (animatedValue: Animated.Value) => ({
        opacity: animatedValue,
      }),
    });

    this.animationPresets.set('scaleIn', {
      name: 'scaleIn',
      config: {
        duration: 400,
        easing: 'ease-out',
        useNativeDriver: true,
        hapticFeedback: true,
        hapticType: 'light',
      },
      transform: (animatedValue: Animated.Value) => ({
        transform: [{ scale: animatedValue }],
      }),
    });

    this.animationPresets.set('scaleOut', {
      name: 'scaleOut',
      config: {
        duration: 300,
        easing: 'ease-in',
        useNativeDriver: true,
        hapticFeedback: false,
      },
      transform: (animatedValue: Animated.Value) => ({
        transform: [{ scale: animatedValue }],
      }),
    });

    // Slide animasyonları
    this.animationPresets.set('slideInFromLeft', {
      name: 'slideInFromLeft',
      config: {
        duration: 500,
        easing: 'ease-out',
        useNativeDriver: true,
        hapticFeedback: false,
      },
      transform: (animatedValue: Animated.Value) => ({
        transform: [{ translateX: animatedValue }],
      }),
    });

    this.animationPresets.set('slideInFromRight', {
      name: 'slideInFromRight',
      config: {
        duration: 500,
        easing: 'ease-out',
        useNativeDriver: true,
        hapticFeedback: false,
      },
      transform: (animatedValue: Animated.Value) => ({
        transform: [{ translateX: animatedValue }],
      }),
    });

    this.animationPresets.set('slideInFromBottom', {
      name: 'slideInFromBottom',
      config: {
        duration: 600,
        easing: 'ease-out',
        useNativeDriver: true,
        hapticFeedback: true,
        hapticType: 'medium',
      },
      transform: (animatedValue: Animated.Value) => ({
        transform: [{ translateY: animatedValue }],
      }),
    });

    this.animationPresets.set('slideInFromTop', {
      name: 'slideInFromTop',
      config: {
        duration: 500,
        easing: 'ease-out',
        useNativeDriver: true,
        hapticFeedback: false,
      },
      transform: (animatedValue: Animated.Value) => ({
        transform: [{ translateY: animatedValue }],
      }),
    });

    // Özel animasyonlar
    this.animationPresets.set('bounceIn', {
      name: 'bounceIn',
      config: {
        duration: 800,
        easing: 'bounce',
        useNativeDriver: true,
        hapticFeedback: true,
        hapticType: 'medium',
      },
      transform: (animatedValue: Animated.Value) => ({
        transform: [{ scale: animatedValue }],
      }),
    });

    this.animationPresets.set('elasticIn', {
      name: 'elasticIn',
      config: {
        duration: 1000,
        easing: 'elastic',
        useNativeDriver: true,
        hapticFeedback: true,
        hapticType: 'heavy',
      },
      transform: (animatedValue: Animated.Value) => ({
        transform: [{ scale: animatedValue }],
      }),
    });

    this.animationPresets.set('rotateIn', {
      name: 'rotateIn',
      config: {
        duration: 600,
        easing: 'ease-out',
        useNativeDriver: true,
        hapticFeedback: false,
      },
      transform: (animatedValue: Animated.Value) => ({
        transform: [{ rotate: animatedValue }],
      }),
    });

    // DNA özel animasyonları
    this.animationPresets.set('dnaPulse', {
      name: 'dnaPulse',
      config: {
        duration: 2000,
        easing: 'ease-in-out',
        useNativeDriver: true,
        hapticFeedback: false,
      },
      transform: (animatedValue: Animated.Value) => ({
        transform: [{ scale: animatedValue }],
      }),
    });

    this.animationPresets.set('geneticGlow', {
      name: 'geneticGlow',
      config: {
        duration: 1500,
        easing: 'ease-in-out',
        useNativeDriver: false,
        hapticFeedback: false,
      },
      transform: (animatedValue: Animated.Value) => ({
        opacity: animatedValue,
      }),
    });

    // Button animasyonları
    this.animationPresets.set('buttonPress', {
      name: 'buttonPress',
      config: {
        duration: 150,
        easing: 'ease-out',
        useNativeDriver: true,
        hapticFeedback: true,
        hapticType: 'light',
      },
      transform: (animatedValue: Animated.Value) => ({
        transform: [{ scale: animatedValue }],
      }),
    });

    this.animationPresets.set('buttonRelease', {
      name: 'buttonRelease',
      config: {
        duration: 200,
        easing: 'ease-out',
        useNativeDriver: true,
        hapticFeedback: false,
      },
      transform: (animatedValue: Animated.Value) => ({
        transform: [{ scale: animatedValue }],
      }),
    });

    // Card animasyonları
    this.animationPresets.set('cardAppear', {
      name: 'cardAppear',
      config: {
        duration: 500,
        easing: 'ease-out',
        useNativeDriver: true,
        hapticFeedback: false,
      },
      transform: (animatedValue: Animated.Value) => ({
        opacity: animatedValue,
        transform: [
          { scale: animatedValue },
          { translateY: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          })}
        ],
      }),
    });

    this.animationPresets.set('cardDisappear', {
      name: 'cardDisappear',
      config: {
        duration: 300,
        easing: 'ease-in',
        useNativeDriver: true,
        hapticFeedback: false,
      },
      transform: (animatedValue: Animated.Value) => ({
        opacity: animatedValue,
        transform: [
          { scale: animatedValue },
          { translateY: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -20],
          })}
        ],
      }),
    });

    // Loading animasyonları
    this.animationPresets.set('loadingSpin', {
      name: 'loadingSpin',
      config: {
        duration: 1000,
        easing: 'linear',
        useNativeDriver: true,
        hapticFeedback: false,
      },
      transform: (animatedValue: Animated.Value) => ({
        transform: [{ rotate: animatedValue }],
      }),
    });

    this.animationPresets.set('loadingPulse', {
      name: 'loadingPulse',
      config: {
        duration: 800,
        easing: 'ease-in-out',
        useNativeDriver: true,
        hapticFeedback: false,
      },
      transform: (animatedValue: Animated.Value) => ({
        opacity: animatedValue,
        transform: [{ scale: animatedValue }],
      }),
    });
  }

  /**
   * Gesture konfigürasyonlarını başlatır
   */
  private static initializeGestureConfigs(): void {
    this.gestureConfigs.set('tap', {
      threshold: 10,
      velocity: 0.1,
      hapticFeedback: true,
      visualFeedback: true,
      soundFeedback: false,
    });

    this.gestureConfigs.set('longPress', {
      threshold: 500,
      velocity: 0,
      hapticFeedback: true,
      visualFeedback: true,
      soundFeedback: false,
    });

    this.gestureConfigs.set('swipe', {
      threshold: 50,
      velocity: 0.3,
      hapticFeedback: true,
      visualFeedback: true,
      soundFeedback: false,
    });

    this.gestureConfigs.set('pinch', {
      threshold: 0.1,
      velocity: 0.2,
      hapticFeedback: true,
      visualFeedback: true,
      soundFeedback: false,
    });

    this.gestureConfigs.set('pan', {
      threshold: 20,
      velocity: 0.1,
      hapticFeedback: false,
      visualFeedback: true,
      soundFeedback: false,
    });
  }

  /**
   * Animasyon çalıştırır
   */
  static async runAnimation(
    animatedValue: Animated.Value,
    presetName: string,
    fromValue: number = 0,
    toValue: number = 1,
    onComplete?: () => void
  ): Promise<void> {
    const preset = this.animationPresets.get(presetName);
    if (!preset) {
      console.warn(`Animation preset '${presetName}' not found`);
      return;
    }

    const { config } = preset;
    const animationId = `${presetName}_${Date.now()}`;
    this.activeAnimations.add(animationId);

    // Haptic feedback
    if (config.hapticFeedback && config.hapticType) {
      HapticFeedbackService.trigger(config.hapticType);
    }

    // Animasyonu başlat
    const animation = Animated.timing(animatedValue, {
      toValue,
      duration: config.duration,
      easing: this.getEasingFunction(config.easing),
      useNativeDriver: config.useNativeDriver || false,
    });

    return new Promise((resolve) => {
      animation.start((finished) => {
        this.activeAnimations.delete(animationId);
        if (finished && onComplete) {
          onComplete();
        }
        resolve();
      });
    });
  }

  /**
   * Easing fonksiyonunu getirir
   */
  private static getEasingFunction(easing: string): any {
    switch (easing) {
      case 'linear': return Easing.linear;
      case 'ease': return Easing.ease;
      case 'ease-in': return Easing.in(Easing.ease);
      case 'ease-out': return Easing.out(Easing.ease);
      case 'ease-in-out': return Easing.inOut(Easing.ease);
      case 'bounce': return Easing.bounce;
      case 'elastic': return Easing.elastic(1);
      case 'back': return Easing.back(1);
      case 'quad': return Easing.quad;
      case 'cubic': return Easing.cubic;
      case 'sin': return Easing.sin;
      case 'circle': return Easing.circle;
      case 'exp': return Easing.exp;
      default: return Easing.ease;
    }
  }

  /**
   * Animasyon presetini getirir
   */
  static getAnimationPreset(name: string): AnimationPreset | null {
    return this.animationPresets.get(name) || null;
  }

  /**
   * Gesture konfigürasyonunu getirir
   */
  static getGestureConfig(name: string): GestureConfig | null {
    return this.gestureConfigs.get(name) || null;
  }

  /**
   * Tüm animasyon presetlerini getirir
   */
  static getAllAnimationPresets(): Map<string, AnimationPreset> {
    return new Map(this.animationPresets);
  }

  /**
   * Tüm gesture konfigürasyonlarını getirir
   */
  static getAllGestureConfigs(): Map<string, GestureConfig> {
    return new Map(this.gestureConfigs);
  }

  /**
   * Aktif animasyonları getirir
   */
  static getActiveAnimations(): string[] {
    return Array.from(this.activeAnimations);
  }

  /**
   * Tüm animasyonları durdurur
   */
  static stopAllAnimations(): void {
    this.activeAnimations.clear();
  }

  /**
   * Özel animasyon oluşturur
   */
  static createCustomAnimation(
    name: string,
    config: MicroInteractionConfig,
    transform: (animatedValue: Animated.Value) => any
  ): void {
    this.animationPresets.set(name, {
      name,
      config,
      transform,
    });
  }

  /**
   * Özel gesture konfigürasyonu oluşturur
   */
  static createCustomGestureConfig(
    name: string,
    config: GestureConfig
  ): void {
    this.gestureConfigs.set(name, config);
  }

  /**
   * Animasyon presetini günceller
   */
  static updateAnimationPreset(
    name: string,
    updates: Partial<MicroInteractionConfig>
  ): void {
    const preset = this.animationPresets.get(name);
    if (preset) {
      preset.config = { ...preset.config, ...updates };
    }
  }

  /**
   * Gesture konfigürasyonunu günceller
   */
  static updateGestureConfig(
    name: string,
    updates: Partial<GestureConfig>
  ): void {
    const config = this.gestureConfigs.get(name);
    if (config) {
      this.gestureConfigs.set(name, { ...config, ...updates });
    }
  }

  /**
   * Animasyon istatistiklerini getirir
   */
  static getAnimationStats(): {
    totalPresets: number;
    activeAnimations: number;
    mostUsedPreset: string | null;
  } {
    return {
      totalPresets: this.animationPresets.size,
      activeAnimations: this.activeAnimations.size,
      mostUsedPreset: null, // Bu gerçek uygulamada takip edilebilir
    };
  }

  /**
   * Servisi temizler
   */
  static cleanup(): void {
    this.animationPresets.clear();
    this.gestureConfigs.clear();
    this.activeAnimations.clear();
    this.isInitialized = false;
  }
}

