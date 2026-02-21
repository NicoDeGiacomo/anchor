import { LOGO_BLUE, LOGO_BLUE_DARK, LOGO_BLUE_LIGHT, LOGO_BLUE_MUTED } from './Colors';

export type WallpaperTemplate = {
  id: string;
  name: string;
  textColor: string;
} & (
  | { type: 'solid'; color: string }
  | { type: 'gradient'; colors: [string, string]; direction: { x1: number; y1: number; x2: number; y2: number } }
);

// Gradient direction presets
const VERTICAL = { x1: 0, y1: 0, x2: 0, y2: 1 };
const HORIZONTAL = { x1: 0, y1: 0, x2: 1, y2: 0 };
const DIAGONAL = { x1: 0, y1: 0, x2: 1, y2: 1 };

export const WALLPAPER_TEMPLATES: WallpaperTemplate[] = [
  // Solids
  { id: 'solid-black', name: 'Black', type: 'solid', color: '#000000', textColor: '#FFFFFF' },
  { id: 'solid-white', name: 'White', type: 'solid', color: '#FFFFFF', textColor: '#000000' },
  { id: 'solid-blue', name: 'Brand Blue', type: 'solid', color: LOGO_BLUE, textColor: '#FFFFFF' },
  { id: 'solid-teal', name: 'Deep Teal', type: 'solid', color: LOGO_BLUE_DARK, textColor: '#FFFFFF' },

  // Gradients
  { id: 'grad-blue-teal', name: 'Blue to Teal', type: 'gradient', colors: [LOGO_BLUE, LOGO_BLUE_DARK], direction: VERTICAL, textColor: '#FFFFFF' },
  { id: 'grad-light-blue', name: 'Light to Blue', type: 'gradient', colors: [LOGO_BLUE_LIGHT, LOGO_BLUE], direction: VERTICAL, textColor: '#FFFFFF' },
  { id: 'grad-teal-muted', name: 'Teal to Muted', type: 'gradient', colors: [LOGO_BLUE_DARK, LOGO_BLUE_MUTED], direction: HORIZONTAL, textColor: '#FFFFFF' },
  { id: 'grad-muted-light', name: 'Muted to Light', type: 'gradient', colors: [LOGO_BLUE_MUTED, LOGO_BLUE_LIGHT], direction: DIAGONAL, textColor: '#FFFFFF' },
  { id: 'grad-dark-black', name: 'Teal to Black', type: 'gradient', colors: [LOGO_BLUE_DARK, '#000000'], direction: VERTICAL, textColor: '#FFFFFF' },
];
