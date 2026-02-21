import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useState } from 'react';
import {
    FlatList,
    ListRenderItem,
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
import { useModeMethod } from '@/hooks/useModes';
import { PhraseWithSource, useFlatPhrasesWithSource, usePhrasesWithSource } from '@/hooks/usePhrases';
import {
    addUserPhrase,
    BuiltInMode,
    FLAT_PHASE_KEY,
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
    phase: PhrasePhase | typeof FLAT_PHASE_KEY;
    borderColor: string;
    secondaryTextColor: string;
    dangerColor: string;
    t: typeof TRANSLATIONS['en'];
    onDelete: (id: string, phase: PhrasePhase | typeof FLAT_PHASE_KEY) => void;
    onHide: (id: string) => void;
    onUnhide: (id: string) => void;
};

const PhraseItem = memo(function PhraseItem({
    phrase,
    phase,
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
                        onPress={() => onDelete(phrase.id, phase)}
                        accessibilityRole="button"
                        accessibilityLabel={t.deleteButton}
                    >
                        <Text style={[styles.actionButtonText, { color: dangerColor }]}>
                            {t.deleteButton}
                        </Text>
                    </Pressable>
                ) : phrase.isHidden ? (
                    <Pressable
                        style={styles.actionButton}
                        onPress={() => onUnhide(phrase.id)}
                        accessibilityRole="button"
                        accessibilityLabel={t.unhideButton}
                    >
                        <Text style={styles.actionButtonText}>
                            {t.unhideButton}
                        </Text>
                    </Pressable>
                ) : (
                    <Pressable
                        style={styles.actionButton}
                        onPress={() => onHide(phrase.id)}
                        accessibilityRole="button"
                        accessibilityLabel={t.hideButton}
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
        values: 'Values',
        loadError: 'Failed to load phrases. Please try again.',
        preparation: 'Preparation',
        confrontation: 'Confrontation',
        reinforcement: 'Reinforcement',
        phrasesHeader: 'Phrases',
        methodLabel: 'Method',
        methodSit: 'SIT',
        methodRandom: 'Random',
        methodSeeAll: 'See all',
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
        values: 'Valores',
        loadError: 'Error al cargar las frases. Por favor, inténtelo de nuevo.',
        preparation: 'Preparación',
        confrontation: 'Confrontación',
        reinforcement: 'Refuerzo',
        phrasesHeader: 'Frases',
        methodLabel: 'Método',
        methodSit: 'SIT',
        methodRandom: 'Aleatorio',
        methodSeeAll: 'Ver todo',
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
        values: 'Valores',
        loadError: 'Falha ao carregar as frases. Por favor, tente novamente.',
        preparation: 'Preparação',
        confrontation: 'Confrontação',
        reinforcement: 'Reforço',
        phrasesHeader: 'Frases',
        methodLabel: 'Método',
        methodSit: 'SIT',
        methodRandom: 'Aleatório',
        methodSeeAll: 'Ver tudo',
    },
};

type PhraseSection = {
    phase: PhrasePhase;
    title: string;
    data: PhraseWithSource[];
};

type EditPhrasesState = {
    showAddModal: boolean;
    addModalPhase: PhrasePhase | typeof FLAT_PHASE_KEY | null;
    newPhraseText: string;
    newSubphrase: string;
    confirmDialog: {
        visible: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        confirmText: string;
        isDanger?: boolean;
    };
};

type EditPhrasesAction =
    | { type: 'OPEN_ADD_MODAL'; phase: PhrasePhase | typeof FLAT_PHASE_KEY }
    | { type: 'CLOSE_ADD_MODAL' }
    | { type: 'SET_PHRASE_TEXT'; text: string }
    | { type: 'SET_SUBPHRASE'; text: string }
    | { type: 'ADD_SUCCESS' }
    | { type: 'SHOW_CONFIRM'; dialog: EditPhrasesState['confirmDialog'] }
    | { type: 'CLOSE_CONFIRM' };

const initialEditPhrasesState: EditPhrasesState = {
    showAddModal: false,
    addModalPhase: null,
    newPhraseText: '',
    newSubphrase: '',
    confirmDialog: {
        visible: false,
        title: '',
        message: '',
        onConfirm: () => {},
        confirmText: '',
    },
};

function editPhrasesReducer(state: EditPhrasesState, action: EditPhrasesAction): EditPhrasesState {
    switch (action.type) {
        case 'OPEN_ADD_MODAL':
            return { ...state, showAddModal: true, addModalPhase: action.phase };
        case 'CLOSE_ADD_MODAL':
            return { ...state, showAddModal: false, addModalPhase: null, newPhraseText: '', newSubphrase: '' };
        case 'SET_PHRASE_TEXT':
            return { ...state, newPhraseText: action.text };
        case 'SET_SUBPHRASE':
            return { ...state, newSubphrase: action.text };
        case 'ADD_SUCCESS':
            return { ...state, showAddModal: false, addModalPhase: null, newPhraseText: '', newSubphrase: '' };
        case 'SHOW_CONFIRM':
            return { ...state, confirmDialog: action.dialog };
        case 'CLOSE_CONFIRM':
            return { ...state, confirmDialog: { ...state.confirmDialog, visible: false } };
    }
}

export default function EditPhrasesScreen() {
    const { mode } = useLocalSearchParams<{ mode: string }>();
    const { language } = useLanguage();
    
    // Accept any non-empty mode string (built-in or custom mode ID)
    const validMode = mode || 'panic';

    // Load the mode's method
    const { method } = useModeMethod(validMode);
    const isSit = method === 'sit';

    // Load phrases - call both hooks (hooks can't be conditional)
    const { phrases: phasedPhrases, isLoading: phasedLoading, error: phasedError, refetch: phasedRefetch, isCustomMode: phasedIsCustom } = usePhrasesWithSource(validMode);
    const { phrases: flatPhrases, isLoading: flatLoading, error: flatError, refetch: flatRefetch, isCustomMode: flatIsCustom } = useFlatPhrasesWithSource(validMode);

    // Use the right data based on method
    const isLoading = isSit ? phasedLoading : flatLoading;
    const error = isSit ? phasedError : flatError;
    const refetch = isSit ? phasedRefetch : flatRefetch;
    const isCustomMode = isSit ? phasedIsCustom : flatIsCustom;

    const [ep, epDispatch] = useReducer(editPhrasesReducer, initialEditPhrasesState);
    const [customModeName, setCustomModeName] = useState<string | null>(null);
    
    const {
        background: backgroundColor,
        text: textColor,
        textSecondary: secondaryTextColor,
        border: borderColor,
        danger: dangerColor,
        overlay: overlayColor,
    } = useColors('background', 'text', 'textSecondary', 'border', 'danger', 'overlay');

    const t = TRANSLATIONS[language];

    // Method label for display
    const methodLabel = method === 'sit' ? t.methodSit
        : method === 'random' ? t.methodRandom
        : t.methodSeeAll;

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

    // Build SectionList sections from phased data (SIT only)
    const sections: PhraseSection[] = useMemo(() => 
        PHRASE_PHASES.map(phase => ({
            phase,
            title: t[phase],
            data: phasedPhrases[phase],
        })),
        [phasedPhrases, t]
    );

    // Open the add modal
    const openAddModal = useCallback((phase: PhrasePhase | typeof FLAT_PHASE_KEY) => {
        epDispatch({ type: 'OPEN_ADD_MODAL', phase });
    }, []);

    // Add new phrase
    const handleAddPhrase = useCallback(async () => {
        if (!ep.newPhraseText.trim()) {
            epDispatch({
                type: 'SHOW_CONFIRM',
                dialog: {
                    visible: true,
                    title: t.emptyMainPhraseError,
                    message: '',
                    onConfirm: () => epDispatch({ type: 'CLOSE_CONFIRM' }),
                    confirmText: 'OK',
                },
            });
            return;
        }

        if (!ep.addModalPhase) return;

        try {
            await addUserPhrase(
                validMode,
                language,
                ep.addModalPhase,
                ep.newPhraseText.trim(),
                ep.newSubphrase.trim() || undefined
            );

            epDispatch({ type: 'ADD_SUCCESS' });
            await refetch();
        } catch (err) {
            console.warn('Failed to add phrase:', err);
        }
    }, [ep.newPhraseText, ep.newSubphrase, ep.addModalPhase, validMode, language, refetch, t.emptyMainPhraseError]);

    // Delete user phrase
    const handleDeletePhrase = useCallback((phraseId: string, phase: PhrasePhase | typeof FLAT_PHASE_KEY) => {
        epDispatch({
            type: 'SHOW_CONFIRM',
            dialog: {
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
                    epDispatch({ type: 'CLOSE_CONFIRM' });
                },
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

    // ---- SIT-specific renderers ----

    const renderPhasedItem: SectionListRenderItem<PhraseWithSource, PhraseSection> = useCallback(({ item, section }) => (
        <PhraseItem
            phrase={item}
            phase={section.phase}
            borderColor={borderColor}
            secondaryTextColor={secondaryTextColor}
            dangerColor={dangerColor}
            t={t}
            onDelete={handleDeletePhrase}
            onHide={handleHidePhrase}
            onUnhide={handleUnhidePhrase}
        />
    ), [borderColor, secondaryTextColor, dangerColor, t, handleDeletePhrase, handleHidePhrase, handleUnhidePhrase]);

    const renderSectionHeader = useCallback(({ section }: { section: PhraseSection }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
        </View>
    ), []);

    const renderSectionFooter = useCallback(({ section }: { section: PhraseSection }) => (
        <Pressable
            style={[styles.addPhraseButton, { borderColor }]}
            onPress={() => openAddModal(section.phase)}
            accessibilityRole="button"
            accessibilityLabel={`${t.addButton} — ${section.title}`}
        >
            <Text style={styles.addPhraseButtonText}>+ {t.addButton}</Text>
        </Pressable>
    ), [borderColor, t.addButton, openAddModal]);

    // ---- Flat-specific renderers ----

    const renderFlatItem: ListRenderItem<PhraseWithSource> = useCallback(({ item }) => (
        <PhraseItem
            phrase={item}
            phase={FLAT_PHASE_KEY}
            borderColor={borderColor}
            secondaryTextColor={secondaryTextColor}
            dangerColor={dangerColor}
            t={t}
            onDelete={handleDeletePhrase}
            onHide={handleHidePhrase}
            onUnhide={handleUnhidePhrase}
        />
    ), [borderColor, secondaryTextColor, dangerColor, t, handleDeletePhrase, handleHidePhrase, handleUnhidePhrase]);

    const flatListHeader = useMemo(() => (
        <View>
            <View style={styles.methodBadge}>
                <Text style={[styles.methodBadgeText, { color: secondaryTextColor }]}>
                    {t.methodLabel}: {methodLabel}
                </Text>
            </View>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{t.phrasesHeader}</Text>
            </View>
        </View>
    ), [secondaryTextColor, t.methodLabel, methodLabel, t.phrasesHeader]);

    const flatListFooter = useMemo(() => (
        <Pressable
            style={[styles.addPhraseButton, { borderColor }]}
            onPress={() => openAddModal(FLAT_PHASE_KEY)}
            accessibilityRole="button"
            accessibilityLabel={t.addButton}
        >
            <Text style={styles.addPhraseButtonText}>+ {t.addButton}</Text>
        </Pressable>
    ), [borderColor, t.addButton, openAddModal]);

    const keyExtractor = useCallback((item: PhraseWithSource) => item.id, []);

    // Modal title for add phrase
    const addModalTitle = useMemo(() => {
        if (!isSit) {
            return t.modalTitle;
        }
        const phaseLabel = ep.addModalPhase && ep.addModalPhase !== FLAT_PHASE_KEY
            ? t[ep.addModalPhase as PhrasePhase]
            : '';
        return phaseLabel ? `${t.modalTitle} — ${phaseLabel}` : t.modalTitle;
    }, [isSit, ep.addModalPhase, t]);

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

            {/* SIT mode: SectionList grouped by phase */}
            {isSit ? (
                <SectionList
                    sections={sections}
                    renderItem={renderPhasedItem}
                    renderSectionHeader={renderSectionHeader}
                    renderSectionFooter={renderSectionFooter}
                    keyExtractor={keyExtractor}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    stickySectionHeadersEnabled={false}
                />
            ) : (
                /* Non-SIT mode: FlatList with flat phrase list */
                <FlatList
                    data={flatPhrases}
                    renderItem={renderFlatItem}
                    ListHeaderComponent={flatListHeader}
                    ListFooterComponent={flatListFooter}
                    keyExtractor={keyExtractor}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                />
            )}

            {/* Add phrase modal */}
            <Modal
                visible={ep.showAddModal}
                transparent
                animationType="fade"
                onRequestClose={() => epDispatch({ type: 'CLOSE_ADD_MODAL' })}
            >
                <View style={[styles.modalOverlay, { backgroundColor: overlayColor }]}>
                    <View style={[styles.modalContent, { backgroundColor }]}>
                        <Text style={styles.modalTitle}>
                            {addModalTitle}
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
                            value={ep.newPhraseText}
                            onChangeText={(text) => epDispatch({ type: 'SET_PHRASE_TEXT', text })}
                            multiline
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
                            value={ep.newSubphrase}
                            onChangeText={(text) => epDispatch({ type: 'SET_SUBPHRASE', text })}
                            multiline
                        />

                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.modalButton, { borderColor }]}
                                onPress={() => epDispatch({ type: 'CLOSE_ADD_MODAL' })}
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
                visible={ep.confirmDialog.visible}
                transparent
                animationType="fade"
                onRequestClose={() => epDispatch({ type: 'CLOSE_CONFIRM' })}
            >
                <View style={[styles.modalOverlay, { backgroundColor: overlayColor }]}>
                    <View style={[styles.modalContent, { backgroundColor }]}>
                        <Text style={styles.modalTitle}>{ep.confirmDialog.title}</Text>
                        {ep.confirmDialog.message ? (
                            <Text style={[styles.confirmMessage, { color: secondaryTextColor }]}>
                                {ep.confirmDialog.message}
                            </Text>
                        ) : null}

                        <View style={styles.modalButtons}>
                            {ep.confirmDialog.message ? (
                                <Pressable
                                    style={[styles.modalButton, { borderColor }]}
                                    onPress={() => epDispatch({ type: 'CLOSE_CONFIRM' })}
                                >
                                    <Text style={styles.modalButtonText}>
                                        {t.cancelButton}
                                    </Text>
                                </Pressable>
                            ) : null}
                            <Pressable
                                style={[
                                    styles.modalButton,
                                    ep.confirmDialog.isDanger ? styles.modalButtonDanger : styles.modalButtonPrimary,
                                    { borderColor: ep.confirmDialog.isDanger ? dangerColor : borderColor },
                                    !ep.confirmDialog.message && { flex: 1 },
                                ]}
                                onPress={ep.confirmDialog.onConfirm}
                            >
                                <Text style={[
                                    styles.modalButtonText,
                                    ep.confirmDialog.isDanger && { color: dangerColor },
                                    !ep.confirmDialog.isDanger && styles.modalButtonTextPrimary,
                                ]}>
                                    {ep.confirmDialog.confirmText}
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
    methodBadge: {
        paddingTop: 4,
        paddingBottom: 4,
    },
    methodBadgeText: {
        fontSize: 13,
        fontWeight: '300',
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
