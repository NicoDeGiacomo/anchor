import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';
import { useLanguage } from '@/contexts/LanguageContext';

// Import all language files
import phrasesEN from '@/content/anchors.en.json';
import phrasesES from '@/content/anchors.es.json';
import phrasesPT from '@/content/anchors.pt.json';

const PHRASES_BY_LANGUAGE = {
    en: phrasesEN,
    es: phrasesES,
    pt: phrasesPT,
};

export default function PanicScreen() {
    const { language } = useLanguage();
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const secondaryTextColor = useThemeColor({}, 'textSecondary' as any);

    // Get phrases for current language, fallback to English if missing
    const phrases = PHRASES_BY_LANGUAGE[language] || PHRASES_BY_LANGUAGE.en;

    // Advance to next phrase with looping
    const nextPhrase = () => {
        setCurrentIndex((prev) => (prev + 1) % phrases.length);
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
