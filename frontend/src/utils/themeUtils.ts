import { Theme } from '../context/ThemeContext';

/**
 * Utility functions for theme-aware styling
 */

/**
 * Get theme-appropriate class names based on current theme
 * @param lightClass - Class names for light theme
 * @param darkClass - Class names for dark theme
 * @param theme - Current theme
 * @returns Appropriate class names for the current theme
 */
export const getThemeClasses = (
  lightClass: string, 
  darkClass: string, 
  theme: Theme
): string => {
  return theme === 'dark' ? darkClass : lightClass;
};

/**
 * Conditional theme classes - returns classes only if theme matches
 * @param classes - Classes to apply
 * @param theme - Theme to match
 * @param currentTheme - Current theme
 * @returns Classes if theme matches, empty string otherwise
 */
export const conditionalThemeClass = (
  classes: string, 
  theme: Theme, 
  currentTheme: Theme
): string => {
  return theme === currentTheme ? classes : '';
};

/**
 * Theme-aware color palette
 */
export const themeColors = {
  light: {
    background: {
      primary: 'bg-gradient-to-br from-slate-50 to-gray-100',
      secondary: 'bg-white',
      card: 'bg-white/90',
      glass: 'bg-white/20',
    },
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      muted: 'text-gray-500',
    },
    border: {
      primary: 'border-gray-200',
      secondary: 'border-gray-300',
    },
    button: {
      primary: 'bg-red-600 hover:bg-red-700 text-white',
      secondary: 'bg-amber-500 hover:bg-amber-600 text-white',
      outline: 'border-red-300 text-red-700 hover:bg-red-50',
    }
  },
  dark: {
    background: {
      primary: 'bg-gradient-to-br from-gray-900 to-gray-800',
      secondary: 'bg-gray-800',
      card: 'bg-gray-800/90',
      glass: 'bg-black/20',
    },
    text: {
      primary: 'text-gray-100',
      secondary: 'text-gray-300',
      muted: 'text-gray-400',
    },
    border: {
      primary: 'border-gray-700',
      secondary: 'border-gray-600',
    },
    button: {
      primary: 'bg-red-700 hover:bg-red-600 text-white',
      secondary: 'bg-amber-600 hover:bg-amber-500 text-white',
      outline: 'border-red-400 text-red-400 hover:bg-red-900/20',
    }
  }
};

/**
 * Get theme-specific color classes
 * @param colorType - Type of color (background, text, border, button)
 * @param variant - Variant of the color type
 * @param theme - Current theme
 * @returns Theme-appropriate class names
 */
export const getThemeColors = (
  colorType: keyof typeof themeColors.light,
  variant: string,
  theme: Theme
): string => {
  const colorPalette = themeColors[theme];
  const colorGroup = colorPalette[colorType] as Record<string, string>;
  return colorGroup[variant] || '';
};

/**
 * Theme-aware shadow classes
 */
export const themeShadows = {
  light: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    card: 'shadow-xl hover:shadow-2xl',
    glass: 'shadow-lg',
  },
  dark: {
    sm: 'shadow-sm shadow-black/20',
    md: 'shadow-md shadow-black/30',
    lg: 'shadow-lg shadow-black/40',
    xl: 'shadow-xl shadow-black/50',
    '2xl': 'shadow-2xl shadow-black/60',
    card: 'shadow-xl shadow-black/50 hover:shadow-2xl hover:shadow-black/60',
    glass: 'shadow-lg shadow-black/40',
  }
};

/**
 * Get theme-appropriate shadow classes
 * @param shadowType - Type of shadow
 * @param theme - Current theme
 * @returns Theme-appropriate shadow classes
 */
export const getThemeShadow = (shadowType: keyof typeof themeShadows.light, theme: Theme): string => {
  return themeShadows[theme][shadowType];
};

/**
 * Theme transition classes for smooth theme changes
 */
export const themeTransitions = {
  default: 'transition-colors duration-300',
  fast: 'transition-colors duration-200',
  slow: 'transition-colors duration-500',
  all: 'transition-all duration-300',
};

/**
 * Generate responsive theme classes
 * @param baseClasses - Base classes to apply
 * @param theme - Current theme
 * @returns Combined classes with theme transitions
 */
export const withThemeTransition = (baseClasses: string, theme?: Theme): string => {
  return `${baseClasses} ${themeTransitions.default}`;
};

/**
 * Theme-aware gradient classes
 */
export const themeGradients = {
  light: {
    primary: 'bg-gradient-to-r from-red-500 to-orange-500',
    secondary: 'bg-gradient-to-r from-amber-400 to-orange-500',
    background: 'bg-gradient-to-br from-slate-50 to-gray-100',
    card: 'bg-gradient-to-br from-white/80 to-gray-50/80',
  },
  dark: {
    primary: 'bg-gradient-to-r from-red-600 to-orange-600',
    secondary: 'bg-gradient-to-r from-amber-500 to-orange-600',
    background: 'bg-gradient-to-br from-gray-900 to-gray-800',
    card: 'bg-gradient-to-br from-gray-800/80 to-gray-900/80',
  }
};

/**
 * Get theme-appropriate gradient classes
 * @param gradientType - Type of gradient
 * @param theme - Current theme
 * @returns Theme-appropriate gradient classes
 */
export const getThemeGradient = (
  gradientType: keyof typeof themeGradients.light, 
  theme: Theme
): string => {
  return themeGradients[theme][gradientType];
};