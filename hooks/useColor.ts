import Colors, { ColorName } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

/**
 * Returns a single color string based on the current color scheme.
 * @param colorName - The name of the color to retrieve
 * @returns The color value as a string
 */
export function useColor(colorName: ColorName): string {
  const colorScheme = useColorScheme() ?? 'light';
  return Colors[colorScheme][colorName];
}

/**
 * Returns multiple color strings based on the current color scheme.
 * @param colorNames - The names of the colors to retrieve
 * @returns An object mapping color names to their values
 */
export function useColors<T extends ColorName[]>(
  ...colorNames: T
): { [K in T[number]]: string } {
  const colorScheme = useColorScheme() ?? 'light';
  const result = {} as { [K in T[number]]: string };
  for (const name of colorNames) {
    result[name as T[number]] = Colors[colorScheme][name];
  }
  return result;
}
