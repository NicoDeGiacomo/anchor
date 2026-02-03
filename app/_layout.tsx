import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider, Theme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useMemo } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import Colors, { ColorScheme } from '@/constants/Colors';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Custom navigation themes that match our app's actual background colors
// Pure black theme (original dark)
const CustomBlackTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.black.background,
    card: Colors.black.background,
    text: Colors.black.text,
    border: Colors.black.border,
    primary: Colors.black.tint,
  },
};

// Blue-dominant dark theme (matches logo)
const CustomDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,
    card: Colors.dark.background,
    text: Colors.dark.text,
    border: Colors.dark.border,
    primary: Colors.dark.tint,
  },
};

// White with blue accents theme (matches logo)
const CustomLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    card: Colors.light.background,
    text: Colors.light.text,
    border: Colors.light.border,
    primary: Colors.light.tint,
  },
};

// Pure white theme (original light)
const CustomWhiteTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.white.background,
    card: Colors.white.background,
    text: Colors.white.text,
    border: Colors.white.border,
    primary: Colors.white.tint,
  },
};

// Map color schemes to navigation themes
const navigationThemes: Record<ColorScheme, Theme> = {
  black: CustomBlackTheme,
  dark: CustomDarkTheme,
  light: CustomLightTheme,
  white: CustomWhiteTheme,
};

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NavigationTheme />
      </LanguageProvider>
    </ThemeProvider>
  );
}

function NavigationTheme() {
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme].background;
  const navigationTheme = useMemo(() => navigationThemes[colorScheme], [colorScheme]);

  // Set the native root view background color to prevent white flash on Android
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(backgroundColor);
  }, [backgroundColor]);

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, contentStyle: { backgroundColor } }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen 
          name="mode/[mode]" 
          options={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor },
          }}
        />
      </Stack>
    </NavigationThemeProvider>
  );
}
