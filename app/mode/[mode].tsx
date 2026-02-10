import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, View } from '@/components/Themed';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColor } from '@/hooks/useColor';
import { usePhrases } from '@/hooks/usePhrases';
import { hasSeenNavigationHint, markNavigationHintSeen, Phrase } from '@/utils/phraseStorage';

const FALLBACK_TRANSLATIONS = {
    en: {
        noContent: 'No phrases available for this mode.',
        notAvailable: 'Content not yet available in this language.',
        error: 'Something went wrong. Please try again.',
        tapHint: 'tap anywhere to continue',
        feelingBetter: "I'm feeling better",
    },
    es: {
        noContent: 'No hay frases disponibles para este modo.',
        notAvailable: 'Contenido aún no disponible en este idioma.',
        error: 'Algo salió mal. Por favor, inténtelo de nuevo.',
        tapHint: 'toca en cualquier lugar para continuar',
        feelingBetter: 'Me siento mejor',
    },
    pt: {
        noContent: 'Nenhuma frase disponível para este modo.',
        notAvailable: 'Conteúdo ainda não disponível neste idioma.',
        error: 'Algo deu errado. Por favor, tente novamente.',
        tapHint: 'toque em qualquer lugar para continuar',
        feelingBetter: 'Estou me sentindo melhor',
    },
};

type PhaseState = 'looping' | 'reinforcement';

export default function ModeScreen() {
    const { mode } = useLocalSearchParams<{ mode: string }>();
    const { language } = useLanguage();
    const insets = useSafeAreaInsets();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [phase, setPhase] = useState<PhaseState>('looping');
    const [showHint, setShowHint] = useState(false);
    const hintOpacity = useSharedValue(1);
    const secondaryTextColor = useColor('textSecondary');
    const iconColor = useColor('icon');

    // Accept any non-empty mode string (built-in or custom mode ID)
    const validMode = mode || 'panic';

    // Load phrases using custom hook (now returns phased data)
    const { phrases, isLoading, error } = usePhrases(validMode);

    // Build the looping array (preparation + confrontation)
    const loopingPhrases = useMemo<Phrase[]>(() => 
        [...phrases.preparation, ...phrases.confrontation],
        [phrases.preparation, phrases.confrontation]
    );

    const reinforcementPhrases = phrases.reinforcement;

    // The currently active list depends on the phase
    const activePhrases = phase === 'looping' ? loopingPhrases : reinforcementPhrases;

    const hasContent = loopingPhrases.length > 0 || reinforcementPhrases.length > 0;

    // Check if user has seen the navigation hint
    useEffect(() => {
        hasSeenNavigationHint().then((hasSeen) => {
            if (!hasSeen) {
                setShowHint(true);
            }
        });
    }, []);

    // Reset index and phase when mode or language changes
    useEffect(() => {
        setCurrentIndex(0);
        setPhase('looping');
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

    // Handle "I'm feeling better" button press
    const handleFeelingBetter = useCallback(() => {
        setPhase('reinforcement');
        setCurrentIndex(0);
    }, []);

    // Advance to next phrase with looping (for looping phase) or navigate back (for reinforcement)
    const nextPhrase = useCallback(() => {
        if (phase === 'reinforcement') {
            // In reinforcement phase, advance through phrases then go home
            if (currentIndex >= reinforcementPhrases.length - 1) {
                router.back();
                return;
            }
            setCurrentIndex(prev => prev + 1);
        } else {
            // In looping phase, cycle through preparation + confrontation
            if (loopingPhrases.length > 0) {
                setCurrentIndex(prev => (prev + 1) % loopingPhrases.length);
            }
        }
        // Hide hint on first tap
        hideHint();
    }, [phase, currentIndex, reinforcementPhrases.length, loopingPhrases.length, hideHint]);

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
    if (isLoading || error || !hasContent) {
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

    const currentPhrase = activePhrases[currentIndex] || activePhrases[0];
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

            {/* "I'm feeling better" button - only visible during looping phase */}
            {phase === 'looping' ? (
                <TouchableOpacity
                    onPress={handleFeelingBetter}
                    hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
                    style={[styles.feelingBetterButton, { top: insets.top + 16 }]}
                    activeOpacity={0.6}
                >
                    <Text style={[styles.feelingBetterText, { color: secondaryTextColor }]}>
                        {fallback.feelingBetter}
                    </Text>
                </TouchableOpacity>
            ) : null}

            {/* Tap-to-advance wrapper */}
            {currentPhrase ? (
                <Pressable style={styles.phraseWrapper} onPress={nextPhrase}>
                    <Text style={styles.phraseText}>
                        {currentPhrase.text}
                    </Text>
                    {currentPhrase.subphrase ? (
                        <Text style={[styles.subphraseText, { color: secondaryTextColor }]}>
                            {currentPhrase.subphrase}
                        </Text>
                    ) : null}
                </Pressable>
            ) : null}

            {/* Navigation hint - shown only on first use */}
            {showHint ? (
                <Animated.View style={[styles.hintContainer, { bottom: insets.bottom + 32 }, hintAnimatedStyle]}>
                    <Text style={[styles.hintText, { color: secondaryTextColor }]}>
                        {fallback.tapHint}
                    </Text>
                </Animated.View>
            ) : null}
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
    feelingBetterButton: {
        position: 'absolute',
        right: 16,
        zIndex: 1,
    },
    feelingBetterText: {
        fontSize: 14,
        fontWeight: '300',
        opacity: 0.6,
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
