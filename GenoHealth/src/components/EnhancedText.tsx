import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';

export interface EnhancedTextProps extends TextProps {
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'bodyLarge' | 'bodySmall' | 'caption' | 'label' | 'helper' | 'button' | 'buttonSmall' | 'geneticTitle' | 'geneticSubtitle' | 'geneticValue' | 'geneticLabel';
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  lineHeight?: number;
  letterSpacing?: number;
  opacity?: number;
  maxLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  testID?: string;
}

// Typography scale
const typographyScale = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700', letterSpacing: -0.5, fontFamily: 'System' },
  h1: { fontSize: 28, lineHeight: 36, fontWeight: '600', letterSpacing: -0.3, fontFamily: 'System' },
  h2: { fontSize: 24, lineHeight: 32, fontWeight: '600', letterSpacing: -0.2, fontFamily: 'System' },
  h3: { fontSize: 20, lineHeight: 28, fontWeight: '600', letterSpacing: 0, fontFamily: 'System' },
  h4: { fontSize: 18, lineHeight: 26, fontWeight: '500', letterSpacing: 0, fontFamily: 'System' },
  h5: { fontSize: 16, lineHeight: 24, fontWeight: '500', letterSpacing: 0, fontFamily: 'System' },
  h6: { fontSize: 14, lineHeight: 22, fontWeight: '500', letterSpacing: 0, fontFamily: 'System' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400', letterSpacing: 0, fontFamily: 'System' },
  bodyLarge: { fontSize: 18, lineHeight: 28, fontWeight: '400', letterSpacing: 0, fontFamily: 'System' },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400', letterSpacing: 0, fontFamily: 'System' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400', letterSpacing: 0.3, fontFamily: 'System' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '500', letterSpacing: 0.1, fontFamily: 'System' },
  helper: { fontSize: 12, lineHeight: 16, fontWeight: '400', letterSpacing: 0, fontFamily: 'System' },
  button: { fontSize: 16, lineHeight: 24, fontWeight: '600', letterSpacing: 0.2, fontFamily: 'System' },
  buttonSmall: { fontSize: 14, lineHeight: 20, fontWeight: '600', letterSpacing: 0.1, fontFamily: 'System' },
  geneticTitle: { fontSize: 20, lineHeight: 28, fontWeight: '700', letterSpacing: -0.1, fontFamily: 'System' },
  geneticSubtitle: { fontSize: 16, lineHeight: 24, fontWeight: '500', letterSpacing: 0, fontFamily: 'System' },
  geneticValue: { fontSize: 18, lineHeight: 26, fontWeight: '600', letterSpacing: 0, fontFamily: 'System' },
  geneticLabel: { fontSize: 12, lineHeight: 16, fontWeight: '500', letterSpacing: 0.2, fontFamily: 'System' },
};

export default function EnhancedText({
  children,
  variant = 'body',
  color,
  align = 'left',
  weight,
  transform,
  lineHeight,
  letterSpacing,
  opacity = 1,
  maxLines,
  ellipsizeMode = 'tail',
  style,
  testID,
  ...props
}: EnhancedTextProps) {
  // Typography stilini al
  const typographyStyle = typographyScale[variant] || typographyScale.body;
  
  // Özel stilleri birleştir
  const customStyle: TextStyle = {
    color,
    textAlign: align,
    fontWeight: weight || typographyStyle.fontWeight,
    textTransform: transform || 'none',
    lineHeight: lineHeight || typographyStyle.lineHeight,
    letterSpacing: letterSpacing !== undefined ? letterSpacing : typographyStyle.letterSpacing,
    opacity,
  };

  // Maksimum satır sayısı ve ellipsis
  const textProps: any = {
    numberOfLines: maxLines,
    ellipsizeMode: maxLines ? ellipsizeMode : undefined,
  };

  return (
    <Text
      style={[
        styles.base,
        {
          fontSize: typographyStyle.fontSize,
          fontFamily: typographyStyle.fontFamily,
        },
        customStyle,
        style,
      ]}
      testID={testID}
      {...textProps}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

// Önceden tanımlanmış varyantlar için kolay kullanım
export const DisplayText = (props: Omit<EnhancedTextProps, 'variant'>) => (
  <EnhancedText variant="display" {...props} />
);

export const H1 = (props: Omit<EnhancedTextProps, 'variant'>) => (
  <EnhancedText variant="h1" {...props} />
);

export const H2 = (props: Omit<EnhancedTextProps, 'variant'>) => (
  <EnhancedText variant="h2" {...props} />
);

export const H3 = (props: Omit<EnhancedTextProps, 'variant'>) => (
  <EnhancedText variant="h3" {...props} />
);

export const H4 = (props: Omit<EnhancedTextProps, 'variant'>) => (
  <EnhancedText variant="h4" {...props} />
);

export const H5 = (props: Omit<EnhancedTextProps, 'variant'>) => (
  <EnhancedText variant="h5" {...props} />
);

export const H6 = (props: Omit<EnhancedTextProps, 'variant'>) => (
  <EnhancedText variant="h6" {...props} />
);

export const BodyText = (props: Omit<EnhancedTextProps, 'variant'>) => (
  <EnhancedText variant="body" {...props} />
);

export const BodyLarge = (props: Omit<EnhancedTextProps, 'variant'>) => (
  <EnhancedText variant="bodyLarge" {...props} />
);

export const BodySmall = (props: Omit<EnhancedTextProps, 'variant'>) => (
  <EnhancedText variant="bodySmall" {...props} />
);

export const Caption = (props: Omit<EnhancedTextProps, 'variant'>) => (
  <EnhancedText variant="caption" {...props} />
);

export const Label = (props: Omit<EnhancedTextProps, 'variant'>) => (
  <EnhancedText variant="label" {...props} />
);

export const Helper = (props: Omit<EnhancedTextProps, 'variant'>) => (
  <EnhancedText variant="helper" {...props} />
);

export const ButtonText = (props: Omit<EnhancedTextProps, 'variant'>) => (
  <EnhancedText variant="button" {...props} />
);

export const ButtonSmallText = (props: Omit<EnhancedTextProps, 'variant'>) => (
  <EnhancedText variant="buttonSmall" {...props} />
);

// DNA/Genetik özel componentler
export const GeneticTitle = (props: Omit<EnhancedTextProps, 'variant'>) => (
  <EnhancedText variant="geneticTitle" {...props} />
);

export const GeneticSubtitle = (props: Omit<EnhancedTextProps, 'variant'>) => (
  <EnhancedText variant="geneticSubtitle" {...props} />
);

export const GeneticValue = (props: Omit<EnhancedTextProps, 'variant'>) => (
  <EnhancedText variant="geneticValue" {...props} />
);

export const GeneticLabel = (props: Omit<EnhancedTextProps, 'variant'>) => (
  <EnhancedText variant="geneticLabel" {...props} />
);