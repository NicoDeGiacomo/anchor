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
    const [state, setState] = useState<{ themeMode: ThemeMode; isInitialized: boolean }>({
        themeMode: 'auto',
        isInitialized: false,
    });
    const deviceColorScheme = useDeviceColorScheme();

    useEffect(() => {
        const initializeTheme = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem(STORAGE_KEY);

                if (storedTheme && VALID_THEME_MODES.includes(storedTheme as ThemeMode)) {
                    setState({ themeMode: storedTheme as ThemeMode, isInitialized: true });
                } else {
                    // Default to auto (system preference)
                    setState({ themeMode: 'auto', isInitialized: true });
                    await AsyncStorage.setItem(STORAGE_KEY, 'auto');
                }
            } catch (error) {
                console.warn('Failed to load theme preference:', error);
                setState({ themeMode: 'auto', isInitialized: true });
            }
        };

        initializeTheme();
    }, []);

    const setThemeMode = useCallback(async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, mode);
            setState(prev => ({ ...prev, themeMode: mode }));
        } catch (error) {
            console.warn('Failed to save theme preference:', error);
        }
    }, []);

    // Determine the actual color scheme based on theme mode
    // - 'auto' uses the new blue themes (dark/light) based on system preference
    // - Other modes map directly to their color scheme
    const colorScheme: ColorScheme = useMemo(() => {
        if (state.themeMode === 'auto') {
            // Auto mode uses the blue-themed dark/light based on system preference
            return deviceColorScheme === 'dark' ? 'dark' : 'light';
        }
        // Direct mapping for explicit theme selections
        return state.themeMode;
    }, [state.themeMode, deviceColorScheme]);

    const value = useMemo(() => ({
        themeMode: state.themeMode,
        setThemeMode,
        colorScheme,
    }), [state.themeMode, setThemeMode, colorScheme]);

    if (!state.isInitialized) {
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
