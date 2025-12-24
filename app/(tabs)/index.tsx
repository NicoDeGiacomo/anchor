import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useLanguage } from '@/contexts/LanguageContext';

const TRANSLATIONS = {
  en: {
    title: 'Anchor',
    panicButton: 'Panic',
    settingsButton: 'Settings',
    aboutButton: 'About',
  },
  es: {
    title: 'Anchor',
    panicButton: 'Pánico',
    settingsButton: 'Configuración',
    aboutButton: 'Acerca de',
  },
  pt: {
    title: 'Anchor',
    panicButton: 'Pânico',
    settingsButton: 'Configurações',
    aboutButton: 'Sobre',
  },
};

export default function MainScreen() {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.title}</Text>

      <View style={styles.buttonContainer}>
        <Link href="/panic" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{t.panicButton}</Text>
          </Pressable>
        </Link>

        <View style={styles.secondaryButtons}>
          <Link href="/settings" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>{t.settingsButton}</Text>
            </Pressable>
          </Link>

          <Link href="/about" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>{t.aboutButton}</Text>
            </Pressable>
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
  primaryButton: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: '400',
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
    borderColor: '#ccc',
    alignItems: 'center',
    opacity: 0.7,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '300',
  },
});
