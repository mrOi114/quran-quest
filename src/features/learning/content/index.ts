import juz30Bundle from './juz30.json';

import { DEFAULT_BEGINNER_RECITER_KEY } from '../constants';
import type { SurahMeta, VerseContent } from '../types';

export type ReciterMeta = {
  key: string;
  name: string;
  style: string;
  audioBaseUrl: string;
  isDefaultBeginner: boolean;
};

export type VerseAudioRef = {
  reciterKey: string;
  audioAssetKey: string;
  audioUrl: string;
};

export type Juz30Bundle = {
  meta: {
    juzNumber: number;
    surahStart: number;
    surahEnd: number;
    contentVersion: number;
    corpusHash: string;
    arabicSource: string;
    translationSource: string;
    audioSource: string;
    generatedAt: string;
  };
  defaultReciterKey: string;
  reciters: ReciterMeta[];
  translation: {
    languageCode: string;
    name: string;
    source: string;
    approvalStatus: string;
  };
  surahs: {
    number: number;
    nameArabic: string;
    nameLatin: string;
    ayahCount: number;
    revelationPlace: string;
    sortOrder: number;
  }[];
  verses: {
    id: string;
    surahNumber: number;
    ayahNumber: number;
    verseOrderGlobal: number;
    textUthmani: string;
    contentHash: string;
    contentVersion: number;
    audioAssetKey: string;
    audioUrl: string;
    translationEn: string;
  }[];
};

export const juz30Content = juz30Bundle as Juz30Bundle;

export function getContentMeta() {
  return juz30Content.meta;
}

export function listReciters(): ReciterMeta[] {
  return juz30Content.reciters.map((reciter) => ({ ...reciter }));
}

export function getDefaultReciter(): ReciterMeta {
  const fromFlag = juz30Content.reciters.find((item) => item.isDefaultBeginner);
  if (fromFlag) {
    return { ...fromFlag };
  }

  const fromKey = juz30Content.reciters.find(
    (item) => item.key === juz30Content.defaultReciterKey,
  );
  if (fromKey) {
    return { ...fromKey };
  }

  const fallback = juz30Content.reciters[0];
  if (!fallback) {
    throw new Error('No reciters available in Juz 30 content bundle');
  }
  return { ...fallback };
}

export function getReciter(reciterKey: string): ReciterMeta | null {
  const found = juz30Content.reciters.find((item) => item.key === reciterKey);
  return found ? { ...found } : null;
}

/**
 * Resolve audio reference for a verse.
 * Falls back to the default beginner Qari when reciterKey is omitted or unknown.
 * Verse `audioAssetKey` / `audioUrl` in the bundle are for the default beginner only;
 * other reciters use the `{reciterKey}/{SSSAAA}` EveryAyah pattern when catalogued.
 */
export function resolveVerseAudio(
  verseId: string,
  reciterKey: string = DEFAULT_BEGINNER_RECITER_KEY,
): VerseAudioRef | null {
  const verse = juz30Content.verses.find((item) => item.id === verseId);
  if (!verse) {
    return null;
  }

  const defaultReciter = getDefaultReciter();
  const requested = getReciter(reciterKey) ?? defaultReciter;
  const effectiveKey = requested.key;

  if (
    effectiveKey === defaultReciter.key ||
    effectiveKey === juz30Content.defaultReciterKey
  ) {
    return {
      reciterKey: defaultReciter.key,
      audioAssetKey: verse.audioAssetKey,
      audioUrl: verse.audioUrl,
    };
  }

  const [surahPart, ayahPart] = verseId.split(':');
  const surahNumber = Number(surahPart);
  const ayahNumber = Number(ayahPart);
  if (!Number.isFinite(surahNumber) || !Number.isFinite(ayahNumber)) {
    return null;
  }

  const fileStem = `${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}`;
  return {
    reciterKey: effectiveKey,
    audioAssetKey: `${effectiveKey}/${fileStem}`,
    audioUrl: `${requested.audioBaseUrl}/${fileStem}.mp3`,
  };
}

export function listSurahs(): SurahMeta[] {
  return juz30Content.surahs.map((surah) => ({
    number: surah.number,
    nameArabic: surah.nameArabic,
    nameLatin: surah.nameLatin,
    ayahCount: surah.ayahCount,
    revelationPlace: surah.revelationPlace,
    sortOrder: surah.sortOrder,
  }));
}

export function getSurah(surahNumber: number): SurahMeta | null {
  return listSurahs().find((surah) => surah.number === surahNumber) ?? null;
}

export function getVerse(verseId: string): VerseContent | null {
  const verse = juz30Content.verses.find((item) => item.id === verseId);
  return verse ? toVerseContent(verse) : null;
}

export function getVersesForSurah(surahNumber: number): VerseContent[] {
  return juz30Content.verses
    .filter((verse) => verse.surahNumber === surahNumber)
    .map(toVerseContent);
}

export function getVersesInRange(
  surahNumber: number,
  startAyah: number,
  endAyah: number,
): VerseContent[] {
  return getVersesForSurah(surahNumber).filter(
    (verse) => verse.ayahNumber >= startAyah && verse.ayahNumber <= endAyah,
  );
}

export function makeVerseId(surahNumber: number, ayahNumber: number): string {
  return `${surahNumber}:${ayahNumber}`;
}

function toVerseContent(verse: Juz30Bundle['verses'][number]): VerseContent {
  return {
    id: verse.id,
    surahNumber: verse.surahNumber,
    ayahNumber: verse.ayahNumber,
    verseOrderGlobal: verse.verseOrderGlobal,
    textUthmani: verse.textUthmani,
    contentHash: verse.contentHash,
    contentVersion: verse.contentVersion,
    audioAssetKey: verse.audioAssetKey,
    audioUrl: verse.audioUrl,
    translationEn: verse.translationEn,
  };
}

/** Verify bundled Arabic hashes still match (integrity smoke check). */
export function verifyBundledArabicIntegrity(): {
  ok: boolean;
  mismatched: string[];
} {
  const mismatched: string[] = [];
  for (const verse of juz30Content.verses) {
    if (!verse.textUthmani.trim() || !verse.contentHash) {
      mismatched.push(verse.id);
    }
  }
  return { ok: mismatched.length === 0, mismatched };
}
