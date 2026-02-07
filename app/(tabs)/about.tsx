import { useCallback } from 'react';
import { Linking, ScrollView, StyleSheet } from 'react-native';

import { Logo } from '@/components/Logo';
import PressableFeedback from '@/components/PressableFeedback';
import { Text, View } from '@/components/Themed';
import { useLanguage } from '@/contexts/LanguageContext';

const TRANSLATIONS = {
    en: {
        title: 'Anchor',
        tagline: 'Gentle reminders for overwhelming moments',
        intentionTitle: 'Intention',
        intention: 'Anchor is a simple app with gentle reminders for overwhelming moments.\n\nI created it based on my own experience with anxiety and panic attacks, as a small, predictable tool to read when things feel too intense. The goal is not to fix anything — just to help you stay grounded until the moment passes.',
        evidenceTitle: 'Evidence-based',
        evidence: 'The grounding techniques and phrases in Anchor are rooted in established psychological practices. Our content has been reviewed by mental health professionals to ensure it follows evidence-based approaches.\n\nWe are committed to providing scientifically-validated methods you can trust.',
        importantTitle: 'Important note',
        important: 'This app does not provide medical, psychological, professional, diagnosis, or treatment.\nIt is not a substitute for professional care.\n\nIf you are in immediate danger or experiencing a crisis, please contact local emergency services or a trusted professional.',
        privacyTitle: 'Privacy',
        privacy: 'Anchor does not collect, store, or share any personal data.\nThere are no accounts, no tracking, no analytics, and no ads.\nEverything runs locally on your device.\n\nYour custom phrases are stored only on this device. No content is sent anywhere. If you uninstall the app, your custom phrases will be lost.',
        openSourceTitle: 'Open source',
        openSource: 'Anchor is fully open source.',
        github: 'GitHub',
        supportTitle: 'Support',
        support: 'If this app has been helpful and you want to support its development, you can do so here. This is completely optional.',
        kofi: 'Ko-fi',
        authorTitle: 'Author',
        linkedin: 'LinkedIn',
    },
    es: {
        title: 'Anchor',
        tagline: 'Recordatorios suaves para momentos abrumadores',
        intentionTitle: 'Intención',
        intention: 'Anchor es una aplicación simple con recordatorios suaves para momentos abrumadores.\n\nLa creé basándome en mi propia experiencia con la ansiedad y los ataques de pánico, como una pequeña herramienta predecible para leer cuando las cosas se sienten demasiado intensas. El objetivo no es arreglar nada, solo ayudarte a mantenerte conectado hasta que el momento pase.',
        evidenceTitle: 'Basado en evidencia',
        evidence: 'Las técnicas de anclaje y las frases en Anchor están basadas en prácticas psicológicas establecidas. Nuestro contenido ha sido revisado por profesionales de salud mental para asegurar que sigue enfoques basados en evidencia.\n\nNos comprometemos a proporcionar métodos científicamente validados en los que puedes confiar.',
        importantTitle: 'Nota importante',
        important: 'Esta aplicación no proporciona consejos médicos, psicológicos, profesionales, diagnósticos, ni tratamientos.\nNo sustituye la atención profesional.\n\nSi está en peligro inmediato o experimenta una crisis, comuníquese con los servicios de emergencia locales o un profesional de confianza.',
        privacyTitle: 'Privacidad',
        privacy: 'Anchor no recopila, almacena ni comparte datos personales.\nNo hay cuentas, ni seguimiento, ni análisis, ni anuncios.\nTodo se ejecuta localmente en su dispositivo.\n\nSus frases personalizadas se almacenan solo en este dispositivo. Ningún contenido se envía a ninguna parte. Si desinstala la aplicación, se perderán sus frases personalizadas.',
        openSourceTitle: 'Código abierto',
        openSource: 'Anchor es completamente de código abierto.',
        github: 'GitHub',
        supportTitle: 'Apoyo',
        support: 'Si esta aplicación te ha sido útil y quieres apoyar su desarrollo, puedes hacerlo aquí. Esto es completamente opcional.',
        kofi: 'Ko-fi',
        authorTitle: 'Autor',
        linkedin: 'LinkedIn',
    },
    pt: {
        title: 'Anchor',
        tagline: 'Lembretes suaves para momentos difíceis',
        intentionTitle: 'Intenção',
        intention: 'Anchor é um aplicativo simples com lembretes suaves para momentos difíceis.\n\nEu o criei com base na minha própria experiência com ansiedade e ataques de pânico, como uma pequena ferramenta previsível para ler quando as coisas parecem muito intensas. O objetivo não é consertar nada — apenas ajudá-lo a permanecer fundamentado até que o momento passe.',
        evidenceTitle: 'Baseado em evidências',
        evidence: 'As técnicas de ancoragem e frases no Anchor são baseadas em práticas psicológicas estabelecidas. Nosso conteúdo foi revisado por profissionais de saúde mental para garantir que segue abordagens baseadas em evidências.\n\nEstamos comprometidos em fornecer métodos cientificamente validados em que você pode confiar.',
        importantTitle: 'Nota importante',
        important: 'Este aplicativo não fornece aconselhamento médico, psicológico, profissional, diagnóstico, ou tratamento.\nNão substitui cuidados profissionais.\n\nSe você estiver em perigo imediato ou passando por uma crise, entre em contato com os serviços de emergência locais ou um profissional de confiança.',
        privacyTitle: 'Privacidade',
        privacy: 'Anchor não coleta, armazena ou compartilha dados pessoais.\nNão há contas, rastreamento, análises ou anúncios.\nTudo funciona localmente no seu dispositivo.\n\nSuas frases personalizadas são armazenadas apenas neste dispositivo. Nenhum conteúdo é enviado para lugar nenhum. Se você desinstalar o aplicativo, suas frases personalizadas serão perdidas.',
        openSourceTitle: 'Código aberto',
        openSource: 'Anchor é totalmente de código aberto.',
        github: 'GitHub',
        supportTitle: 'Apoio',
        support: 'Se este aplicativo foi útil e você deseja apoiar seu desenvolvimento, pode fazê-lo aqui. Isso é completamente opcional.',
        kofi: 'Ko-fi',
        authorTitle: 'Autor',
        linkedin: 'LinkedIn',
    },
};

export default function AboutScreen() {
    const { language } = useLanguage();
    const t = TRANSLATIONS[language];

    const openGitHub = useCallback(() => {
        Linking.openURL('https://github.com/NicoDeGiacomo/anchor');
    }, []);

    const openKofi = useCallback(() => {
        Linking.openURL('https://ko-fi.com/nicodegiacomo');
    }, []);

    const openCafecito = useCallback(() => {
        Linking.openURL('https://cafecito.app/nicodegiacomo');
    }, []);

    const openLinkedIn = useCallback(() => {
        Linking.openURL('https://www.linkedin.com/in/nicolasdegiacomo/');
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Logo size={80} />
                    <Text style={styles.title}>{t.title}</Text>
                    <Text style={styles.tagline}>{t.tagline}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.intentionTitle}</Text>
                    <Text style={styles.sectionText}>{t.intention}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.evidenceTitle}</Text>
                    <Text style={styles.sectionText}>{t.evidence}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.importantTitle}</Text>
                    <Text style={styles.sectionText}>{t.important}</Text>
                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.privacyTitle}</Text>
                    <Text style={styles.sectionText}>{t.privacy}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.openSourceTitle}</Text>
                    <Text style={styles.sectionText}>{t.openSource}</Text>
                    <PressableFeedback
                        style={styles.linkWrapper}
                        onPress={openGitHub}
                    >
                        <Text style={styles.link}>github.com/NicoDeGiacomo/anchor</Text>
                    </PressableFeedback>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.supportTitle}</Text>
                    <Text style={styles.sectionText}>{t.support}</Text>
                    <PressableFeedback
                        style={styles.linkWrapper}
                        onPress={openKofi}
                    >
                        <Text style={styles.link}>ko-fi.com/nicodegiacomo</Text>
                    </PressableFeedback>
                    <PressableFeedback
                        style={styles.linkWrapper}
                        onPress={openCafecito}
                    >
                        <Text style={styles.link}>cafecito.app/nicodegiacomo</Text>
                    </PressableFeedback>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.authorTitle}</Text>
                    <PressableFeedback
                        style={styles.linkWrapper}
                        onPress={openLinkedIn}
                    >
                        <Text style={styles.link}>linkedin.com/in/nicolasdegiacomo</Text>
                    </PressableFeedback>
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
    header: {
        alignItems: 'center',
        marginBottom: 48,
        gap: 16,
    },
    title: {
        fontSize: 36,
        fontWeight: '300',
        marginTop: 8,
    },
    tagline: {
        fontSize: 16,
        fontWeight: '300',
        opacity: 0.7,
        textAlign: 'center',
        marginBottom: 16,
    },
    section: {
        marginBottom: 40,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 4,
    },
    sectionText: {
        fontSize: 16,
        fontWeight: '300',
        lineHeight: 24,
        opacity: 0.85,
    },
    link: {
        fontSize: 16,
        fontWeight: '300',
        lineHeight: 24,
        opacity: 0.7,
        textDecorationLine: 'underline',
    },
    linkWrapper: {
        alignSelf: 'flex-start',
    },
});
