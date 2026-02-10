import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
    Modal,
    Pressable,
    SectionList,
    SectionListRenderItem,
    StyleSheet,
    TextInput,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColors } from '@/hooks/useColor';
import { PhraseWithSource, usePhrasesWithSource } from '@/hooks/usePhrases';
import {
    addUserPhrase,
    BuiltInMode,
    getCustomModeById,
    hideBuiltInPhrase,
    isBuiltInMode,
    PHRASE_PHASES,
    PhrasePhase,
    removeUserPhrase,
    unhideBuiltInPhrase
} from '@/utils/phraseStorage';

type PhraseItemProps = {
    phrase: PhraseWithSource;
    borderColor: string;
    secondaryTextColor: string;
    dangerColor: string;
    t: typeof TRANSLATIONS['en'];
    onDelete: (id: string) => void;
    onHide: (id: string) => void;
    onUnhide: (id: string) => void;
};

const PhraseItem = memo(function PhraseItem({
    phrase,
    borderColor,
    secondaryTextColor,
    dangerColor,
    t,
    onDelete,
    onHide,
    onUnhide,
}: PhraseItemProps) {
    return (
        <View
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
                        ? `${t.defaultPhrase} - ${t.hidden}`
                        : t.defaultPhrase}
                </Text>
            </View>

            {/* Action buttons */}
            <View style={styles.phraseActions}>
                {phrase.isUserAdded ? (
                    <Pressable
                        style={styles.actionButton}
                        onPress={() => onDelete(phrase.id)}
                    >
                        <Text style={[styles.actionButtonText, { color: dangerColor }]}>
                            {t.deleteButton}
                        </Text>
                    </Pressable>
                ) : phrase.isHidden ? (
                    <Pressable
                        style={styles.actionButton}
                        onPress={() => onUnhide(phrase.id)}
                    >
                        <Text style={styles.actionButtonText}>
                            {t.unhideButton}
                        </Text>
                    </Pressable>
                ) : (
                    <Pressable
                        style={styles.actionButton}
                        onPress={() => onHide(phrase.id)}
                    >
                        <Text style={styles.actionButtonText}>
                            {t.hideButton}
                        </Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
});

const TRANSLATIONS = {
    en: {
        title: 'Edit phrases',
        addButton: 'Add phrase',
        defaultPhrase: 'Default',
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
        emptyMainPhraseError: 'Please enter a main phrase',
        modalTitle: 'Add new phrase',
        panic: 'Panic',
        anxiety: 'Anxiety',
        sadness: 'Sadness',
        anger: 'Anger',
        grounding: 'Grounding',
        loadError: 'Failed to load phrases. Please try again.',
        preparation: 'Preparation',
        confrontation: 'Confrontation',
        reinforcement: 'Reinforcement',
    },
    es: {
        title: 'Editar frases',
        addButton: 'Agregar frase',
        defaultPhrase: 'Predeterminada',
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
        emptyMainPhraseError: 'Por favor, ingrese una frase principal',
        modalTitle: 'Agregar nueva frase',
        panic: 'Pánico',
        anxiety: 'Ansiedad',
        sadness: 'Tristeza',
        anger: 'Ira',
        grounding: 'Conexión',
        loadError: 'Error al cargar las frases. Por favor, inténtelo de nuevo.',
        preparation: 'Preparación',
        confrontation: 'Confrontación',
        reinforcement: 'Refuerzo',
    },
    pt: {
        title: 'Editar frases',
        addButton: 'Adicionar frase',
        defaultPhrase: 'Padrão',
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
        emptyMainPhraseError: 'Por favor, insira uma frase principal',
        modalTitle: 'Adicionar nova frase',
        panic: 'Pânico',
        anxiety: 'Ansiedade',
        sadness: 'Tristeza',
        anger: 'Raiva',
        grounding: 'Aterramento',
        loadError: 'Falha ao carregar as frases. Por favor, tente novamente.',
        preparation: 'Preparação',
        confrontation: 'Confrontação',
        reinforcement: 'Reforço',
    },
};

type PhraseSection = {
    phase: PhrasePhase;
    title: string;
    data: PhraseWithSource[];
};

export default function EditPhrasesScreen() {
    const { mode } = useLocalSearchParams<{ mode: string }>();
    const { language } = useLanguage();
    
    // Accept any non-empty mode string (built-in or custom mode ID)
    const validMode = mode || 'panic';

    // Use the phrases hook for loading data (now returns phased data)
    const { phrases, isLoading, error, refetch, isCustomMode } = usePhrasesWithSource(validMode);
    
    const [addModalPhase, setAddModalPhase] = useState<PhrasePhase | null>(null);
    const [newPhraseText, setNewPhraseText] = useState('');
    const [newSubphrase, setNewSubphrase] = useState('');
    const [customModeName, setCustomModeName] = useState<string | null>(null);
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

    // Load custom mode name if this is a custom mode
    useEffect(() => {
        if (isCustomMode && validMode) {
            getCustomModeById(validMode).then(customMode => {
                setCustomModeName(customMode?.name || validMode);
            });
        }
    }, [isCustomMode, validMode]);

    // Get the mode title (translated for built-in, custom name for custom modes)
    const modeTitle = useMemo(() => {
        if (isCustomMode) {
            return customModeName || validMode;
        }
        if (isBuiltInMode(validMode)) {
            const builtInMode = validMode as BuiltInMode;
            return t[builtInMode];
        }
        return validMode;
    }, [validMode, isCustomMode, customModeName, t]);

    // Set dynamic navigation title
    const navigation = useNavigation();
    useLayoutEffect(() => {
        navigation.setOptions({
            title: `${modeTitle} - ${t.title}`,
        });
    }, [navigation, modeTitle, t.title]);

    // Build SectionList sections from phased data
    const sections: PhraseSection[] = useMemo(() => 
        PHRASE_PHASES.map(phase => ({
            phase,
            title: t[phase],
            data: phrases[phase],
        })),
        [phrases, t]
    );

    // Add new phrase (scoped to the phase selected via the modal)
    const handleAddPhrase = useCallback(async () => {
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

        if (!addModalPhase) return;

        try {
            await addUserPhrase(
                validMode,
                language,
                addModalPhase,
                newPhraseText.trim(),
                newSubphrase.trim() || undefined
            );
            
            setNewPhraseText('');
            setNewSubphrase('');
            setAddModalPhase(null);
            await refetch();
        } catch (err) {
            console.warn('Failed to add phrase:', err);
        }
    }, [newPhraseText, newSubphrase, validMode, language, addModalPhase, refetch, t.emptyMainPhraseError]);

    // Delete user phrase (needs the phase to know which storage key to use)
    const handleDeletePhrase = useCallback((phraseId: string, phase: PhrasePhase) => {
        setConfirmDialog({
            visible: true,
            title: t.deleteConfirmTitle,
            message: t.deleteConfirmMessage,
            confirmText: t.deleteButton,
            isDanger: true,
            onConfirm: async () => {
                try {
                    await removeUserPhrase(validMode, language, phase, phraseId);
                    await refetch();
                } catch (err) {
                    console.warn('Failed to delete phrase:', err);
                }
                setConfirmDialog(prev => ({ ...prev, visible: false }));
            },
        });
    }, [t.deleteConfirmTitle, t.deleteConfirmMessage, t.deleteButton, validMode, language, refetch]);

    // Hide built-in phrase
    const handleHidePhrase = useCallback(async (phraseId: string) => {
        try {
            await hideBuiltInPhrase(validMode, language, phraseId);
            await refetch();
        } catch (err) {
            console.warn('Failed to hide phrase:', err);
        }
    }, [validMode, language, refetch]);

    // Unhide built-in phrase
    const handleUnhidePhrase = useCallback(async (phraseId: string) => {
        try {
            await unhideBuiltInPhrase(validMode, language, phraseId);
            await refetch();
        } catch (err) {
            console.warn('Failed to unhide phrase:', err);
        }
    }, [validMode, language, refetch]);

    // SectionList renderItem - need to determine the phase from the section
    const renderPhraseItem: SectionListRenderItem<PhraseWithSource, PhraseSection> = useCallback(({ item, section }) => (
        <PhraseItem
            phrase={item}
            borderColor={borderColor}
            secondaryTextColor={secondaryTextColor}
            dangerColor={dangerColor}
            t={t}
            onDelete={(id) => handleDeletePhrase(id, section.phase)}
            onHide={handleHidePhrase}
            onUnhide={handleUnhidePhrase}
        />
    ), [borderColor, secondaryTextColor, dangerColor, t, handleDeletePhrase, handleHidePhrase, handleUnhidePhrase]);

    // Section header
    const renderSectionHeader = useCallback(({ section }: { section: PhraseSection }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
        </View>
    ), []);

    // Section footer with "Add phrase" button for each phase
    const renderSectionFooter = useCallback(({ section }: { section: PhraseSection }) => (
        <Pressable
            style={[styles.addPhraseButton, { borderColor }]}
            onPress={() => setAddModalPhase(section.phase)}
        >
            <Text style={styles.addPhraseButtonText}>+ {t.addButton}</Text>
        </Pressable>
    ), [borderColor, t.addButton]);

    const keyExtractor = useCallback((item: PhraseWithSource) => item.id, []);

    return (
        <View style={styles.container}>
            {/* Error message */}
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: dangerColor }]}>
                        {t.loadError}
                    </Text>
                </View>
            )}

            {/* Phrase list grouped by phase */}
            <SectionList
                sections={sections}
                renderItem={renderPhraseItem}
                renderSectionHeader={renderSectionHeader}
                renderSectionFooter={renderSectionFooter}
                keyExtractor={keyExtractor}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                stickySectionHeadersEnabled={false}
            />

            {/* Add phrase modal */}
            <Modal
                visible={addModalPhase !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setAddModalPhase(null)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: overlayColor }]}>
                    <View style={[styles.modalContent, { backgroundColor }]}>
                        <Text style={styles.modalTitle}>
                            {t.modalTitle} — {addModalPhase ? t[addModalPhase] : ''}
                        </Text>

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
                                    setAddModalPhase(null);
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionHeader: {
        paddingTop: 20,
        paddingBottom: 10,
    },
    sectionHeaderText: {
        fontSize: 18,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 1,
        opacity: 0.7,
    },
    addPhraseButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 12,
    },
    addPhraseButtonText: {
        fontSize: 16,
        fontWeight: '300',
        opacity: 0.7,
    },
    phraseItem: {
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        gap: 12,
        marginBottom: 12,
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
    errorContainer: {
        padding: 20,
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        fontWeight: '400',
        textAlign: 'center',
    },
});
