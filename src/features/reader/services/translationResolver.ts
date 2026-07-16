import { FALLBACK_TRANSLATION_ID, FALLBACK_TRANSLATION_LANGUAGE } from '../constants';
import type { ResolvedVerseMeaning } from '../types';
import { juz30Content, type Juz30Bundle } from '@/features/learning/content';

/** Catalog of approved translation ids by language (V1: English only seeded). */
const TRANSLATION_BY_LANGUAGE: Record<
  string,
  { id: string; name: string; source: string }
> = {
  en: {
    id: FALLBACK_TRANSLATION_ID,
    name: juz30Content.translation.name,
    source: juz30Content.translation.source,
  },
};

function verseFromBundle(verseId: string): Juz30Bundle['verses'][number] | null {
  return juz30Content.verses.find((item) => item.id === verseId) ?? null;
}

/**
 * Resolve meaning text for a verse from preferred language.
 * Falls back to English Sahih International when the language is unavailable.
 */
export function resolveVerseMeaning(
  verseId: string,
  preferredLanguage: string,
  preferredTranslationId?: string | null,
): ResolvedVerseMeaning | null {
  const verse = verseFromBundle(verseId);
  if (!verse) {
    return null;
  }

  const language =
    preferredLanguage.trim().toLowerCase() || FALLBACK_TRANSLATION_LANGUAGE;
  const catalog =
    (preferredTranslationId
      ? Object.values(TRANSLATION_BY_LANGUAGE).find(
          (item) => item.id === preferredTranslationId,
        )
      : null) ??
    TRANSLATION_BY_LANGUAGE[language] ??
    TRANSLATION_BY_LANGUAGE[FALLBACK_TRANSLATION_LANGUAGE];

  if (!catalog) {
    return null;
  }

  const isFallback =
    catalog.id === FALLBACK_TRANSLATION_ID && language !== FALLBACK_TRANSLATION_LANGUAGE;

  // V1 bundle embeds English only; other languages fall back until Scholar content lands.
  if (catalog.id === FALLBACK_TRANSLATION_ID || isFallback || language === 'en') {
    return {
      text: verse.translationEn,
      languageCode: FALLBACK_TRANSLATION_LANGUAGE,
      translationId: FALLBACK_TRANSLATION_ID,
      sourceLabel: catalog.name,
      isFallback: language !== 'en' && language !== 'ar',
    };
  }

  return {
    text: verse.translationEn,
    languageCode: FALLBACK_TRANSLATION_LANGUAGE,
    translationId: FALLBACK_TRANSLATION_ID,
    sourceLabel: catalog.name,
    isFallback: true,
  };
}

/** Approved child-friendly explanations — none seeded in V1; schema-ready. */
export function resolveVerseExplanation(
  _verseId: string,
  _languageCode: string,
): string | null {
  return null;
}

export function listKnownTranslationLanguages(): string[] {
  return Object.keys(TRANSLATION_BY_LANGUAGE);
}
