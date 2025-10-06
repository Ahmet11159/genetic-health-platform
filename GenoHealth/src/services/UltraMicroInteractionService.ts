// Ultra-premium micro-interactions servisi
import { Animated, Easing, Dimensions, Platform } from 'react-native';
import { HapticFeedbackService } from './HapticFeedbackService';

const { width, height } = Dimensions.get('window');

export interface UltraInteractionConfig {
  duration?: number;
  delay?: number;
  easing?: any;
  useNativeDriver?: boolean;
  hapticFeedback?: boolean;
  soundEffect?: boolean;
  intensity?: 'light' | 'medium' | 'heavy' | 'ultra';
  direction?: 'up' | 'down' | 'left' | 'right' | 'center';
  elasticity?: number;
  damping?: number;
  mass?: number;
  tension?: number;
  friction?: number;
}

export interface MorphingConfig {
  fromShape: 'circle' | 'square' | 'rounded' | 'pill';
  toShape: 'circle' | 'square' | 'rounded' | 'pill';
  duration?: number;
  easing?: any;
}

export interface ParticleConfig {
  count: number;
  colors: string[];
  size: number;
  speed: number;
  gravity: number;
  life: number;
  spread: number;
}

export interface LiquidConfig {
  viscosity: number;
  density: number;
  surfaceTension: number;
  color: string;
  opacity: number;
}

export class UltraMicroInteractionService {
  private static isInitialized = false;
  private static activeAnimations: Map<string, Animated.Value> = new Map();
  private static particleSystems: Map<string, any> = new Map();
  private static liquidAnimations: Map<string, any> = new Map();

  /**
   * Servisi başlatır
   */
  static initialize(): void {
    this.activeAnimations.clear();
    this.particleSystems.clear();
    this.liquidAnimations.clear();
    this.isInitialized = true;
  }

  /**
   * Ultra-premium button press animasyonu
   */
  static async ultraButtonPress(
    animatedValue: Animated.Value,
    config: UltraInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 200,
      hapticFeedback = true,
      intensity = 'medium',
      elasticity = 0.8,
      damping = 0.6,
      useNativeDriver = true
    } = config;

    if (hapticFeedback) {
      HapticFeedbackService.trigger(intensity === 'ultra' ? 'heavy' : intensity);
    }

    // Ultra-smooth scale animation with physics
    Animated.sequence([
      // Press down with physics
      Animated.timing(animatedValue, {
        toValue: 0.92,
        duration: duration * 0.3,
        easing: Easing.out(Easing.quad),
        useNativeDriver,
      }),
      // Bounce back with elasticity
      Animated.spring(animatedValue, {
        toValue: 1.05,
        tension: 300,
        friction: 8,
        useNativeDriver,
      }),
      // Settle with damping
      Animated.spring(animatedValue, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver,
      }),
    ]).start();
  }

  /**
   * Morphing animasyonu
   */
  static async morph(
    animatedValue: Animated.Value,
    config: MorphingConfig
  ): Promise<void> {
    const {
      fromShape,
      toShape,
      duration = 800,
      easing = Easing.inOut(Easing.quad)
    } = config;

    const shapeValues = {
      circle: 0,
      square: 0.25,
      rounded: 0.5,
      pill: 0.75
    };

    const fromValue = shapeValues[fromShape];
    const toValue = shapeValues[toShape];

    Animated.timing(animatedValue, {
      toValue,
      duration,
      easing,
      useNativeDriver: false,
    }).start();
  }

  /**
   * Liquid morphing animasyonu
   */
  static async liquidMorph(
    animatedValue: Animated.Value,
    config: LiquidConfig
  ): Promise<void> {
    const {
      viscosity = 0.5,
      density = 0.8,
      surfaceTension = 0.3,
      color = '#667eea',
      opacity = 0.8
    } = config;

    // Liquid physics simulation
    const liquidAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.1,
          duration: 1000 * viscosity,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.9,
          duration: 1000 * viscosity,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
      ])
    );

    liquidAnimation.start();
  }

  /**
   * Particle system animasyonu
   */
  static async particleExplosion(
    config: ParticleConfig
  ): Promise<void> {
    const {
      count = 20,
      colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
      size = 4,
      speed = 200,
      gravity = 0.5,
      life = 1000,
      spread = 360
    } = config;

    // Create particle system
    const particles = [];
    for (let i = 0; i < count; i++) {
      const particle = {
        id: `particle_${i}`,
        x: width / 2,
        y: height / 2,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed - 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: size + Math.random() * 2,
        life: life,
        maxLife: life,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      };
      particles.push(particle);
    }

    // Animate particles
    this.animateParticles(particles, gravity);
  }

  /**
   * Particle animasyonu
   */
  private static animateParticles(particles: any[], gravity: number): void {
    const animate = () => {
      particles.forEach(particle => {
        // Update physics
        particle.x += particle.vx * 0.016;
        particle.y += particle.vy * 0.016;
        particle.vy += gravity;
        particle.rotation += particle.rotationSpeed;
        particle.life -= 16;

        // Remove dead particles
        if (particle.life <= 0) {
          const index = particles.indexOf(particle);
          particles.splice(index, 1);
        }
      });

      if (particles.length > 0) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Magnetic attraction animasyonu
   */
  static async magneticAttraction(
    animatedValue: Animated.Value,
    targetX: number,
    targetY: number,
    config: UltraInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 600,
      elasticity = 0.8,
      useNativeDriver = true
    } = config;

    // Magnetic field effect
    Animated.sequence([
      // Attract
      Animated.timing(animatedValue, {
        toValue: 1.1,
        duration: duration * 0.4,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver,
      }),
      // Snap to target
      Animated.spring(animatedValue, {
        toValue: 0.95,
        tension: 400,
        friction: 6,
        useNativeDriver,
      }),
      // Settle
      Animated.spring(animatedValue, {
        toValue: 1,
        tension: 200,
        friction: 8,
        useNativeDriver,
      }),
    ]).start();
  }

  /**
   * Elastic bounce animasyonu
   */
  static async elasticBounce(
    animatedValue: Animated.Value,
    config: UltraInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 1000,
      elasticity = 0.8,
      damping = 0.6,
      useNativeDriver = true
    } = config;

    Animated.sequence([
      // Initial bounce
      Animated.spring(animatedValue, {
        toValue: 1.3,
        tension: 300,
        friction: 4,
        useNativeDriver,
      }),
      // Secondary bounce
      Animated.spring(animatedValue, {
        toValue: 0.8,
        tension: 200,
        friction: 6,
        useNativeDriver,
      }),
      // Final settle
      Animated.spring(animatedValue, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver,
      }),
    ]).start();
  }

  /**
   * Floating animation
   */
  static async floating(
    animatedValue: Animated.Value,
    config: UltraInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 3000,
      intensity = 'medium',
      useNativeDriver = true
    } = config;

    const floatDistance = intensity === 'ultra' ? 15 : intensity === 'heavy' ? 12 : intensity === 'medium' ? 8 : 5;

    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: -floatDistance,
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
   * Breathing animation
   */
  static async breathing(
    animatedValue: Animated.Value,
    config: UltraInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 2000,
      intensity = 'medium',
      useNativeDriver = true
    } = config;

    const breathIntensity = intensity === 'ultra' ? 0.15 : intensity === 'heavy' ? 0.12 : intensity === 'medium' ? 0.08 : 0.05;

    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1 + breathIntensity,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver,
        }),
        Animated.timing(animatedValue, {
          toValue: 1 - breathIntensity,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver,
        }),
      ])
    ).start();
  }

  /**
   * Shimmer effect
   */
  static async shimmer(
    animatedValue: Animated.Value,
    config: UltraInteractionConfig = {}
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
   * Ripple effect
   */
  static async ripple(
    scaleValue: Animated.Value,
    opacityValue: Animated.Value,
    config: UltraInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 800,
      intensity = 'medium',
      useNativeDriver = true
    } = config;

    const rippleSize = intensity === 'ultra' ? 3 : intensity === 'heavy' ? 2.5 : intensity === 'medium' ? 2 : 1.5;

    // Reset values
    scaleValue.setValue(0);
    opacityValue.setValue(1);

    // Animate ripple
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: rippleSize,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver,
      }),
      Animated.timing(opacityValue, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver,
      }),
    ]).start();
  }

  /**
   * Magnetic field effect
   */
  static async magneticField(
    animatedValue: Animated.Value,
    config: UltraInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 2000,
      intensity = 'medium',
      useNativeDriver = true
    } = config;

    const fieldStrength = intensity === 'ultra' ? 0.2 : intensity === 'heavy' ? 0.15 : intensity === 'medium' ? 0.1 : 0.05;

    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1 + fieldStrength,
          duration: duration / 4,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver,
        }),
        Animated.timing(animatedValue, {
          toValue: 1 - fieldStrength,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver,
        }),
        Animated.timing(animatedValue, {
          toValue: 1 + fieldStrength,
          duration: duration / 4,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver,
        }),
      ])
    ).start();
  }

  /**
   * Stagger animation
   */
  static async stagger(
    animatedValues: Animated.Value[],
    animationType: 'fadeIn' | 'slideIn' | 'scale' | 'bounce',
    config: UltraInteractionConfig = {}
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
            this.fadeIn(animatedValue, { ...config, duration, useNativeDriver });
            break;
          case 'slideIn':
            this.slideIn(animatedValue, { ...config, duration, useNativeDriver });
            break;
          case 'scale':
            this.scale(animatedValue, 1, { ...config, duration, useNativeDriver });
            break;
          case 'bounce':
            this.elasticBounce(animatedValue, { ...config, duration, useNativeDriver });
            break;
        }
      }, animationDelay);
    });
  }

  /**
   * Fade in animasyonu
   */
  private static async fadeIn(
    animatedValue: Animated.Value,
    config: UltraInteractionConfig = {}
  ): Promise<void> {
    const { duration = 300, useNativeDriver = true } = config;

    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver,
    }).start();
  }

  /**
   * Slide in animasyonu
   */
  private static async slideIn(
    animatedValue: Animated.Value,
    config: UltraInteractionConfig = {}
  ): Promise<void> {
    const { duration = 300, useNativeDriver = true } = config;

    Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver,
    }).start();
  }

  /**
   * Scale animasyonu
   */
  private static async scale(
    animatedValue: Animated.Value,
    toValue: number,
    config: UltraInteractionConfig = {}
  ): Promise<void> {
    const { duration = 300, useNativeDriver = true } = config;

    Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.back(1.1)),
      useNativeDriver,
    }).start();
  }

  /**
   * Ultra-premium success animation
   */
  static async ultraSuccess(
    animatedValue: Animated.Value,
    config: UltraInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 1200,
      hapticFeedback = true,
      useNativeDriver = true
    } = config;

    if (hapticFeedback) {
      HapticFeedbackService.trigger('success');
    }

    // Ultra-success sequence
    Animated.sequence([
      // Initial celebration
      Animated.timing(animatedValue, {
        toValue: 1.2,
        duration: duration * 0.2,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver,
      }),
      // Bounce celebration
      Animated.spring(animatedValue, {
        toValue: 0.9,
        tension: 200,
        friction: 4,
        useNativeDriver,
      }),
      // Final celebration
      Animated.spring(animatedValue, {
        toValue: 1.1,
        tension: 300,
        friction: 6,
        useNativeDriver,
      }),
      // Settle
      Animated.spring(animatedValue, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver,
      }),
    ]).start();
  }

  /**
   * Ultra-premium error animation
   */
  static async ultraError(
    animatedValue: Animated.Value,
    config: UltraInteractionConfig = {}
  ): Promise<void> {
    const {
      duration = 800,
      hapticFeedback = true,
      useNativeDriver = true
    } = config;

    if (hapticFeedback) {
      HapticFeedbackService.trigger('error');
    }

    // Ultra-error sequence with shake
    const shakeValues = [0, -15, 15, -15, 15, -10, 10, -5, 5, 0];
    const shakeDuration = duration / shakeValues.length;

    shakeValues.forEach((value, index) => {
      setTimeout(() => {
        Animated.timing(animatedValue, {
          toValue: value,
          duration: shakeDuration,
          easing: Easing.linear,
          useNativeDriver,
        }).start();
      }, index * shakeDuration);
    });
  }

  /**
   * Servisi temizler
   */
  static cleanup(): void {
    this.activeAnimations.forEach(animatedValue => {
      animatedValue.stopAnimation();
    });
    this.activeAnimations.clear();
    this.particleSystems.clear();
    this.liquidAnimations.clear();
  }
}


