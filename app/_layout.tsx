import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider, Theme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useCallback, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Custom navigation themes that match our app's actual background colors
const CustomLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    card: Colors.light.background,
  },
};

const CustomDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,
    card: Colors.dark.background,
  },
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
  const iconColor = Colors[colorScheme ?? 'light'].icon;
  const backgroundColor = colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;

  // Set the native root view background color to prevent white flash on Android
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(backgroundColor);
  }, [backgroundColor]);

  const handleBackToSettings = useCallback(() => {
    router.push('/settings');
  }, []);

  const renderEditPhrasesHeaderLeft = useCallback(() => (
    <TouchableOpacity 
      onPress={handleBackToSettings} 
      style={headerLeftStyle}
      activeOpacity={0.6}
    >
      <Ionicons name="chevron-back" size={24} color={iconColor} />
    </TouchableOpacity>
  ), [iconColor, handleBackToSettings]);

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
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
        <Stack.Screen 
          name="edit-phrases/[mode]" 
          options={{
            title: 'Edit phrases',
            headerLeft: renderEditPhrasesHeaderLeft,
          }}
        />
      </Stack>
    </NavigationThemeProvider>
  );
}

const headerLeftStyle = { marginLeft: 16 };
