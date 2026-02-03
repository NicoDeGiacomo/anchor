import AsyncStorage from '@react-native-async-storage/async-storage';

// Built-in mode type (the 5 predefined modes)
export type BuiltInMode = 'panic' | 'anxiety' | 'sadness' | 'anger' | 'grounding';

// Mode can be either a built-in mode or a custom mode ID (string)
export type Mode = BuiltInMode | string;

export type Language = 'en' | 'es' | 'pt';

export interface Phrase {
    id: string;
    text: string;
    subphrase?: string;
}

export interface UserPhrase extends Phrase {
    // User phrases use the same structure as built-in phrases
}

// Custom mode interface
export interface CustomMode {
    id: string;           // Unique ID (e.g., "custom_1706123456789")
    name: string;         // User-defined display name
    createdAt: number;    // Timestamp for ordering
}

// Storage keys
const getUserPhrasesKey = (mode: string, language: Language) => 
    `user_phrases:${mode}:${language}`;

const getHiddenPhrasesKey = (mode: string, language: Language) => 
    `hidden_phrases:${mode}:${language}`;

const CUSTOM_MODES_KEY = 'custom_modes';

/**
 * Generate a unique ID for a user phrase
 */
export const generatePhraseId = (): string => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get user-added phrases for a specific mode and language
 */
export const getUserPhrases = async (mode: string, language: Language): Promise<UserPhrase[]> => {
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
    mode: string, 
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
    mode: string,
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
    mode: string,
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
export const getHiddenPhrases = async (mode: string, language: Language): Promise<string[]> => {
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
    mode: string,
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
    mode: string,
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
    mode: string,
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
    mode: string,
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
 * All built-in modes (the 5 predefined modes)
 */
export const BUILT_IN_MODES: BuiltInMode[] = ['panic', 'anxiety', 'sadness', 'anger', 'grounding'];

/**
 * Check if a mode ID is a built-in mode
 */
export const isBuiltInMode = (mode: string): mode is BuiltInMode => {
    return BUILT_IN_MODES.includes(mode as BuiltInMode);
};

/**
 * Storage key for hidden modes (not language-specific)
 */
const HIDDEN_MODES_KEY = 'hidden_modes';

/**
 * Default hidden modes for new users
 */
const DEFAULT_HIDDEN_MODES: string[] = ['sadness'];

/**
 * Get hidden mode IDs (includes both built-in and custom modes)
 */
export const getHiddenModes = async (): Promise<string[]> => {
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
export const saveHiddenModes = async (hiddenModes: string[]): Promise<void> => {
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
export const hideMode = async (mode: string): Promise<void> => {
    const hiddenModes = await getHiddenModes();
    if (!hiddenModes.includes(mode)) {
        await saveHiddenModes([...hiddenModes, mode]);
    }
};

/**
 * Unhide a mode
 */
export const unhideMode = async (mode: string): Promise<void> => {
    const hiddenModes = await getHiddenModes();
    const updatedModes = hiddenModes.filter(m => m !== mode);
    await saveHiddenModes(updatedModes);
};

/**
 * Get all visible built-in modes (excluding hidden)
 */
export const getVisibleModes = async (): Promise<BuiltInMode[]> => {
    const hiddenModes = await getHiddenModes();
    return BUILT_IN_MODES.filter(mode => !hiddenModes.includes(mode));
};

// ============================================
// Custom Mode Storage
// ============================================

/**
 * Generate a unique ID for a custom mode
 */
export const generateCustomModeId = (): string => {
    return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get all custom modes
 */
export const getCustomModes = async (): Promise<CustomMode[]> => {
    try {
        const data = await AsyncStorage.getItem(CUSTOM_MODES_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.warn('Failed to load custom modes:', error);
        return [];
    }
};

/**
 * Save all custom modes
 */
const saveCustomModes = async (modes: CustomMode[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(CUSTOM_MODES_KEY, JSON.stringify(modes));
    } catch (error) {
        console.warn('Failed to save custom modes:', error);
        throw error;
    }
};

/**
 * Add a new custom mode
 */
export const addCustomMode = async (name: string): Promise<CustomMode> => {
    const newMode: CustomMode = {
        id: generateCustomModeId(),
        name,
        createdAt: Date.now(),
    };

    const existingModes = await getCustomModes();
    await saveCustomModes([...existingModes, newMode]);

    return newMode;
};

/**
 * Update a custom mode's name
 */
export const updateCustomMode = async (id: string, name: string): Promise<void> => {
    const modes = await getCustomModes();
    const updatedModes = modes.map(mode => 
        mode.id === id ? { ...mode, name } : mode
    );
    await saveCustomModes(updatedModes);
};

/**
 * Delete a custom mode and all its associated data
 */
export const deleteCustomMode = async (id: string): Promise<void> => {
    // Remove the mode from custom modes list
    const modes = await getCustomModes();
    const updatedModes = modes.filter(mode => mode.id !== id);
    await saveCustomModes(updatedModes);

    // Remove the mode from hidden modes if present
    const hiddenModes = await getHiddenModes();
    if (hiddenModes.includes(id)) {
        await saveHiddenModes(hiddenModes.filter(m => m !== id));
    }

    // Remove all phrases for this custom mode (all languages)
    const ALL_LANGUAGES: Language[] = ['en', 'es', 'pt'];
    const keysToRemove: string[] = [];
    for (const language of ALL_LANGUAGES) {
        keysToRemove.push(getUserPhrasesKey(id, language));
        keysToRemove.push(getHiddenPhrasesKey(id, language));
    }
    await AsyncStorage.multiRemove(keysToRemove);
};

/**
 * Get a custom mode by ID
 */
export const getCustomModeById = async (id: string): Promise<CustomMode | null> => {
    const modes = await getCustomModes();
    return modes.find(mode => mode.id === id) || null;
};

/**
 * Get all visible custom modes (excluding hidden)
 */
export const getVisibleCustomModes = async (): Promise<CustomMode[]> => {
    const [customModes, hiddenModes] = await Promise.all([
        getCustomModes(),
        getHiddenModes(),
    ]);
    return customModes.filter(mode => !hiddenModes.includes(mode.id));
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
 * - Removes all user-added phrases (for built-in and custom modes)
 * - Unhides all hidden phrases
 * - Resets hidden modes to default (sadness hidden)
 * - Removes all custom modes
 */
export const resetAllToDefaults = async (): Promise<void> => {
    try {
        const keysToRemove: string[] = [];

        // Collect all user phrases and hidden phrases keys for built-in modes
        for (const mode of BUILT_IN_MODES) {
            for (const language of ALL_LANGUAGES) {
                keysToRemove.push(getUserPhrasesKey(mode, language));
                keysToRemove.push(getHiddenPhrasesKey(mode, language));
            }
        }

        // Also collect keys for any custom modes
        const customModes = await getCustomModes();
        for (const mode of customModes) {
            for (const language of ALL_LANGUAGES) {
                keysToRemove.push(getUserPhrasesKey(mode.id, language));
                keysToRemove.push(getHiddenPhrasesKey(mode.id, language));
            }
        }

        // Remove all phrase-related keys
        await AsyncStorage.multiRemove(keysToRemove);

        // Reset hidden modes to default by removing the key
        // (getHiddenModes will return DEFAULT_HIDDEN_MODES when no data exists)
        await AsyncStorage.removeItem(HIDDEN_MODES_KEY);

        // Remove all custom modes
        await AsyncStorage.removeItem(CUSTOM_MODES_KEY);

        // Reset navigation hint so it shows again
        await AsyncStorage.removeItem(NAVIGATION_HINT_KEY);
    } catch (error) {
        console.warn('Failed to reset to defaults:', error);
        throw error;
    }
};

