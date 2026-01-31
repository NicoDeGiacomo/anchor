import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColors } from '@/hooks/useColor';
import {
    addUserPhrase,
    getHiddenPhrases,
    getUserPhrases,
    hideBuiltInPhrase,
    Language,
    Mode,
    Phrase,
    removeUserPhrase,
    unhideBuiltInPhrase
} from '@/utils/phraseStorage';

type PhraseWithSource = Phrase & {
    isUserAdded: boolean;
    isHidden?: boolean;
};

// Dynamic imports for built-in phrases
const PHRASES_MAP: Record<Mode, Record<Language, Phrase[]>> = {
    panic: {
        en: require('@/content/panic/anchors.en.json'),
        es: require('@/content/panic/anchors.es.json'),
        pt: require('@/content/panic/anchors.pt.json'),
    },
    anxiety: {
        en: require('@/content/anxiety/anchors.en.json'),
        es: require('@/content/anxiety/anchors.es.json'),
        pt: require('@/content/anxiety/anchors.pt.json'),
    },
    sadness: {
        en: require('@/content/sadness/anchors.en.json'),
        es: require('@/content/sadness/anchors.es.json'),
        pt: require('@/content/sadness/anchors.pt.json'),
    },
    anger: {
        en: require('@/content/anger/anchors.en.json'),
        es: require('@/content/anger/anchors.es.json'),
        pt: require('@/content/anger/anchors.pt.json'),
    },
    grounding: {
        en: require('@/content/grounding/anchors.en.json'),
        es: require('@/content/grounding/anchors.es.json'),
        pt: require('@/content/grounding/anchors.pt.json'),
    },
};

const TRANSLATIONS = {
    en: {
        title: 'Edit phrases',
        addButton: 'Add phrase',
        builtIn: 'Built-in',
        userAdded: 'Your phrase',
        hidden: 'Hidden',
        hideButton: 'Hide',
        unhideButton: 'Unhide',
        deleteButton: 'Delete',
        cancelButton: 'Cancel',
        saveButton: 'Save',
        mainPhrasePlaceholder: 'Main phrase',
        subphrasePlaceholder: 'Subphrase (optional)',
        deleteConfirmTitle: 'Delete phrase',
        deleteConfirmMessage: 'Are you sure you want to delete this phrase?',
        hideConfirmTitle: 'Hide phrase',
        hideConfirmMessage: 'This phrase will not appear in your sessions.',
        emptyMainPhraseError: 'Please enter a main phrase',
        modalTitle: 'Add new phrase',
        panic: 'Panic',
        anxiety: 'Anxiety',
        sadness: 'Sadness',
        anger: 'Anger',
        grounding: 'Grounding',
    },
    es: {
        title: 'Editar frases',
        addButton: 'Agregar frase',
        builtIn: 'Integrada',
        userAdded: 'Tu frase',
        hidden: 'Oculta',
        hideButton: 'Ocultar',
        unhideButton: 'Mostrar',
        deleteButton: 'Eliminar',
        cancelButton: 'Cancelar',
        saveButton: 'Guardar',
        mainPhrasePlaceholder: 'Frase principal',
        subphrasePlaceholder: 'Subfrase (opcional)',
        deleteConfirmTitle: 'Eliminar frase',
        deleteConfirmMessage: '¿Está seguro de que desea eliminar esta frase?',
        hideConfirmTitle: 'Ocultar frase',
        hideConfirmMessage: 'Esta frase no aparecerá en tus sesiones.',
        emptyMainPhraseError: 'Por favor, ingrese una frase principal',
        modalTitle: 'Agregar nueva frase',
        panic: 'Pánico',
        anxiety: 'Ansiedad',
        sadness: 'Tristeza',
        anger: 'Ira',
        grounding: 'Conexión',
    },
    pt: {
        title: 'Editar frases',
        addButton: 'Adicionar frase',
        builtIn: 'Integrada',
        userAdded: 'Sua frase',
        hidden: 'Oculta',
        hideButton: 'Ocultar',
        unhideButton: 'Mostrar',
        deleteButton: 'Excluir',
        cancelButton: 'Cancelar',
        saveButton: 'Salvar',
        mainPhrasePlaceholder: 'Frase principal',
        subphrasePlaceholder: 'Subfrase (opcional)',
        deleteConfirmTitle: 'Excluir frase',
        deleteConfirmMessage: 'Tem certeza de que deseja excluir esta frase?',
        hideConfirmTitle: 'Ocultar frase',
        hideConfirmMessage: 'Esta frase não aparecerá em suas sessões.',
        emptyMainPhraseError: 'Por favor, insira uma frase principal',
        modalTitle: 'Adicionar nova frase',
        panic: 'Pânico',
        anxiety: 'Ansiedade',
        sadness: 'Tristeza',
        anger: 'Raiva',
        grounding: 'Aterramento',
    },
};

export default function EditPhrasesScreen() {
    const { mode } = useLocalSearchParams<{ mode: string }>();
    const { language } = useLanguage();
    const router = useRouter();
    const [phrases, setPhrases] = useState<PhraseWithSource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPhraseText, setNewPhraseText] = useState('');
    const [newSubphrase, setNewSubphrase] = useState('');
    const [confirmDialog, setConfirmDialog] = useState<{
        visible: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        confirmText: string;
        isDanger?: boolean;
    }>({
        visible: false,
        title: '',
        message: '',
        onConfirm: () => {},
        confirmText: '',
    });
    
    const {
        background: backgroundColor,
        text: textColor,
        textSecondary: secondaryTextColor,
        border: borderColor,
        danger: dangerColor,
        overlay: overlayColor,
    } = useColors('background', 'text', 'textSecondary', 'border', 'danger', 'overlay');

    const t = TRANSLATIONS[language];

    // Validate mode parameter
    const validMode = (mode && ['panic', 'anxiety', 'sadness', 'anger', 'grounding'].includes(mode))
        ? mode as Mode
        : 'panic';

    const getModeTitle = () => {
        switch (validMode) {
            case 'panic': return t.panic;
            case 'anxiety': return t.anxiety;
            case 'sadness': return t.sadness;
            case 'anger': return t.anger;
            case 'grounding': return t.grounding;
        }
    };

    // Load phrases
    const loadPhrases = async () => {
        setIsLoading(true);
        try {
            // Get built-in phrases
            let builtInPhrases: Phrase[] = [];
            try {
                builtInPhrases = PHRASES_MAP[validMode]?.[language] || [];
                
                // Fallback to English if current language has no content
                if (builtInPhrases.length === 0 && language !== 'en') {
                    builtInPhrases = PHRASES_MAP[validMode]?.en || [];
                }
            } catch (error) {
                console.warn('Failed to load built-in phrases:', error);
            }

            // Get user phrases and hidden IDs
            const [userPhrases, hiddenIds] = await Promise.all([
                getUserPhrases(validMode, language),
                getHiddenPhrases(validMode, language),
            ]);

            // Mark built-in phrases
            const builtInWithSource: PhraseWithSource[] = builtInPhrases.map(phrase => ({
                ...phrase,
                isUserAdded: false,
                isHidden: hiddenIds.includes(phrase.id),
            }));

            // Mark user phrases
            const userWithSource: PhraseWithSource[] = userPhrases.map(phrase => ({
                ...phrase,
                isUserAdded: true,
            }));

            // Combine all phrases (visible and hidden)
            setPhrases([...builtInWithSource, ...userWithSource]);
        } catch (error) {
            console.warn('Failed to load phrases:', error);
            setPhrases([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPhrases();
    }, [validMode, language]);

    // Add new phrase
    const handleAddPhrase = async () => {
        if (!newPhraseText.trim()) {
            setConfirmDialog({
                visible: true,
                title: t.emptyMainPhraseError,
                message: '',
                onConfirm: () => setConfirmDialog(prev => ({ ...prev, visible: false })),
                confirmText: 'OK',
            });
            return;
        }

        try {
            await addUserPhrase(
                validMode,
                language,
                newPhraseText.trim(),
                newSubphrase.trim() || undefined
            );
            
            setNewPhraseText('');
            setNewSubphrase('');
            setShowAddModal(false);
            await loadPhrases();
        } catch (error) {
            console.warn('Failed to add phrase:', error);
        }
    };

    // Delete user phrase
    const handleDeletePhrase = (phraseId: string) => {
        setConfirmDialog({
            visible: true,
            title: t.deleteConfirmTitle,
            message: t.deleteConfirmMessage,
            confirmText: t.deleteButton,
            isDanger: true,
            onConfirm: async () => {
                try {
                    await removeUserPhrase(validMode, language, phraseId);
                    await loadPhrases();
                } catch (error) {
                    console.warn('Failed to delete phrase:', error);
                }
                setConfirmDialog(prev => ({ ...prev, visible: false }));
            },
        });
    };

    // Hide built-in phrase
    const handleHidePhrase = (phraseId: string) => {
        setConfirmDialog({
            visible: true,
            title: t.hideConfirmTitle,
            message: t.hideConfirmMessage,
            confirmText: t.hideButton,
            onConfirm: async () => {
                try {
                    await hideBuiltInPhrase(validMode, language, phraseId);
                    await loadPhrases();
                } catch (error) {
                    console.warn('Failed to hide phrase:', error);
                }
                setConfirmDialog(prev => ({ ...prev, visible: false }));
            },
        });
    };

    // Unhide built-in phrase
    const handleUnhidePhrase = async (phraseId: string) => {
        try {
            await unhideBuiltInPhrase(validMode, language, phraseId);
            await loadPhrases();
        } catch (error) {
            console.warn('Failed to unhide phrase:', error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    {getModeTitle()} - {t.title}
                </Text>
                <Pressable
                    style={[styles.addButton, { borderColor }]}
                    onPress={() => setShowAddModal(true)}
                >
                    <Text style={styles.addButtonText}>{t.addButton}</Text>
                </Pressable>
            </View>

            {/* Phrase list */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {phrases.map((phrase) => (
                    <View
                        key={phrase.id}
                        style={[
                            styles.phraseItem,
                            { borderColor },
                            phrase.isHidden && styles.phraseItemHidden,
                        ]}
                    >
                        <View style={styles.phraseContent}>
                            <Text
                                style={[
                                    styles.phraseText,
                                    phrase.isHidden && styles.phraseTextHidden,
                                ]}
                            >
                                {phrase.text}
                            </Text>
                            {phrase.subphrase && (
                                <Text
                                    style={[
                                        styles.subphraseText,
                                        { color: secondaryTextColor },
                                        phrase.isHidden && styles.phraseTextHidden,
                                    ]}
                                >
                                    {phrase.subphrase}
                                </Text>
                            )}
                            <Text
                                style={[
                                    styles.phraseSource,
                                    { color: secondaryTextColor },
                                ]}
                            >
                                {phrase.isUserAdded
                                    ? t.userAdded
                                    : phrase.isHidden
                                    ? `${t.builtIn} - ${t.hidden}`
                                    : t.builtIn}
                            </Text>
                        </View>

                        {/* Action buttons */}
                        <View style={styles.phraseActions}>
                            {phrase.isUserAdded ? (
                                <Pressable
                                    style={styles.actionButton}
                                    onPress={() => handleDeletePhrase(phrase.id)}
                                >
                                    <Text style={[styles.actionButtonText, { color: dangerColor }]}>
                                        {t.deleteButton}
                                    </Text>
                                </Pressable>
                            ) : phrase.isHidden ? (
                                <Pressable
                                    style={styles.actionButton}
                                    onPress={() => handleUnhidePhrase(phrase.id)}
                                >
                                    <Text style={styles.actionButtonText}>
                                        {t.unhideButton}
                                    </Text>
                                </Pressable>
                            ) : (
                                <Pressable
                                    style={styles.actionButton}
                                    onPress={() => handleHidePhrase(phrase.id)}
                                >
                                    <Text style={styles.actionButtonText}>
                                        {t.hideButton}
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Add phrase modal */}
            <Modal
                visible={showAddModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: overlayColor }]}>
                    <View style={[styles.modalContent, { backgroundColor }]}>
                        <Text style={styles.modalTitle}>{t.modalTitle}</Text>

                        <TextInput
                            style={[
                                styles.input,
                                { 
                                    borderColor,
                                    color: textColor,
                                    backgroundColor,
                                },
                            ]}
                            placeholder={t.mainPhrasePlaceholder}
                            placeholderTextColor={secondaryTextColor}
                            value={newPhraseText}
                            onChangeText={setNewPhraseText}
                            multiline
                            autoFocus
                        />

                        <TextInput
                            style={[
                                styles.input,
                                { 
                                    borderColor,
                                    color: textColor,
                                    backgroundColor,
                                },
                            ]}
                            placeholder={t.subphrasePlaceholder}
                            placeholderTextColor={secondaryTextColor}
                            value={newSubphrase}
                            onChangeText={setNewSubphrase}
                            multiline
                        />

                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.modalButton, { borderColor }]}
                                onPress={() => {
                                    setShowAddModal(false);
                                    setNewPhraseText('');
                                    setNewSubphrase('');
                                }}
                            >
                                <Text style={styles.modalButtonText}>
                                    {t.cancelButton}
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, styles.modalButtonPrimary, { borderColor }]}
                                onPress={handleAddPhrase}
                            >
                                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                                    {t.saveButton}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Confirmation dialog modal */}
            <Modal
                visible={confirmDialog.visible}
                transparent
                animationType="fade"
                onRequestClose={() => setConfirmDialog(prev => ({ ...prev, visible: false }))}
            >
                <View style={[styles.modalOverlay, { backgroundColor: overlayColor }]}>
                    <View style={[styles.modalContent, { backgroundColor }]}>
                        <Text style={styles.modalTitle}>{confirmDialog.title}</Text>
                        {confirmDialog.message ? (
                            <Text style={[styles.confirmMessage, { color: secondaryTextColor }]}>
                                {confirmDialog.message}
                            </Text>
                        ) : null}

                        <View style={styles.modalButtons}>
                            {confirmDialog.message ? (
                                <Pressable
                                    style={[styles.modalButton, { borderColor }]}
                                    onPress={() => setConfirmDialog(prev => ({ ...prev, visible: false }))}
                                >
                                    <Text style={styles.modalButtonText}>
                                        {t.cancelButton}
                                    </Text>
                                </Pressable>
                            ) : null}
                            <Pressable
                                style={[
                                    styles.modalButton,
                                    confirmDialog.isDanger ? styles.modalButtonDanger : styles.modalButtonPrimary,
                                    { borderColor: confirmDialog.isDanger ? dangerColor : borderColor },
                                    !confirmDialog.message && { flex: 1 },
                                ]}
                                onPress={confirmDialog.onConfirm}
                            >
                                <Text style={[
                                    styles.modalButtonText,
                                    confirmDialog.isDanger && { color: dangerColor },
                                    !confirmDialog.isDanger && styles.modalButtonTextPrimary,
                                ]}>
                                    {confirmDialog.confirmText}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        gap: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '400',
    },
    addButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '400',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        gap: 12,
    },
    phraseItem: {
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        gap: 12,
    },
    phraseItemHidden: {
        opacity: 0.5,
    },
    phraseContent: {
        gap: 6,
    },
    phraseText: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
    },
    phraseTextHidden: {
        opacity: 0.6,
    },
    subphraseText: {
        fontSize: 14,
        fontWeight: '300',
        lineHeight: 20,
    },
    phraseSource: {
        fontSize: 12,
        fontWeight: '300',
        marginTop: 4,
    },
    phraseActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '400',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        padding: 24,
        borderRadius: 12,
        gap: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 48,
        maxHeight: 120,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    modalButtonPrimary: {
        borderWidth: 2,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '300',
    },
    modalButtonTextPrimary: {
        fontWeight: '400',
    },
    modalButtonDanger: {
        borderWidth: 2,
    },
    confirmMessage: {
        fontSize: 16,
        fontWeight: '300',
        lineHeight: 24,
    },
});

