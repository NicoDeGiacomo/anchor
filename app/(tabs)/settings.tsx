import { Link } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, ViewStyle } from 'react-native';

import PressableFeedback from '@/components/PressableFeedback';
import { Text, View } from '@/components/Themed';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useColors } from '@/hooks/useColor';
import { DisplayMode, getModeId, isCustomMode, useModesWithVisibility } from '@/hooks/useModes';
import {
    addCustomMode,
    BuiltInMode,
    CustomMode,
    deleteCustomMode,
    hideMode,
    ModeMethod,
    resetAllToDefaults,
    unhideMode,
    updateCustomMode,
} from '@/utils/phraseStorage';

const LANGUAGES = [
    { code: 'en' as const, name: 'English' },
    { code: 'es' as const, name: 'Español' },
    { code: 'pt' as const, name: 'Português' },
];

const THEMES = [
    { mode: 'auto' as const, nameKey: 'auto' },
    { mode: 'black' as const, nameKey: 'black' },
    { mode: 'dark' as const, nameKey: 'dark' },
    { mode: 'light' as const, nameKey: 'light' },
    { mode: 'white' as const, nameKey: 'white' },
];

const TRANSLATIONS = {
    en: {
        title: 'Settings',
        languageSection: 'Language',
        themeSection: 'Theme',
        themeAuto: 'Auto (System)',
        themeBlack: 'Black',
        themeDark: 'Dark',
        themeLight: 'Light',
        themeWhite: 'White',
        modesSection: 'Customize modes',
        modesDescription: 'Show or hide modes on the home screen',
        hideButton: 'Hide',
        showButton: 'Show',
        createCustomMode: 'Create custom mode',
        renameButton: 'Rename',
        deleteButton: 'Delete',
        createModeTitle: 'Create custom mode',
        renameModeTitle: 'Rename mode',
        modeNamePlaceholder: 'Mode name',
        saveButton: 'Save',
        deleteConfirmTitle: 'Delete mode?',
        deleteConfirmMessage: 'This will delete the mode and all its phrases. This cannot be undone.',
        emptyNameError: 'Please enter a name',
        defaultModeLabel: 'Default',
        phrasesSection: 'Customize phrases',
        phrasesDescription: 'Add, remove, or hide phrases for each mode',
        panic: 'Panic',
        anxiety: 'Anxiety',
        sadness: 'Sadness',
        anger: 'Anger',
        grounding: 'Grounding',
        values: 'Values',
        methodSection: 'Method',
        methodSit: 'SIT',
        methodSitDesc: 'Preparation, confrontation, reinforcement',
        methodRandom: 'Random',
        methodRandomDesc: 'Randomly picks one phrase each time',
        methodSeeAll: 'See all',
        methodSeeAllDesc: 'Shows all phrases in sequence',
        resetSection: 'Reset',
        resetButton: 'Reset to defaults',
        resetConfirmTitle: 'Reset to defaults?',
        resetConfirmMessage: 'This will remove all your custom phrases, custom modes, and restore default mode visibility. This cannot be undone.',
        resetConfirmButton: 'Reset',
        cancelButton: 'Cancel',
    },
    es: {
        title: 'Configuración',
        languageSection: 'Idioma',
        themeSection: 'Tema',
        themeAuto: 'Automático (Sistema)',
        themeBlack: 'Negro',
        themeDark: 'Oscuro',
        themeLight: 'Claro',
        themeWhite: 'Blanco',
        modesSection: 'Personalizar modos',
        modesDescription: 'Mostrar u ocultar modos en la pantalla principal',
        hideButton: 'Ocultar',
        showButton: 'Mostrar',
        createCustomMode: 'Crear modo personalizado',
        renameButton: 'Renombrar',
        deleteButton: 'Eliminar',
        createModeTitle: 'Crear modo personalizado',
        renameModeTitle: 'Renombrar modo',
        modeNamePlaceholder: 'Nombre del modo',
        saveButton: 'Guardar',
        deleteConfirmTitle: '¿Eliminar modo?',
        deleteConfirmMessage: 'Esto eliminará el modo y todas sus frases. Esta acción no se puede deshacer.',
        emptyNameError: 'Por favor, ingrese un nombre',
        defaultModeLabel: 'Predeterminado',
        phrasesSection: 'Personalizar frases',
        phrasesDescription: 'Agregar, eliminar u ocultar frases para cada modo',
        panic: 'Pánico',
        anxiety: 'Ansiedad',
        sadness: 'Tristeza',
        anger: 'Ira',
        grounding: 'Conexión',
        values: 'Valores',
        methodSection: 'Método',
        methodSit: 'SIT',
        methodSitDesc: 'Preparación, confrontación, refuerzo',
        methodRandom: 'Aleatorio',
        methodRandomDesc: 'Elige una frase al azar cada vez',
        methodSeeAll: 'Ver todo',
        methodSeeAllDesc: 'Muestra todas las frases en secuencia',
        resetSection: 'Restablecer',
        resetButton: 'Restablecer valores predeterminados',
        resetConfirmTitle: '¿Restablecer valores predeterminados?',
        resetConfirmMessage: 'Esto eliminará todas tus frases personalizadas, modos personalizados y restaurará la visibilidad predeterminada. Esta acción no se puede deshacer.',
        resetConfirmButton: 'Restablecer',
        cancelButton: 'Cancelar',
    },
    pt: {
        title: 'Configurações',
        languageSection: 'Idioma',
        themeSection: 'Tema',
        themeAuto: 'Automático (Sistema)',
        themeBlack: 'Preto',
        themeDark: 'Escuro',
        themeLight: 'Claro',
        themeWhite: 'Branco',
        modesSection: 'Personalizar modos',
        modesDescription: 'Mostrar ou ocultar modos na tela inicial',
        hideButton: 'Ocultar',
        showButton: 'Mostrar',
        createCustomMode: 'Criar modo personalizado',
        renameButton: 'Renomear',
        deleteButton: 'Excluir',
        createModeTitle: 'Criar modo personalizado',
        renameModeTitle: 'Renomear modo',
        modeNamePlaceholder: 'Nome do modo',
        saveButton: 'Salvar',
        deleteConfirmTitle: 'Excluir modo?',
        deleteConfirmMessage: 'Isso excluirá o modo e todas as suas frases. Esta ação não pode ser desfeita.',
        emptyNameError: 'Por favor, insira um nome',
        defaultModeLabel: 'Padrão',
        phrasesSection: 'Personalizar frases',
        phrasesDescription: 'Adicionar, excluir ou ocultar frases para cada modo',
        panic: 'Pânico',
        anxiety: 'Ansiedade',
        sadness: 'Tristeza',
        anger: 'Raiva',
        grounding: 'Aterramento',
        values: 'Valores',
        methodSection: 'Método',
        methodSit: 'SIT',
        methodSitDesc: 'Preparação, confrontação, reforço',
        methodRandom: 'Aleatório',
        methodRandomDesc: 'Escolhe uma frase aleatória a cada vez',
        methodSeeAll: 'Ver tudo',
        methodSeeAllDesc: 'Mostra todas as frases em sequência',
        resetSection: 'Redefinir',
        resetButton: 'Redefinir para padrões',
        resetConfirmTitle: 'Redefinir para padrões?',
        resetConfirmMessage: 'Isso removerá todas as suas frases personalizadas, modos personalizados e restaurará a visibilidade padrão. Esta ação não pode ser desfeita.',
        resetConfirmButton: 'Redefinir',
        cancelButton: 'Cancelar',
    },
};

export default function SettingsScreen() {
    const { language, setLanguage } = useLanguage();
    const { themeMode, setThemeMode } = useTheme();
    const t = TRANSLATIONS[language];
    const { 
        background: backgroundColor,
        text: textColor,
        textSecondary: secondaryTextColor,
        border: borderColor, 
        borderSelected: borderSelectedColor,
        danger: dangerColor,
        overlay: overlayColor,
    } = useColors('background', 'text', 'textSecondary', 'border', 'borderSelected', 'danger', 'overlay');
    const { modes: modesWithVisibility, refetch: refetchModes } = useModesWithVisibility();
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    
    // Custom mode management state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [newModeName, setNewModeName] = useState('');
    const [newModeMethod, setNewModeMethod] = useState<ModeMethod>('sit');
    const [editingMode, setEditingMode] = useState<CustomMode | null>(null);
    const [modeToDelete, setModeToDelete] = useState<CustomMode | null>(null);

    const getThemeName = useCallback((themeKey: string) => {
        switch (themeKey) {
            case 'auto':
                return t.themeAuto;
            case 'black':
                return t.themeBlack;
            case 'dark':
                return t.themeDark;
            case 'light':
                return t.themeLight;
            case 'white':
                return t.themeWhite;
            default:
                return themeKey;
        }
    }, [t.themeAuto, t.themeBlack, t.themeDark, t.themeLight, t.themeWhite]);

    // Helper to get translated mode name (works for both built-in and custom modes)
    const getModeLabel = useCallback((mode: DisplayMode): string => {
        if (isCustomMode(mode)) {
            return mode.name;
        }
        return t[mode as BuiltInMode];
    }, [t]);

    // Handle hide mode
    const handleHideMode = useCallback(async (mode: DisplayMode) => {
        // Prevent hiding the last visible mode
        const visibleModes = modesWithVisibility.filter(m => !m.isHidden);
        if (visibleModes.length <= 1) {
            return;
        }
        const modeId = getModeId(mode);
        await hideMode(modeId);
        await refetchModes();
    }, [modesWithVisibility, refetchModes]);

    // Handle show mode
    const handleShowMode = useCallback(async (mode: DisplayMode) => {
        const modeId = getModeId(mode);
        await unhideMode(modeId);
        await refetchModes();
    }, [refetchModes]);

    // Handle create custom mode
    const handleCreateMode = useCallback(async () => {
        if (!newModeName.trim()) {
            return;
        }
        try {
            await addCustomMode(newModeName.trim(), newModeMethod);
            setNewModeName('');
            setNewModeMethod('sit');
            setShowCreateModal(false);
            await refetchModes();
        } catch (error) {
            console.warn('Failed to create custom mode:', error);
        }
    }, [newModeName, newModeMethod, refetchModes]);

    // Handle rename custom mode
    const handleRenameMode = useCallback(async () => {
        if (!editingMode || !newModeName.trim()) {
            return;
        }
        try {
            await updateCustomMode(editingMode.id, newModeName.trim());
            setNewModeName('');
            setEditingMode(null);
            setShowRenameModal(false);
            await refetchModes();
        } catch (error) {
            console.warn('Failed to rename custom mode:', error);
        }
    }, [editingMode, newModeName, refetchModes]);

    // Handle delete custom mode
    const handleDeleteMode = useCallback(async () => {
        if (!modeToDelete) {
            return;
        }
        try {
            await deleteCustomMode(modeToDelete.id);
            setModeToDelete(null);
            setShowDeleteConfirm(false);
            await refetchModes();
        } catch (error) {
            console.warn('Failed to delete custom mode:', error);
        }
    }, [modeToDelete, refetchModes]);

    // Open rename modal
    const openRenameModal = useCallback((mode: CustomMode) => {
        setEditingMode(mode);
        setNewModeName(mode.name);
        setShowRenameModal(true);
    }, []);

    // Open delete confirmation
    const openDeleteConfirm = useCallback((mode: CustomMode) => {
        setModeToDelete(mode);
        setShowDeleteConfirm(true);
    }, []);

    // Handle reset to defaults
    const handleReset = useCallback(async () => {
        try {
            await resetAllToDefaults();
            await refetchModes();
            setShowResetConfirm(false);
        } catch (error) {
            console.warn('Failed to reset to defaults:', error);
        }
    }, [refetchModes]);

    // Memoized base styles
    const optionItemStyle = useMemo(() => ({
        ...styles.optionItem,
        borderColor,
    }), [borderColor]);

    const optionItemSelectedStyle = useMemo(() => ({
        ...styles.optionItem,
        ...styles.optionItemSelected,
        borderColor: borderSelectedColor,
    }), [borderSelectedColor]);

    // Helper to get the correct style based on selection state
    const getOptionStyle = useCallback((isSelected: boolean): ViewStyle => {
        return isSelected ? optionItemSelectedStyle : optionItemStyle;
    }, [optionItemStyle, optionItemSelectedStyle]);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>{t.themeSection}</Text>

                <View style={styles.optionList}>
                    {THEMES.map((theme) => {
                        const isSelected = themeMode === theme.mode;
                        const themeName = getThemeName(theme.nameKey);
                        return (
                            <PressableFeedback
                                key={theme.mode}
                                style={getOptionStyle(isSelected)}
                                onPress={() => setThemeMode(theme.mode)}
                                accessibilityRole="radio"
                                accessibilityLabel={themeName}
                                accessibilityState={{ selected: isSelected }}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        isSelected && styles.optionTextSelected,
                                    ]}
                                >
                                    {themeName}
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
                                style={getOptionStyle(isSelected)}
                                onPress={() => setLanguage(lang.code)}
                                accessibilityRole="radio"
                                accessibilityLabel={lang.name}
                                accessibilityState={{ selected: isSelected }}
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

                <Text style={[styles.sectionTitle, styles.sectionSpacing]}>{t.modesSection}</Text>
                <Text style={styles.sectionDescription}>{t.modesDescription}</Text>

                <View style={styles.optionList}>
                    {modesWithVisibility.map(({ mode, isHidden, isCustom }) => {
                        const visibleCount = modesWithVisibility.filter(m => !m.isHidden).length;
                        const isLastVisible = !isHidden && visibleCount <= 1;
                        const modeKey = getModeId(mode);
                        
                        return (
                            <View
                                key={modeKey}
                                style={[
                                    styles.modeItem,
                                    { borderColor },
                                    isHidden && styles.modeItemHidden,
                                ]}
                            >
                                <View style={styles.modeNameContainer}>
                                    <Text
                                        style={[
                                            styles.optionText,
                                            isHidden && styles.modeTextHidden,
                                        ]}
                                    >
                                        {getModeLabel(mode)}
                                    </Text>
                                    {!isCustom && (
                                        <Text style={[styles.defaultBadge, { color: secondaryTextColor }]}>
                                            {t.defaultModeLabel}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.modeActions}>
                                    {isCustom && isCustomMode(mode) && (
                                        <>
                                            <PressableFeedback
                                                style={styles.toggleButton}
                                                onPress={() => openRenameModal(mode)}
                                                accessibilityRole="button"
                                                accessibilityLabel={`${t.renameButton} ${getModeLabel(mode)}`}
                                            >
                                                <Text style={styles.toggleButtonText}>
                                                    {t.renameButton}
                                                </Text>
                                            </PressableFeedback>
                                            <PressableFeedback
                                                style={styles.toggleButton}
                                                onPress={() => openDeleteConfirm(mode)}
                                                accessibilityRole="button"
                                                accessibilityLabel={`${t.deleteButton} ${getModeLabel(mode)}`}
                                            >
                                                <Text style={[styles.toggleButtonText, { color: dangerColor }]}>
                                                    {t.deleteButton}
                                                </Text>
                                            </PressableFeedback>
                                        </>
                                    )}
                                    <PressableFeedback
                                        style={[
                                            styles.toggleButton,
                                            isLastVisible && styles.toggleButtonDisabled,
                                        ]}
                                        onPress={() => isHidden ? handleShowMode(mode) : handleHideMode(mode)}
                                        disabled={isLastVisible}
                                        accessibilityRole="button"
                                        accessibilityLabel={`${isHidden ? t.showButton : t.hideButton} ${getModeLabel(mode)}`}
                                        accessibilityState={{ disabled: isLastVisible }}
                                    >
                                        <Text
                                            style={[
                                                styles.toggleButtonText,
                                                isLastVisible && styles.toggleButtonTextDisabled,
                                            ]}
                                        >
                                            {isHidden ? t.showButton : t.hideButton}
                                        </Text>
                                    </PressableFeedback>
                                </View>
                            </View>
                        );
                    })}
                    
                    {/* Create custom mode button */}
                    <PressableFeedback
                        style={[styles.createModeButton, { borderColor }]}
                        onPress={() => setShowCreateModal(true)}
                        accessibilityRole="button"
                        accessibilityLabel={t.createCustomMode}
                    >
                        <Text style={styles.createModeButtonText}>+ {t.createCustomMode}</Text>
                    </PressableFeedback>
                </View>

                <Text style={[styles.sectionTitle, styles.sectionSpacing]}>{t.phrasesSection}</Text>
                <Text style={styles.sectionDescription}>{t.phrasesDescription}</Text>

                <View style={styles.optionList}>
                    {/* Dynamically render phrase editing links for all modes */}
                    {modesWithVisibility.map(({ mode }) => {
                        const modeId = getModeId(mode);
                        const label = getModeLabel(mode);
                        
                        return (
                            <Link key={modeId} href={`/edit-phrases/${modeId}`} asChild>
                                <PressableFeedback
                                    style={optionItemStyle}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${t.phrasesSection} — ${label}`}
                                >
                                    <Text style={styles.optionText}>{label}</Text>
                                </PressableFeedback>
                            </Link>
                        );
                    })}
                </View>

                <Text style={[styles.sectionTitle, styles.sectionSpacing]}>{t.resetSection}</Text>

                <PressableFeedback
                    style={[styles.resetButton, { borderColor: dangerColor }]}
                    onPress={() => setShowResetConfirm(true)}
                    accessibilityRole="button"
                    accessibilityLabel={t.resetButton}
                >
                    <Text style={[styles.resetButtonText, { color: dangerColor }]}>
                        {t.resetButton}
                    </Text>
                </PressableFeedback>
            </ScrollView>

            {/* Reset confirmation modal */}
            <Modal
                visible={showResetConfirm}
                transparent
                animationType="fade"
                onRequestClose={() => setShowResetConfirm(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: overlayColor }]}>
                    <View style={[styles.modalContent, { backgroundColor }]}>
                        <Text style={styles.modalTitle}>{t.resetConfirmTitle}</Text>
                        <Text style={styles.modalMessage}>{t.resetConfirmMessage}</Text>

                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.modalButton, { borderColor }]}
                                onPress={() => setShowResetConfirm(false)}
                            >
                                <Text style={styles.modalButtonText}>
                                    {t.cancelButton}
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, styles.modalButtonDanger, { borderColor: dangerColor }]}
                                onPress={handleReset}
                            >
                                <Text style={[styles.modalButtonText, { color: dangerColor }]}>
                                    {t.resetConfirmButton}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Create custom mode modal */}
            <Modal
                visible={showCreateModal}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setShowCreateModal(false);
                    setNewModeName('');
                    setNewModeMethod('sit');
                }}
            >
                <View style={[styles.modalOverlay, { backgroundColor: overlayColor }]}>
                    <View style={[styles.modalContent, { backgroundColor }]}>
                        <Text style={styles.modalTitle}>{t.createModeTitle}</Text>

                        <TextInput
                            style={[
                                styles.input,
                                { 
                                    borderColor,
                                    color: textColor,
                                    backgroundColor,
                                },
                            ]}
                            placeholder={t.modeNamePlaceholder}
                            placeholderTextColor={secondaryTextColor}
                            value={newModeName}
                            onChangeText={setNewModeName}
                            autoFocus
                        />

                        <View>
                            <Text style={styles.methodSectionLabel}>{t.methodSection}</Text>
                            <View style={styles.methodOptions}>
                                {(['sit', 'random', 'seeAll'] as ModeMethod[]).map((method) => {
                                    const isSelected = newModeMethod === method;
                                    const label = method === 'sit' ? t.methodSit
                                        : method === 'random' ? t.methodRandom
                                        : t.methodSeeAll;
                                    const desc = method === 'sit' ? t.methodSitDesc
                                        : method === 'random' ? t.methodRandomDesc
                                        : t.methodSeeAllDesc;
                                    return (
                                        <Pressable
                                            key={method}
                                            style={[
                                                styles.methodOption,
                                                { borderColor: isSelected ? borderSelectedColor : borderColor },
                                                isSelected && styles.methodOptionSelected,
                                            ]}
                                            onPress={() => setNewModeMethod(method)}
                                            accessibilityRole="radio"
                                            accessibilityLabel={label}
                                            accessibilityState={{ selected: isSelected }}
                                        >
                                            <Text style={[
                                                styles.methodOptionLabel,
                                                isSelected && styles.methodOptionLabelSelected,
                                            ]}>
                                                {label}
                                            </Text>
                                            <Text style={[styles.methodOptionDesc, { color: secondaryTextColor }]}>
                                                {desc}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.modalButton, { borderColor }]}
                                onPress={() => {
                                    setShowCreateModal(false);
                                    setNewModeName('');
                                    setNewModeMethod('sit');
                                }}
                            >
                                <Text style={styles.modalButtonText}>
                                    {t.cancelButton}
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, styles.modalButtonPrimary, { borderColor }]}
                                onPress={handleCreateMode}
                            >
                                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                                    {t.saveButton}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Rename custom mode modal */}
            <Modal
                visible={showRenameModal}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setShowRenameModal(false);
                    setEditingMode(null);
                    setNewModeName('');
                }}
            >
                <View style={[styles.modalOverlay, { backgroundColor: overlayColor }]}>
                    <View style={[styles.modalContent, { backgroundColor }]}>
                        <Text style={styles.modalTitle}>{t.renameModeTitle}</Text>

                        <TextInput
                            style={[
                                styles.input,
                                { 
                                    borderColor,
                                    color: textColor,
                                    backgroundColor,
                                },
                            ]}
                            placeholder={t.modeNamePlaceholder}
                            placeholderTextColor={secondaryTextColor}
                            value={newModeName}
                            onChangeText={setNewModeName}
                            autoFocus
                        />

                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.modalButton, { borderColor }]}
                                onPress={() => {
                                    setShowRenameModal(false);
                                    setEditingMode(null);
                                    setNewModeName('');
                                }}
                            >
                                <Text style={styles.modalButtonText}>
                                    {t.cancelButton}
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, styles.modalButtonPrimary, { borderColor }]}
                                onPress={handleRenameMode}
                            >
                                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                                    {t.saveButton}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete custom mode confirmation modal */}
            <Modal
                visible={showDeleteConfirm}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setShowDeleteConfirm(false);
                    setModeToDelete(null);
                }}
            >
                <View style={[styles.modalOverlay, { backgroundColor: overlayColor }]}>
                    <View style={[styles.modalContent, { backgroundColor }]}>
                        <Text style={styles.modalTitle}>{t.deleteConfirmTitle}</Text>
                        <Text style={styles.modalMessage}>{t.deleteConfirmMessage}</Text>

                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.modalButton, { borderColor }]}
                                onPress={() => {
                                    setShowDeleteConfirm(false);
                                    setModeToDelete(null);
                                }}
                            >
                                <Text style={styles.modalButtonText}>
                                    {t.cancelButton}
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, styles.modalButtonDanger, { borderColor: dangerColor }]}
                                onPress={handleDeleteMode}
                            >
                                <Text style={[styles.modalButtonText, { color: dangerColor }]}>
                                    {t.deleteButton}
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
    modeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingLeft: 20,
        paddingRight: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    modeItemHidden: {
        opacity: 0.5,
    },
    modeNameContainer: {
        flex: 1,
        gap: 4,
    },
    modeTextHidden: {
        opacity: 0.6,
    },
    defaultBadge: {
        fontSize: 12,
        fontWeight: '300',
    },
    modeActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    toggleButtonDisabled: {
        opacity: 0.3,
    },
    toggleButtonText: {
        fontSize: 14,
        fontWeight: '400',
    },
    toggleButtonTextDisabled: {
        opacity: 0.5,
    },
    createModeButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
    },
    createModeButtonText: {
        fontSize: 16,
        fontWeight: '300',
        opacity: 0.7,
    },
    resetButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    resetButtonText: {
        fontSize: 16,
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
    modalMessage: {
        fontSize: 16,
        fontWeight: '300',
        lineHeight: 24,
        opacity: 0.8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 48,
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
    modalButtonDanger: {
        borderWidth: 2,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '400',
    },
    modalButtonTextPrimary: {
        fontWeight: '500',
    },
    methodSectionLabel: {
        fontSize: 14,
        fontWeight: '400',
        marginBottom: 8,
    },
    methodOptions: {
        gap: 8,
    },
    methodOption: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1,
    },
    methodOptionSelected: {
        borderWidth: 2,
    },
    methodOptionLabel: {
        fontSize: 15,
        fontWeight: '300',
    },
    methodOptionLabelSelected: {
        fontWeight: '400',
    },
    methodOptionDesc: {
        fontSize: 12,
        fontWeight: '300',
        marginTop: 2,
    },
});
