import * as MediaLibrary from 'expo-media-library';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import ViewShot from 'react-native-view-shot';

import WallpaperCanvas from '@/components/WallpaperCanvas';
import { Text, View } from '@/components/Themed';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColor } from '@/hooks/useColor';
import { WALLPAPER_TEMPLATES, WallpaperTemplate } from '@/constants/wallpaperTemplates';
import { getPhrasesByMode } from '@/utils/getAllPhrases';

const TRANSLATIONS = {
  en: {
    inputPlaceholder: 'Type a phrase...',
    pickLabel: 'Pick a phrase',
    templateLabel: 'Background',
    fontSizeLabel: 'Font size',
    saveButton: 'Save to Photos',
    saved: 'Saved!',
    permissionDenied: 'Permission needed',
    permissionMessage: 'Please allow photo library access in Settings to save wallpapers.',
    back: '←',
    close: '✕',
    chooseModeTitle: 'Choose a category',
  },
  es: {
    inputPlaceholder: 'Escribe una frase...',
    pickLabel: 'Elige una frase',
    templateLabel: 'Fondo',
    fontSizeLabel: 'Tamaño de fuente',
    saveButton: 'Guardar en Fotos',
    saved: 'Guardado!',
    permissionDenied: 'Permiso necesario',
    permissionMessage: 'Permite el acceso a la biblioteca de fotos en Configuración para guardar fondos de pantalla.',
    back: '←',
    close: '✕',
    chooseModeTitle: 'Elige una categoría',
  },
  pt: {
    inputPlaceholder: 'Digite uma frase...',
    pickLabel: 'Escolha uma frase',
    templateLabel: 'Fundo',
    fontSizeLabel: 'Tamanho da fonte',
    saveButton: 'Salvar nas Fotos',
    saved: 'Salvo!',
    permissionDenied: 'Permissão necessária',
    permissionMessage: 'Permita o acesso à biblioteca de fotos nas Configurações para salvar papéis de parede.',
    back: '←',
    close: '✕',
    chooseModeTitle: 'Escolha uma categoria',
  },
};

export default function WallpaperScreen() {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language];
  const borderColor = useColor('border');
  const borderSelectedColor = useColor('borderSelected');
  const textColor = useColor('text');
  const textSecondaryColor = useColor('textSecondary');
  const backgroundColor = useColor('background');
  const screen = useWindowDimensions();

  const [phrase, setPhrase] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WallpaperTemplate>(WALLPAPER_TEMPLATES[0]);
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [fontSize, setFontSize] = useState(24);

  // Modal state
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<string | null>(null);

  const fullResRef = useRef<ViewShot>(null);

  const phrasesByMode = useMemo(() => getPhrasesByMode(language), [language]);

  // Preview dimensions: ~55% of screen width, proportional height
  const previewWidth = Math.round(screen.width * 0.55);
  const previewHeight = Math.round(previewWidth * (screen.height / screen.width));

  // Font size scaled for full-res canvas
  const fullResFontSize = Math.round(fontSize * (screen.width / previewWidth));

  const handleSave = useCallback(async () => {
    if (!phrase.trim()) return;
    setSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t.permissionDenied, t.permissionMessage);
        return;
      }
      const uri = await fullResRef.current?.capture?.();
      if (uri) {
        await MediaLibrary.saveToLibraryAsync(uri);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
      }
    } catch (err) {
      console.warn('Failed to save wallpaper:', err);
    } finally {
      setSaving(false);
    }
  }, [phrase, t]);

  const closePicker = useCallback(() => {
    setShowPicker(false);
    setPickerMode(null);
  }, []);

  const handlePickPhrase = useCallback((text: string) => {
    setPhrase(text);
    closePicker();
  }, [closePicker]);

  const inputStyle = useMemo(() => ({
    ...styles.input,
    borderColor,
    color: textColor,
  }), [borderColor, textColor]);

  const selectedModeData = pickerMode
    ? phrasesByMode.find((m) => m.mode === pickerMode)
    : null;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Phrase input */}
        <TextInput
          style={inputStyle}
          placeholder={t.inputPlaceholder}
          placeholderTextColor={textSecondaryColor}
          value={phrase}
          onChangeText={setPhrase}
          multiline
        />

        {/* Pick a phrase button */}
        <TouchableOpacity
          style={[styles.pickButton, { borderColor }]}
          onPress={() => setShowPicker(true)}
          activeOpacity={0.6}
        >
          <Text style={[styles.pickButtonText, { color: textColor }]}>{t.pickLabel}</Text>
        </TouchableOpacity>

        {/* Template selector */}
        <Text style={[styles.label, { color: textSecondaryColor }]}>{t.templateLabel}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.templateScroll}
          contentContainerStyle={styles.templateScrollContent}
        >
          {WALLPAPER_TEMPLATES.map((tmpl) => {
            const isSelected = tmpl.id === selectedTemplate.id;
            const swatchBg = tmpl.type === 'solid' ? tmpl.color : tmpl.colors[0];
            return (
              <TouchableOpacity
                key={tmpl.id}
                style={[
                  styles.swatch,
                  { backgroundColor: swatchBg, borderColor: isSelected ? borderSelectedColor : borderColor },
                  isSelected && styles.swatchSelected,
                ]}
                onPress={() => setSelectedTemplate(tmpl)}
                activeOpacity={0.6}
              />
            );
          })}
        </ScrollView>

        {/* Font size control */}
        <Text style={[styles.label, { color: textSecondaryColor }]}>{t.fontSizeLabel}</Text>
        <View style={styles.fontSizeRow}>
          <TouchableOpacity
            style={[styles.fontSizeButton, { borderColor }]}
            onPress={() => setFontSize((s) => Math.max(16, s - 2))}
            activeOpacity={0.6}
          >
            <Text style={styles.fontSizeButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={[styles.fontSizeValue, { color: textColor }]}>{fontSize}</Text>
          <TouchableOpacity
            style={[styles.fontSizeButton, { borderColor }]}
            onPress={() => setFontSize((s) => Math.min(48, s + 2))}
            activeOpacity={0.6}
          >
            <Text style={styles.fontSizeButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Live preview */}
        <View style={styles.previewContainer}>
          <WallpaperCanvas
            template={selectedTemplate}
            phrase={phrase}
            width={previewWidth}
            height={previewHeight}
            fontSize={fontSize}
          />
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveButton, { borderColor }]}
          onPress={handleSave}
          activeOpacity={0.6}
          disabled={saving || !phrase.trim()}
        >
          <Text style={[styles.saveButtonText, (!phrase.trim() || saving) && styles.saveButtonDisabled]}>
            {showSaved ? t.saved : t.saveButton}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Hidden full-res canvas for capture */}
      <View style={styles.hiddenCanvas}>
        <WallpaperCanvas
          ref={fullResRef}
          template={selectedTemplate}
          phrase={phrase}
          width={screen.width}
          height={screen.height}
          fontSize={fullResFontSize}
        />
      </View>

      {/* Phrase picker modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={closePicker}
      >
        <View style={[styles.modalOverlay, { backgroundColor }]}>
          {/* Modal header */}
          <View style={styles.modalHeader}>
            {pickerMode ? (
              <TouchableOpacity onPress={() => setPickerMode(null)} style={styles.modalHeaderButton}>
                <Text style={[styles.modalHeaderButtonText, { color: textColor }]}>{t.back}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.modalHeaderButton} />
            )}
            <Text style={[styles.modalTitle, { color: textColor }]}>
              {selectedModeData ? selectedModeData.label : t.chooseModeTitle}
            </Text>
            <TouchableOpacity onPress={closePicker} style={styles.modalHeaderButton}>
              <Text style={[styles.modalHeaderButtonText, { color: textColor }]}>{t.close}</Text>
            </TouchableOpacity>
          </View>

          {/* Modal content */}
          <ScrollView contentContainerStyle={styles.modalContent}>
            {!pickerMode ? (
              // Step 1: Mode list
              phrasesByMode.map((group) => (
                <TouchableOpacity
                  key={group.mode}
                  style={[styles.modalItem, { borderColor }]}
                  onPress={() => setPickerMode(group.mode)}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.modalItemText, { color: textColor }]}>{group.label}</Text>
                  <Text style={[styles.modalItemCount, { color: textSecondaryColor }]}>{group.phrases.length}</Text>
                </TouchableOpacity>
              ))
            ) : (
              // Step 2: Phrase list
              selectedModeData?.phrases.map((text) => (
                <TouchableOpacity
                  key={text}
                  style={[styles.modalItem, { borderColor }]}
                  onPress={() => handlePickPhrase(text)}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.modalItemText, { color: textColor }]}>{text}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    fontWeight: '300',
    minHeight: 50,
  },
  label: {
    alignSelf: 'flex-start',
    marginTop: 18,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '300',
  },
  pickButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  pickButtonText: {
    fontSize: 14,
    fontWeight: '300',
  },
  templateScroll: {
    alignSelf: 'stretch',
    maxHeight: 52,
  },
  templateScrollContent: {
    gap: 10,
    paddingRight: 4,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
  },
  swatchSelected: {
    borderWidth: 3,
  },
  fontSizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  fontSizeButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizeButtonText: {
    fontSize: 18,
    fontWeight: '300',
  },
  fontSizeValue: {
    fontSize: 16,
    fontWeight: '300',
    minWidth: 28,
    textAlign: 'center',
  },
  previewContainer: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '300',
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  hiddenCanvas: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
  },
  modalHeaderButton: {
    width: 40,
    alignItems: 'center',
  },
  modalHeaderButtonText: {
    fontSize: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '400',
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    padding: 16,
    gap: 8,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalItemText: {
    fontSize: 15,
    fontWeight: '300',
    flex: 1,
  },
  modalItemCount: {
    fontSize: 13,
    fontWeight: '300',
    marginLeft: 8,
  },
});
