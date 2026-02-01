import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

type ThemeMode = 'auto' | 'light' | 'dark';
type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => Promise<void>;
    colorScheme: ColorScheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = '@anchor_theme';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
    const [isInitialized, setIsInitialized] = useState(false);
    const deviceColorScheme = useDeviceColorScheme();

    useEffect(() => {
        const initializeTheme = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem(STORAGE_KEY);

                if (storedTheme && ['auto', 'light', 'dark'].includes(storedTheme)) {
                    setThemeModeState(storedTheme as ThemeMode);
                } else {
                    // Default to auto (system preference)
                    setThemeModeState('auto');
                    await AsyncStorage.setItem(STORAGE_KEY, 'auto');
                }
            } catch (error) {
                console.warn('Failed to load theme preference:', error);
                setThemeModeState('auto');
            } finally {
                setIsInitialized(true);
            }
        };

        initializeTheme();
    }, []);

    const setThemeMode = useCallback(async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, mode);
            setThemeModeState(mode);
        } catch (error) {
            console.warn('Failed to save theme preference:', error);
        }
    }, []);

    // Determine the actual color scheme based on theme mode
    const colorScheme: ColorScheme = 
        themeMode === 'auto' 
            ? (deviceColorScheme ?? 'light')
            : themeMode as ColorScheme;

    const value = useMemo(() => ({
        themeMode,
        setThemeMode,
        colorScheme,
    }), [themeMode, setThemeMode, colorScheme]);

    if (!isInitialized) {
        return null; // Wait for initialization
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

