import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { getLocales } from 'expo-localization';
import React from 'react';

import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { clearStorage, seedStorage } from '../helpers/storage-helpers';

const mockedGetLocales = getLocales as jest.MockedFunction<typeof getLocales>;

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LanguageProvider>{children}</LanguageProvider>
);

beforeEach(async () => {
    await clearStorage();
    // Reset to default English locale
    mockedGetLocales.mockReturnValue([{ languageCode: 'en' }] as any);
});

describe('LanguageContext', () => {
    it('auto-detects system language', async () => {
        mockedGetLocales.mockReturnValue([{ languageCode: 'es' }] as any);

        const { result } = renderHook(() => useLanguage(), { wrapper });

        await waitFor(() => expect(result.current.language).toBe('es'));
    });

    it('loads stored language from AsyncStorage', async () => {
        await seedStorage({ '@anchor_language': 'pt' });

        const { result } = renderHook(() => useLanguage(), { wrapper });

        await waitFor(() => expect(result.current.language).toBe('pt'));
    });

    it('defaults to en for unsupported system language', async () => {
        mockedGetLocales.mockReturnValue([{ languageCode: 'fr' }] as any);

        const { result } = renderHook(() => useLanguage(), { wrapper });

        await waitFor(() => expect(result.current.language).toBe('en'));
    });

    it('useLanguage throws outside provider', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation();

        expect(() => {
            renderHook(() => useLanguage());
        }).toThrow('useLanguage must be used within a LanguageProvider');

        spy.mockRestore();
    });

    it('setLanguage persists and updates state', async () => {
        const { result } = renderHook(() => useLanguage(), { wrapper });

        await waitFor(() => expect(result.current.language).toBe('en'));

        await act(async () => {
            await result.current.setLanguage('pt');
        });

        expect(result.current.language).toBe('pt');

        const stored = await AsyncStorage.getItem('@anchor_language');
        expect(stored).toBe('pt');
    });

    it('stored preference overrides system language', async () => {
        mockedGetLocales.mockReturnValue([{ languageCode: 'es' }] as any);
        await seedStorage({ '@anchor_language': 'pt' });

        const { result } = renderHook(() => useLanguage(), { wrapper });

        await waitFor(() => expect(result.current.language).toBe('pt'));
    });

    it('ignores invalid stored language and detects system', async () => {
        mockedGetLocales.mockReturnValue([{ languageCode: 'es' }] as any);
        await seedStorage({ '@anchor_language': 'invalid' });

        const { result } = renderHook(() => useLanguage(), { wrapper });

        await waitFor(() => expect(result.current.language).toBe('es'));
    });
});
