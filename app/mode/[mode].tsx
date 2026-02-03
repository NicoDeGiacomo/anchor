import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, View } from '@/components/Themed';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColor } from '@/hooks/useColor';
import { usePhrases } from '@/hooks/usePhrases';
import { Mode, hasSeenNavigationHint, markNavigationHintSeen } from '@/utils/phraseStorage';

const FALLBACK_TRANSLATIONS = {
    en: {
        noContent: 'No phrases available for this mode.',
        notAvailable: 'Content not yet available in this language.',
        error: 'Something went wrong. Please try again.',
        tapHint: 'tap anywhere to continue',
    },
    es: {
        noContent: 'No hay frases disponibles para este modo.',
        notAvailable: 'Contenido aún no disponible en este idioma.',
        error: 'Algo salió mal. Por favor, inténtelo de nuevo.',
        tapHint: 'toca en cualquier lugar para continuar',
    },
    pt: {
        noContent: 'Nenhuma frase disponível para este modo.',
        notAvailable: 'Conteúdo ainda não disponível neste idioma.',
        error: 'Algo deu errado. Por favor, tente novamente.',
        tapHint: 'toque em qualquer lugar para continuar',
    },
};

export default function ModeScreen() {
    const { mode } = useLocalSearchParams<{ mode: string }>();
    const { language } = useLanguage();
    const insets = useSafeAreaInsets();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const hintOpacity = useSharedValue(1);
    const secondaryTextColor = useColor('textSecondary');
    const iconColor = useColor('icon');

    // Validate mode parameter
    const validMode = (mode && ['panic', 'anxiety', 'sadness', 'anger', 'grounding'].includes(mode)) 
        ? mode as Mode 
        : 'panic';

    // Load phrases using custom hook
    const { phrases, isLoading, error } = usePhrases(validMode);

    // Check if user has seen the navigation hint
    useEffect(() => {
        hasSeenNavigationHint().then((hasSeen) => {
            if (!hasSeen) {
                setShowHint(true);
            }
        });
    }, []);

    // Reset index when mode or language changes
    useEffect(() => {
        setCurrentIndex(0);
    }, [mode, language]);

    // Hide hint with animation
    const hideHint = useCallback(() => {
        if (showHint) {
            hintOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
                if (finished) {
                    runOnJS(setShowHint)(false);
                    runOnJS(markNavigationHintSeen)();
                }
            });
        }
    }, [showHint, hintOpacity]);

    // Animated style for the hint
    const hintAnimatedStyle = useAnimatedStyle(() => ({
        opacity: hintOpacity.value,
    }));

    // Advance to next phrase with looping
    const nextPhrase = useCallback(() => {
        if (phrases.length > 0) {
            setCurrentIndex((prev) => (prev + 1) % phrases.length);
        }
        // Hide hint on first tap
        hideHint();
    }, [phrases.length, hideHint]);

    // Keep a ref to the latest nextPhrase to avoid stale closures in event listener
    const nextPhraseRef = useRef(nextPhrase);
    nextPhraseRef.current = nextPhrase;

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
                nextPhraseRef.current();
            }
        };

        // Only add keyboard listener on web
        if (Platform.OS === 'web') {
            window.addEventListener('keydown', handleKeyPress);
            return () => {
                window.removeEventListener('keydown', handleKeyPress);
            };
        }
    }, []); // No dependencies needed - uses ref for latest function

    // Show fallback if loading, error, or no phrases available
    if (isLoading || error || phrases.length === 0) {
        const fallback = FALLBACK_TRANSLATIONS[language];
        let message = '';
        if (isLoading) {
            message = '';
        } else if (error) {
            message = fallback.error;
        } else {
            message = fallback.notAvailable;
        }
        
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
                    style={[styles.backButton, { top: insets.top + 16 }]}
                    activeOpacity={0.6}
                >
                    <Ionicons name="chevron-back" size={24} color={iconColor} />
                </TouchableOpacity>
                <View style={styles.phraseWrapper}>
                    <Text style={[styles.phraseText, { opacity: 0.5 }]}>
                        {message}
                    </Text>
                </View>
            </View>
        );
    }

    const currentPhrase = phrases[currentIndex];
    const fallback = FALLBACK_TRANSLATIONS[language];

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => router.back()}
                hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
                style={[styles.backButton, { top: insets.top + 16 }]}
                activeOpacity={0.6}
            >
                <Ionicons name="chevron-back" size={24} color={iconColor} />
            </TouchableOpacity>
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
            {/* Navigation hint - shown only on first use */}
            {showHint && (
                <Animated.View style={[styles.hintContainer, { bottom: insets.bottom + 32 }, hintAnimatedStyle]}>
                    <Text style={[styles.hintText, { color: secondaryTextColor }]}>
                        {fallback.tapHint}
                    </Text>
                </Animated.View>
            )}
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
    backButton: {
        position: 'absolute',
        left: 16,
        zIndex: 1,
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
    hintContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    hintText: {
        fontSize: 14,
        fontWeight: '300',
        opacity: 0.7,
    },
});

