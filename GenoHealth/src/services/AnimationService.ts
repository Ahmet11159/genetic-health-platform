// Gelişmiş animasyon servisi
import { Animated, Easing, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: any;
  useNativeDriver?: boolean;
}

export interface SpringConfig {
  tension?: number;
  friction?: number;
  mass?: number;
  damping?: number;
  stiffness?: number;
}

export class AnimationService {
  /**
   * Fade in animasyonu
   */
  static fadeIn(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 300,
      delay = 0,
      easing = Easing.out(Easing.quad),
      useNativeDriver = true
    } = config;

    return Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      delay,
      easing,
      useNativeDriver,
    });
  }

  /**
   * Fade out animasyonu
   */
  static fadeOut(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 300,
      delay = 0,
      easing = Easing.in(Easing.quad),
      useNativeDriver = true
    } = config;

    return Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      delay,
      easing,
      useNativeDriver,
    });
  }

  /**
   * Slide in from left animasyonu
   */
  static slideInLeft(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 400,
      delay = 0,
      easing = Easing.out(Easing.back(1.2)),
      useNativeDriver = true
    } = config;

    return Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      delay,
      easing,
      useNativeDriver,
    });
  }

  /**
   * Slide in from right animasyonu
   */
  static slideInRight(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 400,
      delay = 0,
      easing = Easing.out(Easing.back(1.2)),
      useNativeDriver = true
    } = config;

    return Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      delay,
      easing,
      useNativeDriver,
    });
  }

  /**
   * Slide in from bottom animasyonu
   */
  static slideInBottom(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 500,
      delay = 0,
      easing = Easing.out(Easing.back(1.1)),
      useNativeDriver = true
    } = config;

    return Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      delay,
      easing,
      useNativeDriver,
    });
  }

  /**
   * Scale animasyonu
   */
  static scale(
    animatedValue: Animated.Value,
    toValue: number = 1,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 300,
      delay = 0,
      easing = Easing.out(Easing.back(1.1)),
      useNativeDriver = true
    } = config;

    return Animated.timing(animatedValue, {
      toValue,
      duration,
      delay,
      easing,
      useNativeDriver,
    });
  }

  /**
   * Bounce animasyonu
   */
  static bounce(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 600,
      delay = 0,
      easing = Easing.bounce,
      useNativeDriver = true
    } = config;

    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.2,
        duration: duration / 2,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
    ]);
  }

  /**
   * Pulse animasyonu
   */
  static pulse(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 1000,
      delay = 0,
      useNativeDriver = true
    } = config;

    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.1,
          duration: duration / 2,
          delay,
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
    );
  }

  /**
   * Shake animasyonu
   */
  static shake(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 500,
      delay = 0,
      useNativeDriver = true
    } = config;

    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 10,
        duration: duration / 6,
        delay,
        easing: Easing.linear,
        useNativeDriver,
      }),
      Animated.timing(animatedValue, {
        toValue: -10,
        duration: duration / 6,
        easing: Easing.linear,
        useNativeDriver,
      }),
      Animated.timing(animatedValue, {
        toValue: 10,
        duration: duration / 6,
        easing: Easing.linear,
        useNativeDriver,
      }),
      Animated.timing(animatedValue, {
        toValue: -10,
        duration: duration / 6,
        easing: Easing.linear,
        useNativeDriver,
      }),
      Animated.timing(animatedValue, {
        toValue: 10,
        duration: duration / 6,
        easing: Easing.linear,
        useNativeDriver,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: duration / 6,
        easing: Easing.linear,
        useNativeDriver,
      }),
    ]);
  }

  /**
   * Rotate animasyonu
   */
  static rotate(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 1000,
      delay = 0,
      useNativeDriver = true
    } = config;

    return Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.linear,
        useNativeDriver,
      })
    );
  }

  /**
   * Stagger animasyonu - birden fazla öğeyi sırayla animasyonla
   */
  static stagger(
    animatedValues: Animated.Value[],
    animationType: 'fadeIn' | 'slideInLeft' | 'slideInRight' | 'slideInBottom' | 'scale',
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation[] {
    const {
      duration = 300,
      delay = 100,
      useNativeDriver = true
    } = config;

    return animatedValues.map((animatedValue, index) => {
      const animationDelay = index * delay;
      
      switch (animationType) {
        case 'fadeIn':
          return this.fadeIn(animatedValue, { ...config, delay: animationDelay });
        case 'slideInLeft':
          return this.slideInLeft(animatedValue, { ...config, delay: animationDelay });
        case 'slideInRight':
          return this.slideInRight(animatedValue, { ...config, delay: animationDelay });
        case 'slideInBottom':
          return this.slideInBottom(animatedValue, { ...config, delay: animationDelay });
        case 'scale':
          return this.scale(animatedValue, 1, { ...config, delay: animationDelay });
        default:
          return this.fadeIn(animatedValue, { ...config, delay: animationDelay });
      }
    });
  }

  /**
   * Parallax animasyonu
   */
  static parallax(
    scrollY: Animated.Value,
    speed: number = 0.5
  ): Animated.AnimatedAddition {
    return Animated.multiply(scrollY, speed);
  }

  /**
   * DNA loading animasyonu
   */
  static dnaLoading(
    rotationValue: Animated.Value,
    scaleValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 2000,
      useNativeDriver = true
    } = config;

    return Animated.parallel([
      Animated.loop(
        Animated.timing(rotationValue, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver,
        })
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.2,
            duration: duration / 2,
            easing: Easing.out(Easing.quad),
            useNativeDriver,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: duration / 2,
            easing: Easing.in(Easing.quad),
            useNativeDriver,
          }),
        ])
      ),
    ]);
  }

  /**
   * Success checkmark animasyonu
   */
  static successCheckmark(
    scaleValue: Animated.Value,
    opacityValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 600,
      useNativeDriver = true
    } = config;

    return Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1.3,
          duration: duration / 3,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: duration / 3,
          easing: Easing.out(Easing.quad),
          useNativeDriver,
        }),
      ]),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: duration * 2 / 3,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver,
      }),
    ]);
  }

  /**
   * Error shake animasyonu
   */
  static errorShake(
    translateX: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 500,
      useNativeDriver = true
    } = config;

    return Animated.sequence([
      Animated.timing(translateX, {
        toValue: 10,
        duration: duration / 6,
        easing: Easing.linear,
        useNativeDriver,
      }),
      Animated.timing(translateX, {
        toValue: -10,
        duration: duration / 6,
        easing: Easing.linear,
        useNativeDriver,
      }),
      Animated.timing(translateX, {
        toValue: 10,
        duration: duration / 6,
        easing: Easing.linear,
        useNativeDriver,
      }),
      Animated.timing(translateX, {
        toValue: -10,
        duration: duration / 6,
        easing: Easing.linear,
        useNativeDriver,
      }),
      Animated.timing(translateX, {
        toValue: 10,
        duration: duration / 6,
        easing: Easing.linear,
        useNativeDriver,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: duration / 6,
        easing: Easing.linear,
        useNativeDriver,
      }),
    ]);
  }

  /**
   * Floating animasyonu
   */
  static floating(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 2000,
      useNativeDriver = true
    } = config;

    return Animated.loop(
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
    );
  }

  /**
   * Heartbeat animasyonu
   */
  static heartbeat(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 1000,
      useNativeDriver = true
    } = config;

    return Animated.loop(
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
    );
  }

  /**
   * Page transition animasyonu
   */
  static pageTransition(
    fromScreen: Animated.Value,
    toScreen: Animated.Value,
    direction: 'left' | 'right' | 'up' | 'down' = 'right',
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 300,
      useNativeDriver = true
    } = config;

    const screenWidth = width;
    const screenHeight = height;

    let fromTransform: any = {};
    let toTransform: any = {};

    switch (direction) {
      case 'left':
        fromTransform = { translateX: -screenWidth };
        toTransform = { translateX: 0 };
        break;
      case 'right':
        fromTransform = { translateX: screenWidth };
        toTransform = { translateX: 0 };
        break;
      case 'up':
        fromTransform = { translateY: -screenHeight };
        toTransform = { translateY: 0 };
        break;
      case 'down':
        fromTransform = { translateY: screenHeight };
        toTransform = { translateY: 0 };
        break;
    }

    return Animated.parallel([
      Animated.timing(fromScreen, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver,
      }),
      Animated.timing(toScreen, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver,
      }),
    ]);
  }

  /**
   * Card flip animasyonu
   */
  static cardFlip(
    frontValue: Animated.Value,
    backValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 600,
      useNativeDriver = true
    } = config;

    return Animated.sequence([
      Animated.timing(frontValue, {
        toValue: 0,
        duration: duration / 2,
        easing: Easing.in(Easing.quad),
        useNativeDriver,
      }),
      Animated.timing(backValue, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.out(Easing.quad),
        useNativeDriver,
      }),
    ]);
  }

  /**
   * Morphing animasyonu - bir şekilden diğerine geçiş
   */
  static morph(
    animatedValue: Animated.Value,
    fromValue: number = 0,
    toValue: number = 1,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 1000,
      delay = 0,
      easing = Easing.inOut(Easing.quad),
      useNativeDriver = true
    } = config;

    return Animated.timing(animatedValue, {
      toValue,
      duration,
      delay,
      easing,
      useNativeDriver,
    });
  }

  /**
   * Elastic animasyonu
   */
  static elastic(
    animatedValue: Animated.Value,
    toValue: number = 1,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 800,
      delay = 0,
      useNativeDriver = true
    } = config;

    return Animated.timing(animatedValue, {
      toValue,
      duration,
      delay,
      easing: Easing.elastic(1.2),
      useNativeDriver,
    });
  }

  /**
   * Ripple effect animasyonu
   */
  static ripple(
    scaleValue: Animated.Value,
    opacityValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 600,
      useNativeDriver = true
    } = config;

    return Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 2,
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
    ]);
  }
}


