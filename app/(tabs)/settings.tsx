import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useLanguage } from '@/contexts/LanguageContext';

const LANGUAGES = [
    { code: 'en' as const, name: 'English' },
    { code: 'es' as const, name: 'Español' },
    { code: 'pt' as const, name: 'Português' },
];

const TRANSLATIONS = {
    en: {
        title: 'Settings',
        languageSection: 'Language',
    },
    es: {
        title: 'Configuración',
        languageSection: 'Idioma',
    },
    pt: {
        title: 'Configurações',
        languageSection: 'Idioma',
    },
};

export default function SettingsScreen() {
    const { language, setLanguage } = useLanguage();
    const t = TRANSLATIONS[language];

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>{t.languageSection}</Text>

                <View style={styles.languageList}>
                    {LANGUAGES.map((lang) => (
                        <Pressable
                            key={lang.code}
                            style={[
                                styles.languageItem,
                                language === lang.code && styles.languageItemSelected,
                            ]}
                            onPress={() => setLanguage(lang.code)}
                        >
                            <Text
                                style={[
                                    styles.languageText,
                                    language === lang.code && styles.languageTextSelected,
                                ]}
                            >
                                {lang.name}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 16,
    },
    languageList: {
        gap: 12,
    },
    languageItem: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    languageItemSelected: {
        borderColor: '#666',
        borderWidth: 2,
    },
    languageText: {
        fontSize: 18,
        fontWeight: '300',
    },
    languageTextSelected: {
        fontWeight: '400',
    },
});
