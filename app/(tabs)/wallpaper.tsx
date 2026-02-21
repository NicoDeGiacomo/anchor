import * as MediaLibrary from 'expo-media-library';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
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
import { getAllPhrases } from '@/utils/getAllPhrases';

const TRANSLATIONS = {
  en: {
    inputPlaceholder: 'Type a phrase...',
    pickLabel: 'Or pick a phrase',
    templateLabel: 'Background',
    saveButton: 'Save to Photos',
    saved: 'Saved!',
    permissionDenied: 'Permission needed',
    permissionMessage: 'Please allow photo library access in Settings to save wallpapers.',
  },
  es: {
    inputPlaceholder: 'Escribe una frase...',
    pickLabel: 'O elige una frase',
    templateLabel: 'Fondo',
    saveButton: 'Guardar en Fotos',
    saved: 'Guardado!',
    permissionDenied: 'Permiso necesario',
    permissionMessage: 'Permite el acceso a la biblioteca de fotos en Configuración para guardar fondos de pantalla.',
  },
  pt: {
    inputPlaceholder: 'Digite uma frase...',
    pickLabel: 'Ou escolha uma frase',
    templateLabel: 'Fundo',
    saveButton: 'Salvar nas Fotos',
    saved: 'Salvo!',
    permissionDenied: 'Permissão necessária',
    permissionMessage: 'Permita o acesso à biblioteca de fotos nas Configurações para salvar papéis de parede.',
  },
};

export default function WallpaperScreen() {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language];
  const borderColor = useColor('border');
  const borderSelectedColor = useColor('borderSelected');
  const textColor = useColor('text');
  const textSecondaryColor = useColor('textSecondary');
  const screen = useWindowDimensions();

  const [phrase, setPhrase] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WallpaperTemplate>(WALLPAPER_TEMPLATES[0]);
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const fullResRef = useRef<ViewShot>(null);

  const allPhrases = useMemo(() => getAllPhrases(language), [language]);

  // Preview dimensions: ~55% of screen width, proportional height
  const previewWidth = Math.round(screen.width * 0.55);
  const previewHeight = Math.round(previewWidth * (screen.height / screen.width));

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

  const chipStyle = useMemo(() => ({
    ...styles.chip,
    borderColor,
  }), [borderColor]);

  const inputStyle = useMemo(() => ({
    ...styles.input,
    borderColor,
    color: textColor,
  }), [borderColor, textColor]);

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

        {/* Phrase picker */}
        <Text style={[styles.label, { color: textSecondaryColor }]}>{t.pickLabel}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipScrollContent}
        >
          {allPhrases.map((text) => (
            <TouchableOpacity
              key={text}
              style={chipStyle}
              onPress={() => setPhrase(text)}
              activeOpacity={0.6}
            >
              <Text style={styles.chipText} numberOfLines={1}>{text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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

        {/* Live preview */}
        <View style={styles.previewContainer}>
          <WallpaperCanvas
            template={selectedTemplate}
            phrase={phrase}
            width={previewWidth}
            height={previewHeight}
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
        />
      </View>
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
  chipScroll: {
    alignSelf: 'stretch',
    maxHeight: 44,
  },
  chipScrollContent: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    maxWidth: 200,
  },
  chipText: {
    fontSize: 13,
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
});
