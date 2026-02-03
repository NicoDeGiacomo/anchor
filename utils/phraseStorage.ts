import AsyncStorage from '@react-native-async-storage/async-storage';

export type Mode = 'panic' | 'anxiety' | 'sadness' | 'anger' | 'grounding';
export type Language = 'en' | 'es' | 'pt';

export interface Phrase {
    id: string;
    text: string;
    subphrase?: string;
}

export interface UserPhrase extends Phrase {
    // User phrases use the same structure as built-in phrases
}

// Storage keys
const getUserPhrasesKey = (mode: Mode, language: Language) => 
    `user_phrases:${mode}:${language}`;

const getHiddenPhrasesKey = (mode: Mode, language: Language) => 
    `hidden_phrases:${mode}:${language}`;

/**
 * Generate a unique ID for a user phrase
 */
export const generatePhraseId = (): string => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get user-added phrases for a specific mode and language
 */
export const getUserPhrases = async (mode: Mode, language: Language): Promise<UserPhrase[]> => {
    try {
        const key = getUserPhrasesKey(mode, language);
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.warn('Failed to load user phrases:', error);
        return [];
    }
};

/**
 * Save user-added phrases for a specific mode and language
 */
export const saveUserPhrases = async (
    mode: Mode, 
    language: Language, 
    phrases: UserPhrase[]
): Promise<void> => {
    try {
        const key = getUserPhrasesKey(mode, language);
        await AsyncStorage.setItem(key, JSON.stringify(phrases));
    } catch (error) {
        console.warn('Failed to save user phrases:', error);
        throw error;
    }
};

/**
 * Add a new user phrase
 */
export const addUserPhrase = async (
    mode: Mode,
    language: Language,
    text: string,
    subphrase?: string
): Promise<UserPhrase> => {
    const newPhrase: UserPhrase = {
        id: generatePhraseId(),
        text,
        subphrase,
    };

    const existingPhrases = await getUserPhrases(mode, language);
    const updatedPhrases = [...existingPhrases, newPhrase];
    await saveUserPhrases(mode, language, updatedPhrases);

    return newPhrase;
};

/**
 * Remove a user phrase by ID
 */
export const removeUserPhrase = async (
    mode: Mode,
    language: Language,
    phraseId: string
): Promise<void> => {
    const existingPhrases = await getUserPhrases(mode, language);
    const updatedPhrases = existingPhrases.filter(p => p.id !== phraseId);
    await saveUserPhrases(mode, language, updatedPhrases);
};

/**
 * Get hidden built-in phrase IDs for a specific mode and language
 */
export const getHiddenPhrases = async (mode: Mode, language: Language): Promise<string[]> => {
    try {
        const key = getHiddenPhrasesKey(mode, language);
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.warn('Failed to load hidden phrases:', error);
        return [];
    }
};

/**
 * Save hidden built-in phrase IDs
 */
export const saveHiddenPhrases = async (
    mode: Mode,
    language: Language,
    hiddenIds: string[]
): Promise<void> => {
    try {
        const key = getHiddenPhrasesKey(mode, language);
        await AsyncStorage.setItem(key, JSON.stringify(hiddenIds));
    } catch (error) {
        console.warn('Failed to save hidden phrases:', error);
        throw error;
    }
};

/**
 * Hide a built-in phrase
 */
export const hideBuiltInPhrase = async (
    mode: Mode,
    language: Language,
    phraseId: string
): Promise<void> => {
    const hiddenPhrases = await getHiddenPhrases(mode, language);
    if (!hiddenPhrases.includes(phraseId)) {
        await saveHiddenPhrases(mode, language, [...hiddenPhrases, phraseId]);
    }
};

/**
 * Unhide a built-in phrase
 */
export const unhideBuiltInPhrase = async (
    mode: Mode,
    language: Language,
    phraseId: string
): Promise<void> => {
    const hiddenPhrases = await getHiddenPhrases(mode, language);
    const updatedPhrases = hiddenPhrases.filter(id => id !== phraseId);
    await saveHiddenPhrases(mode, language, updatedPhrases);
};

/**
 * Get all active phrases (built-in + user, excluding hidden)
 */
export const getActivePhrases = async (
    mode: Mode,
    language: Language,
    builtInPhrases: Phrase[]
): Promise<Phrase[]> => {
    const [userPhrases, hiddenIds] = await Promise.all([
        getUserPhrases(mode, language),
        getHiddenPhrases(mode, language),
    ]);

    // Filter out hidden built-in phrases
    const visibleBuiltInPhrases = builtInPhrases.filter(
        phrase => !hiddenIds.includes(phrase.id)
    );

    // Combine built-in and user phrases
    return [...visibleBuiltInPhrases, ...userPhrases];
};

// ============================================
// Mode Visibility Storage
// ============================================

/**
 * All available modes
 */
export const ALL_MODES: Mode[] = ['panic', 'anxiety', 'sadness', 'anger', 'grounding'];

/**
 * Storage key for hidden modes (not language-specific)
 */
const HIDDEN_MODES_KEY = 'hidden_modes';

/**
 * Default hidden modes for new users
 */
const DEFAULT_HIDDEN_MODES: Mode[] = ['sadness'];

/**
 * Get hidden mode IDs
 */
export const getHiddenModes = async (): Promise<Mode[]> => {
    try {
        const data = await AsyncStorage.getItem(HIDDEN_MODES_KEY);
        return data ? JSON.parse(data) : DEFAULT_HIDDEN_MODES;
    } catch (error) {
        console.warn('Failed to load hidden modes:', error);
        return DEFAULT_HIDDEN_MODES;
    }
};

/**
 * Save hidden mode IDs
 */
export const saveHiddenModes = async (hiddenModes: Mode[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(HIDDEN_MODES_KEY, JSON.stringify(hiddenModes));
    } catch (error) {
        console.warn('Failed to save hidden modes:', error);
        throw error;
    }
};

/**
 * Hide a mode
 */
export const hideMode = async (mode: Mode): Promise<void> => {
    const hiddenModes = await getHiddenModes();
    if (!hiddenModes.includes(mode)) {
        await saveHiddenModes([...hiddenModes, mode]);
    }
};

/**
 * Unhide a mode
 */
export const unhideMode = async (mode: Mode): Promise<void> => {
    const hiddenModes = await getHiddenModes();
    const updatedModes = hiddenModes.filter(m => m !== mode);
    await saveHiddenModes(updatedModes);
};

/**
 * Get all visible modes (excluding hidden)
 */
export const getVisibleModes = async (): Promise<Mode[]> => {
    const hiddenModes = await getHiddenModes();
    return ALL_MODES.filter(mode => !hiddenModes.includes(mode));
};

// ============================================
// Navigation Hint Storage
// ============================================

const NAVIGATION_HINT_KEY = '@anchor_has_seen_nav_hint';

/**
 * Check if the user has seen the navigation hint
 */
export const hasSeenNavigationHint = async (): Promise<boolean> => {
    try {
        const value = await AsyncStorage.getItem(NAVIGATION_HINT_KEY);
        return value === 'true';
    } catch (error) {
        console.warn('Failed to check navigation hint status:', error);
        return false;
    }
};

/**
 * Mark the navigation hint as seen
 */
export const markNavigationHintSeen = async (): Promise<void> => {
    try {
        await AsyncStorage.setItem(NAVIGATION_HINT_KEY, 'true');
    } catch (error) {
        console.warn('Failed to mark navigation hint as seen:', error);
    }
};

// ============================================
// Reset to Defaults
// ============================================

const ALL_LANGUAGES: Language[] = ['en', 'es', 'pt'];

/**
 * Reset all phrase and mode customizations to defaults
 * - Removes all user-added phrases
 * - Unhides all hidden phrases
 * - Resets hidden modes to default (sadness hidden)
 */
export const resetAllToDefaults = async (): Promise<void> => {
    try {
        const keysToRemove: string[] = [];

        // Collect all user phrases and hidden phrases keys for all mode/language combinations
        for (const mode of ALL_MODES) {
            for (const language of ALL_LANGUAGES) {
                keysToRemove.push(getUserPhrasesKey(mode, language));
                keysToRemove.push(getHiddenPhrasesKey(mode, language));
            }
        }

        // Remove all phrase-related keys
        await AsyncStorage.multiRemove(keysToRemove);

        // Reset hidden modes to default by removing the key
        // (getHiddenModes will return DEFAULT_HIDDEN_MODES when no data exists)
        await AsyncStorage.removeItem(HIDDEN_MODES_KEY);

        // Reset navigation hint so it shows again
        await AsyncStorage.removeItem(NAVIGATION_HINT_KEY);
    } catch (error) {
        console.warn('Failed to reset to defaults:', error);
        throw error;
    }
};

