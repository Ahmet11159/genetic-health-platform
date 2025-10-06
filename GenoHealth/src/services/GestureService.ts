// Gelişmiş gesture navigation servisi
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export interface GestureConfig {
  threshold?: number;
  velocity?: number;
  direction?: 'horizontal' | 'vertical' | 'both';
  enabled?: boolean;
  hapticFeedback?: boolean;
}

export interface SwipeConfig {
  left?: () => void;
  right?: () => void;
  up?: () => void;
  down?: () => void;
  threshold?: number;
  velocity?: number;
}

export interface PinchConfig {
  onPinch?: (scale: number) => void;
  onPinchEnd?: (scale: number) => void;
  minScale?: number;
  maxScale?: number;
}

export interface LongPressConfig {
  onLongPress?: () => void;
  duration?: number;
  hapticFeedback?: boolean;
}

export class GestureService {
  private static gestureConfig: GestureConfig = {
    threshold: 50,
    velocity: 500,
    direction: 'both',
    enabled: true,
    hapticFeedback: true,
  };

  private static swipeConfig: SwipeConfig = {};
  private static pinchConfig: PinchConfig = {};
  private static longPressConfig: LongPressConfig = {};

  /**
   * Servisi başlatır
   */
  static initialize(): void {
    this.gestureConfig = {
      threshold: 50,
      velocity: 500,
      direction: 'both',
      enabled: true,
      hapticFeedback: true,
    };
  }

  /**
   * Gesture ayarlarını günceller
   */
  static updateGestureConfig(config: Partial<GestureConfig>): void {
    this.gestureConfig = { ...this.gestureConfig, ...config };
  }

  /**
   * Swipe ayarlarını günceller
   */
  static updateSwipeConfig(config: SwipeConfig): void {
    this.swipeConfig = { ...this.swipeConfig, ...config };
  }

  /**
   * Pinch ayarlarını günceller
   */
  static updatePinchConfig(config: PinchConfig): void {
    this.pinchConfig = { ...this.pinchConfig, ...config };
  }

  /**
   * Long press ayarlarını günceller
   */
  static updateLongPressConfig(config: LongPressConfig): void {
    this.longPressConfig = { ...this.longPressConfig, ...config };
  }

  /**
   * Swipe gesture handler oluşturur
   */
  static createSwipeHandler(
    animatedValue: Animated.Value,
    onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void
  ) {
    return (event: any) => {
      if (!this.gestureConfig.enabled) return;

      const { translationX, translationY, velocityX, velocityY, state } = event.nativeEvent;

      if (state === State.END) {
        const absX = Math.abs(translationX);
        const absY = Math.abs(translationY);
        const absVelocityX = Math.abs(velocityX);
        const absVelocityY = Math.abs(velocityY);

        // Yatay swipe kontrolü
        if (absX > absY && absX > this.gestureConfig.threshold! && absVelocityX > this.gestureConfig.velocity!) {
          if (translationX > 0) {
            // Sağa swipe
            this.swipeConfig.right?.();
            onSwipe?.('right');
            this.triggerHaptic('swipe');
          } else {
            // Sola swipe
            this.swipeConfig.left?.();
            onSwipe?.('left');
            this.triggerHaptic('swipe');
          }
        }
        // Dikey swipe kontrolü
        else if (absY > absX && absY > this.gestureConfig.threshold! && absVelocityY > this.gestureConfig.velocity!) {
          if (translationY > 0) {
            // Aşağı swipe
            this.swipeConfig.down?.();
            onSwipe?.('down');
            this.triggerHaptic('swipe');
          } else {
            // Yukarı swipe
            this.swipeConfig.up?.();
            onSwipe?.('up');
            this.triggerHaptic('swipe');
          }
        }
      }
    };
  }

  /**
   * Pinch gesture handler oluşturur
   */
  static createPinchHandler(
    scaleValue: Animated.Value,
    onPinch?: (scale: number) => void
  ) {
    return (event: any) => {
      if (!this.gestureConfig.enabled) return;

      const { scale, state } = event.nativeEvent;

      if (state === State.ACTIVE) {
        const clampedScale = Math.max(
          this.pinchConfig.minScale || 0.5,
          Math.min(this.pinchConfig.maxScale || 3, scale)
        );
        
        scaleValue.setValue(clampedScale);
        this.pinchConfig.onPinch?.(clampedScale);
        onPinch?.(clampedScale);
      } else if (state === State.END) {
        this.pinchConfig.onPinchEnd?.(scale);
        onPinch?.(scale);
      }
    };
  }

  /**
   * Long press handler oluşturur
   */
  static createLongPressHandler(
    onLongPress?: () => void
  ) {
    let timeoutId: NodeJS.Timeout | null = null;

    return (event: any) => {
      if (!this.gestureConfig.enabled) return;

      const { state } = event.nativeEvent;

      if (state === State.BEGAN) {
        timeoutId = setTimeout(() => {
          this.longPressConfig.onLongPress?.();
          onLongPress?.();
          this.triggerHaptic('long_press');
        }, this.longPressConfig.duration || 500);
      } else if (state === State.END || state === State.CANCELLED) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }
    };
  }

  /**
   * Drag gesture handler oluşturur
   */
  static createDragHandler(
    animatedValue: Animated.Value,
    onDrag?: (translation: { x: number; y: number }) => void
  ) {
    return (event: any) => {
      if (!this.gestureConfig.enabled) return;

      const { translationX, translationY, state } = event.nativeEvent;

      if (state === State.ACTIVE) {
        animatedValue.setValue(translationX);
        onDrag?.({ x: translationX, y: translationY });
      } else if (state === State.END) {
        // Snap back animasyonu
        Animated.spring(animatedValue, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    };
  }

  /**
   * Double tap handler oluşturur
   */
  static createDoubleTapHandler(
    onDoubleTap?: () => void
  ) {
    let lastTap = 0;
    const DOUBLE_TAP_DELAY = 300;

    return (event: any) => {
      if (!this.gestureConfig.enabled) return;

      const { state } = event.nativeEvent;

      if (state === State.END) {
        const now = Date.now();
        if (now - lastTap < DOUBLE_TAP_DELAY) {
          onDoubleTap?.();
          this.triggerHaptic('button_press');
        }
        lastTap = now;
      }
    };
  }

  /**
   * Rotation gesture handler oluşturur
   */
  static createRotationHandler(
    rotationValue: Animated.Value,
    onRotation?: (rotation: number) => void
  ) {
    return (event: any) => {
      if (!this.gestureConfig.enabled) return;

      const { rotation, state } = event.nativeEvent;

      if (state === State.ACTIVE) {
        rotationValue.setValue(rotation);
        onRotation?.(rotation);
      } else if (state === State.END) {
        // Snap back animasyonu
        Animated.spring(rotationValue, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    };
  }

  /**
   * Haptic feedback tetikler
   */
  private static triggerHaptic(type: 'swipe' | 'long_press' | 'button_press'): void {
    if (!this.gestureConfig.hapticFeedback) return;

    // HapticFeedbackService import edilmeli
    try {
      const { HapticFeedbackService } = require('./HapticFeedbackService');
      HapticFeedbackService.trigger(type);
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  /**
   * Gesture ayarlarını getirir
   */
  static getGestureConfig(): GestureConfig {
    return { ...this.gestureConfig };
  }

  /**
   * Swipe ayarlarını getirir
   */
  static getSwipeConfig(): SwipeConfig {
    return { ...this.swipeConfig };
  }

  /**
   * Pinch ayarlarını getirir
   */
  static getPinchConfig(): PinchConfig {
    return { ...this.pinchConfig };
  }

  /**
   * Long press ayarlarını getirir
   */
  static getLongPressConfig(): LongPressConfig {
    return { ...this.longPressConfig };
  }

  /**
   * Gesture'ları etkinleştirir/devre dışı bırakır
   */
  static setEnabled(enabled: boolean): void {
    this.gestureConfig.enabled = enabled;
  }

  /**
   * Gesture'lar etkin mi kontrol eder
   */
  static isEnabled(): boolean {
    return this.gestureConfig.enabled;
  }

  /**
   * Gesture istatistiklerini getirir
   */
  static getStats(): {
    totalGestures: number;
    swipeCount: number;
    pinchCount: number;
    longPressCount: number;
    lastGestureTime: Date | null;
  } {
    // Bu veriler gerçek uygulamada AsyncStorage'da saklanabilir
    return {
      totalGestures: 0,
      swipeCount: 0,
      pinchCount: 0,
      longPressCount: 0,
      lastGestureTime: null,
    };
  }

  /**
   * Gesture geçmişini temizler
   */
  static clearStats(): void {
    // İstatistikleri temizle
  }

  /**
   * Gesture önerilerini getirir
   */
  static getRecommendations(): string[] {
    return [
      'Swipe gesture\'ları için yeterli threshold değeri ayarlayın',
      'Haptic feedback ile gesture\'ları destekleyin',
      'Long press için uygun süre belirleyin',
      'Pinch gesture\'ları için min/max scale sınırları koyun',
      'Gesture\'ları kullanıcı ayarlarından kontrol edilebilir yapın'
    ];
  }

  /**
   * Gesture test eder
   */
  static testGesture(type: 'swipe' | 'pinch' | 'longPress' | 'drag'): void {
    switch (type) {
      case 'swipe':
        this.swipeConfig.left?.();
        break;
      case 'pinch':
        this.pinchConfig.onPinch?.(1.5);
        break;
      case 'longPress':
        this.longPressConfig.onLongPress?.();
        break;
      case 'drag':
        // Drag test
        break;
    }
  }

  /**
   * Tüm gesture'ları test eder
   */
  static testAllGestures(): void {
    setTimeout(() => this.testGesture('swipe'), 0);
    setTimeout(() => this.testGesture('pinch'), 500);
    setTimeout(() => this.testGesture('longPress'), 1000);
    setTimeout(() => this.testGesture('drag'), 1500);
  }

  /**
   * Gesture ayarlarını sıfırlar
   */
  static reset(): void {
    this.gestureConfig = {
      threshold: 50,
      velocity: 500,
      direction: 'both',
      enabled: true,
      hapticFeedback: true,
    };
    this.swipeConfig = {};
    this.pinchConfig = {};
    this.longPressConfig = {};
  }
}


