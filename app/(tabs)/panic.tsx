import { ScrollView, StyleSheet } from 'react-native';

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

    // Get phrases for current language, fallback to English if missing
    const phrases = PHRASES_BY_LANGUAGE[language] || PHRASES_BY_LANGUAGE.en;

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {phrases.map((phrase) => (
                    <View key={phrase.id} style={styles.phraseContainer}>
                        <Text style={styles.phraseText}>{phrase.text}</Text>
                    </View>
                ))}
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
        gap: 48,
    },
    phraseContainer: {
        paddingVertical: 24,
    },
    phraseText: {
        fontSize: 26,
        fontWeight: '300',
        lineHeight: 36,
        textAlign: 'center',
    },
});
