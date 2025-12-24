import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'es' | 'pt';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = '@anchor_language';
const SUPPORTED_LANGUAGES: Language[] = ['en', 'es', 'pt'];

const detectSystemLanguage = (): Language => {
    try {
        const locales = getLocales();
        if (locales && locales.length > 0) {
            const systemLang = locales[0].languageCode;
            if (systemLang && SUPPORTED_LANGUAGES.includes(systemLang as Language)) {
                return systemLang as Language;
            }
        }
    } catch (error) {
        console.warn('Failed to detect system language:', error);
    }
    return 'en'; // Fallback to English
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('en');
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeLanguage = async () => {
            try {
                const storedLanguage = await AsyncStorage.getItem(STORAGE_KEY);

                if (storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage as Language)) {
                    setLanguageState(storedLanguage as Language);
                } else {
                    const detectedLanguage = detectSystemLanguage();
                    setLanguageState(detectedLanguage);
                    await AsyncStorage.setItem(STORAGE_KEY, detectedLanguage);
                }
            } catch (error) {
                console.warn('Failed to load language preference:', error);
                setLanguageState('en');
            } finally {
                setIsInitialized(true);
            }
        };

        initializeLanguage();
    }, []);

    const setLanguage = async (lang: Language) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, lang);
            setLanguageState(lang);
        } catch (error) {
            console.warn('Failed to save language preference:', error);
        }
    };

    if (!isInitialized) {
        return null; // Wait for initialization
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
