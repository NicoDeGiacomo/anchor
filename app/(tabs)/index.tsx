import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import PressableFeedback from '@/components/PressableFeedback';
import { Text, View } from '@/components/Themed';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColor } from '@/hooks/useColor';

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
    grounding: 'Conexión',
    settingsButton: 'Configuración',
    aboutButton: 'Acerca de',
  },
  pt: {
    title: 'Anchor',
    panic: 'Pânico',
    anxiety: 'Ansiedade',
    sadness: 'Tristeza',
    anger: 'Raiva',
    grounding: 'Aterramento',
    settingsButton: 'Configurações',
    aboutButton: 'Sobre',
  },
};

export default function MainScreen() {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language];
  const borderColor = useColor('border');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.title}</Text>

      <View style={styles.buttonContainer}>
        <View style={styles.modeButtons}>
          <Link href="/mode/panic" asChild>
            <PressableFeedback style={{...styles.modeButton, borderColor}}>
              <Text style={styles.modeButtonText}>{t.panic}</Text>
            </PressableFeedback>
          </Link>

          <Link href="/mode/anxiety" asChild>
            <PressableFeedback style={{...styles.modeButton, borderColor}}>
              <Text style={styles.modeButtonText}>{t.anxiety}</Text>
            </PressableFeedback>
          </Link>

          {/* <Link href="/mode/sadness" asChild>
            <PressableFeedback style={{...styles.modeButton, borderColor}}>
              <Text style={styles.modeButtonText}>{t.sadness}</Text>
            </PressableFeedback>
          </Link> */}

          <Link href="/mode/anger" asChild>
            <PressableFeedback style={{...styles.modeButton, borderColor}}>
              <Text style={styles.modeButtonText}>{t.anger}</Text>
            </PressableFeedback>
          </Link>

          <Link href="/mode/grounding" asChild>
            <PressableFeedback style={{...styles.modeButton, borderColor}}>
              <Text style={styles.modeButtonText}>{t.grounding}</Text>
            </PressableFeedback>
          </Link>
        </View>

        <View style={styles.secondaryButtons}>
          <Link href="/settings" asChild>
            <PressableFeedback style={{...styles.secondaryButton, borderColor}}>
              <Text style={styles.secondaryButtonText}>{t.settingsButton}</Text>
            </PressableFeedback>
          </Link>

          <Link href="/about" asChild>
            <PressableFeedback style={{...styles.secondaryButton, borderColor}}>
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
