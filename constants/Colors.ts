// =============================================================================
// Logo Colors - Derived from the brand cyan in the final logo assets
// =============================================================================
export const LOGO_BLUE = '#4AAFCA'; // Brand cyan - primary accent
export const LOGO_WHITE = '#FFFFFF';

// Derived logo colors for variations
export const LOGO_BLUE_LIGHT = '#7DD3E8'; // Light cyan (matches logo imagery)
export const LOGO_BLUE_DARK = '#236B7A'; // Deep teal for dark theme backgrounds
export const LOGO_BLUE_MUTED = '#7AB0BE'; // Muted cyan for secondary text

// =============================================================================
// Color Keys Type
// =============================================================================
export type ColorName =
  | 'text'
  | 'textSecondary'
  | 'background'
  | 'tint'
  | 'tabIconDefault'
  | 'tabIconSelected'
  | 'icon'
  | 'border'
  | 'borderSelected'
  | 'danger'
  | 'link'
  | 'overlay'
  | 'separator';

// =============================================================================
// Color Schemes
// =============================================================================
// black: Pure black background with white text (original dark theme)
// dark: Blue dominant with white accents (matches logo)
// light: White dominant with blue accents (matches logo)
// white: Pure white background with black text (original light theme)
// =============================================================================
export type ColorScheme = 'black' | 'dark' | 'light' | 'white';

const Colors: Record<ColorScheme, Record<ColorName, string>> = {
  // Pure black/white theme (original dark theme)
  black: {
    text: '#fff',
    textSecondary: '#999',
    background: '#000',
    tint: '#fff',
    tabIconDefault: '#ccc',
    tabIconSelected: '#fff',
    icon: '#ccc',
    border: '#444',
    borderSelected: '#888',
    danger: '#ef5350',
    link: '#5dade2',
    overlay: 'rgba(0, 0, 0, 0.7)',
    separator: 'rgba(255, 255, 255, 0.1)',
  },

  // Blue dominant with white accents (matches logo - dark mode)
  dark: {
    text: LOGO_WHITE,
    textSecondary: LOGO_BLUE_MUTED,
    background: LOGO_BLUE_DARK,
    tint: LOGO_WHITE,
    tabIconDefault: LOGO_BLUE_MUTED,
    tabIconSelected: LOGO_WHITE,
    icon: LOGO_BLUE_LIGHT,
    border: LOGO_BLUE,
    borderSelected: LOGO_WHITE,
    danger: '#ef5350',
    link: LOGO_WHITE,
    overlay: 'rgba(0, 0, 0, 0.5)',
    separator: `rgba(255, 255, 255, 0.15)`,
  },

  // White dominant with blue accents (matches logo - light mode)
  light: {
    text: LOGO_BLUE_DARK,
    textSecondary: LOGO_BLUE_MUTED,
    background: LOGO_WHITE,
    tint: LOGO_BLUE,
    tabIconDefault: LOGO_BLUE_MUTED,
    tabIconSelected: LOGO_BLUE,
    icon: LOGO_BLUE,
    border: LOGO_BLUE_LIGHT,
    borderSelected: LOGO_BLUE,
    danger: '#d32f2f',
    link: LOGO_BLUE_DARK,
    overlay: 'rgba(0, 0, 0, 0.5)',
    separator: `rgba(74, 144, 217, 0.15)`,
  },

  // Pure white/black theme (original light theme)
  white: {
    text: '#000',
    textSecondary: '#666',
    background: '#fff',
    tint: '#2f95dc',
    tabIconDefault: '#ccc',
    tabIconSelected: '#2f95dc',
    icon: '#666',
    border: '#ccc',
    borderSelected: '#666',
    danger: '#d32f2f',
    link: '#2e78b7',
    overlay: 'rgba(0, 0, 0, 0.5)',
    separator: '#eee',
  },
};

export default Colors;
