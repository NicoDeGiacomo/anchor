import { useCallback, useEffect, useState } from 'react';

import { useLanguage } from '@/contexts/LanguageContext';
import {
    BuiltInMode,
    FLAT_PHASE_KEY,
    getActiveFlatPhrases,
    getActivePhrases,
    getHiddenPhrases,
    getUserPhrases,
    isBuiltInMode,
    Language,
    PhasedPhrases,
    Phrase,
    PHRASE_PHASES
} from '@/utils/phraseStorage';

// Content type for flat (non-SIT) JSON files
interface FlatPhraseContent {
    phrases: Phrase[];
}

// Dynamic imports for SIT built-in mode/language combinations (phased format)
const PHASED_PHRASES_MAP: Partial<Record<BuiltInMode, Record<Language, PhasedPhrases>>> = {
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
};

// Dynamic imports for flat (non-SIT) built-in mode/language combinations
const FLAT_PHRASES_MAP: Partial<Record<BuiltInMode, Record<Language, FlatPhraseContent>>> = {
    grounding: {
        en: require('@/content/grounding/anchors.en.json'),
        es: require('@/content/grounding/anchors.es.json'),
        pt: require('@/content/grounding/anchors.pt.json'),
    },
    values: {
        en: require('@/content/values/anchors.en.json'),
        es: require('@/content/values/anchors.es.json'),
        pt: require('@/content/values/anchors.pt.json'),
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

interface UseFlatPhrasesResult {
    phrases: Phrase[];
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

interface UseFlatPhrasesWithSourceResult {
    phrases: PhraseWithSource[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    isCustomMode: boolean;
}

/**
 * Helper to get built-in phased phrases with fallback to English
 * Returns empty phased object for custom modes or non-SIT built-in modes
 */
function getBuiltInPhasedPhrases(mode: string, language: Language): PhasedPhrases {
    if (!isBuiltInMode(mode)) {
        return EMPTY_PHASED;
    }
    
    try {
        let phrases = PHASED_PHRASES_MAP[mode]?.[language];
        
        // Fallback to English if current language has no content
        if ((!phrases || (phrases.preparation.length === 0 && phrases.confrontation.length === 0)) && language !== 'en') {
            phrases = PHASED_PHRASES_MAP[mode]?.en;
        }
        
        return phrases || EMPTY_PHASED;
    } catch (error) {
        console.warn('Failed to load built-in phased phrases:', error);
        return EMPTY_PHASED;
    }
}

/**
 * Helper to get built-in flat phrases with fallback to English
 * Returns empty array for custom modes or SIT built-in modes
 */
function getBuiltInFlatPhrases(mode: string, language: Language): Phrase[] {
    if (!isBuiltInMode(mode)) {
        return [];
    }
    
    try {
        let content = FLAT_PHRASES_MAP[mode]?.[language];
        
        // Fallback to English if current language has no content
        if ((!content || content.phrases.length === 0) && language !== 'en') {
            content = FLAT_PHRASES_MAP[mode]?.en;
        }
        
        return content?.phrases || [];
    } catch (error) {
        console.warn('Failed to load built-in flat phrases:', error);
        return [];
    }
}

/**
 * Hook to load active phased phrases for display (SIT method)
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
            const builtInPhrases = getBuiltInPhasedPhrases(mode, language);
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
 * Hook to load active flat phrases for display (Random / See All methods)
 * Returns a flat array of phrases (no phases)
 */
export function useFlatPhrases(mode: string): UseFlatPhrasesResult {
    const { language } = useLanguage();
    const [phrases, setPhrases] = useState<Phrase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPhrases = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const builtInPhrases = getBuiltInFlatPhrases(mode, language);
            const activePhrases = await getActiveFlatPhrases(mode, language, builtInPhrases);
            setPhrases(activePhrases);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load phrases';
            console.warn('Failed to load flat phrases:', err);
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
 * Hook to load all phased phrases with source information (for editing SIT modes)
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
            const builtInPhrases = getBuiltInPhasedPhrases(mode, language);

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

/**
 * Hook to load all flat phrases with source information (for editing non-SIT modes)
 * Includes built-in, user-added, and hidden phrases as a flat list
 */
export function useFlatPhrasesWithSource(mode: string): UseFlatPhrasesWithSourceResult {
    const { language } = useLanguage();
    const [phrases, setPhrases] = useState<PhraseWithSource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isCustom = !isBuiltInMode(mode);

    const loadPhrases = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const builtInPhrases = getBuiltInFlatPhrases(mode, language);

            // Get hidden IDs
            const hiddenIds = await getHiddenPhrases(mode, language);
            const hiddenSet = new Set(hiddenIds);

            // Get user-added flat phrases
            const userPhrases = await getUserPhrases(mode, language, FLAT_PHASE_KEY);

            // Mark built-in phrases
            const builtInWithSource: PhraseWithSource[] = builtInPhrases.map(phrase => ({
                ...phrase,
                isUserAdded: false,
                isHidden: hiddenSet.has(phrase.id),
            }));

            // Mark user phrases
            const userWithSource: PhraseWithSource[] = userPhrases.map(phrase => ({
                ...phrase,
                isUserAdded: true,
            }));

            setPhrases([...builtInWithSource, ...userWithSource]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load phrases';
            console.warn('Failed to load flat phrases:', err);
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
        isCustomMode: isCustom,
    };
}
