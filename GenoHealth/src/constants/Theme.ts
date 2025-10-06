// GenoHealth Professional Design System
export const Theme = {
  // Color Palette
  colors: {
    // Primary Colors
    primary: {
      50: '#E8F5E8',
      100: '#C8E6C9',
      200: '#A5D6A7',
      300: '#81C784',
      400: '#66BB6A',
      500: '#4CAF50', // Main primary
      600: '#43A047',
      700: '#388E3C',
      800: '#2E7D32',
      900: '#1B5E20',
    },
    
    // Secondary Colors
    secondary: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#2196F3', // Main secondary
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
    },
    
    // Accent Colors
    accent: {
      orange: '#FF9800',
      purple: '#9C27B0',
      pink: '#E91E63',
      cyan: '#00BCD4',
      teal: '#009688',
      amber: '#FFC107',
    },
    
    // Neutral Colors
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    
    // Semantic Colors
    semantic: {
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
    },
    
    // Background Colors
    background: {
      primary: '#FFFFFF',
      secondary: '#FAFAFA',
      tertiary: '#F5F5F5',
      dark: '#121212',
    },
    
    // Text Colors
    text: {
      primary: '#212121',
      secondary: '#757575',
      tertiary: '#9E9E9E',
      inverse: '#FFFFFF',
      disabled: '#BDBDBD',
    },
    
    // Border Colors
    border: {
      light: '#E0E0E0',
      medium: '#BDBDBD',
      dark: '#757575',
    },
  },
  
  // Typography
  typography: {
    // Font Families
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
      light: 'System',
    },
    
    // Font Sizes
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },
    
    // Font Weights
    fontWeight: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    
    // Line Heights
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8,
    },
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 48,
  },
  
  // Border Radius
  borderRadius: {
    none: 0,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 36,
    full: 9999,
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 10,
    },
  },
  
  // Animation Durations
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 800,
  },
  
  // Breakpoints
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
};

// Component-specific theme variants
export const ComponentThemes = {
  card: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    ...Theme.shadows.md,
  },
  
  button: {
    primary: {
      backgroundColor: Theme.colors.primary[500],
      borderRadius: Theme.borderRadius.lg,
      paddingVertical: Theme.spacing.md,
      paddingHorizontal: Theme.spacing.lg,
    },
    secondary: {
      backgroundColor: Theme.colors.secondary[500],
      borderRadius: Theme.borderRadius.lg,
      paddingVertical: Theme.spacing.md,
      paddingHorizontal: Theme.spacing.lg,
    },
  },
  
  input: {
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
  },
};

export default Theme;
