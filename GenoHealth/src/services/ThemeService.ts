// Gelişmiş tema servisi
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  // Ana renkler
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  card: string;
  
  // Metin renkleri
  text: string;
  textSecondary: string;
  textDisabled: string;
  textInverse: string;
  
  // Durum renkleri
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Border ve divider
  border: string;
  divider: string;
  outline: string;
  
  // Overlay
  overlay: string;
  backdrop: string;
  
  // Özel renkler
  dna: string;
  genetic: string;
  health: string;
  nutrition: string;
  exercise: string;
  sleep: string;
  stress: string;
  energy: string;
  
  // Gradient renkleri
  gradientStart: string;
  gradientEnd: string;
  gradientMiddle?: string;
  
  // Shadow renkleri
  shadow: string;
  shadowLight: string;
  shadowDark: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  typography: {
    fontFamily: string;
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
      xxxl: number;
    };
    fontWeight: {
      light: '300';
      normal: '400';
      medium: '500';
      semibold: '600';
      bold: '700';
      extrabold: '800';
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  shadows: {
    sm: any;
    md: any;
    lg: any;
    xl: any;
  };
}

export class ThemeService {
  private static currentTheme: Theme;
  private static themeMode: ThemeMode = 'light';
  private static systemColorScheme: ColorScheme = 'light';
  private static listeners: ((theme: Theme) => void)[] = [];

  // Light tema
  private static lightTheme: Theme = {
    mode: 'light',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#FF6B6B',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      card: '#FFFFFF',
      text: '#212529',
      textSecondary: '#6C757D',
      textDisabled: '#ADB5BD',
      textInverse: '#FFFFFF',
      success: '#28A745',
      warning: '#FFC107',
      error: '#DC3545',
      info: '#17A2B8',
      border: '#E9ECEF',
      divider: '#DEE2E6',
      outline: '#CED4DA',
      overlay: 'rgba(0, 0, 0, 0.5)',
      backdrop: 'rgba(0, 0, 0, 0.3)',
      dna: '#4CAF50',
      genetic: '#9C27B0',
      health: '#2196F3',
      nutrition: '#FF9800',
      exercise: '#F44336',
      sleep: '#673AB7',
      stress: '#FF5722',
      energy: '#FFD700',
      gradientStart: '#667eea',
      gradientEnd: '#764ba2',
      gradientMiddle: '#5a67d8',
      shadow: '#000000',
      shadowLight: 'rgba(0, 0, 0, 0.1)',
      shadowDark: 'rgba(0, 0, 0, 0.3)',
    },
    typography: {
      fontFamily: 'System',
      fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.8,
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      full: 9999,
    },
    shadows: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
      },
      xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 16,
      },
    },
  };

  // Dark tema
  private static darkTheme: Theme = {
    mode: 'dark',
    colors: {
      primary: '#8B5CF6',
      secondary: '#A855F7',
      accent: '#FF6B6B',
      background: '#0F0F0F',
      surface: '#1A1A1A',
      card: '#2D2D2D',
      text: '#FFFFFF',
      textSecondary: '#B3B3B3',
      textDisabled: '#666666',
      textInverse: '#000000',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      border: '#404040',
      divider: '#333333',
      outline: '#555555',
      overlay: 'rgba(0, 0, 0, 0.7)',
      backdrop: 'rgba(0, 0, 0, 0.5)',
      dna: '#10B981',
      genetic: '#A855F7',
      health: '#3B82F6',
      nutrition: '#F59E0B',
      exercise: '#EF4444',
      sleep: '#8B5CF6',
      stress: '#F97316',
      energy: '#FCD34D',
      gradientStart: '#8B5CF6',
      gradientEnd: '#A855F7',
      gradientMiddle: '#9333EA',
      shadow: '#000000',
      shadowLight: 'rgba(0, 0, 0, 0.3)',
      shadowDark: 'rgba(0, 0, 0, 0.6)',
    },
    typography: {
      fontFamily: 'System',
      fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.8,
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      full: 9999,
    },
    shadows: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
      },
      xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        elevation: 16,
      },
    },
  };

  /**
   * Servisi başlatır
   */
  static async initialize(): Promise<void> {
    try {
      // Kaydedilmiş tema modunu yükle
      const savedMode = await AsyncStorage.getItem('theme_mode');
      if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
        this.themeMode = savedMode as ThemeMode;
      }

      // Sistem renk şemasını kontrol et
      this.updateSystemColorScheme();

      // Tema moduna göre tema seç
      this.updateTheme();

      console.log('Theme Service initialized!');
    } catch (error) {
      console.error('Theme service initialization error:', error);
      this.themeMode = 'light';
      this.currentTheme = this.lightTheme;
    }
  }

  /**
   * Sistem renk şemasını günceller
   */
  private static updateSystemColorScheme(): void {
    // Bu gerçek uygulamada Appearance API kullanılabilir
    // Şimdilik mock implementasyon
    this.systemColorScheme = 'light';
  }

  /**
   * Tema moduna göre tema günceller
   */
  private static updateTheme(): void {
    if (this.themeMode === 'auto') {
      this.currentTheme = this.systemColorScheme === 'dark' ? this.darkTheme : this.lightTheme;
    } else if (this.themeMode === 'dark') {
      this.currentTheme = this.darkTheme;
    } else {
      this.currentTheme = this.lightTheme;
    }

    // Dinleyicilere bildir
    this.notifyListeners();
  }

  /**
   * Dinleyicilere bildirim gönderir
   */
  private static notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentTheme);
      } catch (error) {
        console.error('Theme listener error:', error);
      }
    });
  }

  /**
   * Tema modunu değiştirir
   */
  static async setThemeMode(mode: ThemeMode): Promise<void> {
    try {
      this.themeMode = mode;
      await AsyncStorage.setItem('theme_mode', mode);
      this.updateTheme();
    } catch (error) {
      console.error('Set theme mode error:', error);
    }
  }

  /**
   * Mevcut tema modunu getirir
   */
  static getThemeMode(): ThemeMode {
    return this.themeMode;
  }

  /**
   * Mevcut temayı getirir
   */
  static getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Tema dinleyicisi ekler
   */
  static addThemeListener(listener: (theme: Theme) => void): () => void {
    this.listeners.push(listener);
    
    // Cleanup fonksiyonu döndür
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Tema dinleyicisini kaldırır
   */
  static removeThemeListener(listener: (theme: Theme) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Tema renklerini getirir
   */
  static getColors(): ThemeColors {
    return this.currentTheme.colors;
  }

  /**
   * Belirli bir rengi getirir
   */
  static getColor(colorKey: keyof ThemeColors): string {
    return this.currentTheme.colors[colorKey];
  }

  /**
   * Typography ayarlarını getirir
   */
  static getTypography() {
    return this.currentTheme.typography;
  }

  /**
   * Spacing ayarlarını getirir
   */
  static getSpacing() {
    return this.currentTheme.spacing;
  }

  /**
   * Border radius ayarlarını getirir
   */
  static getBorderRadius() {
    return this.currentTheme.borderRadius;
  }

  /**
   * Shadow ayarlarını getirir
   */
  static getShadows() {
    return this.currentTheme.shadows;
  }

  /**
   * Dark mode aktif mi kontrol eder
   */
  static isDarkMode(): boolean {
    return this.currentTheme.mode === 'dark';
  }

  /**
   * Light mode aktif mi kontrol eder
   */
  static isLightMode(): boolean {
    return this.currentTheme.mode === 'light';
  }

  /**
   * Auto mode aktif mi kontrol eder
   */
  static isAutoMode(): boolean {
    return this.themeMode === 'auto';
  }

  /**
   * Tema ayarlarını getirir
   */
  static getThemeSettings(): {
    mode: ThemeMode;
    systemColorScheme: ColorScheme;
    isDarkMode: boolean;
    isLightMode: boolean;
    isAutoMode: boolean;
  } {
    return {
      mode: this.themeMode,
      systemColorScheme: this.systemColorScheme,
      isDarkMode: this.isDarkMode(),
      isLightMode: this.isLightMode(),
      isAutoMode: this.isAutoMode(),
    };
  }

  /**
   * Tema ayarlarını kaydeder
   */
  static async saveThemeSettings(settings: { mode: ThemeMode }): Promise<void> {
    try {
      await this.setThemeMode(settings.mode);
    } catch (error) {
      console.error('Save theme settings error:', error);
    }
  }

  /**
   * Tema ayarlarını sıfırlar
   */
  static async resetThemeSettings(): Promise<void> {
    try {
      await this.setThemeMode('light');
    } catch (error) {
      console.error('Reset theme settings error:', error);
    }
  }

  /**
   * Özel tema oluşturur
   */
  static createCustomTheme(
    baseTheme: Theme,
    customColors: Partial<ThemeColors>
  ): Theme {
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        ...customColors,
      },
    };
  }

  /**
   * Tema geçiş animasyonu için renk değişimi
   */
  static getThemeTransitionColors(): {
    from: ThemeColors;
    to: ThemeColors;
  } {
    const isDark = this.isDarkMode();
    return {
      from: isDark ? this.lightTheme.colors : this.darkTheme.colors,
      to: isDark ? this.darkTheme.colors : this.lightTheme.colors,
    };
  }

  /**
   * Tema istatistiklerini getirir
   */
  static getThemeStats(): {
    totalThemeChanges: number;
    lastThemeChange: Date | null;
    mostUsedMode: ThemeMode | null;
  } {
    // Bu veriler gerçek uygulamada AsyncStorage'da saklanabilir
    return {
      totalThemeChanges: 0,
      lastThemeChange: null,
      mostUsedMode: null,
    };
  }

  /**
   * Tema geçmişini temizler
   */
  static clearThemeStats(): void {
    // İstatistikleri temizle
  }

  /**
   * Tema önerilerini getirir
   */
  static getThemeRecommendations(): string[] {
    return [
      'Dark mode göz yorgunluğunu azaltır',
      'Auto mode sistem ayarlarını takip eder',
      'Light mode daha iyi okunabilirlik sağlar',
      'Tema değişiklikleri animasyonlu olmalı',
      'Kullanıcı tercihlerini hatırlayın'
    ];
  }
}


