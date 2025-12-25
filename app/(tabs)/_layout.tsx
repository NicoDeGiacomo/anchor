import { Ionicons } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const iconColor = Colors[colorScheme ?? 'light'].text;

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
        name="panic"
        options={{
          title: 'Panic',
          headerShown: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.push('/')} 
              style={{ marginLeft: 16 }}
              activeOpacity={0.6}
            >
              <Ionicons name="chevron-back" size={24} color="#666" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTintColor: '#000',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.push('/')} 
              style={{ marginLeft: 16 }}
              activeOpacity={0.6}
            >
              <Ionicons name="chevron-back" size={24} color="#666" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          headerTintColor: '#000',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.push('/')} 
              style={{ marginLeft: 16 }}
              activeOpacity={0.6}
            >
              <Ionicons name="chevron-back" size={24} color="#666" />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}
