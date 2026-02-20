import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import React from 'react';

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { clearStorage, seedStorage } from '../helpers/storage-helpers';

// Mock useColorScheme from react-native at the module level
let mockDeviceScheme: 'light' | 'dark' = 'light';
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
    default: () => mockDeviceScheme,
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
);

beforeEach(async () => {
    await clearStorage();
    mockDeviceScheme = 'light';
});

describe('ThemeContext', () => {
    it('initializes with auto when no stored preference', async () => {
        const { result } = renderHook(() => useTheme(), { wrapper });

        await waitFor(() => expect(result.current.themeMode).toBe('auto'));
    });

    it('loads stored theme from AsyncStorage', async () => {
        await seedStorage({ '@anchor_theme': 'dark' });

        const { result } = renderHook(() => useTheme(), { wrapper });

        await waitFor(() => expect(result.current.themeMode).toBe('dark'));
    });

    it('ignores invalid stored values and defaults to auto', async () => {
        await seedStorage({ '@anchor_theme': 'invalid_theme' });

        const { result } = renderHook(() => useTheme(), { wrapper });

        await waitFor(() => expect(result.current.themeMode).toBe('auto'));
    });

    it('useTheme throws outside provider', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation();

        expect(() => {
            renderHook(() => useTheme());
        }).toThrow('useTheme must be used within a ThemeProvider');

        spy.mockRestore();
    });

    it('setThemeMode persists and updates state', async () => {
        const { result } = renderHook(() => useTheme(), { wrapper });

        await waitFor(() => expect(result.current.themeMode).toBe('auto'));

        await act(async () => {
            await result.current.setThemeMode('black');
        });

        expect(result.current.themeMode).toBe('black');

        const stored = await AsyncStorage.getItem('@anchor_theme');
        expect(stored).toBe('black');
    });

    it('colorScheme maps auto + light system to light', async () => {
        mockDeviceScheme = 'light';

        const { result } = renderHook(() => useTheme(), { wrapper });

        await waitFor(() => expect(result.current.themeMode).toBe('auto'));
        expect(result.current.colorScheme).toBe('light');
    });

    it('colorScheme maps auto + dark system to dark', async () => {
        mockDeviceScheme = 'dark';

        const { result } = renderHook(() => useTheme(), { wrapper });

        await waitFor(() => expect(result.current.themeMode).toBe('auto'));
        expect(result.current.colorScheme).toBe('dark');
    });

    it('explicit modes map directly to colorScheme', async () => {
        const { result } = renderHook(() => useTheme(), { wrapper });

        await waitFor(() => expect(result.current.themeMode).toBe('auto'));

        await act(async () => {
            await result.current.setThemeMode('black');
        });
        expect(result.current.colorScheme).toBe('black');

        await act(async () => {
            await result.current.setThemeMode('white');
        });
        expect(result.current.colorScheme).toBe('white');
    });
});
