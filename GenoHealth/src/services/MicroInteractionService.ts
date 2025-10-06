// Premium micro-interactions servisi
import { Animated, Easing, Dimensions } from 'react-native';
import { HapticFeedbackService } from './HapticFeedbackService';

const { width, height } = Dimensions.get('window');

export interface MicroInteractionConfig {
  duration?: number;
  delay?: number;
  easing?: any;
  useNativeDriver?: boolean;
  hapticFeedback?: boolean;
  soundEffect?: boolean;
}

export interface RippleConfig {
  x: number;
  y: number;
  color?: string;
  size?: number;
  duration?: number;
}

export interface ShimmerConfig {
  width?: number;
  height?: number;
  colors?: string[];
  duration?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export class MicroInteractionService {
  private static activeAnimations: Map<string, Animated.Value> = new Map();
  private static animationQueue: string[] = [];

  /**
   * Servisi başlatır
   */
  static initialize(): void {
    this.activeAnimations.clear();
    this.animationQueue = [];
  }

  /**
   * Premium button press animasyonu
   */
  static async premiumButtonPress(
    animatedValue: Animated.Value,
    config: MicroInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 150,
      hapticFeedback = true,
      useNativeDriver = true
    } = config;

    if (hapticFeedback) {
      HapticFeedbackService.trigger('button_press');
    }

    // Scale down
    Animated.timing(animatedValue, {
      toValue: 0.95,
      duration: duration / 2,
      easing: Easing.out(Easing.quad),
      useNativeDriver,
    }).start();

    // Scale back up
    setTimeout(() => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver,
      }).start();
    }, duration / 2);
  }

  /**
   * Card hover animasyonu
   */
  static async cardHover(
    animatedValue: Animated.Value,
    config: MicroInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 200,
      useNativeDriver = true
    } = config;

    Animated.timing(animatedValue, {
      toValue: 1.02,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver,
    }).start();
  }

  /**
   * Card leave animasyonu
   */
  static async cardLeave(
    animatedValue: Animated.Value,
    config: MicroInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 200,
      useNativeDriver = true
    } = config;

    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver,
    }).start();
  }

  /**
   * Success state animasyonu
   */
  static async successState(
    animatedValue: Animated.Value,
    config: MicroInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 600,
      hapticFeedback = true,
      useNativeDriver = true
    } = config;

    if (hapticFeedback) {
      HapticFeedbackService.trigger('success');
    }

    // Scale up
    Animated.timing(animatedValue, {
      toValue: 1.1,
      duration: duration / 3,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver,
    }).start();

    // Scale back
    setTimeout(() => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: duration * 2 / 3,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver,
      }).start();
    }, duration / 3);
  }

  /**
   * Error state animasyonu
   */
  static async errorState(
    animatedValue: Animated.Value,
    config: MicroInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 500,
      hapticFeedback = true,
      useNativeDriver = true
    } = config;

    if (hapticFeedback) {
      HapticFeedbackService.trigger('error');
    }

    // Shake animation
    const shakeValues = [0, -10, 10, -10, 10, -5, 5, 0];
    const shakeDuration = duration / shakeValues.length;

    shakeValues.forEach((value, index) => {
      setTimeout(() => {
        Animated.timing(animatedValue, {
          toValue,
          duration: shakeDuration,
          easing: Easing.linear,
          useNativeDriver,
        }).start();
      }, index * shakeDuration);
    });
  }

  /**
   * Loading state animasyonu
   */
  static async loadingState(
    animatedValue: Animated.Value,
    config: MicroInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 1000,
      useNativeDriver = true
    } = config;

    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.8,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver,
        }),
      ])
    ).start();
  }

  /**
   * Ripple effect animasyonu
   */
  static async rippleEffect(
    scaleValue: Animated.Value,
    opacityValue: Animated.Value,
    config: RippleConfig
  ): Promise<void> {
    const {
      size = 100,
      duration = 600,
      color = '#667eea'
    } = config;

    // Reset values
    scaleValue.setValue(0);
    opacityValue.setValue(1);

    // Animate ripple
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: size / 50,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }

  /**
   * Shimmer effect animasyonu
   */
  static async shimmerEffect(
    animatedValue: Animated.Value,
    config: ShimmerConfig = {}
  ): Promise<void> {
    const {
      duration = 1500,
      useNativeDriver = true
    } = config;

    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver,
      })
    ).start();
  }

  /**
   * Bounce in animasyonu
   */
  static async bounceIn(
    animatedValue: Animated.Value,
    config: MicroInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 800,
      hapticFeedback = true,
      useNativeDriver = true
    } = config;

    if (hapticFeedback) {
      HapticFeedbackService.trigger('button_press');
    }

    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.2,
        duration: duration / 3,
        easing: Easing.out(Easing.quad),
        useNativeDriver,
      }),
      Animated.timing(animatedValue, {
        toValue: 0.9,
        duration: duration / 3,
        easing: Easing.in(Easing.quad),
        useNativeDriver,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: duration / 3,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver,
      }),
    ]).start();
  }

  /**
   * Slide in from left animasyonu
   */
  static async slideInLeft(
    animatedValue: Animated.Value,
    config: MicroInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 400,
      useNativeDriver = true
    } = config;

    Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver,
    }).start();
  }

  /**
   * Slide in from right animasyonu
   */
  static async slideInRight(
    animatedValue: Animated.Value,
    config: MicroInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 400,
      useNativeDriver = true
    } = config;

    Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver,
    }).start();
  }

  /**
   * Fade in animasyonu
   */
  static async fadeIn(
    animatedValue: Animated.Value,
    config: MicroInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 300,
      useNativeDriver = true
    } = config;

    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver,
    }).start();
  }

  /**
   * Fade out animasyonu
   */
  static async fadeOut(
    animatedValue: Animated.Value,
    config: MicroInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 300,
      useNativeDriver = true
    } = config;

    Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      easing: Easing.in(Easing.quad),
      useNativeDriver,
    }).start();
  }

  /**
   * Scale animasyonu
   */
  static async scale(
    animatedValue: Animated.Value,
    toValue: number,
    config: MicroInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 300,
      useNativeDriver = true
    } = config;

    Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.back(1.1)),
      useNativeDriver,
    }).start();
  }

  /**
   * Rotate animasyonu
   */
  static async rotate(
    animatedValue: Animated.Value,
    config: MicroInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 1000,
      useNativeDriver = true
    } = config;

    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver,
      })
    ).start();
  }

  /**
   * Pulse animasyonu
   */
  static async pulse(
    animatedValue: Animated.Value,
    config: MicroInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 1000,
      useNativeDriver = true
    } = config;

    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.1,
          duration: duration / 2,
          easing: Easing.out(Easing.quad),
          useNativeDriver,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.in(Easing.quad),
          useNativeDriver,
        }),
      ])
    ).start();
  }

  /**
   * Heartbeat animasyonu
   */
  static async heartbeat(
    animatedValue: Animated.Value,
    config: MicroInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 1000,
      useNativeDriver = true
    } = config;

    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.1,
          duration: duration / 4,
          easing: Easing.out(Easing.quad),
          useNativeDriver,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: duration / 4,
          easing: Easing.in(Easing.quad),
          useNativeDriver,
        }),
        Animated.timing(animatedValue, {
          toValue: 1.1,
          duration: duration / 4,
          easing: Easing.out(Easing.quad),
          useNativeDriver,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: duration / 4,
          easing: Easing.in(Easing.quad),
          useNativeDriver,
        }),
      ])
    ).start();
  }

  /**
   * Floating animasyonu
   */
  static async floating(
    animatedValue: Animated.Value,
    config: MicroInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 2000,
      useNativeDriver = true
    } = config;

    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: -10,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver,
        }),
      ])
    ).start();
  }

  /**
   * Wiggle animasyonu
   */
  static async wiggle(
    animatedValue: Animated.Value,
    config: MicroInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 500,
      useNativeDriver = true
    } = config;

    const wiggleValues = [0, -5, 5, -5, 5, -3, 3, 0];
    const wiggleDuration = duration / wiggleValues.length;

    wiggleValues.forEach((value, index) => {
      setTimeout(() => {
        Animated.timing(animatedValue, {
          toValue,
          duration: wiggleDuration,
          easing: Easing.linear,
          useNativeDriver,
        }).start();
      }, index * wiggleDuration);
    });
  }

  /**
   * Morphing animasyonu
   */
  static async morph(
    animatedValue: Animated.Value,
    fromValue: number,
    toValue: number,
    config: MicroInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 1000,
      useNativeDriver = true
    } = config;

    animatedValue.setValue(fromValue);
    
    Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver,
    }).start();
  }

  /**
   * Elastic animasyonu
   */
  static async elastic(
    animatedValue: Animated.Value,
    toValue: number,
    config: MicroInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 800,
      useNativeDriver = true
    } = config;

    Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.elastic(1.2),
      useNativeDriver,
    }).start();
  }

  /**
   * Stagger animasyonu
   */
  static async stagger(
    animatedValues: Animated.Value[],
    animationType: 'fadeIn' | 'slideInLeft' | 'slideInRight' | 'scale',
    config: MicroInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 300,
      delay = 100,
      useNativeDriver = true
    } = config;

    animatedValues.forEach((animatedValue, index) => {
      const animationDelay = index * delay;
      
      setTimeout(() => {
        switch (animationType) {
          case 'fadeIn':
            this.fadeIn(animatedValue, { ...config, duration });
            break;
          case 'slideInLeft':
            this.slideInLeft(animatedValue, { ...config, duration });
            break;
          case 'slideInRight':
            this.slideInRight(animatedValue, { ...config, duration });
            break;
          case 'scale':
            this.scale(animatedValue, 1, { ...config, duration });
            break;
        }
      }, animationDelay);
    });
  }

  /**
   * Animasyonu durdurur
   */
  static stopAnimation(animatedValue: Animated.Value): void {
    animatedValue.stopAnimation();
  }

  /**
   * Tüm animasyonları durdurur
   */
  static stopAllAnimations(): void {
    this.activeAnimations.forEach((animatedValue) => {
      animatedValue.stopAnimation();
    });
    this.activeAnimations.clear();
  }

  /**
   * Animasyon kuyruğunu temizler
   */
  static clearAnimationQueue(): void {
    this.animationQueue = [];
  }

  /**
   * Animasyon istatistiklerini getirir
   */
  static getAnimationStats(): {
    activeAnimations: number;
    queuedAnimations: number;
    totalAnimations: number;
  } {
    return {
      activeAnimations: this.activeAnimations.size,
      queuedAnimations: this.animationQueue.length,
      totalAnimations: this.activeAnimations.size + this.animationQueue.length,
    };
  }
}


