import { Link } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, ViewStyle } from 'react-native';

import PressableFeedback from '@/components/PressableFeedback';
import { Text, View } from '@/components/Themed';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useColors } from '@/hooks/useColor';
import { useModesWithVisibility } from '@/hooks/useModes';
import { hideMode, unhideMode, resetAllToDefaults, Mode } from '@/utils/phraseStorage';

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
        modesSection: 'Customize modes',
        modesDescription: 'Show or hide modes on the home screen',
        hideButton: 'Hide',
        showButton: 'Show',
        phrasesSection: 'Customize phrases',
        phrasesDescription: 'Add, remove, or hide phrases for each mode',
        panic: 'Panic',
        anxiety: 'Anxiety',
        sadness: 'Sadness',
        anger: 'Anger',
        grounding: 'Grounding',
        resetSection: 'Reset',
        resetButton: 'Reset to defaults',
        resetConfirmTitle: 'Reset to defaults?',
        resetConfirmMessage: 'This will remove all your custom phrases and restore default mode visibility. This cannot be undone.',
        resetConfirmButton: 'Reset',
        cancelButton: 'Cancel',
    },
    es: {
        title: 'Configuración',
        languageSection: 'Idioma',
        themeSection: 'Tema',
        themeAuto: 'Automático (Sistema)',
        themeLight: 'Claro',
        themeDark: 'Oscuro',
        modesSection: 'Personalizar modos',
        modesDescription: 'Mostrar u ocultar modos en la pantalla principal',
        hideButton: 'Ocultar',
        showButton: 'Mostrar',
        phrasesSection: 'Personalizar frases',
        phrasesDescription: 'Agregar, eliminar u ocultar frases para cada modo',
        panic: 'Pánico',
        anxiety: 'Ansiedad',
        sadness: 'Tristeza',
        anger: 'Ira',
        grounding: 'Conexión',
        resetSection: 'Restablecer',
        resetButton: 'Restablecer valores predeterminados',
        resetConfirmTitle: '¿Restablecer valores predeterminados?',
        resetConfirmMessage: 'Esto eliminará todas tus frases personalizadas y restaurará la visibilidad predeterminada de los modos. Esta acción no se puede deshacer.',
        resetConfirmButton: 'Restablecer',
        cancelButton: 'Cancelar',
    },
    pt: {
        title: 'Configurações',
        languageSection: 'Idioma',
        themeSection: 'Tema',
        themeAuto: 'Automático (Sistema)',
        themeLight: 'Claro',
        themeDark: 'Escuro',
        modesSection: 'Personalizar modos',
        modesDescription: 'Mostrar ou ocultar modos na tela inicial',
        hideButton: 'Ocultar',
        showButton: 'Mostrar',
        phrasesSection: 'Personalizar frases',
        phrasesDescription: 'Adicionar, excluir ou ocultar frases para cada modo',
        panic: 'Pânico',
        anxiety: 'Ansiedade',
        sadness: 'Tristeza',
        anger: 'Raiva',
        grounding: 'Aterramento',
        resetSection: 'Redefinir',
        resetButton: 'Redefinir para padrões',
        resetConfirmTitle: 'Redefinir para padrões?',
        resetConfirmMessage: 'Isso removerá todas as suas frases personalizadas e restaurará a visibilidade padrão dos modos. Esta ação não pode ser desfeita.',
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
        border: borderColor, 
        borderSelected: borderSelectedColor,
        danger: dangerColor,
        overlay: overlayColor,
    } = useColors('background', 'border', 'borderSelected', 'danger', 'overlay');
    const { modes: modesWithVisibility, refetch: refetchModes } = useModesWithVisibility();
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const getThemeName = useCallback((themeKey: string) => {
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
    }, [t.themeAuto, t.themeLight, t.themeDark]);

    // Helper to get translated mode name
    const getModeLabel = useCallback((mode: Mode): string => {
        return t[mode];
    }, [t]);

    // Handle hide mode
    const handleHideMode = useCallback(async (mode: Mode) => {
        // Prevent hiding the last visible mode
        const visibleModes = modesWithVisibility.filter(m => !m.isHidden);
        if (visibleModes.length <= 1) {
            return;
        }
        await hideMode(mode);
        await refetchModes();
    }, [modesWithVisibility, refetchModes]);

    // Handle show mode
    const handleShowMode = useCallback(async (mode: Mode) => {
        await unhideMode(mode);
        await refetchModes();
    }, [refetchModes]);

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
                        return (
                            <PressableFeedback
                                key={theme.mode}
                                style={getOptionStyle(isSelected)}
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
                                style={getOptionStyle(isSelected)}
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

                <Text style={[styles.sectionTitle, styles.sectionSpacing]}>{t.modesSection}</Text>
                <Text style={styles.sectionDescription}>{t.modesDescription}</Text>

                <View style={styles.optionList}>
                    {modesWithVisibility.map(({ mode, isHidden }) => {
                        const visibleCount = modesWithVisibility.filter(m => !m.isHidden).length;
                        const isLastVisible = !isHidden && visibleCount <= 1;
                        
                        return (
                            <View
                                key={mode}
                                style={[
                                    styles.modeItem,
                                    { borderColor },
                                    isHidden && styles.modeItemHidden,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        isHidden && styles.modeTextHidden,
                                    ]}
                                >
                                    {getModeLabel(mode)}
                                </Text>
                                <PressableFeedback
                                    style={[
                                        styles.toggleButton,
                                        isLastVisible && styles.toggleButtonDisabled,
                                    ]}
                                    onPress={() => isHidden ? handleShowMode(mode) : handleHideMode(mode)}
                                    disabled={isLastVisible}
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
                        );
                    })}
                </View>

                <Text style={[styles.sectionTitle, styles.sectionSpacing]}>{t.phrasesSection}</Text>
                <Text style={styles.sectionDescription}>{t.phrasesDescription}</Text>

                <View style={styles.optionList}>
                    <Link href="/edit-phrases/panic" asChild>
                        <PressableFeedback style={optionItemStyle}>
                            <Text style={styles.optionText}>{t.panic}</Text>
                        </PressableFeedback>
                    </Link>
                    <Link href="/edit-phrases/anxiety" asChild>
                        <PressableFeedback style={optionItemStyle}>
                            <Text style={styles.optionText}>{t.anxiety}</Text>
                        </PressableFeedback>
                    </Link>
                    <Link href="/edit-phrases/sadness" asChild>
                        <PressableFeedback style={optionItemStyle}>
                            <Text style={styles.optionText}>{t.sadness}</Text>
                        </PressableFeedback>
                    </Link>
                    <Link href="/edit-phrases/anger" asChild>
                        <PressableFeedback style={optionItemStyle}>
                            <Text style={styles.optionText}>{t.anger}</Text>
                        </PressableFeedback>
                    </Link>
                    <Link href="/edit-phrases/grounding" asChild>
                        <PressableFeedback style={optionItemStyle}>
                            <Text style={styles.optionText}>{t.grounding}</Text>
                        </PressableFeedback>
                    </Link>
                </View>

                <Text style={[styles.sectionTitle, styles.sectionSpacing]}>{t.resetSection}</Text>

                <PressableFeedback
                    style={[styles.resetButton, { borderColor: dangerColor }]}
                    onPress={() => setShowResetConfirm(true)}
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
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
    },
    modeItemHidden: {
        opacity: 0.5,
    },
    modeTextHidden: {
        opacity: 0.6,
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
    modalButtonDanger: {
        borderWidth: 2,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '400',
    },
});
