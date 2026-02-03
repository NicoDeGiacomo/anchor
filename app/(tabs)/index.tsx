import { useFocusEffect } from '@react-navigation/native';
import { Link } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';

import PressableFeedback from '@/components/PressableFeedback';
import { Text, View } from '@/components/Themed';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColor } from '@/hooks/useColor';
import { DisplayMode, getModeId, isCustomMode, useModes } from '@/hooks/useModes';
import { BuiltInMode } from '@/utils/phraseStorage';

const TRANSLATIONS = {
  en: {
    title: 'Anchor',
    panic: 'Panic',
    anxiety: 'Anxiety',
    sadness: 'Sadness',
    anger: 'Anger',
    grounding: 'Grounding',
    settingsButton: 'Settings',
    aboutButton: 'About',
  },
  es: {
    title: 'Anchor',
    panic: 'Pánico',
    anxiety: 'Ansiedad',
    sadness: 'Tristeza',
    anger: 'Ira',
    grounding: 'Grounding',
    settingsButton: 'Configuración',
    aboutButton: 'Acerca de',
  },
  pt: {
    title: 'Anchor',
    panic: 'Pânico',
    anxiety: 'Ansiedade',
    sadness: 'Tristeza',
    anger: 'Raiva',
    grounding: 'Grounding',
    settingsButton: 'Configurações',
    aboutButton: 'Sobre',
  },
};

export default function MainScreen() {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language];
  const borderColor = useColor('border');
  const { modes, refetch } = useModes();

  // Refetch modes when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const modeButtonStyle = useMemo(() => ({
    ...styles.modeButton,
    borderColor,
  }), [borderColor]);

  const secondaryButtonStyle = useMemo(() => ({
    ...styles.secondaryButton,
    borderColor,
  }), [borderColor]);

  // Helper to get mode label (translated for built-in, custom name for custom)
  const getModeLabel = useCallback((mode: DisplayMode): string => {
    if (isCustomMode(mode)) {
      return mode.name;
    }
    return t[mode as BuiltInMode];
  }, [t]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.title}</Text>

      <View style={styles.buttonContainer}>
        <View style={styles.modeButtons}>
          {modes.map((mode) => {
            const modeId = getModeId(mode);
            return (
              <Link href={`/mode/${modeId}`} asChild key={modeId}>
                <PressableFeedback style={modeButtonStyle}>
                  <Text style={styles.modeButtonText}>{getModeLabel(mode)}</Text>
                </PressableFeedback>
              </Link>
            );
          })}
        </View>

        <View style={styles.secondaryButtons}>
          <Link href="/settings" asChild>
            <PressableFeedback style={secondaryButtonStyle}>
              <Text style={styles.secondaryButtonText}>{t.settingsButton}</Text>
            </PressableFeedback>
          </Link>

          <Link href="/about" asChild>
            <PressableFeedback style={secondaryButtonStyle}>
              <Text style={styles.secondaryButtonText}>{t.aboutButton}</Text>
            </PressableFeedback>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    marginBottom: 60,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 32,
  },
  modeButtons: {
    gap: 16,
  },
  modeButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 18,
    fontWeight: '300',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    opacity: 0.7,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '300',
  },
});
