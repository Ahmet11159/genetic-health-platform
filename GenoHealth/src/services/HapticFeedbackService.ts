// Gelişmiş haptic feedback servisi
import * as Haptics from 'expo-haptics';

export type HapticType = 
  | 'light' 
  | 'medium' 
  | 'heavy' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'selection' 
  | 'impact' 
  | 'notification' 
  | 'dna_analysis' 
  | 'achievement' 
  | 'button_press' 
  | 'card_flip' 
  | 'swipe' 
  | 'long_press';

export interface HapticConfig {
  intensity?: 'light' | 'medium' | 'heavy';
  duration?: number;
  pattern?: number[];
  enabled?: boolean;
}

export class HapticFeedbackService {
  private static isEnabled = true;
  private static intensity = 'medium' as 'light' | 'medium' | 'heavy';
  private static customPatterns: Map<string, number[]> = new Map();

  /**
   * Servisi başlatır
   */
  static initialize(): void {
    this.isEnabled = true;
    this.setupCustomPatterns();
  }

  /**
   * Özel haptic desenlerini ayarlar
   */
  private static setupCustomPatterns(): void {
    // DNA analizi için özel desen
    this.customPatterns.set('dna_analysis', [100, 50, 100, 50, 200]);
    
    // Başarı için özel desen
    this.customPatterns.set('achievement', [50, 100, 50, 200]);
    
    // Uyarı için özel desen
    this.customPatterns.set('warning', [200, 100, 200]);
    
    // Hata için özel desen
    this.customPatterns.set('error', [300, 100, 300, 100, 300]);
    
    // Kart çevirme için özel desen
    this.customPatterns.set('card_flip', [150, 50, 150]);
    
    // Swipe için özel desen
    this.customPatterns.set('swipe', [80, 40, 80]);
    
    // Long press için özel desen
    this.customPatterns.set('long_press', [100, 200, 100]);
  }

  /**
   * Haptic feedback'i etkinleştirir/devre dışı bırakır
   */
  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Haptic feedback etkin mi kontrol eder
   */
  static isHapticEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Haptic yoğunluğunu ayarlar
   */
  static setIntensity(intensity: 'light' | 'medium' | 'heavy'): void {
    this.intensity = intensity;
  }

  /**
   * Temel haptic feedback
   */
  static trigger(type: HapticType, config: HapticConfig = {}): void {
    if (!this.isEnabled) return;

    const { intensity = this.intensity } = config;

    try {
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          this.triggerSuccess();
          break;
        case 'warning':
          this.triggerWarning();
          break;
        case 'error':
          this.triggerError();
          break;
        case 'selection':
          Haptics.selectionAsync();
          break;
        case 'impact':
          this.triggerImpact(intensity);
          break;
        case 'notification':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'dna_analysis':
          this.triggerDNAAnalysis();
          break;
        case 'achievement':
          this.triggerAchievement();
          break;
        case 'button_press':
          this.triggerButtonPress();
          break;
        case 'card_flip':
          this.triggerCardFlip();
          break;
        case 'swipe':
          this.triggerSwipe();
          break;
        case 'long_press':
          this.triggerLongPress();
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  /**
   * Başarı haptic feedback'i
   */
  private static triggerSuccess(): void {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 100);
  }

  /**
   * Uyarı haptic feedback'i
   */
  private static triggerWarning(): void {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 150);
  }

  /**
   * Hata haptic feedback'i
   */
  private static triggerError(): void {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 200);
  }

  /**
   * Impact haptic feedback'i
   */
  private static triggerImpact(intensity: 'light' | 'medium' | 'heavy'): void {
    switch (intensity) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }
  }

  /**
   * DNA analizi haptic feedback'i
   */
  private static triggerDNAAnalysis(): void {
    const pattern = this.customPatterns.get('dna_analysis') || [100, 50, 100, 50, 200];
    this.triggerPattern(pattern);
  }

  /**
   * Başarı rozeti haptic feedback'i
   */
  private static triggerAchievement(): void {
    const pattern = this.customPatterns.get('achievement') || [50, 100, 50, 200];
    this.triggerPattern(pattern);
  }

  /**
   * Buton basma haptic feedback'i
   */
  private static triggerButtonPress(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  /**
   * Kart çevirme haptic feedback'i
   */
  private static triggerCardFlip(): void {
    const pattern = this.customPatterns.get('card_flip') || [150, 50, 150];
    this.triggerPattern(pattern);
  }

  /**
   * Swipe haptic feedback'i
   */
  private static triggerSwipe(): void {
    const pattern = this.customPatterns.get('swipe') || [80, 40, 80];
    this.triggerPattern(pattern);
  }

  /**
   * Long press haptic feedback'i
   */
  private static triggerLongPress(): void {
    const pattern = this.customPatterns.get('long_press') || [100, 200, 100];
    this.triggerPattern(pattern);
  }

  /**
   * Özel haptic deseni tetikler
   */
  private static triggerPattern(pattern: number[]): void {
    pattern.forEach((delay, index) => {
      setTimeout(() => {
        if (index % 2 === 0) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }, delay);
    });
  }

  /**
   * Özel haptic deseni ekler
   */
  static addCustomPattern(name: string, pattern: number[]): void {
    this.customPatterns.set(name, pattern);
  }

  /**
   * Özel haptic desenini kaldırır
   */
  static removeCustomPattern(name: string): void {
    this.customPatterns.delete(name);
  }

  /**
   * Tüm özel desenleri temizler
   */
  static clearCustomPatterns(): void {
    this.customPatterns.clear();
    this.setupCustomPatterns();
  }

  /**
   * Haptic feedback ayarlarını getirir
   */
  static getSettings(): {
    enabled: boolean;
    intensity: 'light' | 'medium' | 'heavy';
    customPatterns: string[];
  } {
    return {
      enabled: this.isEnabled,
      intensity: this.intensity,
      customPatterns: Array.from(this.customPatterns.keys())
    };
  }

  /**
   * Haptic feedback test eder
   */
  static testHaptic(type: HapticType = 'medium'): void {
    this.trigger(type);
  }

  /**
   * Tüm haptic türlerini test eder
   */
  static testAllHaptics(): void {
    const types: HapticType[] = [
      'light', 'medium', 'heavy', 'success', 'warning', 'error',
      'selection', 'impact', 'notification', 'dna_analysis', 'achievement',
      'button_press', 'card_flip', 'swipe', 'long_press'
    ];

    types.forEach((type, index) => {
      setTimeout(() => {
        this.trigger(type);
      }, index * 500);
    });
  }

  /**
   * Haptic feedback durumunu kontrol eder
   */
  static isHapticSupported(): boolean {
    try {
      // Haptic feedback desteklenip desteklenmediğini kontrol et
      return true; // Expo Haptics her zaman desteklenir
    } catch (error) {
      return false;
    }
  }

  /**
   * Haptic feedback ayarlarını kaydeder
   */
  static saveSettings(settings: {
    enabled: boolean;
    intensity: 'light' | 'medium' | 'heavy';
  }): void {
    this.isEnabled = settings.enabled;
    this.intensity = settings.intensity;
  }

  /**
   * Haptic feedback ayarlarını yükler
   */
  static loadSettings(): {
    enabled: boolean;
    intensity: 'light' | 'medium' | 'heavy';
  } {
    return {
      enabled: this.isEnabled,
      intensity: this.intensity
    };
  }

  /**
   * Haptic feedback istatistiklerini getirir
   */
  static getStats(): {
    totalTriggers: number;
    lastTriggerTime: Date | null;
    mostUsedType: HapticType | null;
  } {
    // Bu veriler gerçek uygulamada AsyncStorage'da saklanabilir
    return {
      totalTriggers: 0,
      lastTriggerTime: null,
      mostUsedType: null
    };
  }

  /**
   * Haptic feedback geçmişini temizler
   */
  static clearStats(): void {
    // İstatistikleri temizle
  }

  /**
   * Haptic feedback önerilerini getirir
   */
  static getRecommendations(): string[] {
    return [
      'DNA analizi sırasında haptic feedback kullanın',
      'Başarı rozetleri için özel haptic desenleri ayarlayın',
      'Buton etkileşimlerinde haptic feedback ekleyin',
      'Hata durumlarında güçlü haptic feedback kullanın',
      'Kart çevirme işlemlerinde haptic feedback ekleyin'
    ];
  }
}
