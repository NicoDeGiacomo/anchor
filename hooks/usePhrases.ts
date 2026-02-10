import { useCallback, useEffect, useState } from 'react';

import { useLanguage } from '@/contexts/LanguageContext';
import {
    BuiltInMode,
    getActivePhrases,
    getHiddenPhrases,
    getUserPhrases,
    isBuiltInMode,
    Language,
    PhasedPhrases,
    Phrase,
    PHRASE_PHASES
} from '@/utils/phraseStorage';

// Dynamic imports for all built-in mode/language combinations
// These now return PhasedPhrases objects instead of flat arrays
const PHRASES_MAP: Record<BuiltInMode, Record<Language, PhasedPhrases>> = {
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

const EMPTY_PHASED: PhasedPhrases = {
    preparation: [],
    confrontation: [],
    reinforcement: [],
};

export type PhraseWithSource = Phrase & {
    isUserAdded: boolean;
    isHidden?: boolean;
};

export type PhasedPhrasesWithSource = {
    preparation: PhraseWithSource[];
    confrontation: PhraseWithSource[];
    reinforcement: PhraseWithSource[];
};

interface UsePhasesResult {
    phrases: PhasedPhrases;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

interface UsePhrasesWithSourceResult {
    phrases: PhasedPhrasesWithSource;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    isCustomMode: boolean;
}

/**
 * Helper to get built-in phrases with fallback to English
 * Returns empty phased object for custom modes
 */
function getBuiltInPhrases(mode: string, language: Language): PhasedPhrases {
    // Custom modes have no built-in phrases
    if (!isBuiltInMode(mode)) {
        return EMPTY_PHASED;
    }
    
    try {
        let phrases = PHRASES_MAP[mode]?.[language];
        
        // Fallback to English if current language has no content
        if ((!phrases || (phrases.preparation.length === 0 && phrases.confrontation.length === 0)) && language !== 'en') {
            phrases = PHRASES_MAP[mode]?.en;
        }
        
        return phrases || EMPTY_PHASED;
    } catch (error) {
        console.warn('Failed to load built-in phrases:', error);
        return EMPTY_PHASED;
    }
}

/**
 * Hook to load active phrases for display (built-in + user, excluding hidden)
 * Returns phrases grouped by phase: { preparation, confrontation, reinforcement }
 */
export function usePhrases(mode: string): UsePhasesResult {
    const { language } = useLanguage();
    const [phrases, setPhrases] = useState<PhasedPhrases>(EMPTY_PHASED);
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
            setPhrases(EMPTY_PHASED);
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
 * Includes built-in, user-added, and hidden phrases grouped by phase
 */
export function usePhrasesWithSource(mode: string): UsePhrasesWithSourceResult {
    const { language } = useLanguage();
    const [phrases, setPhrases] = useState<PhasedPhrasesWithSource>({
        preparation: [],
        confrontation: [],
        reinforcement: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isCustom = !isBuiltInMode(mode);

    const loadPhrases = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const builtInPhrases = getBuiltInPhrases(mode, language);

            // Get hidden IDs (shared across phases)
            const hiddenIds = await getHiddenPhrases(mode, language);
            const hiddenSet = new Set(hiddenIds);

            // Build phased result
            const result: PhasedPhrasesWithSource = {
                preparation: [],
                confrontation: [],
                reinforcement: [],
            };

            // Load user phrases for all phases in parallel
            const userPhrasesByPhase = await Promise.all(
                PHRASE_PHASES.map(phase => getUserPhrases(mode, language, phase))
            );

            for (let i = 0; i < PHRASE_PHASES.length; i++) {
                const phase = PHRASE_PHASES[i];
                const builtIn = builtInPhrases[phase] || [];
                const userPhrases = userPhrasesByPhase[i];

                // Mark built-in phrases
                const builtInWithSource: PhraseWithSource[] = builtIn.map(phrase => ({
                    ...phrase,
                    isUserAdded: false,
                    isHidden: hiddenSet.has(phrase.id),
                }));

                // Mark user phrases
                const userWithSource: PhraseWithSource[] = userPhrases.map(phrase => ({
                    ...phrase,
                    isUserAdded: true,
                }));

                result[phase] = [...builtInWithSource, ...userWithSource];
            }

            setPhrases(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load phrases';
            console.warn('Failed to load phrases:', err);
            setError(errorMessage);
            setPhrases({ preparation: [], confrontation: [], reinforcement: [] });
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
        isCustomMode: isCustom,
    };
}
