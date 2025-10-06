// Gelişmiş gesture kontrol servisi
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Animated, Dimensions } from 'react-native';
import { HapticFeedbackService } from './HapticFeedbackService';

const { width, height } = Dimensions.get('window');

export interface GestureConfig {
  threshold?: number;
  velocity?: number;
  hapticFeedback?: boolean;
  animationDuration?: number;
  useNativeDriver?: boolean;
}

export interface SwipeConfig extends GestureConfig {
  direction?: 'left' | 'right' | 'up' | 'down' | 'any';
  distance?: number;
  velocity?: number;
}

export interface PinchConfig extends GestureConfig {
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
}

export interface LongPressConfig extends GestureConfig {
  minDuration?: number;
  maxDistance?: number;
}

export interface DoubleTapConfig extends GestureConfig {
  maxDelay?: number;
  maxDistance?: number;
}

export interface DragDropConfig extends GestureConfig {
  snapThreshold?: number;
  snapPoints?: number[];
  magnetic?: boolean;
}

export interface RotationConfig extends GestureConfig {
  minRotation?: number;
  maxRotation?: number;
  snapToAngles?: number[];
}

export class AdvancedGestureService {
  private static gestureStates: Map<string, any> = new Map();
  private static gestureCallbacks: Map<string, Function[]> = new Map();

  /**
   * Servisi başlatır
   */
  static initialize(): void {
    this.gestureStates.clear();
    this.gestureCallbacks.clear();
  }

  /**
   * Swipe gesture handler
   */
  static createSwipeHandler(
    gestureId: string,
    config: SwipeConfig = {},
    onSwipe: (direction: string, distance: number, velocity: number) => void
  ): any {
    const {
      threshold = 50,
      velocity = 0.3,
      hapticFeedback = true,
      direction = 'any'
    } = config;

    return {
      onHandlerStateChange: (event: any) => {
        if (event.nativeEvent.state === State.END) {
          const { translationX, translationY, velocityX, velocityY } = event.nativeEvent;
          const distance = Math.sqrt(translationX * translationX + translationY * translationY);
          const velocityMagnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

          if (distance > threshold && velocityMagnitude > velocity) {
            let swipeDirection = '';

            if (Math.abs(translationX) > Math.abs(translationY)) {
              swipeDirection = translationX > 0 ? 'right' : 'left';
            } else {
              swipeDirection = translationY > 0 ? 'down' : 'up';
            }

            if (direction === 'any' || direction === swipeDirection) {
              if (hapticFeedback) {
                HapticFeedbackService.trigger('selection');
              }
              onSwipe(swipeDirection, distance, velocityMagnitude);
            }
          }
        }
      }
    };
  }

  /**
   * Pinch to zoom gesture handler
   */
  static createPinchHandler(
    gestureId: string,
    config: PinchConfig = {},
    onPinch: (scale: number, velocity: number) => void
  ): any {
    const {
      minScale = 0.5,
      maxScale = 3.0,
      initialScale = 1.0,
      hapticFeedback = true
    } = config;

    let currentScale = initialScale;

    return {
      onHandlerStateChange: (event: any) => {
        if (event.nativeEvent.state === State.ACTIVE) {
          const { scale, velocity } = event.nativeEvent;
          const newScale = Math.max(minScale, Math.min(maxScale, currentScale * scale));
          
          if (Math.abs(newScale - currentScale) > 0.1) {
            if (hapticFeedback) {
              HapticFeedbackService.trigger('button_press');
            }
            onPinch(newScale, velocity);
            currentScale = newScale;
          }
        }
      }
    };
  }

  /**
   * Long press gesture handler
   */
  static createLongPressHandler(
    gestureId: string,
    config: LongPressConfig = {},
    onLongPress: (x: number, y: number) => void
  ): any {
    const {
      minDuration = 500,
      maxDistance = 10,
      hapticFeedback = true
    } = config;

    return {
      onHandlerStateChange: (event: any) => {
        if (event.nativeEvent.state === State.ACTIVE) {
          const { x, y } = event.nativeEvent;
          
          setTimeout(() => {
            if (hapticFeedback) {
              HapticFeedbackService.trigger('heavy');
            }
            onLongPress(x, y);
          }, minDuration);
        }
      }
    };
  }

  /**
   * Double tap gesture handler
   */
  static createDoubleTapHandler(
    gestureId: string,
    config: DoubleTapConfig = {},
    onDoubleTap: (x: number, y: number) => void
  ): any {
    const {
      maxDelay = 300,
      maxDistance = 20,
      hapticFeedback = true
    } = config;

    let lastTap = 0;
    let lastTapX = 0;
    let lastTapY = 0;

    return {
      onHandlerStateChange: (event: any) => {
        if (event.nativeEvent.state === State.END) {
          const { x, y } = event.nativeEvent;
          const currentTime = Date.now();
          const timeDiff = currentTime - lastTap;
          const distance = Math.sqrt(
            Math.pow(x - lastTapX, 2) + Math.pow(y - lastTapY, 2)
          );

          if (timeDiff < maxDelay && distance < maxDistance) {
            if (hapticFeedback) {
              HapticFeedbackService.trigger('success');
            }
            onDoubleTap(x, y);
          }

          lastTap = currentTime;
          lastTapX = x;
          lastTapY = y;
        }
      }
    };
  }

  /**
   * Drag and drop gesture handler
   */
  static createDragDropHandler(
    gestureId: string,
    config: DragDropConfig = {},
    onDrag: (x: number, y: number) => void,
    onDrop: (x: number, y: number) => void
  ): any {
    const {
      snapThreshold = 50,
      snapPoints = [],
      magnetic = true,
      hapticFeedback = true
    } = config;

    return {
      onHandlerStateChange: (event: any) => {
        const { translationX, translationY, state } = event.nativeEvent;
        
        if (state === State.ACTIVE) {
          onDrag(translationX, translationY);
        } else if (state === State.END) {
          let finalX = translationX;
          let finalY = translationY;

          // Magnetic snapping
          if (magnetic && snapPoints.length > 0) {
            const nearestSnapPoint = snapPoints.reduce((nearest, point) => {
              const distance = Math.sqrt(
                Math.pow(translationX - point.x, 2) + Math.pow(translationY - point.y, 2)
              );
              return distance < nearest.distance ? { point, distance } : nearest;
            }, { point: { x: translationX, y: translationY }, distance: Infinity });

            if (nearestSnapPoint.distance < snapThreshold) {
              finalX = nearestSnapPoint.point.x;
              finalY = nearestSnapPoint.point.y;
              
              if (hapticFeedback) {
                HapticFeedbackService.trigger('success');
              }
            }
          }

          onDrop(finalX, finalY);
        }
      }
    };
  }

  /**
   * Rotation gesture handler
   */
  static createRotationHandler(
    gestureId: string,
    config: RotationConfig = {},
    onRotation: (rotation: number, velocity: number) => void
  ): any {
    const {
      minRotation = -Math.PI,
      maxRotation = Math.PI,
      snapToAngles = [],
      hapticFeedback = true
    } = config;

    let currentRotation = 0;

    return {
      onHandlerStateChange: (event: any) => {
        if (event.nativeEvent.state === State.ACTIVE) {
          const { rotation, velocity } = event.nativeEvent;
          const newRotation = Math.max(minRotation, Math.min(maxRotation, currentRotation + rotation));
          
          if (Math.abs(newRotation - currentRotation) > 0.1) {
            if (hapticFeedback) {
              HapticFeedbackService.trigger('button_press');
            }
            onRotation(newRotation, velocity);
            currentRotation = newRotation;
          }
        }
      }
    };
  }

  /**
   * Multi-touch gesture handler
   */
  static createMultiTouchHandler(
    gestureId: string,
    config: GestureConfig = {},
    onMultiTouch: (touches: any[]) => void
  ): any {
    const { hapticFeedback = true } = config;

    return {
      onHandlerStateChange: (event: any) => {
        if (event.nativeEvent.state === State.ACTIVE) {
          const { touches } = event.nativeEvent;
          
          if (touches.length > 1) {
            if (hapticFeedback) {
              HapticFeedbackService.trigger('medium');
            }
            onMultiTouch(touches);
          }
        }
      }
    };
  }

  /**
   * Edge swipe gesture handler
   */
  static createEdgeSwipeHandler(
    gestureId: string,
    config: SwipeConfig = {},
    onEdgeSwipe: (direction: string) => void
  ): any {
    const {
      threshold = 30,
      hapticFeedback = true
    } = config;

    return {
      onHandlerStateChange: (event: any) => {
        if (event.nativeEvent.state === State.END) {
          const { translationX, translationY, x, y } = event.nativeEvent;
          
          // Check if gesture started from edge
          const isFromLeftEdge = x < threshold;
          const isFromRightEdge = x > width - threshold;
          const isFromTopEdge = y < threshold;
          const isFromBottomEdge = y > height - threshold;

          if (isFromLeftEdge && translationX > threshold) {
            if (hapticFeedback) {
              HapticFeedbackService.trigger('selection');
            }
            onEdgeSwipe('right');
          } else if (isFromRightEdge && translationX < -threshold) {
            if (hapticFeedback) {
              HapticFeedbackService.trigger('selection');
            }
            onEdgeSwipe('left');
          } else if (isFromTopEdge && translationY > threshold) {
            if (hapticFeedback) {
              HapticFeedbackService.trigger('selection');
            }
            onEdgeSwipe('down');
          } else if (isFromBottomEdge && translationY < -threshold) {
            if (hapticFeedback) {
              HapticFeedbackService.trigger('selection');
            }
            onEdgeSwipe('up');
          }
        }
      }
    };
  }

  /**
   * Force touch gesture handler (3D Touch)
   */
  static createForceTouchHandler(
    gestureId: string,
    config: GestureConfig = {},
    onForceTouch: (force: number, x: number, y: number) => void
  ): any {
    const { hapticFeedback = true } = config;

    return {
      onHandlerStateChange: (event: any) => {
        if (event.nativeEvent.state === State.ACTIVE) {
          const { force, x, y } = event.nativeEvent;
          
          if (force > 0.5) {
            if (hapticFeedback) {
              HapticFeedbackService.trigger('heavy');
            }
            onForceTouch(force, x, y);
          }
        }
      }
    };
  }

  /**
   * Gesture callback kaydeder
   */
  static registerCallback(gestureId: string, callback: Function): void {
    if (!this.gestureCallbacks.has(gestureId)) {
      this.gestureCallbacks.set(gestureId, []);
    }
    this.gestureCallbacks.get(gestureId)!.push(callback);
  }

  /**
   * Gesture callback kaldırır
   */
  static unregisterCallback(gestureId: string, callback: Function): void {
    const callbacks = this.gestureCallbacks.get(gestureId);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Gesture state kaydeder
   */
  static setGestureState(gestureId: string, state: any): void {
    this.gestureStates.set(gestureId, state);
  }

  /**
   * Gesture state getirir
   */
  static getGestureState(gestureId: string): any {
    return this.gestureStates.get(gestureId);
  }

  /**
   * Tüm gesture callback'lerini temizler
   */
  static clearAllCallbacks(): void {
    this.gestureCallbacks.clear();
  }

  /**
   * Tüm gesture state'lerini temizler
   */
  static clearAllStates(): void {
    this.gestureStates.clear();
  }

  /**
   * Gesture istatistiklerini getirir
   */
  static getGestureStats(): {
    activeGestures: number;
    registeredCallbacks: number;
    totalGestures: number;
  } {
    const totalCallbacks = Array.from(this.gestureCallbacks.values())
      .reduce((total, callbacks) => total + callbacks.length, 0);

    return {
      activeGestures: this.gestureStates.size,
      registeredCallbacks: totalCallbacks,
      totalGestures: this.gestureStates.size + totalCallbacks,
    };
  }

  /**
   * Gesture performansını optimize eder
   */
  static optimizePerformance(): void {
    // Gesture callback'lerini optimize et
    this.gestureCallbacks.forEach((callbacks, gestureId) => {
      if (callbacks.length > 10) {
        // En son 10 callback'i tut
        this.gestureCallbacks.set(gestureId, callbacks.slice(-10));
      }
    });

    // Eski gesture state'lerini temizle
    const now = Date.now();
    this.gestureStates.forEach((state, gestureId) => {
      if (state.timestamp && now - state.timestamp > 30000) { // 30 saniye
        this.gestureStates.delete(gestureId);
      }
    });
  }
}



