import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

// Theme modes the user can select
type ThemeMode = 'auto' | 'black' | 'dark' | 'light' | 'white';

// Color schemes that map to Colors.ts
type ColorScheme = 'black' | 'dark' | 'light' | 'white';

const VALID_THEME_MODES: ThemeMode[] = ['auto', 'black', 'dark', 'light', 'white'];

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

                if (storedTheme && VALID_THEME_MODES.includes(storedTheme as ThemeMode)) {
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
    // - 'auto' uses the new blue themes (dark/light) based on system preference
    // - Other modes map directly to their color scheme
    const colorScheme: ColorScheme = useMemo(() => {
        if (themeMode === 'auto') {
            // Auto mode uses the blue-themed dark/light based on system preference
            return deviceColorScheme === 'dark' ? 'dark' : 'light';
        }
        // Direct mapping for explicit theme selections
        return themeMode;
    }, [themeMode, deviceColorScheme]);

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
