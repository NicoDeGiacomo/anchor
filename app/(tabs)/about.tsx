import { ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function AboutScreen() {
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.description}>
                    Anchor is a simple app with gentle reminders for overwhelming moments.
                </Text>

                <View style={styles.disclaimerSection}>
                    <Text style={styles.disclaimerTitle}>Disclaimer</Text>

                    <Text style={styles.disclaimerText}>
                        This app does not provide medical advice, diagnosis, or treatment.
                    </Text>

                    <Text style={styles.disclaimerText}>
                        Not a substitute for professional care.
                    </Text>

                    <Text style={styles.disclaimerText}>
                        If you are in immediate danger, contact local emergency services.
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
