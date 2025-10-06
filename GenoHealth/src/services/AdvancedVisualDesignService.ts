// Advanced visual design servisi
import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export interface ColorPalette {
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
}

export interface TypographyScale {
  h1: TypographyStyle;
  h2: TypographyStyle;
  h3: TypographyStyle;
  h4: TypographyStyle;
  h5: TypographyStyle;
  h6: TypographyStyle;
  body: TypographyStyle;
  bodySmall: TypographyStyle;
  caption: TypographyStyle;
  button: TypographyStyle;
  overline: TypographyStyle;
}

export interface TypographyStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  letterSpacing: number;
  fontFamily?: string;
}

export interface SpacingScale {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

export interface ShadowScale {
  none: ShadowStyle;
  sm: ShadowStyle;
  md: ShadowStyle;
  lg: ShadowStyle;
  xl: ShadowStyle;
  xxl: ShadowStyle;
}

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface BorderRadiusScale {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  full: number;
}

export interface GradientConfig {
  colors: string[];
  start: { x: number; y: number };
  end: { x: number; y: number };
  locations?: number[];
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  useNativeDriver?: boolean;
}

export class AdvancedVisualDesignService {
  private static isInitialized = false;
  private static colorPalette: ColorPalette;
  private static typographyScale: TypographyScale;
  private static spacingScale: SpacingScale;
  private static shadowScale: ShadowScale;
  private static borderRadiusScale: BorderRadiusScale;
  private static gradients: Map<string, GradientConfig> = new Map();
  private static animations: Map<string, AnimationConfig> = new Map();

  /**
   * Servisi başlatır
   */
  static initialize(): void {
    if (this.isInitialized) return;

    this.initializeColorPalette();
    this.initializeTypographyScale();
    this.initializeSpacingScale();
    this.initializeShadowScale();
    this.initializeBorderRadiusScale();
    this.initializeGradients();
    this.initializeAnimations();

    this.isInitialized = true;
  }

  /**
   * Renk paletini başlatır
   */
  private static initializeColorPalette(): void {
    this.colorPalette = {
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
    };
  }

  /**
   * Tipografi ölçeğini başlatır
   */
  private static initializeTypographyScale(): void {
    const baseFontSize = Platform.OS === 'ios' ? 16 : 14;
    const scaleFactor = 1.2;

    this.typographyScale = {
      h1: {
        fontSize: baseFontSize * Math.pow(scaleFactor, 4),
        lineHeight: baseFontSize * Math.pow(scaleFactor, 4) * 1.2,
        fontWeight: '700',
        letterSpacing: -0.5,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      },
      h2: {
        fontSize: baseFontSize * Math.pow(scaleFactor, 3),
        lineHeight: baseFontSize * Math.pow(scaleFactor, 3) * 1.2,
        fontWeight: '600',
        letterSpacing: -0.25,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      },
      h3: {
        fontSize: baseFontSize * Math.pow(scaleFactor, 2),
        lineHeight: baseFontSize * Math.pow(scaleFactor, 2) * 1.2,
        fontWeight: '600',
        letterSpacing: 0,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      },
      h4: {
        fontSize: baseFontSize * Math.pow(scaleFactor, 1),
        lineHeight: baseFontSize * Math.pow(scaleFactor, 1) * 1.2,
        fontWeight: '500',
        letterSpacing: 0,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      },
      h5: {
        fontSize: baseFontSize,
        lineHeight: baseFontSize * 1.2,
        fontWeight: '500',
        letterSpacing: 0,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      },
      h6: {
        fontSize: baseFontSize * Math.pow(scaleFactor, -1),
        lineHeight: baseFontSize * Math.pow(scaleFactor, -1) * 1.2,
        fontWeight: '500',
        letterSpacing: 0,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      },
      body: {
        fontSize: baseFontSize,
        lineHeight: baseFontSize * 1.5,
        fontWeight: '400',
        letterSpacing: 0,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      },
      bodySmall: {
        fontSize: baseFontSize * Math.pow(scaleFactor, -1),
        lineHeight: baseFontSize * Math.pow(scaleFactor, -1) * 1.5,
        fontWeight: '400',
        letterSpacing: 0,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      },
      caption: {
        fontSize: baseFontSize * Math.pow(scaleFactor, -2),
        lineHeight: baseFontSize * Math.pow(scaleFactor, -2) * 1.5,
        fontWeight: '400',
        letterSpacing: 0.25,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      },
      button: {
        fontSize: baseFontSize,
        lineHeight: baseFontSize * 1.2,
        fontWeight: '600',
        letterSpacing: 0.5,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      },
      overline: {
        fontSize: baseFontSize * Math.pow(scaleFactor, -2),
        lineHeight: baseFontSize * Math.pow(scaleFactor, -2) * 1.2,
        fontWeight: '500',
        letterSpacing: 1.5,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      },
    };
  }

  /**
   * Spacing ölçeğini başlatır
   */
  private static initializeSpacingScale(): void {
    const baseSpacing = 4;
    const scaleFactor = 1.5;

    this.spacingScale = {
      xs: baseSpacing,
      sm: baseSpacing * scaleFactor,
      md: baseSpacing * Math.pow(scaleFactor, 2),
      lg: baseSpacing * Math.pow(scaleFactor, 3),
      xl: baseSpacing * Math.pow(scaleFactor, 4),
      xxl: baseSpacing * Math.pow(scaleFactor, 5),
      xxxl: baseSpacing * Math.pow(scaleFactor, 6),
    };
  }

  /**
   * Shadow ölçeğini başlatır
   */
  private static initializeShadowScale(): void {
    this.shadowScale = {
      none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      },
      sm: {
        shadowColor: this.colorPalette.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
      md: {
        shadowColor: this.colorPalette.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
      },
      lg: {
        shadowColor: this.colorPalette.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
      },
      xl: {
        shadowColor: this.colorPalette.shadow,
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 12,
      },
      xxl: {
        shadowColor: this.colorPalette.shadow,
        shadowOffset: { width: 0, height: 32 },
        shadowOpacity: 0.25,
        shadowRadius: 48,
        elevation: 24,
      },
    };
  }

  /**
   * Border radius ölçeğini başlatır
   */
  private static initializeBorderRadiusScale(): void {
    const baseRadius = 4;
    const scaleFactor = 1.5;

    this.borderRadiusScale = {
      none: 0,
      sm: baseRadius,
      md: baseRadius * scaleFactor,
      lg: baseRadius * Math.pow(scaleFactor, 2),
      xl: baseRadius * Math.pow(scaleFactor, 3),
      xxl: baseRadius * Math.pow(scaleFactor, 4),
      full: 9999,
    };
  }

  /**
   * Gradient'ları başlatır
   */
  private static initializeGradients(): void {
    this.gradients.set('primary', {
      colors: ['#667eea', '#764ba2'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    });

    this.gradients.set('secondary', {
      colors: ['#f093fb', '#f5576c'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    });

    this.gradients.set('success', {
      colors: ['#4facfe', '#00f2fe'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    });

    this.gradients.set('warning', {
      colors: ['#ffecd2', '#fcb69f'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    });

    this.gradients.set('error', {
      colors: ['#ff9a9e', '#fecfef'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    });

    this.gradients.set('info', {
      colors: ['#a8edea', '#fed6e3'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    });

    this.gradients.set('sunset', {
      colors: ['#ff9a9e', '#fecfef', '#fecfef'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
      locations: [0, 0.5, 1],
    });

    this.gradients.set('ocean', {
      colors: ['#667eea', '#764ba2', '#f093fb'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
      locations: [0, 0.5, 1],
    });

    this.gradients.set('forest', {
      colors: ['#134e5e', '#71b280'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    });

    this.gradients.set('aurora', {
      colors: ['#00c6ff', '#0072ff'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    });
  }

  /**
   * Animasyonları başlatır
   */
  private static initializeAnimations(): void {
    this.animations.set('fast', {
      duration: 150,
      easing: 'ease-out',
      useNativeDriver: true,
    });

    this.animations.set('normal', {
      duration: 300,
      easing: 'ease-in-out',
      useNativeDriver: true,
    });

    this.animations.set('slow', {
      duration: 600,
      easing: 'ease-in-out',
      useNativeDriver: true,
    });

    this.animations.set('bounce', {
      duration: 800,
      easing: 'bounce',
      useNativeDriver: true,
    });

    this.animations.set('elastic', {
      duration: 1000,
      easing: 'elastic',
      useNativeDriver: true,
    });

    this.animations.set('spring', {
      duration: 500,
      easing: 'spring',
      useNativeDriver: true,
    });
  }

  /**
   * Renk paletini getirir
   */
  static getColorPalette(): ColorPalette {
    return { ...this.colorPalette };
  }

  /**
   * Tipografi ölçeğini getirir
   */
  static getTypographyScale(): TypographyScale {
    return { ...this.typographyScale };
  }

  /**
   * Spacing ölçeğini getirir
   */
  static getSpacingScale(): SpacingScale {
    return { ...this.spacingScale };
  }

  /**
   * Shadow ölçeğini getirir
   */
  static getShadowScale(): ShadowScale {
    return { ...this.shadowScale };
  }

  /**
   * Border radius ölçeğini getirir
   */
  static getBorderRadiusScale(): BorderRadiusScale {
    return { ...this.borderRadiusScale };
  }

  /**
   * Gradient konfigürasyonunu getirir
   */
  static getGradient(name: string): GradientConfig | null {
    return this.gradients.get(name) || null;
  }

  /**
   * Animasyon konfigürasyonunu getirir
   */
  static getAnimation(name: string): AnimationConfig | null {
    return this.animations.get(name) || null;
  }

  /**
   * Tüm gradient'ları getirir
   */
  static getAllGradients(): Map<string, GradientConfig> {
    return new Map(this.gradients);
  }

  /**
   * Tüm animasyonları getirir
   */
  static getAllAnimations(): Map<string, AnimationConfig> {
    return new Map(this.animations);
  }

  /**
   * Renk paletini günceller
   */
  static updateColorPalette(updates: Partial<ColorPalette>): void {
    this.colorPalette = { ...this.colorPalette, ...updates };
  }

  /**
   * Yeni gradient ekler
   */
  static addGradient(name: string, config: GradientConfig): void {
    this.gradients.set(name, config);
  }

  /**
   * Yeni animasyon ekler
   */
  static addAnimation(name: string, config: AnimationConfig): void {
    this.animations.set(name, config);
  }

  /**
   * Responsive font size hesaplar
   */
  static getResponsiveFontSize(baseSize: number): number {
    const scale = Math.min(width / 375, height / 667); // iPhone 6/7/8 base
    return Math.round(baseSize * scale);
  }

  /**
   * Responsive spacing hesaplar
   */
  static getResponsiveSpacing(baseSpacing: number): number {
    const scale = Math.min(width / 375, height / 667);
    return Math.round(baseSpacing * scale);
  }

  /**
   * Dark mode renk paleti
   */
  static getDarkModeColorPalette(): ColorPalette {
    return {
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
    };
  }

  /**
   * High contrast renk paleti
   */
  static getHighContrastColorPalette(): ColorPalette {
    return {
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
    };
  }

  /**
   * Color blind friendly renk paleti
   */
  static getColorBlindFriendlyPalette(): ColorPalette {
    return {
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
    };
  }

  /**
   * Servisi temizler
   */
  static cleanup(): void {
    this.gradients.clear();
    this.animations.clear();
    this.isInitialized = false;
  }
}


