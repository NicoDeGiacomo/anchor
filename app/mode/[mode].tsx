import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';
import { useLanguage } from '@/contexts/LanguageContext';
import { getActivePhrases, Mode, Language, Phrase } from '@/utils/phraseStorage';

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

const FALLBACK_TRANSLATIONS = {
    en: {
        noContent: 'No phrases available for this mode.',
        notAvailable: 'Content not yet available in this language.',
    },
    es: {
        noContent: 'No hay frases disponibles para este modo.',
        notAvailable: 'Contenido aún no disponible en este idioma.',
    },
    pt: {
        noContent: 'Nenhuma frase disponível para este modo.',
        notAvailable: 'Conteúdo ainda não disponível neste idioma.',
    },
};

export default function ModeScreen() {
    const { mode } = useLocalSearchParams<{ mode: string }>();
    const { language } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [phrases, setPhrases] = useState<Phrase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const secondaryTextColor = useThemeColor({}, 'textSecondary' as any);

    // Validate mode parameter
    const validMode = (mode && ['panic', 'anxiety', 'sadness', 'anger', 'grounding'].includes(mode)) 
        ? mode as Mode 
        : 'panic';

    // Load phrases (built-in + user, excluding hidden)
    useEffect(() => {
        const loadPhrases = async () => {
            setIsLoading(true);
            try {
                // Get built-in phrases
                let builtInPhrases: Phrase[] = [];
                try {
                    builtInPhrases = PHRASES_MAP[validMode]?.[language] || [];
                    
                    // Fallback to English if current language has no content
                    if (builtInPhrases.length === 0 && language !== 'en') {
                        builtInPhrases = PHRASES_MAP[validMode]?.en || [];
                    }
                } catch (error) {
                    console.warn('Failed to load built-in phrases:', error);
                }

                // Get active phrases (built-in + user, excluding hidden)
                const activePhrases = await getActivePhrases(validMode, language, builtInPhrases);
                setPhrases(activePhrases);
            } catch (error) {
                console.warn('Failed to load phrases:', error);
                setPhrases([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadPhrases();
    }, [validMode, language]);

    // Reset index when mode or language changes
    useEffect(() => {
        setCurrentIndex(0);
    }, [mode, language]);

    // Advance to next phrase with looping
    const nextPhrase = () => {
        if (phrases.length > 0) {
            setCurrentIndex((prev) => (prev + 1) % phrases.length);
        }
    };

    // Add keyboard support for web browsers (specific keys only)
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            // Only advance on Space, Enter, or Arrow keys
            if (
                event.key === ' ' ||
                event.key === 'Enter' ||
                event.key === 'ArrowRight' ||
                event.key === 'ArrowDown'
            ) {
                event.preventDefault(); // Prevent default scrolling behavior
                nextPhrase();
            }
        };

        // Only add keyboard listener on web
        if (Platform.OS === 'web') {
            window.addEventListener('keydown', handleKeyPress);
            return () => {
                window.removeEventListener('keydown', handleKeyPress);
            };
        }
    }, [phrases.length]); // Re-attach when phrases change

    // Show fallback if loading or no phrases available
    if (isLoading || phrases.length === 0) {
        const fallback = FALLBACK_TRANSLATIONS[language];
        return (
            <View style={styles.container}>
                <View style={styles.phraseWrapper}>
                    <Text style={[styles.phraseText, { opacity: 0.5 }]}>
                        {isLoading ? '' : fallback.notAvailable}
                    </Text>
                </View>
            </View>
        );
    }

    const currentPhrase = phrases[currentIndex];

    return (
        <View style={styles.container}>
            {/* Tap-to-advance wrapper */}
            <Pressable style={styles.phraseWrapper} onPress={nextPhrase}>
                <Text style={styles.phraseText}>
                    {currentPhrase.text}
                </Text>
                {currentPhrase.subphrase && (
                    <Text style={[styles.subphraseText, { color: secondaryTextColor }]}>
                        {currentPhrase.subphrase}
                    </Text>
                )}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    phraseWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    phraseText: {
        fontSize: 28,
        fontWeight: '300',
        lineHeight: 40,
        textAlign: 'center',
    },
    subphraseText: {
        fontSize: 18,
        fontWeight: '300',
        lineHeight: 28,
        textAlign: 'center',
        marginTop: 16,
    },
});

