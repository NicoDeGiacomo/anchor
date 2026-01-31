import { Link } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import PressableFeedback from '@/components/PressableFeedback';
import { Text, View } from '@/components/Themed';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useColors } from '@/hooks/useColor';

const LANGUAGES = [
    { code: 'en' as const, name: 'English' },
    { code: 'es' as const, name: 'Español' },
    { code: 'pt' as const, name: 'Português' },
];

const THEMES = [
    { mode: 'auto' as const, nameKey: 'auto' },
    { mode: 'light' as const, nameKey: 'light' },
    { mode: 'dark' as const, nameKey: 'dark' },
];

const TRANSLATIONS = {
    en: {
        title: 'Settings',
        languageSection: 'Language',
        themeSection: 'Theme',
        themeAuto: 'Auto (System)',
        themeLight: 'Light',
        themeDark: 'Dark',
        phrasesSection: 'Customize phrases',
        phrasesDescription: 'Add, remove, or hide phrases for each mode',
        panic: 'Panic',
        anxiety: 'Anxiety',
        sadness: 'Sadness',
        anger: 'Anger',
        grounding: 'Grounding',
    },
    es: {
        title: 'Configuración',
        languageSection: 'Idioma',
        themeSection: 'Tema',
        themeAuto: 'Automático (Sistema)',
        themeLight: 'Claro',
        themeDark: 'Oscuro',
        phrasesSection: 'Personalizar frases',
        phrasesDescription: 'Agregar, eliminar u ocultar frases para cada modo',
        panic: 'Pánico',
        anxiety: 'Ansiedad',
        sadness: 'Tristeza',
        anger: 'Ira',
        grounding: 'Conexión',
    },
    pt: {
        title: 'Configurações',
        languageSection: 'Idioma',
        themeSection: 'Tema',
        themeAuto: 'Automático (Sistema)',
        themeLight: 'Claro',
        themeDark: 'Escuro',
        phrasesSection: 'Personalizar frases',
        phrasesDescription: 'Adicionar, excluir ou ocultar frases para cada modo',
        panic: 'Pânico',
        anxiety: 'Ansiedade',
        sadness: 'Tristeza',
        anger: 'Raiva',
        grounding: 'Aterramento',
    },
};

export default function SettingsScreen() {
    const { language, setLanguage } = useLanguage();
    const { themeMode, setThemeMode } = useTheme();
    const t = TRANSLATIONS[language];
    const { border: borderColor, borderSelected: borderSelectedColor } = useColors('border', 'borderSelected');

    const getThemeName = (themeKey: string) => {
        switch (themeKey) {
            case 'auto':
                return t.themeAuto;
            case 'light':
                return t.themeLight;
            case 'dark':
                return t.themeDark;
            default:
                return themeKey;
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>{t.themeSection}</Text>

                <View style={styles.optionList}>
                    {THEMES.map((theme) => {
                        const isSelected = themeMode === theme.mode;
                        return (
                            <PressableFeedback
                                key={theme.mode}
                                style={{
                                    ...styles.optionItem,
                                    borderColor: isSelected ? borderSelectedColor : borderColor,
                                    ...(isSelected && styles.optionItemSelected),
                                }}
                                onPress={() => setThemeMode(theme.mode)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        isSelected && styles.optionTextSelected,
                                    ]}
                                >
                                    {getThemeName(theme.nameKey)}
                                </Text>
                            </PressableFeedback>
                        );
                    })}
                </View>

                <Text style={[styles.sectionTitle, styles.sectionSpacing]}>{t.languageSection}</Text>

                <View style={styles.optionList}>
                    {LANGUAGES.map((lang) => {
                        const isSelected = language === lang.code;
                        return (
                            <PressableFeedback
                                key={lang.code}
                                style={{
                                    ...styles.optionItem,
                                    borderColor: isSelected ? borderSelectedColor : borderColor,
                                    ...(isSelected && styles.optionItemSelected),
                                }}
                                onPress={() => setLanguage(lang.code)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        isSelected && styles.optionTextSelected,
                                    ]}
                                >
                                    {lang.name}
                                </Text>
                            </PressableFeedback>
                        );
                    })}
                </View>

                <Text style={[styles.sectionTitle, styles.sectionSpacing]}>{t.phrasesSection}</Text>
                <Text style={styles.sectionDescription}>{t.phrasesDescription}</Text>

                <View style={styles.optionList}>
                    <Link href="/edit-phrases/panic" asChild>
                        <PressableFeedback style={{...styles.optionItem, borderColor}}>
                            <Text style={styles.optionText}>{t.panic}</Text>
                        </PressableFeedback>
                    </Link>
                    <Link href="/edit-phrases/anxiety" asChild>
                        <PressableFeedback style={{...styles.optionItem, borderColor}}>
                            <Text style={styles.optionText}>{t.anxiety}</Text>
                        </PressableFeedback>
                    </Link>
                    <Link href="/edit-phrases/sadness" asChild>
                        <PressableFeedback style={{...styles.optionItem, borderColor}}>
                            <Text style={styles.optionText}>{t.sadness}</Text>
                        </PressableFeedback>
                    </Link>
                    <Link href="/edit-phrases/anger" asChild>
                        <PressableFeedback style={{...styles.optionItem, borderColor}}>
                            <Text style={styles.optionText}>{t.anger}</Text>
                        </PressableFeedback>
                    </Link>
                    <Link href="/edit-phrases/grounding" asChild>
                        <PressableFeedback style={{...styles.optionItem, borderColor}}>
                            <Text style={styles.optionText}>{t.grounding}</Text>
                        </PressableFeedback>
                    </Link>
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
    sectionSpacing: {
        marginTop: 32,
    },
    sectionDescription: {
        fontSize: 14,
        fontWeight: '300',
        opacity: 0.7,
        marginBottom: 12,
        marginTop: -8,
    },
    optionList: {
        gap: 12,
    },
    optionItem: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
    },
    optionItemSelected: {
        borderWidth: 2,
    },
    optionText: {
        fontSize: 18,
        fontWeight: '300',
    },
    optionTextSelected: {
        fontWeight: '400',
    },
});
