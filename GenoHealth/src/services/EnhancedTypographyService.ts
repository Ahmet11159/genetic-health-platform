// Gelişmiş tipografi servisi - UX odaklı
import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export interface TypographyScale {
  // Başlık seviyeleri
  display: TypographyStyle;
  h1: TypographyStyle;
  h2: TypographyStyle;
  h3: TypographyStyle;
  h4: TypographyStyle;
  h5: TypographyStyle;
  h6: TypographyStyle;
  
  // Metin seviyeleri
  bodyLarge: TypographyStyle;
  body: TypographyStyle;
  bodySmall: TypographyStyle;
  caption: TypographyStyle;
  overline: TypographyStyle;
  
  // Özel kullanımlar
  button: TypographyStyle;
  buttonSmall: TypographyStyle;
  label: TypographyStyle;
  helper: TypographyStyle;
  code: TypographyStyle;
  
  // DNA/Genetik özel
  geneticTitle: TypographyStyle;
  geneticSubtitle: TypographyStyle;
  geneticValue: TypographyStyle;
  geneticLabel: TypographyStyle;
}

export interface TypographyStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight: FontWeight;
  letterSpacing: number;
  fontFamily: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export type FontWeight = 
  | '100' | '200' | '300' | '400' | '500' 
  | '600' | '700' | '800' | '900';

export interface ReadingLevel {
  level: 'easy' | 'medium' | 'hard';
  score: number;
  recommendations: string[];
}

export interface TypographyConfig {
  baseFontSize: number;
  scaleFactor: number;
  lineHeightMultiplier: number;
  letterSpacingBase: number;
  fontFamily: {
    primary: string;
    secondary: string;
    mono: string;
  };
}

export class EnhancedTypographyService {
  private static isInitialized = false;
  private static typographyScale: TypographyScale;
  private static config: TypographyConfig;
  private static readingLevels: Map<string, ReadingLevel> = new Map();

  /**
   * Servisi başlatır
   */
  static initialize(): void {
    if (this.isInitialized) return;

    this.initializeConfig();
    this.initializeTypographyScale();
    this.initializeReadingLevels();

    this.isInitialized = true;
    console.log('Enhanced Typography Service initialized!');
  }

  /**
   * Konfigürasyonu başlatır
   */
  private static initializeConfig(): void {
    const isIOS = Platform.OS === 'ios';
    const screenWidth = Math.min(width, height);
    
    // Responsive base font size
    let baseFontSize = 16;
    if (screenWidth < 375) baseFontSize = 14; // Small phones
    else if (screenWidth > 414) baseFontSize = 18; // Large phones/tablets

    this.config = {
      baseFontSize,
      scaleFactor: 1.25, // Perfect fourth scale
      lineHeightMultiplier: 1.5,
      letterSpacingBase: 0.5,
      fontFamily: {
        primary: isIOS ? 'SF Pro Display' : 'Roboto',
        secondary: isIOS ? 'SF Pro Text' : 'Roboto',
        mono: isIOS ? 'SF Mono' : 'Roboto Mono',
      },
    };
  }

  /**
   * Tipografi ölçeğini başlatır
   */
  private static initializeTypographyScale(): void {
    const { baseFontSize, scaleFactor, lineHeightMultiplier, letterSpacingBase, fontFamily } = this.config;

    this.typographyScale = {
      // Display - En büyük başlık
      display: {
        fontSize: baseFontSize * Math.pow(scaleFactor, 4),
        lineHeight: baseFontSize * Math.pow(scaleFactor, 4) * lineHeightMultiplier,
        fontWeight: '700',
        letterSpacing: -1,
        fontFamily: fontFamily.primary,
        textTransform: 'none',
      },

      // H1-H6 - Hiyerarşik başlıklar
      h1: {
        fontSize: baseFontSize * Math.pow(scaleFactor, 3),
        lineHeight: baseFontSize * Math.pow(scaleFactor, 3) * lineHeightMultiplier,
        fontWeight: '700',
        letterSpacing: -0.5,
        fontFamily: fontFamily.primary,
        textTransform: 'none',
      },

      h2: {
        fontSize: baseFontSize * Math.pow(scaleFactor, 2.5),
        lineHeight: baseFontSize * Math.pow(scaleFactor, 2.5) * lineHeightMultiplier,
        fontWeight: '600',
        letterSpacing: -0.25,
        fontFamily: fontFamily.primary,
        textTransform: 'none',
      },

      h3: {
        fontSize: baseFontSize * Math.pow(scaleFactor, 2),
        lineHeight: baseFontSize * Math.pow(scaleFactor, 2) * lineHeightMultiplier,
        fontWeight: '600',
        letterSpacing: 0,
        fontFamily: fontFamily.primary,
        textTransform: 'none',
      },

      h4: {
        fontSize: baseFontSize * Math.pow(scaleFactor, 1.5),
        lineHeight: baseFontSize * Math.pow(scaleFactor, 1.5) * lineHeightMultiplier,
        fontWeight: '500',
        letterSpacing: 0,
        fontFamily: fontFamily.primary,
        textTransform: 'none',
      },

      h5: {
        fontSize: baseFontSize * Math.pow(scaleFactor, 1.25),
        lineHeight: baseFontSize * Math.pow(scaleFactor, 1.25) * lineHeightMultiplier,
        fontWeight: '500',
        letterSpacing: 0,
        fontFamily: fontFamily.primary,
        textTransform: 'none',
      },

      h6: {
        fontSize: baseFontSize * Math.pow(scaleFactor, 1),
        lineHeight: baseFontSize * Math.pow(scaleFactor, 1) * lineHeightMultiplier,
        fontWeight: '500',
        letterSpacing: 0,
        fontFamily: fontFamily.primary,
        textTransform: 'none',
      },

      // Body text
      bodyLarge: {
        fontSize: baseFontSize * Math.pow(scaleFactor, 0.5),
        lineHeight: baseFontSize * Math.pow(scaleFactor, 0.5) * lineHeightMultiplier,
        fontWeight: '400',
        letterSpacing: 0,
        fontFamily: fontFamily.secondary,
        textTransform: 'none',
      },

      body: {
        fontSize: baseFontSize,
        lineHeight: baseFontSize * lineHeightMultiplier,
        fontWeight: '400',
        letterSpacing: 0,
        fontFamily: fontFamily.secondary,
        textTransform: 'none',
      },

      bodySmall: {
        fontSize: baseFontSize * Math.pow(scaleFactor, -0.25),
        lineHeight: baseFontSize * Math.pow(scaleFactor, -0.25) * lineHeightMultiplier,
        fontWeight: '400',
        letterSpacing: 0,
        fontFamily: fontFamily.secondary,
        textTransform: 'none',
      },

      caption: {
        fontSize: baseFontSize * Math.pow(scaleFactor, -0.5),
        lineHeight: baseFontSize * Math.pow(scaleFactor, -0.5) * lineHeightMultiplier,
        fontWeight: '400',
        letterSpacing: 0.25,
        fontFamily: fontFamily.secondary,
        textTransform: 'none',
      },

      overline: {
        fontSize: baseFontSize * Math.pow(scaleFactor, -0.75),
        lineHeight: baseFontSize * Math.pow(scaleFactor, -0.75) * lineHeightMultiplier,
        fontWeight: '500',
        letterSpacing: 1.5,
        fontFamily: fontFamily.secondary,
        textTransform: 'uppercase',
      },

      // Buttons
      button: {
        fontSize: baseFontSize,
        lineHeight: baseFontSize * 1.2,
        fontWeight: '600',
        letterSpacing: 0.5,
        fontFamily: fontFamily.primary,
        textTransform: 'none',
      },

      buttonSmall: {
        fontSize: baseFontSize * Math.pow(scaleFactor, -0.25),
        lineHeight: baseFontSize * Math.pow(scaleFactor, -0.25) * 1.2,
        fontWeight: '600',
        letterSpacing: 0.25,
        fontFamily: fontFamily.primary,
        textTransform: 'none',
      },

      // Labels and helpers
      label: {
        fontSize: baseFontSize * Math.pow(scaleFactor, -0.25),
        lineHeight: baseFontSize * Math.pow(scaleFactor, -0.25) * 1.2,
        fontWeight: '500',
        letterSpacing: 0,
        fontFamily: fontFamily.primary,
        textTransform: 'none',
      },

      helper: {
        fontSize: baseFontSize * Math.pow(scaleFactor, -0.5),
        lineHeight: baseFontSize * Math.pow(scaleFactor, -0.5) * 1.3,
        fontWeight: '400',
        letterSpacing: 0,
        fontFamily: fontFamily.secondary,
        textTransform: 'none',
      },

      // Code
      code: {
        fontSize: baseFontSize * Math.pow(scaleFactor, -0.25),
        lineHeight: baseFontSize * Math.pow(scaleFactor, -0.25) * 1.4,
        fontWeight: '400',
        letterSpacing: 0,
        fontFamily: fontFamily.mono,
        textTransform: 'none',
      },

      // DNA/Genetik özel stiller
      geneticTitle: {
        fontSize: baseFontSize * Math.pow(scaleFactor, 2),
        lineHeight: baseFontSize * Math.pow(scaleFactor, 2) * 1.2,
        fontWeight: '700',
        letterSpacing: -0.5,
        fontFamily: fontFamily.primary,
        textTransform: 'none',
      },

      geneticSubtitle: {
        fontSize: baseFontSize * Math.pow(scaleFactor, 1),
        lineHeight: baseFontSize * Math.pow(scaleFactor, 1) * 1.3,
        fontWeight: '500',
        letterSpacing: 0,
        fontFamily: fontFamily.primary,
        textTransform: 'none',
      },

      geneticValue: {
        fontSize: baseFontSize * Math.pow(scaleFactor, 1.5),
        lineHeight: baseFontSize * Math.pow(scaleFactor, 1.5) * 1.1,
        fontWeight: '600',
        letterSpacing: 0,
        fontFamily: fontFamily.primary,
        textTransform: 'none',
      },

      geneticLabel: {
        fontSize: baseFontSize * Math.pow(scaleFactor, -0.25),
        lineHeight: baseFontSize * Math.pow(scaleFactor, -0.25) * 1.2,
        fontWeight: '500',
        letterSpacing: 0.5,
        fontFamily: fontFamily.secondary,
        textTransform: 'uppercase',
      },
    };
  }

  /**
   * Okuma seviyelerini başlatır
   */
  private static initializeReadingLevels(): void {
    this.readingLevels.set('easy', {
      level: 'easy',
      score: 0.8,
      recommendations: [
        'Kısa cümleler kullanın (15 kelimeden az)',
        'Basit kelimeler tercih edin',
        'Aktif ses kullanın',
        'Teknik terimleri açıklayın'
      ]
    });

    this.readingLevels.set('medium', {
      level: 'medium',
      score: 0.6,
      recommendations: [
        'Orta uzunlukta cümleler (15-25 kelime)',
        'Bazı teknik terimler kullanabilirsiniz',
        'Açıklayıcı ifadeler ekleyin'
      ]
    });

    this.readingLevels.set('hard', {
      level: 'hard',
      score: 0.4,
      recommendations: [
        'Uzun cümleler kabul edilebilir',
        'Teknik terimler kullanılabilir',
        'Uzman seviyesi içerik'
      ]
    });
  }

  /**
   * Tipografi ölçeğini getirir
   */
  static getTypographyScale(): TypographyScale {
    if (!this.isInitialized || !this.typographyScale) {
      console.warn('TypographyService not initialized, using default scale');
      // Varsayılan tipografi ölçeği döndür
      return {
        display: { fontSize: 32, lineHeight: 40, fontWeight: '700', letterSpacing: -1, fontFamily: 'System', textTransform: 'none' },
        h1: { fontSize: 24, lineHeight: 32, fontWeight: '700', letterSpacing: -0.5, fontFamily: 'System', textTransform: 'none' },
        h2: { fontSize: 20, lineHeight: 28, fontWeight: '600', letterSpacing: -0.25, fontFamily: 'System', textTransform: 'none' },
        h3: { fontSize: 18, lineHeight: 24, fontWeight: '600', letterSpacing: 0, fontFamily: 'System', textTransform: 'none' },
        h4: { fontSize: 16, lineHeight: 22, fontWeight: '500', letterSpacing: 0, fontFamily: 'System', textTransform: 'none' },
        h5: { fontSize: 14, lineHeight: 20, fontWeight: '500', letterSpacing: 0, fontFamily: 'System', textTransform: 'none' },
        h6: { fontSize: 12, lineHeight: 18, fontWeight: '500', letterSpacing: 0, fontFamily: 'System', textTransform: 'none' },
        bodyLarge: { fontSize: 18, lineHeight: 28, fontWeight: '400', letterSpacing: 0, fontFamily: 'System', textTransform: 'none' },
        body: { fontSize: 16, lineHeight: 24, fontWeight: '400', letterSpacing: 0, fontFamily: 'System', textTransform: 'none' },
        bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400', letterSpacing: 0, fontFamily: 'System', textTransform: 'none' },
        caption: { fontSize: 12, lineHeight: 16, fontWeight: '400', letterSpacing: 0.25, fontFamily: 'System', textTransform: 'none' },
        overline: { fontSize: 10, lineHeight: 16, fontWeight: '500', letterSpacing: 1.5, fontFamily: 'System', textTransform: 'uppercase' },
        button: { fontSize: 16, lineHeight: 20, fontWeight: '600', letterSpacing: 0.5, fontFamily: 'System', textTransform: 'none' },
        buttonSmall: { fontSize: 14, lineHeight: 18, fontWeight: '600', letterSpacing: 0.25, fontFamily: 'System', textTransform: 'none' },
        label: { fontSize: 14, lineHeight: 18, fontWeight: '500', letterSpacing: 0, fontFamily: 'System', textTransform: 'none' },
        helper: { fontSize: 12, lineHeight: 16, fontWeight: '400', letterSpacing: 0, fontFamily: 'System', textTransform: 'none' },
        code: { fontSize: 14, lineHeight: 20, fontWeight: '400', letterSpacing: 0, fontFamily: 'System', textTransform: 'none' },
        geneticTitle: { fontSize: 20, lineHeight: 24, fontWeight: '700', letterSpacing: -0.5, fontFamily: 'System', textTransform: 'none' },
        geneticSubtitle: { fontSize: 16, lineHeight: 22, fontWeight: '500', letterSpacing: 0, fontFamily: 'System', textTransform: 'none' },
        geneticValue: { fontSize: 18, lineHeight: 22, fontWeight: '600', letterSpacing: 0, fontFamily: 'System', textTransform: 'none' },
        geneticLabel: { fontSize: 14, lineHeight: 18, fontWeight: '500', letterSpacing: 0.5, fontFamily: 'System', textTransform: 'uppercase' },
      };
    }
    return { ...this.typographyScale };
  }

  /**
   * Belirli bir stil getirir
   */
  static getStyle(styleName: keyof TypographyScale): TypographyStyle {
    if (!this.isInitialized || !this.typographyScale) {
      console.warn('TypographyService not initialized, using default style');
      return {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '400',
        letterSpacing: 0,
        fontFamily: 'System',
        textTransform: 'none',
      };
    }
    return { ...this.typographyScale[styleName] };
  }

  /**
   * Responsive font size hesaplar
   */
  static getResponsiveFontSize(baseSize: number, minSize?: number, maxSize?: number): number {
    const scale = Math.min(width / 375, height / 667);
    let responsiveSize = Math.round(baseSize * scale);
    
    if (minSize) responsiveSize = Math.max(responsiveSize, minSize);
    if (maxSize) responsiveSize = Math.min(responsiveSize, maxSize);
    
    return responsiveSize;
  }

  /**
   * Metin okunabilirlik skoru hesaplar
   */
  static calculateReadabilityScore(text: string): ReadingLevel {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const syllables = this.countSyllables(text);
    
    // Flesch Reading Ease Score
    const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
    
    if (score >= 80) return this.readingLevels.get('easy')!;
    if (score >= 60) return this.readingLevels.get('medium')!;
    return this.readingLevels.get('hard')!;
  }

  /**
   * Hece sayısını hesaplar
   */
  private static countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let totalSyllables = 0;
    
    words.forEach(word => {
      if (word.length === 0) return;
      
      // Basit hece sayma algoritması
      let syllables = 0;
      const vowels = 'aeiouy';
      let previousWasVowel = false;
      
      for (let i = 0; i < word.length; i++) {
        const isVowel = vowels.includes(word[i]);
        if (isVowel && !previousWasVowel) {
          syllables++;
        }
        previousWasVowel = isVowel;
      }
      
      // E ile biten kelimeler genellikle sessiz e'dir
      if (word.endsWith('e')) syllables--;
      
      // En az bir hece olmalı
      if (syllables <= 0) syllables = 1;
      
      totalSyllables += syllables;
    });
    
    return totalSyllables;
  }

  /**
   * Metin uzunluğu önerileri
   */
  static getTextLengthRecommendations(styleName: keyof TypographyScale): {
    minLength: number;
    maxLength: number;
    optimalLength: number;
  } {
    const style = this.typographyScale[styleName];
    const baseLength = 50; // Ortalama karakter sayısı
    
    return {
      minLength: Math.round(baseLength * 0.5),
      maxLength: Math.round(baseLength * 2),
      optimalLength: Math.round(baseLength * 1.2),
    };
  }

  /**
   * Renk kontrastı için font weight önerisi
   */
  static getRecommendedFontWeight(
    backgroundColor: string, 
    textColor: string, 
    currentWeight: FontWeight
  ): FontWeight {
    // Basit kontrast hesaplama
    const contrast = this.calculateSimpleContrast(textColor, backgroundColor);
    
    if (contrast < 3) {
      // Düşük kontrast - daha kalın font
      const weightMap: FontWeight[] = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
      const currentIndex = weightMap.indexOf(currentWeight);
      return weightMap[Math.min(currentIndex + 2, weightMap.length - 1)];
    }
    
    return currentWeight;
  }

  /**
   * Basit kontrast hesaplama
   */
  private static calculateSimpleContrast(color1: string, color2: string): number {
    // Hex to RGB dönüşümü
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 1;
    
    // Luminance hesaplama
    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Tipografi konfigürasyonunu getirir
   */
  static getConfig(): TypographyConfig {
    return { ...this.config };
  }

  /**
   * Tüm okuma seviyelerini getirir
   */
  static getReadingLevels(): Map<string, ReadingLevel> {
    return new Map(this.readingLevels);
  }

  /**
   * Servisi temizler
   */
  static cleanup(): void {
    this.readingLevels.clear();
    this.isInitialized = false;
  }
}
