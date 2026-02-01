import { useCallback, useEffect, useState } from 'react';

import { useLanguage } from '@/contexts/LanguageContext';
import {
    getActivePhrases,
    getHiddenPhrases,
    getUserPhrases,
    Language,
    Mode,
    Phrase,
} from '@/utils/phraseStorage';

// Dynamic imports for all mode/language combinations
const PHRASES_MAP: Record<Mode, Record<Language, Phrase[]>> = {
    panic: {
        en: require('@/content/panic/anchors.en.json'),
        es: require('@/content/panic/anchors.es.json'),
        pt: require('@/content/panic/anchors.pt.json'),
    },
    anxiety: {
        en: require('@/content/anxiety/anchors.en.json'),
        es: require('@/content/anxiety/anchors.es.json'),
        pt: require('@/content/anxiety/anchors.pt.json'),
    },
    sadness: {
        en: require('@/content/sadness/anchors.en.json'),
        es: require('@/content/sadness/anchors.es.json'),
        pt: require('@/content/sadness/anchors.pt.json'),
    },
    anger: {
        en: require('@/content/anger/anchors.en.json'),
        es: require('@/content/anger/anchors.es.json'),
        pt: require('@/content/anger/anchors.pt.json'),
    },
    grounding: {
        en: require('@/content/grounding/anchors.en.json'),
        es: require('@/content/grounding/anchors.es.json'),
        pt: require('@/content/grounding/anchors.pt.json'),
    },
};

type PhraseWithSource = Phrase & {
    isUserAdded: boolean;
    isHidden?: boolean;
};

interface UsePhasesResult {
    phrases: Phrase[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

interface UsePhrasesWithSourceResult {
    phrases: PhraseWithSource[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Helper to get built-in phrases with fallback to English
 */
function getBuiltInPhrases(mode: Mode, language: Language): Phrase[] {
    try {
        let phrases = PHRASES_MAP[mode]?.[language] || [];
        
        // Fallback to English if current language has no content
        if (phrases.length === 0 && language !== 'en') {
            phrases = PHRASES_MAP[mode]?.en || [];
        }
        
        return phrases;
    } catch (error) {
        console.warn('Failed to load built-in phrases:', error);
        return [];
    }
}

/**
 * Hook to load active phrases for display (built-in + user, excluding hidden)
 * Use this for the mode display screen
 */
export function usePhrases(mode: Mode): UsePhasesResult {
    const { language } = useLanguage();
    const [phrases, setPhrases] = useState<Phrase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPhrases = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const builtInPhrases = getBuiltInPhrases(mode, language);
            const activePhrases = await getActivePhrases(mode, language, builtInPhrases);
            setPhrases(activePhrases);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load phrases';
            console.warn('Failed to load phrases:', err);
            setError(errorMessage);
            setPhrases([]);
        } finally {
            setIsLoading(false);
        }
    }, [mode, language]);

    useEffect(() => {
        loadPhrases();
    }, [loadPhrases]);

    return {
        phrases,
        isLoading,
        error,
        refetch: loadPhrases,
    };
}

/**
 * Hook to load all phrases with source information (for editing)
 * Includes built-in, user-added, and hidden phrases
 */
export function usePhrasesWithSource(mode: Mode): UsePhrasesWithSourceResult {
    const { language } = useLanguage();
    const [phrases, setPhrases] = useState<PhraseWithSource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPhrases = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const builtInPhrases = getBuiltInPhrases(mode, language);

            // Get user phrases and hidden IDs
            const [userPhrases, hiddenIds] = await Promise.all([
                getUserPhrases(mode, language),
                getHiddenPhrases(mode, language),
            ]);

            // Mark built-in phrases
            const builtInWithSource: PhraseWithSource[] = builtInPhrases.map(phrase => ({
                ...phrase,
                isUserAdded: false,
                isHidden: hiddenIds.includes(phrase.id),
            }));

            // Mark user phrases
            const userWithSource: PhraseWithSource[] = userPhrases.map(phrase => ({
                ...phrase,
                isUserAdded: true,
            }));

            // Combine all phrases (visible and hidden)
            setPhrases([...builtInWithSource, ...userWithSource]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load phrases';
            console.warn('Failed to load phrases:', err);
            setError(errorMessage);
            setPhrases([]);
        } finally {
            setIsLoading(false);
        }
    }, [mode, language]);

    useEffect(() => {
        loadPhrases();
    }, [loadPhrases]);

    return {
        phrases,
        isLoading,
        error,
        refetch: loadPhrases,
    };
}
