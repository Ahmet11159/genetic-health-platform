// Premium loading states servisi
import { Animated, Easing, Dimensions } from 'react-native';
import { HapticFeedbackService } from './HapticFeedbackService';

const { width, height } = Dimensions.get('window');

export interface LoadingConfig {
  type: 'dna' | 'spinner' | 'dots' | 'pulse' | 'wave' | 'particle' | 'morphing' | 'skeleton';
  duration?: number;
  size?: number;
  color?: string;
  backgroundColor?: string;
  opacity?: number;
  intensity?: 'light' | 'medium' | 'heavy' | 'ultra';
  hapticFeedback?: boolean;
  message?: string;
  progress?: number;
}

export interface LoadingState {
  id: string;
  config: LoadingConfig;
  isVisible: boolean;
  startTime: number;
  progress: number;
  message: string;
}

export interface SkeletonConfig {
  width: number;
  height: number;
  borderRadius: number;
  shimmer: boolean;
  animation: 'pulse' | 'wave' | 'fade';
  color: string;
  highlightColor: string;
}

export class PremiumLoadingService {
  private static isInitialized = false;
  private static activeLoadings: Map<string, LoadingState> = new Map();
  private static loadingQueue: string[] = [];
  private static skeletonConfigs: Map<string, SkeletonConfig> = new Map();

  /**
   * Servisi başlatır
   */
  static initialize(): void {
    if (this.isInitialized) return;

    this.activeLoadings.clear();
    this.loadingQueue = [];
    this.initializeSkeletonConfigs();

    this.isInitialized = true;
  }

  /**
   * Skeleton konfigürasyonlarını başlatır
   */
  private static initializeSkeletonConfigs(): void {
    this.skeletonConfigs.set('card', {
      width: width - 40,
      height: 120,
      borderRadius: 12,
      shimmer: true,
      animation: 'wave',
      color: '#f0f0f0',
      highlightColor: '#ffffff',
    });

    this.skeletonConfigs.set('profile', {
      width: 60,
      height: 60,
      borderRadius: 30,
      shimmer: true,
      animation: 'pulse',
      color: '#f0f0f0',
      highlightColor: '#ffffff',
    });

    this.skeletonConfigs.set('text', {
      width: width - 40,
      height: 20,
      borderRadius: 4,
      shimmer: true,
      animation: 'wave',
      color: '#f0f0f0',
      highlightColor: '#ffffff',
    });

    this.skeletonConfigs.set('button', {
      width: 120,
      height: 40,
      borderRadius: 20,
      shimmer: true,
      animation: 'pulse',
      color: '#f0f0f0',
      highlightColor: '#ffffff',
    });
  }

  /**
   * Loading başlatır
   */
  static startLoading(
    id: string,
    config: LoadingConfig,
    message: string = 'Yükleniyor...'
  ): LoadingState {
    const loadingState: LoadingState = {
      id,
      config: {
        duration: 2000,
        size: 50,
        color: '#667eea',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        opacity: 1,
        intensity: 'medium',
        hapticFeedback: true,
        progress: 0,
        ...config,
      },
      isVisible: true,
      startTime: Date.now(),
      progress: 0,
      message,
    };

    this.activeLoadings.set(id, loadingState);

    if (loadingState.config.hapticFeedback) {
      HapticFeedbackService.trigger('light');
    }

    return loadingState;
  }

  /**
   * Loading günceller
   */
  static updateLoading(id: string, updates: Partial<LoadingState>): void {
    const loading = this.activeLoadings.get(id);
    if (loading) {
      Object.assign(loading, updates);
    }
  }

  /**
   * Loading durdurur
   */
  static stopLoading(id: string): void {
    const loading = this.activeLoadings.get(id);
    if (loading) {
      loading.isVisible = false;
      this.activeLoadings.delete(id);
      
      if (loading.config.hapticFeedback) {
        HapticFeedbackService.trigger('success');
      }
    }
  }

  /**
   * Tüm loading'leri durdurur
   */
  static stopAllLoadings(): void {
    this.activeLoadings.forEach((loading, id) => {
      this.stopLoading(id);
    });
  }

  /**
   * DNA loading animasyonu
   */
  static createDNALoading(
    animatedValue: Animated.Value,
    config: LoadingConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 2000,
      size = 50,
      color = '#667eea',
      intensity = 'medium'
    } = config;

    const rotationSpeed = intensity === 'ultra' ? 0.5 : intensity === 'heavy' ? 0.7 : intensity === 'medium' ? 1 : 1.5;

    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: duration * rotationSpeed,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 0,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
  }

  /**
   * Spinner loading animasyonu
   */
  static createSpinnerLoading(
    animatedValue: Animated.Value,
    config: LoadingConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 1000,
      intensity = 'medium'
    } = config;

    const rotationSpeed = intensity === 'ultra' ? 0.3 : intensity === 'heavy' ? 0.5 : intensity === 'medium' ? 0.7 : 1;

    return Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: duration * rotationSpeed,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
  }

  /**
   * Dots loading animasyonu
   */
  static createDotsLoading(
    animatedValues: Animated.Value[],
    config: LoadingConfig = {}
  ): Animated.CompositeAnimation[] {
    const {
      duration = 600,
      intensity = 'medium'
    } = config;

    const delay = duration / animatedValues.length;

    return animatedValues.map((animatedValue, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: duration / 2,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: duration / 2,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
    });
  }

  /**
   * Pulse loading animasyonu
   */
  static createPulseLoading(
    animatedValue: Animated.Value,
    config: LoadingConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 1000,
      intensity = 'medium'
    } = config;

    const pulseIntensity = intensity === 'ultra' ? 0.3 : intensity === 'heavy' ? 0.25 : intensity === 'medium' ? 0.2 : 0.15;

    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1 + pulseIntensity,
          duration: duration / 2,
          easing: Easing.out(Easing.sine),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1 - pulseIntensity,
          duration: duration / 2,
          easing: Easing.in(Easing.sine),
          useNativeDriver: true,
        }),
      ])
    );
  }

  /**
   * Wave loading animasyonu
   */
  static createWaveLoading(
    animatedValues: Animated.Value[],
    config: LoadingConfig = {}
  ): Animated.CompositeAnimation[] {
    const {
      duration = 1200,
      intensity = 'medium'
    } = config;

    const waveSpeed = intensity === 'ultra' ? 0.5 : intensity === 'heavy' ? 0.7 : intensity === 'medium' ? 1 : 1.3;

    return animatedValues.map((animatedValue, index) => {
      const delay = (duration / animatedValues.length) * index;
      
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: duration * waveSpeed / 2,
            easing: Easing.out(Easing.sine),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: duration * waveSpeed / 2,
            easing: Easing.in(Easing.sine),
            useNativeDriver: true,
          }),
        ])
      );
    });
  }

  /**
   * Particle loading animasyonu
   */
  static createParticleLoading(
    animatedValues: Animated.Value[],
    config: LoadingConfig = {}
  ): Animated.CompositeAnimation[] {
    const {
      duration = 2000,
      intensity = 'medium'
    } = config;

    const particleCount = animatedValues.length;
    const particleSpeed = intensity === 'ultra' ? 0.3 : intensity === 'heavy' ? 0.5 : intensity === 'medium' ? 0.7 : 1;

    return animatedValues.map((animatedValue, index) => {
      const angle = (360 / particleCount) * index;
      const radius = 50;
      const x = Math.cos(angle * Math.PI / 180) * radius;
      const y = Math.sin(angle * Math.PI / 180) * radius;

      return Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: duration * particleSpeed,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: duration * particleSpeed,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
    });
  }

  /**
   * Morphing loading animasyonu
   */
  static createMorphingLoading(
    animatedValue: Animated.Value,
    config: LoadingConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 1500,
      intensity = 'medium'
    } = config;

    const morphSpeed = intensity === 'ultra' ? 0.5 : intensity === 'heavy' ? 0.7 : intensity === 'medium' ? 1 : 1.3;

    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: duration * morphSpeed / 2,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: duration * morphSpeed / 2,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
      ])
    );
  }

  /**
   * Skeleton loading oluşturur
   */
  static createSkeletonLoading(
    type: string,
    animatedValue: Animated.Value,
    config: Partial<SkeletonConfig> = {}
  ): Animated.CompositeAnimation {
    const skeletonConfig = this.skeletonConfigs.get(type) || this.skeletonConfigs.get('card')!;
    const finalConfig = { ...skeletonConfig, ...config };

    if (finalConfig.animation === 'pulse') {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 0.6,
            duration: 1000,
            easing: Easing.inOut(Easing.sine),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.sine),
            useNativeDriver: true,
          }),
        ])
      );
    } else if (finalConfig.animation === 'wave') {
      return Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
    } else {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 0.3,
            duration: 800,
            easing: Easing.inOut(Easing.sine),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.sine),
            useNativeDriver: true,
          }),
        ])
      );
    }
  }

  /**
   * Progress loading oluşturur
   */
  static createProgressLoading(
    animatedValue: Animated.Value,
    progress: number,
    config: LoadingConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 1000
    } = config;

    return Animated.timing(animatedValue, {
      toValue: progress,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    });
  }

  /**
   * Loading durumunu getirir
   */
  static getLoadingState(id: string): LoadingState | null {
    return this.activeLoadings.get(id) || null;
  }

  /**
   * Tüm aktif loading'leri getirir
   */
  static getAllActiveLoadings(): LoadingState[] {
    return Array.from(this.activeLoadings.values());
  }

  /**
   * Loading istatistiklerini getirir
   */
  static getLoadingStats(): {
    activeCount: number;
    totalTime: number;
    averageTime: number;
  } {
    const activeLoadings = this.getAllActiveLoadings();
    const totalTime = activeLoadings.reduce((total, loading) => {
      return total + (Date.now() - loading.startTime);
    }, 0);
    const averageTime = activeLoadings.length > 0 ? totalTime / activeLoadings.length : 0;

    return {
      activeCount: activeLoadings.length,
      totalTime,
      averageTime,
    };
  }

  /**
   * Skeleton konfigürasyonunu getirir
   */
  static getSkeletonConfig(type: string): SkeletonConfig | null {
    return this.skeletonConfigs.get(type) || null;
  }

  /**
   * Skeleton konfigürasyonunu günceller
   */
  static updateSkeletonConfig(type: string, config: Partial<SkeletonConfig>): void {
    const existingConfig = this.skeletonConfigs.get(type);
    if (existingConfig) {
      this.skeletonConfigs.set(type, { ...existingConfig, ...config });
    }
  }

  /**
   * Servisi temizler
   */
  static cleanup(): void {
    this.activeLoadings.clear();
    this.loadingQueue = [];
    this.skeletonConfigs.clear();
    this.isInitialized = false;
  }
}


