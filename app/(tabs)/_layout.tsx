import { Ionicons } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import React, { useCallback } from 'react';
import { TouchableOpacity } from 'react-native';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

const headerLeftStyle = { marginLeft: 16 };

export default function TabLayout() { 
  const colorScheme = useColorScheme();
  const iconColor = Colors[colorScheme ?? 'light'].icon;
  const textColor = Colors[colorScheme ?? 'light'].text;

  const handleBackToHome = useCallback(() => {
    router.push('/');
  }, []);

  const handleBackToSettings = useCallback(() => {
    router.push('/settings');
  }, []);

  const renderHeaderLeft = useCallback(() => (
    <TouchableOpacity 
      onPress={handleBackToHome} 
      style={headerLeftStyle}
      activeOpacity={0.6}
    >
      <Ionicons name="chevron-back" size={24} color={iconColor} />
    </TouchableOpacity>
  ), [iconColor, handleBackToHome]);

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
    <Tabs
      screenOptions={{
        // Hide the tab bar completely for a minimal experience
        tabBarStyle: { display: 'none' },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Anchor',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTintColor: textColor,
          headerLeft: renderHeaderLeft,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          headerTintColor: textColor,
          headerLeft: renderHeaderLeft,
        }}
      />
      <Tabs.Screen
        name="edit-phrases/[mode]"
        options={{
          title: 'Edit phrases',
          headerTintColor: textColor,
          headerLeft: renderEditPhrasesHeaderLeft,
        }}
      />
    </Tabs>
  );
}
