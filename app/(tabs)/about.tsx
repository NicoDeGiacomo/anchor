import { ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useLanguage } from '@/contexts/LanguageContext';

const TRANSLATIONS = {
    en: {
        description: 'Anchor is a simple app with gentle reminders for overwhelming moments.',
        disclaimerTitle: 'Disclaimer',
        disclaimer1: 'This app does not provide medical advice, diagnosis, or treatment.',
        disclaimer2: 'Not a substitute for professional care.',
        disclaimer3: 'If you are in immediate danger, contact local emergency services.',
    },
    es: {
        description: 'Anchor es una aplicación simple con recordatorios suaves para momentos abrumadores.',
        disclaimerTitle: 'Descargo de responsabilidad',
        disclaimer1: 'Esta aplicación no proporciona consejos médicos, diagnósticos ni tratamientos.',
        disclaimer2: 'No sustituye la atención profesional.',
        disclaimer3: 'Si está en peligro inmediato, comuníquese con los servicios de emergencia locales.',
    },
    pt: {
        description: 'Anchor é um aplicativo simples com lembretes suaves para momentos difíceis.',
        disclaimerTitle: 'Aviso legal',
        disclaimer1: 'Este aplicativo não fornece aconselhamento médico, diagnóstico ou tratamento.',
        disclaimer2: 'Não substitui cuidados profissionais.',
        disclaimer3: 'Se você estiver em perigo imediato, entre em contato com os serviços de emergência locais.',
    },
};

export default function AboutScreen() {
    const { language } = useLanguage();
    const t = TRANSLATIONS[language];

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.description}>
                    {t.description}
                </Text>

                <View style={styles.disclaimerSection}>
                    <Text style={styles.disclaimerTitle}>{t.disclaimerTitle}</Text>

                    <Text style={styles.disclaimerText}>
                        {t.disclaimer1}
                    </Text>

                    <Text style={styles.disclaimerText}>
                        {t.disclaimer2}
                    </Text>

                    <Text style={styles.disclaimerText}>
                        {t.disclaimer3}
                    </Text>
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
    description: {
        fontSize: 20,
        fontWeight: '300',
        lineHeight: 30,
        marginBottom: 48,
    },
    disclaimerSection: {
        gap: 16,
    },
    disclaimerTitle: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 8,
    },
    disclaimerText: {
        fontSize: 16,
        fontWeight: '300',
        lineHeight: 24,
        opacity: 0.8,
    },
});
