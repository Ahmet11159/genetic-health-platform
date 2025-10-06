// Smart color system servisi
import { Appearance, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ColorScheme {
  name: string;
  type: 'light' | 'dark' | 'auto' | 'high-contrast' | 'colorblind';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    shadow: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  gradients: {
    primary: string[];
    secondary: string[];
    success: string[];
    warning: string[];
    error: string[];
    info: string[];
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface ColorPreferences {
  preferredScheme: 'light' | 'dark' | 'auto';
  highContrast: boolean;
  colorBlindSupport: boolean;
  reducedMotion: boolean;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

export interface ColorAnalysis {
  contrastRatio: number;
  accessibilityLevel: 'AA' | 'AAA' | 'fail';
  colorBlindSafe: boolean;
  readabilityScore: number;
  emotionalTone: 'calm' | 'energetic' | 'professional' | 'friendly' | 'serious';
}

export class SmartColorSystemService {
  private static isInitialized = false;
  private static currentScheme: ColorScheme;
  private static availableSchemes: Map<string, ColorScheme> = new Map();
  private static userPreferences: ColorPreferences = {
    preferredScheme: 'auto',
    highContrast: false,
    colorBlindSupport: false,
    reducedMotion: false,
  };
  private static systemColorScheme: 'light' | 'dark' = 'light';

  /**
   * Servisi başlatır
   */
  static async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Sistem renk şemasını algıla
      this.systemColorScheme = Appearance.getColorScheme() || 'light';

      // Renk şemalarını yükle
      await this.loadColorSchemes();

      // Kullanıcı tercihlerini yükle
      await this.loadUserPreferences();

      // Mevcut şemayı ayarla
      await this.setCurrentScheme();

      // Sistem değişikliklerini dinle
      this.setupSystemListeners();

      this.isInitialized = true;
      console.log('Smart color system servisi başlatıldı');
      return true;
    } catch (error) {
      console.error('Smart color system başlatma hatası:', error);
      return false;
    }
  }

  /**
   * Renk şemalarını yükler
   */
  private static async loadColorSchemes(): Promise<void> {
    try {
      const schemesData = await AsyncStorage.getItem('color_schemes');
      if (schemesData) {
        const schemes = JSON.parse(schemesData);
        schemes.forEach((scheme: ColorScheme) => {
          this.availableSchemes.set(scheme.name, scheme);
        });
      } else {
        // Varsayılan şemaları oluştur
        await this.createDefaultSchemes();
      }
    } catch (error) {
      console.error('Renk şemalarını yükleme hatası:', error);
    }
  }

  /**
   * Varsayılan şemaları oluşturur
   */
  private static async createDefaultSchemes(): Promise<void> {
    const defaultSchemes: ColorScheme[] = [
      {
        name: 'genetic-light',
        type: 'light',
        colors: {
          primary: '#667eea',
          secondary: '#764ba2',
          accent: '#f093fb',
          background: '#fafbfc',
          surface: '#ffffff',
          text: '#1a1a1a',
          textSecondary: '#6b7280',
          border: '#e5e7eb',
          shadow: '#000000',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
        gradients: {
          primary: ['#667eea', '#764ba2'],
          secondary: ['#f093fb', '#f5576c'],
          success: ['#4facfe', '#00f2fe'],
          warning: ['#ffecd2', '#fcb69f'],
          error: ['#ff9a9e', '#fecfef'],
          info: ['#a8edea', '#fed6e3'],
        },
        shadows: {
          sm: 'rgba(0, 0, 0, 0.05)',
          md: 'rgba(0, 0, 0, 0.1)',
          lg: 'rgba(0, 0, 0, 0.15)',
          xl: 'rgba(0, 0, 0, 0.2)',
        },
      },
      {
        name: 'genetic-dark',
        type: 'dark',
        colors: {
          primary: '#8b5cf6',
          secondary: '#a78bfa',
          accent: '#fbbf24',
          background: '#0f172a',
          surface: '#1e293b',
          text: '#f8fafc',
          textSecondary: '#94a3b8',
          border: '#334155',
          shadow: '#000000',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
        gradients: {
          primary: ['#8b5cf6', '#a78bfa'],
          secondary: ['#fbbf24', '#f59e0b'],
          success: ['#22c55e', '#16a34a'],
          warning: ['#f59e0b', '#d97706'],
          error: ['#ef4444', '#dc2626'],
          info: ['#3b82f6', '#2563eb'],
        },
        shadows: {
          sm: 'rgba(0, 0, 0, 0.3)',
          md: 'rgba(0, 0, 0, 0.4)',
          lg: 'rgba(0, 0, 0, 0.5)',
          xl: 'rgba(0, 0, 0, 0.6)',
        },
      },
      {
        name: 'genetic-high-contrast',
        type: 'high-contrast',
        colors: {
          primary: '#000000',
          secondary: '#ffffff',
          accent: '#ffff00',
          background: '#ffffff',
          surface: '#ffffff',
          text: '#000000',
          textSecondary: '#000000',
          border: '#000000',
          shadow: '#000000',
          success: '#008000',
          warning: '#ff8c00',
          error: '#ff0000',
          info: '#0000ff',
        },
        gradients: {
          primary: ['#000000', '#333333'],
          secondary: ['#ffffff', '#cccccc'],
          success: ['#008000', '#00ff00'],
          warning: ['#ff8c00', '#ffff00'],
          error: ['#ff0000', '#ff6666'],
          info: ['#0000ff', '#6666ff'],
        },
        shadows: {
          sm: 'rgba(0, 0, 0, 0.8)',
          md: 'rgba(0, 0, 0, 0.9)',
          lg: 'rgba(0, 0, 0, 1)',
          xl: 'rgba(0, 0, 0, 1)',
        },
      },
      {
        name: 'genetic-colorblind',
        type: 'colorblind',
        colors: {
          primary: '#1f77b4',
          secondary: '#ff7f0e',
          accent: '#2ca02c',
          background: '#fafafa',
          surface: '#ffffff',
          text: '#2c2c2c',
          textSecondary: '#6c6c6c',
          border: '#d0d0d0',
          shadow: '#000000',
          success: '#2ca02c',
          warning: '#ff7f0e',
          error: '#d62728',
          info: '#1f77b4',
        },
        gradients: {
          primary: ['#1f77b4', '#aec7e8'],
          secondary: ['#ff7f0e', '#ffbb78'],
          success: ['#2ca02c', '#98df8a'],
          warning: ['#ff7f0e', '#ffbb78'],
          error: ['#d62728', '#ff9896'],
          info: ['#1f77b4', '#aec7e8'],
        },
        shadows: {
          sm: 'rgba(0, 0, 0, 0.1)',
          md: 'rgba(0, 0, 0, 0.2)',
          lg: 'rgba(0, 0, 0, 0.3)',
          xl: 'rgba(0, 0, 0, 0.4)',
        },
      },
    ];

    defaultSchemes.forEach(scheme => {
      this.availableSchemes.set(scheme.name, scheme);
    });

    await this.saveColorSchemes();
  }

  /**
   * Renk şemalarını kaydeder
   */
  private static async saveColorSchemes(): Promise<void> {
    try {
      const schemes = Array.from(this.availableSchemes.values());
      await AsyncStorage.setItem('color_schemes', JSON.stringify(schemes));
    } catch (error) {
      console.error('Renk şemalarını kaydetme hatası:', error);
    }
  }

  /**
   * Kullanıcı tercihlerini yükler
   */
  private static async loadUserPreferences(): Promise<void> {
    try {
      const preferencesData = await AsyncStorage.getItem('color_preferences');
      if (preferencesData) {
        this.userPreferences = { ...this.userPreferences, ...JSON.parse(preferencesData) };
      }
    } catch (error) {
      console.error('Kullanıcı tercihlerini yükleme hatası:', error);
    }
  }

  /**
   * Kullanıcı tercihlerini kaydeder
   */
  private static async saveUserPreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem('color_preferences', JSON.stringify(this.userPreferences));
    } catch (error) {
      console.error('Kullanıcı tercihlerini kaydetme hatası:', error);
    }
  }

  /**
   * Mevcut şemayı ayarlar
   */
  private static async setCurrentScheme(): Promise<void> {
    let schemeName = 'genetic-light';

    if (this.userPreferences.preferredScheme === 'auto') {
      schemeName = this.systemColorScheme === 'dark' ? 'genetic-dark' : 'genetic-light';
    } else if (this.userPreferences.preferredScheme === 'dark') {
      schemeName = 'genetic-dark';
    } else if (this.userPreferences.preferredScheme === 'light') {
      schemeName = 'genetic-light';
    }

    if (this.userPreferences.highContrast) {
      schemeName = 'genetic-high-contrast';
    } else if (this.userPreferences.colorBlindSupport) {
      schemeName = 'genetic-colorblind';
    }

    this.currentScheme = this.availableSchemes.get(schemeName) || this.availableSchemes.get('genetic-light')!;
  }

  /**
   * Sistem değişikliklerini dinler
   */
  private static setupSystemListeners(): void {
    Appearance.addChangeListener(({ colorScheme }) => {
      this.systemColorScheme = colorScheme || 'light';
      if (this.userPreferences.preferredScheme === 'auto') {
        this.setCurrentScheme();
      }
    });
  }

  /**
   * Renk analizi yapar
   */
  static analyzeColor(foreground: string, background: string): ColorAnalysis {
    const contrastRatio = this.calculateContrastRatio(foreground, background);
    const accessibilityLevel = this.getAccessibilityLevel(contrastRatio);
    const colorBlindSafe = this.isColorBlindSafe(foreground, background);
    const readabilityScore = this.calculateReadabilityScore(contrastRatio, colorBlindSafe);
    const emotionalTone = this.getEmotionalTone(foreground);

    return {
      contrastRatio,
      accessibilityLevel,
      colorBlindSafe,
      readabilityScore,
      emotionalTone,
    };
  }

  /**
   * Kontrast oranını hesaplar
   */
  private static calculateContrastRatio(foreground: string, background: string): number {
    const fgLuminance = this.getLuminance(foreground);
    const bgLuminance = this.getLuminance(background);
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Luminance hesaplar
   */
  private static getLuminance(color: string): number {
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;

    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Hex'i RGB'ye çevirir
   */
  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Erişilebilirlik seviyesini belirler
   */
  private static getAccessibilityLevel(contrastRatio: number): 'AA' | 'AAA' | 'fail' {
    if (contrastRatio >= 7) return 'AAA';
    if (contrastRatio >= 4.5) return 'AA';
    return 'fail';
  }

  /**
   * Renk körü güvenli olup olmadığını kontrol eder
   */
  private static isColorBlindSafe(foreground: string, background: string): boolean {
    const fgRgb = this.hexToRgb(foreground);
    const bgRgb = this.hexToRgb(background);
    
    if (!fgRgb || !bgRgb) return false;

    // Protanopia simulation
    const fgProtanopia = this.simulateProtanopia(fgRgb);
    const bgProtanopia = this.simulateProtanopia(bgRgb);
    
    // Deuteranopia simulation
    const fgDeuteranopia = this.simulateDeuteranopia(fgRgb);
    const bgDeuteranopia = this.simulateDeuteranopia(bgRgb);

    // Tritanopia simulation
    const fgTritanopia = this.simulateTritanopia(fgRgb);
    const bgTritanopia = this.simulateTritanopia(bgRgb);

    const protanopiaContrast = this.calculateContrastRatio(
      this.rgbToHex(fgProtanopia),
      this.rgbToHex(bgProtanopia)
    );
    const deuteranopiaContrast = this.calculateContrastRatio(
      this.rgbToHex(fgDeuteranopia),
      this.rgbToHex(bgDeuteranopia)
    );
    const tritanopiaContrast = this.calculateContrastRatio(
      this.rgbToHex(fgTritanopia),
      this.rgbToHex(bgTritanopia)
    );

    return protanopiaContrast >= 3 && deuteranopiaContrast >= 3 && tritanopiaContrast >= 3;
  }

  /**
   * Protanopia simülasyonu
   */
  private static simulateProtanopia(rgb: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
    return {
      r: 0.567 * rgb.r + 0.433 * rgb.g + 0 * rgb.b,
      g: 0.558 * rgb.r + 0.442 * rgb.g + 0 * rgb.b,
      b: 0.242 * rgb.r + 0.758 * rgb.g + 0 * rgb.b,
    };
  }

  /**
   * Deuteranopia simülasyonu
   */
  private static simulateDeuteranopia(rgb: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
    return {
      r: 0.625 * rgb.r + 0.375 * rgb.g + 0 * rgb.b,
      g: 0.7 * rgb.r + 0.3 * rgb.g + 0 * rgb.b,
      b: 0.3 * rgb.r + 0.7 * rgb.g + 0 * rgb.b,
    };
  }

  /**
   * Tritanopia simülasyonu
   */
  private static simulateTritanopia(rgb: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
    return {
      r: 0.95 * rgb.r + 0.05 * rgb.g + 0 * rgb.b,
      g: 0 * rgb.r + 0.433 * rgb.g + 0.567 * rgb.b,
      b: 0 * rgb.r + 0.475 * rgb.g + 0.525 * rgb.b,
    };
  }

  /**
   * RGB'yi hex'e çevirir
   */
  private static rgbToHex(rgb: { r: number; g: number; b: number }): string {
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  /**
   * Okunabilirlik skoru hesaplar
   */
  private static calculateReadabilityScore(contrastRatio: number, colorBlindSafe: boolean): number {
    let score = 0;
    
    // Contrast score (0-70)
    if (contrastRatio >= 7) score += 70;
    else if (contrastRatio >= 4.5) score += 50;
    else if (contrastRatio >= 3) score += 30;
    else score += 10;

    // Color blind safety score (0-30)
    if (colorBlindSafe) score += 30;
    else score += 10;

    return Math.min(score, 100);
  }

  /**
   * Duygusal ton belirler
   */
  private static getEmotionalTone(color: string): 'calm' | 'energetic' | 'professional' | 'friendly' | 'serious' {
    const rgb = this.hexToRgb(color);
    if (!rgb) return 'professional';

    const { r, g, b } = rgb;
    const hue = this.rgbToHue(r, g, b);
    const saturation = this.rgbToSaturation(r, g, b);
    const lightness = this.rgbToLightness(r, g, b);

    if (hue >= 0 && hue < 30) return 'energetic'; // Red
    if (hue >= 30 && hue < 60) return 'friendly'; // Yellow
    if (hue >= 60 && hue < 120) return 'calm'; // Green
    if (hue >= 120 && hue < 240) return 'professional'; // Blue
    if (hue >= 240 && hue < 300) return 'friendly'; // Purple
    if (hue >= 300 && hue < 360) return 'energetic'; // Magenta

    if (lightness < 0.3) return 'serious';
    if (lightness > 0.7) return 'calm';

    return 'professional';
  }

  /**
   * RGB'den hue hesaplar
   */
  private static rgbToHue(r: number, g: number, b: number): number {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    if (diff === 0) return 0;

    let hue = 0;
    if (max === r) {
      hue = ((g - b) / diff) % 6;
    } else if (max === g) {
      hue = (b - r) / diff + 2;
    } else {
      hue = (r - g) / diff + 4;
    }

    return (hue * 60 + 360) % 360;
  }

  /**
   * RGB'den saturation hesaplar
   */
  private static rgbToSaturation(r: number, g: number, b: number): number {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    if (max === 0) return 0;
    return diff / max;
  }

  /**
   * RGB'den lightness hesaplar
   */
  private static rgbToLightness(r: number, g: number, b: number): number {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return (max + min) / 2;
  }

  /**
   * Mevcut renk şemasını getirir
   */
  static getCurrentScheme(): ColorScheme {
    return { ...this.currentScheme };
  }

  /**
   * Kullanıcı tercihlerini getirir
   */
  static getUserPreferences(): ColorPreferences {
    return { ...this.userPreferences };
  }

  /**
   * Kullanıcı tercihlerini günceller
   */
  static async updateUserPreferences(updates: Partial<ColorPreferences>): Promise<void> {
    this.userPreferences = { ...this.userPreferences, ...updates };
    await this.saveUserPreferences();
    await this.setCurrentScheme();
  }

  /**
   * Renk şemasını değiştirir
   */
  static async setScheme(schemeName: string): Promise<void> {
    const scheme = this.availableSchemes.get(schemeName);
    if (scheme) {
      this.currentScheme = scheme;
    }
  }

  /**
   * Tüm mevcut şemaları getirir
   */
  static getAvailableSchemes(): ColorScheme[] {
    return Array.from(this.availableSchemes.values());
  }

  /**
   * Servisi temizler
   */
  static async cleanup(): Promise<void> {
    await this.saveColorSchemes();
    await this.saveUserPreferences();
    this.availableSchemes.clear();
    this.isInitialized = false;
  }
}


