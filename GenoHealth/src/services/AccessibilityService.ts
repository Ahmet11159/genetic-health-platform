// Accessibility servisi
import { AccessibilityInfo, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AccessibilityConfig {
  screenReaderEnabled: boolean;
  reduceMotionEnabled: boolean;
  highContrastEnabled: boolean;
  largeTextEnabled: boolean;
  voiceOverEnabled: boolean;
  talkBackEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  contrastLevel: 'normal' | 'high' | 'extra-high';
  animationSpeed: 'slow' | 'normal' | 'fast';
  hapticFeedback: boolean;
  soundEffects: boolean;
  voiceGuidance: boolean;
  colorBlindSupport: boolean;
  keyboardNavigation: boolean;
  focusManagement: boolean;
}

export interface AccessibilityFeatures {
  screenReader: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  voiceOver: boolean;
  talkBack: boolean;
  fontSize: number;
  contrastRatio: number;
  animationDuration: number;
  hapticEnabled: boolean;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  colorBlindMode: string;
  keyboardNav: boolean;
  focusVisible: boolean;
}

export interface AccessibilityAnnouncement {
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'navigation' | 'action' | 'status' | 'error' | 'success';
  timestamp: number;
  duration?: number;
}

export interface AccessibilityShortcut {
  key: string;
  action: string;
  description: string;
  enabled: boolean;
}

export class AccessibilityService {
  private static isInitialized = false;
  private static config: AccessibilityConfig = {
    screenReaderEnabled: false,
    reduceMotionEnabled: false,
    highContrastEnabled: false,
    largeTextEnabled: false,
    voiceOverEnabled: false,
    talkBackEnabled: false,
    fontSize: 'medium',
    contrastLevel: 'normal',
    animationSpeed: 'normal',
    hapticFeedback: true,
    soundEffects: true,
    voiceGuidance: true,
    colorBlindSupport: false,
    keyboardNavigation: true,
    focusManagement: true,
  };
  private static features: AccessibilityFeatures = {
    screenReader: false,
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    voiceOver: false,
    talkBack: false,
    fontSize: 16,
    contrastRatio: 4.5,
    animationDuration: 300,
    hapticEnabled: true,
    soundEnabled: true,
    voiceEnabled: true,
    colorBlindMode: 'none',
    keyboardNav: true,
    focusVisible: true,
  };
  private static announcements: AccessibilityAnnouncement[] = [];
  private static shortcuts: Map<string, AccessibilityShortcut> = new Map();
  private static focusHistory: string[] = [];
  private static currentFocus: string | null = null;

  /**
   * Servisi başlatır
   */
  static async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Sistem accessibility özelliklerini kontrol et
      await this.detectSystemFeatures();

      // Konfigürasyonu yükle
      await this.loadConfig();

      // Shortcut'ları yükle
      await this.loadShortcuts();

      // Event listener'ları ayarla
      this.setupEventListeners();

      this.isInitialized = true;
      console.log('Accessibility servisi başlatıldı');
      return true;
    } catch (error) {
      console.error('Accessibility servisi başlatma hatası:', error);
      return false;
    }
  }

  /**
   * Sistem accessibility özelliklerini tespit eder
   */
  private static async detectSystemFeatures(): Promise<void> {
    try {
      // Screen reader kontrolü
      this.features.screenReader = await AccessibilityInfo.isScreenReaderEnabled();
      
      // Reduce motion kontrolü
      this.features.reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
      
      // High contrast kontrolü (iOS'ta mevcut değil)
      try {
        this.features.highContrast = await AccessibilityInfo.isHighContrastEnabled();
      } catch (error) {
        this.features.highContrast = false;
      }
      
      // Large text kontrolü (iOS'ta mevcut değil)
      try {
        this.features.largeText = await AccessibilityInfo.isLargeTextEnabled();
      } catch (error) {
        this.features.largeText = false;
      }
      
      // Platform-specific özellikler
      if (Platform.OS === 'ios') {
        this.features.voiceOver = this.features.screenReader;
      } else if (Platform.OS === 'android') {
        this.features.talkBack = this.features.screenReader;
      }

      // Font size hesapla
      this.calculateFontSize();
      
      // Contrast ratio hesapla
      this.calculateContrastRatio();
      
      // Animation duration hesapla
      this.calculateAnimationDuration();
    } catch (error) {
      console.error('Sistem özelliklerini tespit etme hatası:', error);
    }
  }

  /**
   * Font size hesaplar
   */
  private static calculateFontSize(): void {
    switch (this.config.fontSize) {
      case 'small':
        this.features.fontSize = 14;
        break;
      case 'medium':
        this.features.fontSize = 16;
        break;
      case 'large':
        this.features.fontSize = 18;
        break;
      case 'extra-large':
        this.features.fontSize = 20;
        break;
    }
  }

  /**
   * Contrast ratio hesaplar
   */
  private static calculateContrastRatio(): void {
    switch (this.config.contrastLevel) {
      case 'normal':
        this.features.contrastRatio = 4.5;
        break;
      case 'high':
        this.features.contrastRatio = 7.0;
        break;
      case 'extra-high':
        this.features.contrastRatio = 10.0;
        break;
    }
  }

  /**
   * Animation duration hesaplar
   */
  private static calculateAnimationDuration(): void {
    if (this.features.reduceMotion) {
      this.features.animationDuration = 0;
    } else {
      switch (this.config.animationSpeed) {
        case 'slow':
          this.features.animationDuration = 500;
          break;
        case 'normal':
          this.features.animationDuration = 300;
          break;
        case 'fast':
          this.features.animationDuration = 150;
          break;
      }
    }
  }

  /**
   * Konfigürasyonu yükler
   */
  private static async loadConfig(): Promise<void> {
    try {
      const configData = await AsyncStorage.getItem('accessibility_config');
      if (configData) {
        this.config = { ...this.config, ...JSON.parse(configData) };
      }
    } catch (error) {
      console.error('Konfigürasyon yükleme hatası:', error);
    }
  }

  /**
   * Konfigürasyonu kaydeder
   */
  static async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem('accessibility_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Konfigürasyon kaydetme hatası:', error);
    }
  }

  /**
   * Shortcut'ları yükler
   */
  private static async loadShortcuts(): Promise<void> {
    try {
      const shortcutsData = await AsyncStorage.getItem('accessibility_shortcuts');
      if (shortcutsData) {
        const shortcuts = JSON.parse(shortcutsData);
        shortcuts.forEach((shortcut: AccessibilityShortcut) => {
          this.shortcuts.set(shortcut.key, shortcut);
        });
      } else {
        // Varsayılan shortcut'ları oluştur
        await this.createDefaultShortcuts();
      }
    } catch (error) {
      console.error('Shortcut yükleme hatası:', error);
    }
  }

  /**
   * Varsayılan shortcut'ları oluşturur
   */
  private static async createDefaultShortcuts(): Promise<void> {
    const defaultShortcuts: AccessibilityShortcut[] = [
      {
        key: 'double_tap',
        action: 'activate',
        description: 'Çift dokunma ile aktifleştir',
        enabled: true,
      },
      {
        key: 'long_press',
        action: 'context_menu',
        description: 'Uzun basma ile menü aç',
        enabled: true,
      },
      {
        key: 'swipe_left',
        action: 'navigate_back',
        description: 'Sola kaydırma ile geri git',
        enabled: true,
      },
      {
        key: 'swipe_right',
        action: 'navigate_forward',
        description: 'Sağa kaydırma ile ileri git',
        enabled: true,
      },
      {
        key: 'swipe_up',
        action: 'scroll_up',
        description: 'Yukarı kaydırma ile yukarı kaydır',
        enabled: true,
      },
      {
        key: 'swipe_down',
        action: 'scroll_down',
        description: 'Aşağı kaydırma ile aşağı kaydır',
        enabled: true,
      },
      {
        key: 'pinch_zoom',
        action: 'zoom',
        description: 'Pinch ile yakınlaştır/uzaklaştır',
        enabled: true,
      },
      {
        key: 'voice_command',
        action: 'voice_control',
        description: 'Ses komutu ile kontrol et',
        enabled: true,
      },
    ];

    defaultShortcuts.forEach(shortcut => {
      this.shortcuts.set(shortcut.key, shortcut);
    });

    await this.saveShortcuts();
  }

  /**
   * Shortcut'ları kaydeder
   */
  private static async saveShortcuts(): Promise<void> {
    try {
      const shortcuts = Array.from(this.shortcuts.values());
      await AsyncStorage.setItem('accessibility_shortcuts', JSON.stringify(shortcuts));
    } catch (error) {
      console.error('Shortcut kaydetme hatası:', error);
    }
  }

  /**
   * Event listener'ları ayarlar
   */
  private static setupEventListeners(): void {
    // Screen reader değişikliklerini dinle
    AccessibilityInfo.addEventListener('screenReaderChanged', (isEnabled) => {
      this.features.screenReader = isEnabled;
      this.config.screenReaderEnabled = isEnabled;
      this.announce('Ekran okuyucu ' + (isEnabled ? 'açıldı' : 'kapandı'), 'status');
    });

    // Reduce motion değişikliklerini dinle
    AccessibilityInfo.addEventListener('reduceMotionChanged', (isEnabled) => {
      this.features.reduceMotion = isEnabled;
      this.config.reduceMotionEnabled = isEnabled;
      this.calculateAnimationDuration();
      this.announce('Hareket azaltma ' + (isEnabled ? 'açıldı' : 'kapandı'), 'status');
    });

    // High contrast değişikliklerini dinle (iOS'ta mevcut değil)
    try {
      AccessibilityInfo.addEventListener('highContrastChanged', (isEnabled) => {
        this.features.highContrast = isEnabled;
        this.config.highContrastEnabled = isEnabled;
        this.calculateContrastRatio();
        this.announce('Yüksek kontrast ' + (isEnabled ? 'açıldı' : 'kapandı'), 'status');
      });
    } catch (error) {
      console.log('High contrast listener not available on this platform');
    }

    // Large text değişikliklerini dinle (iOS'ta mevcut değil)
    try {
      AccessibilityInfo.addEventListener('largeTextChanged', (isEnabled) => {
        this.features.largeText = isEnabled;
        this.config.largeTextEnabled = isEnabled;
        this.calculateFontSize();
        this.announce('Büyük metin ' + (isEnabled ? 'açıldı' : 'kapandı'), 'status');
      });
    } catch (error) {
      console.log('Large text listener not available on this platform');
    }
  }

  /**
   * Accessibility announcement yapar
   */
  static announce(message: string, category: 'navigation' | 'action' | 'status' | 'error' | 'success' = 'status'): void {
    if (!this.features.screenReader) return;

    const announcement: AccessibilityAnnouncement = {
      message,
      priority: category === 'error' ? 'urgent' : 'medium',
      category,
      timestamp: Date.now(),
    };

    this.announcements.push(announcement);

    // Announcement'ı ekran okuyucuya gönder
    AccessibilityInfo.announceForAccessibility(message);

    // Son 100 announcement'ı tut
    if (this.announcements.length > 100) {
      this.announcements = this.announcements.slice(-100);
    }
  }

  /**
   * Focus yönetimi
   */
  static setFocus(elementId: string): void {
    if (!this.config.focusManagement) return;

    // Önceki focus'u kaydet
    if (this.currentFocus) {
      this.focusHistory.push(this.currentFocus);
    }

    // Yeni focus'u ayarla
    this.currentFocus = elementId;

    // Focus announcement
    this.announce(`Odak ${elementId} elementine taşındı`, 'navigation');
  }

  /**
   * Focus geçmişini getirir
   */
  static getFocusHistory(): string[] {
    return [...this.focusHistory];
  }

  /**
   * Mevcut focus'u getirir
   */
  static getCurrentFocus(): string | null {
    return this.currentFocus;
  }

  /**
   * Focus'u temizler
   */
  static clearFocus(): void {
    this.currentFocus = null;
    this.focusHistory = [];
  }

  /**
   * Keyboard navigation kontrolü
   */
  static isKeyboardNavigationEnabled(): boolean {
    return this.config.keyboardNavigation && this.features.keyboardNav;
  }

  /**
   * Haptic feedback kontrolü
   */
  static isHapticFeedbackEnabled(): boolean {
    return this.config.hapticFeedback && this.features.hapticEnabled;
  }

  /**
   * Sound effects kontrolü
   */
  static isSoundEffectsEnabled(): boolean {
    return this.config.soundEffects && this.features.soundEnabled;
  }

  /**
   * Voice guidance kontrolü
   */
  static isVoiceGuidanceEnabled(): boolean {
    return this.config.voiceGuidance && this.features.voiceEnabled;
  }

  /**
   * Color blind support kontrolü
   */
  static isColorBlindSupportEnabled(): boolean {
    return this.config.colorBlindSupport;
  }

  /**
   * Accessibility özelliklerini getirir
   */
  static getAccessibilityFeatures(): AccessibilityFeatures {
    return { ...this.features };
  }

  /**
   * Konfigürasyonu getirir
   */
  static getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  /**
   * Konfigürasyonu günceller
   */
  static async updateConfig(updates: Partial<AccessibilityConfig>): Promise<void> {
    this.config = { ...this.config, ...updates };
    
    // Özellikleri yeniden hesapla
    this.calculateFontSize();
    this.calculateContrastRatio();
    this.calculateAnimationDuration();
    
    await this.saveConfig();
  }

  /**
   * Shortcut'ları getirir
   */
  static getShortcuts(): AccessibilityShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Shortcut'ı günceller
   */
  static async updateShortcut(key: string, updates: Partial<AccessibilityShortcut>): Promise<void> {
    const shortcut = this.shortcuts.get(key);
    if (shortcut) {
      Object.assign(shortcut, updates);
      await this.saveShortcuts();
    }
  }

  /**
   * Shortcut'ı etkinleştirir/devre dışı bırakır
   */
  static async toggleShortcut(key: string): Promise<void> {
    const shortcut = this.shortcuts.get(key);
    if (shortcut) {
      shortcut.enabled = !shortcut.enabled;
      await this.saveShortcuts();
    }
  }

  /**
   * Announcement'ları getirir
   */
  static getAnnouncements(): AccessibilityAnnouncement[] {
    return [...this.announcements];
  }

  /**
   * Son announcement'ı getirir
   */
  static getLastAnnouncement(): AccessibilityAnnouncement | null {
    return this.announcements.length > 0 ? this.announcements[this.announcements.length - 1] : null;
  }

  /**
   * Accessibility raporu oluşturur
   */
  static generateAccessibilityReport(): {
    summary: string;
    features: AccessibilityFeatures;
    config: AccessibilityConfig;
    shortcuts: AccessibilityShortcut[];
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    
    // Screen reader önerileri
    if (!this.features.screenReader) {
      recommendations.push('Ekran okuyucu kullanımı önerilir.');
    }
    
    // High contrast önerileri
    if (!this.features.highContrast) {
      recommendations.push('Yüksek kontrast modu görme zorluğu yaşayanlar için önerilir.');
    }
    
    // Large text önerileri
    if (!this.features.largeText) {
      recommendations.push('Büyük metin modu okuma zorluğu yaşayanlar için önerilir.');
    }
    
    // Reduce motion önerileri
    if (!this.features.reduceMotion) {
      recommendations.push('Hareket azaltma modu vertigo yaşayanlar için önerilir.');
    }

    const summary = `Accessibility: ${this.features.screenReader ? 'Ekran Okuyucu' : 'Normal'} mod, ${this.features.fontSize}px font, ${this.features.contrastRatio}:1 kontrast`;

    return {
      summary,
      features: this.features,
      config: this.config,
      shortcuts: this.getShortcuts(),
      recommendations,
    };
  }

  /**
   * Accessibility test yapar
   */
  static async runAccessibilityTest(): Promise<{
    passed: number;
    failed: number;
    total: number;
    results: Array<{ test: string; passed: boolean; message: string }>;
  }> {
    const results: Array<{ test: string; passed: boolean; message: string }> = [];
    
    // Test 1: Screen reader support
    results.push({
      test: 'Screen Reader Support',
      passed: this.features.screenReader,
      message: this.features.screenReader ? 'Ekran okuyucu destekleniyor' : 'Ekran okuyucu desteklenmiyor'
    });
    
    // Test 2: Focus management
    results.push({
      test: 'Focus Management',
      passed: this.config.focusManagement,
      message: this.config.focusManagement ? 'Focus yönetimi aktif' : 'Focus yönetimi pasif'
    });
    
    // Test 3: Keyboard navigation
    results.push({
      test: 'Keyboard Navigation',
      passed: this.config.keyboardNavigation,
      message: this.config.keyboardNavigation ? 'Klavye navigasyonu aktif' : 'Klavye navigasyonu pasif'
    });
    
    // Test 4: Haptic feedback
    results.push({
      test: 'Haptic Feedback',
      passed: this.config.hapticFeedback,
      message: this.config.hapticFeedback ? 'Haptic feedback aktif' : 'Haptic feedback pasif'
    });
    
    // Test 5: Sound effects
    results.push({
      test: 'Sound Effects',
      passed: this.config.soundEffects,
      message: this.config.soundEffects ? 'Ses efektleri aktif' : 'Ses efektleri pasif'
    });

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;

    return { passed, failed, total, results };
  }

  /**
   * Servisi temizler
   */
  static async cleanup(): Promise<void> {
    try {
      await this.saveConfig();
      await this.saveShortcuts();
      this.announcements = [];
      this.shortcuts.clear();
      this.focusHistory = [];
      this.currentFocus = null;
      this.isInitialized = false;
    } catch (error) {
      console.error('Servis temizleme hatası:', error);
    }
  }
}
