import { ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

const GROUNDING_PHRASES = [
    "Panic attacks are uncomfortable, but not dangerous.",
    "This feeling will pass.",
    "You have been through this before.",
];

export default function PanicScreen() {
    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {GROUNDING_PHRASES.map((phrase, index) => (
                    <View key={index} style={styles.phraseContainer}>
                        <Text style={styles.phraseText}>{phrase}</Text>
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
