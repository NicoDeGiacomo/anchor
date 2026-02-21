import { Language, PhasedPhrases, Phrase } from './phraseStorage';

interface FlatPhraseContent {
  phrases: Phrase[];
}

const PHASED_PHRASES_MAP: Record<string, Record<Language, PhasedPhrases>> = {
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
};

const FLAT_PHRASES_MAP: Record<string, Record<Language, FlatPhraseContent>> = {
  grounding: {
    en: require('@/content/grounding/anchors.en.json'),
    es: require('@/content/grounding/anchors.es.json'),
    pt: require('@/content/grounding/anchors.pt.json'),
  },
  values: {
    en: require('@/content/values/anchors.en.json'),
    es: require('@/content/values/anchors.es.json'),
    pt: require('@/content/values/anchors.pt.json'),
  },
};

const MODE_LABELS: Record<string, Record<Language, string>> = {
  panic: { en: 'Panic', es: 'Pánico', pt: 'Pânico' },
  anxiety: { en: 'Anxiety', es: 'Ansiedad', pt: 'Ansiedade' },
  sadness: { en: 'Sadness', es: 'Tristeza', pt: 'Tristeza' },
  anger: { en: 'Anger', es: 'Ira', pt: 'Raiva' },
  grounding: { en: 'Grounding', es: 'Grounding', pt: 'Grounding' },
  values: { en: 'Values', es: 'Valores', pt: 'Valores' },
};

export type PhrasesByMode = { mode: string; label: string; phrases: string[] }[];

/**
 * Returns built-in phrases grouped by mode for the given language.
 * Falls back to English when a language has no content for a mode.
 */
export function getPhrasesByMode(language: Language): PhrasesByMode {
  const result: PhrasesByMode = [];

  // Phased modes (SIT)
  for (const mode of Object.keys(PHASED_PHRASES_MAP)) {
    const phased = PHASED_PHRASES_MAP[mode][language] ?? PHASED_PHRASES_MAP[mode].en;
    const texts: string[] = [];
    if (phased) {
      for (const phase of ['preparation', 'confrontation', 'reinforcement'] as const) {
        for (const p of phased[phase] ?? []) {
          texts.push(p.text);
        }
      }
    }
    result.push({
      mode,
      label: MODE_LABELS[mode]?.[language] ?? MODE_LABELS[mode]?.en ?? mode,
      phrases: texts,
    });
  }

  // Flat modes
  for (const mode of Object.keys(FLAT_PHRASES_MAP)) {
    const content = FLAT_PHRASES_MAP[mode][language] ?? FLAT_PHRASES_MAP[mode].en;
    const texts: string[] = [];
    if (content) {
      for (const p of content.phrases) {
        texts.push(p.text);
      }
    }
    result.push({
      mode,
      label: MODE_LABELS[mode]?.[language] ?? MODE_LABELS[mode]?.en ?? mode,
      phrases: texts,
    });
  }

  return result;
}
