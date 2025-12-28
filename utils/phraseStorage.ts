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

