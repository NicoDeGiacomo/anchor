import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
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

    // Get phrases for current language, fallback to English if missing
    const phrases = PHRASES_BY_LANGUAGE[language] || PHRASES_BY_LANGUAGE.en;

    // Advance to next phrase with looping
    const nextPhrase = () => {
        setCurrentIndex((prev) => (prev + 1) % phrases.length);
    };

    // Handle scroll event to advance phrase
    const handleScroll = () => {
        nextPhrase();
    };

    // Add keyboard support for web browsers
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            nextPhrase();
        };

        // Only add keyboard listener on web
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', handleKeyPress);
            return () => {
                window.removeEventListener('keydown', handleKeyPress);
            };
        }
    }, [phrases.length]); // Re-attach when phrases change

    return (
        <View style={styles.container}>
            {/* Back arrow to main menu */}
            <Pressable
                style={styles.backButton}
                onPress={() => router.push('/')}
                hitSlop={20}
            >
                <Ionicons name="chevron-back" size={28} color="#666" />
            </Pressable>

            {/* Scrollable wrapper for scroll-to-advance */}
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={400}
            >
                {/* Tap-to-advance wrapper */}
                <Pressable style={styles.phraseWrapper} onPress={nextPhrase}>
                    <Text style={styles.phraseText}>
                        {phrases[currentIndex].text}
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 10,
        padding: 8,
    },
    scrollContainer: {
        flexGrow: 1,
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
});
