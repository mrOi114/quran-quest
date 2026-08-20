import { juz30Content } from '@/features/learning/content';

import { getMushafVerse } from '../content';
import { QURANENC_SOMALI_KEY, getSomaliYacobVerse, somaliYacobContent } from '../content/somaliYacob';
import { FALLBACK_TRANSLATION_ID, FALLBACK_TRANSLATION_LANGUAGE } from '../constants';
import type { ResolvedVerseMeaning, VerseMeaningAttribution } from '../types';

const ENGLISH_CATALOG = {
  id: FALLBACK_TRANSLATION_ID,
  name: juz30Content.translation.name,
  source: juz30Content.translation.source,
};

function verseFromBundle(verseId: string): {
  translationEn: string;
  surahNumber: number;
  ayahNumber: number;
} | null {
  const fromLesson = juz30Content.verses.find((item) => item.id === verseId);
  if (fromLesson) {
    return fromLesson;
  }
  return getMushafVerse(verseId);
}

function englishMeaning(
  translationEn: string,
  isFallback: boolean,
): ResolvedVerseMeaning {
  return {
    text: translationEn,
    footnotes: null,
    languageCode: FALLBACK_TRANSLATION_LANGUAGE,
    translationId: ENGLISH_CATALOG.id,
    sourceLabel: ENGLISH_CATALOG.name,
    attribution: null,
    isFallback,
  };
}

function somaliAttribution(): VerseMeaningAttribution {
  return {
    translator: somaliYacobContent.meta.translator,
    source: somaliYacobContent.meta.source,
    translationKey: somaliYacobContent.meta.key,
    version: somaliYacobContent.meta.version,
  };
}

/**
 * Resolve meaning text for a verse from preferred language.
 * Somali uses the published QuranEnc somali_yacob text unchanged.
 * Falls back to English Sahih International when Somali is unavailable.
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
  const wantsSomali =
    language === 'so' || preferredTranslationId === QURANENC_SOMALI_KEY;

  if (wantsSomali) {
    const somali = getSomaliYacobVerse(verse.surahNumber, verse.ayahNumber);
    if (somali) {
      const attribution = somaliAttribution();
      return {
        text: somali.translation,
        footnotes: somali.footnotes.length > 0 ? somali.footnotes : null,
        languageCode: 'so',
        translationId: QURANENC_SOMALI_KEY,
        sourceLabel: `${attribution.translator} · ${attribution.source}`,
        attribution,
        isFallback: false,
      };
    }
    return englishMeaning(verse.translationEn, true);
  }

  return englishMeaning(verse.translationEn, language !== 'en' && language !== 'ar');
}

/** Approved child-friendly explanations — none seeded in V1; schema-ready. */
export function resolveVerseExplanation(
  _verseId: string,
  _languageCode: string,
): string | null {
  return null;
}

export function listKnownTranslationLanguages(): string[] {
  return ['en', 'so'];
}
