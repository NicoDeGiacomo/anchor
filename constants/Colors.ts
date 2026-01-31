// Color keys type for type safety
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

export type ColorScheme = 'light' | 'dark';

const Colors: Record<ColorScheme, Record<ColorName, string>> = {
  light: {
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
  dark: {
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
};

export default Colors;
