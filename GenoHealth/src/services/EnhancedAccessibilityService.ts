// Güvenli Accessibility Service
import { AccessibilityInfo, Platform } from 'react-native';

export interface AccessibilityConfig {
  screenReaderEnabled: boolean;
  reduceMotionEnabled: boolean;
  highContrastEnabled: boolean;
  largeTextEnabled: boolean;
  boldTextEnabled: boolean;
  invertColorsEnabled: boolean;
  grayscaleEnabled: boolean;
}

export class EnhancedAccessibilityService {
  private static isInitialized = false;
  private static config: AccessibilityConfig = {
    screenReaderEnabled: false,
    reduceMotionEnabled: false,
    highContrastEnabled: false,
    largeTextEnabled: false,
    boldTextEnabled: false,
    invertColorsEnabled: false,
    grayscaleEnabled: false,
  };

  /**
   * Servisi başlatır
   */
  static initialize(): void {
    if (this.isInitialized) return;

    this.checkAccessibilitySettings();
    this.setupAccessibilityListeners();

    this.isInitialized = true;
    console.log('Enhanced Accessibility Service initialized!');
  }

  /**
   * Erişilebilirlik ayarlarını kontrol eder
   */
  private static async checkAccessibilitySettings(): Promise<void> {
    try {
      const [
        screenReaderEnabled,
        reduceMotionEnabled,
        boldTextEnabled,
        invertColorsEnabled,
        grayscaleEnabled,
      ] = await Promise.all([
        AccessibilityInfo.isScreenReaderEnabled(),
        AccessibilityInfo.isReduceMotionEnabled(),
        AccessibilityInfo.isBoldTextEnabled(),
        AccessibilityInfo.isInvertColorsEnabled(),
        AccessibilityInfo.isGrayscaleEnabled(),
      ]);

      this.config = {
        screenReaderEnabled: screenReaderEnabled || false,
        reduceMotionEnabled: reduceMotionEnabled || false,
        highContrastEnabled: false, // React Native'de mevcut değil
        largeTextEnabled: false, // React Native'de mevcut değil
        boldTextEnabled: boldTextEnabled || false,
        invertColorsEnabled: invertColorsEnabled || false,
        grayscaleEnabled: grayscaleEnabled || false,
      };
    } catch (error) {
      console.error('Error checking accessibility settings:', error);
    }
  }

  /**
   * Erişilebilirlik dinleyicilerini ayarlar
   */
  private static setupAccessibilityListeners(): void {
    // Screen reader durumu değişikliği
    AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
      this.config.screenReaderEnabled = enabled;
      this.announce('Ekran okuyucu ' + (enabled ? 'etkinleştirildi' : 'devre dışı bırakıldı'), 'medium');
    });

    // Reduce motion durumu değişikliği
    AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      this.config.reduceMotionEnabled = enabled;
    });
  }

  /**
   * Sesli duyuru yapar
   */
  static announce(message: string, priority: 'low' | 'medium' | 'high' = 'medium'): void {
    if (!this.config.screenReaderEnabled) return;

    try {
      if (Platform.OS === 'ios') {
        // iOS için AccessibilityInfo.announceForAccessibility kullan
        AccessibilityInfo.announceForAccessibility(message);
      } else {
        // Android için console.log (gerçek uygulamada TalkBack API kullanılabilir)
        console.log(`Accessibility Announcement: ${message}`);
      }
    } catch (error) {
      console.error('Error announcing accessibility message:', error);
    }
  }

  /**
   * Card accessibility bilgileri oluşturur
   */
  static createCardAccessibility(title: string, content: string, action?: string) {
    const accessibilityLabel = `${title}. ${content}`;
    const accessibilityHint = action ? `Dokunarak ${action}` : 'Dokunarak detayları görüntüle';
    
    return {
      accessibilityLabel,
      accessibilityHint,
      accessibilityRole: 'button' as const,
    };
  }

  /**
   * Button accessibility bilgileri oluşturur
   */
  static createButtonAccessibility(label: string, action: string) {
    return {
      accessibilityLabel: label,
      accessibilityHint: `Dokunarak ${action}`,
      accessibilityRole: 'button' as const,
    };
  }

  /**
   * Screen reader etkin mi kontrol eder
   */
  static isScreenReaderEnabled(): boolean {
    return this.config.screenReaderEnabled;
  }

  /**
   * Reduce motion etkin mi kontrol eder
   */
  static isReduceMotionEnabled(): boolean {
    return this.config.reduceMotionEnabled;
  }

  /**
   * High contrast etkin mi kontrol eder (React Native'de mevcut değil)
   */
  static isHighContrastEnabled(): boolean {
    return false; // React Native'de bu özellik mevcut değil
  }

  /**
   * Large text etkin mi kontrol eder (React Native'de mevcut değil)
   */
  static isLargeTextEnabled(): boolean {
    return false; // React Native'de bu özellik mevcut değil
  }

  /**
   * Bold text etkin mi kontrol eder
   */
  static isBoldTextEnabled(): boolean {
    return this.config.boldTextEnabled;
  }

  /**
   * Invert colors etkin mi kontrol eder
   */
  static isInvertColorsEnabled(): boolean {
    return this.config.invertColorsEnabled;
  }

  /**
   * Grayscale etkin mi kontrol eder
   */
  static isGrayscaleEnabled(): boolean {
    return this.config.grayscaleEnabled;
  }

  /**
   * Erişilebilirlik konfigürasyonunu döndürür
   */
  static getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  /**
   * Servis durumunu kontrol eder
   */
  static isInitialized(): boolean {
    return this.isInitialized;
  }
}