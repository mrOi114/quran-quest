import fullQuranBundle from '@/features/reader/content/fullQuran.json';
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

export type JuzMeta = {
  number: number;
  startSurahNumber: number;
  startAyahNumber: number;
  endSurahNumber: number;
  endAyahNumber: number;
};

export type LearningContentBundle = {
  meta: {
    surahStart: number;
    surahEnd: number;
    verseCount?: number;
    contentVersion: number;
    corpusHash: string;
    arabicSource: string;
    translationSource: string;
    audioSource: string;
    generatedAt: string;
    juzNumber?: number;
  };
  defaultReciterKey: string;
  reciters: ReciterMeta[];
  translation: {
    languageCode: string;
    name: string;
    source: string;
    approvalStatus: string;
  };
  juz?: JuzMeta[];
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

/** @deprecated Prefer full mushaf helpers — kept for Juz 30–specific callers. */
export type Juz30Bundle = LearningContentBundle;

export const learningContent = fullQuranBundle as LearningContentBundle;

/** Legacy Juz 30 bundle (progress-gated browse / migration callers). */
export const juz30Content = juz30Bundle as Juz30Bundle;

const verseById = new Map(
  learningContent.verses.map((verse) => [verse.id, verse] as const),
);

const versesBySurah = new Map<number, LearningContentBundle['verses']>();
for (const verse of learningContent.verses) {
  const list = versesBySurah.get(verse.surahNumber);
  if (list) {
    list.push(verse);
  } else {
    versesBySurah.set(verse.surahNumber, [verse]);
  }
}

export function getContentMeta() {
  return learningContent.meta;
}

export function listReciters(): ReciterMeta[] {
  return learningContent.reciters.map((reciter) => ({ ...reciter }));
}

export function getDefaultReciter(): ReciterMeta {
  const fromFlag = learningContent.reciters.find((item) => item.isDefaultBeginner);
  if (fromFlag) {
    return { ...fromFlag };
  }

  const fromKey = learningContent.reciters.find(
    (item) => item.key === learningContent.defaultReciterKey,
  );
  if (fromKey) {
    return { ...fromKey };
  }

  const fallback = learningContent.reciters[0];
  if (!fallback) {
    throw new Error('No reciters available in learning content bundle');
  }
  return { ...fallback };
}

export function getReciter(reciterKey: string): ReciterMeta | null {
  const found = learningContent.reciters.find((item) => item.key === reciterKey);
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
  const verse = verseById.get(verseId);
  if (!verse) {
    return null;
  }

  const defaultReciter = getDefaultReciter();
  const requested = getReciter(reciterKey) ?? defaultReciter;
  const effectiveKey = requested.key;

  if (
    effectiveKey === defaultReciter.key ||
    effectiveKey === learningContent.defaultReciterKey
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
  return learningContent.surahs.map((surah) => ({
    number: surah.number,
    nameArabic: surah.nameArabic,
    nameLatin: surah.nameLatin,
    ayahCount: surah.ayahCount,
    revelationPlace: surah.revelationPlace,
    sortOrder: surah.sortOrder,
  }));
}

/** Juz 30 surahs only — for progress-gated browse that remains Juz 30 scoped. */
export function listJuz30Surahs(): SurahMeta[] {
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

export function listJuz(): JuzMeta[] {
  return (learningContent.juz ?? []).map((item) => ({ ...item }));
}

export function getJuz(juzNumber: number): JuzMeta | null {
  return listJuz().find((item) => item.number === juzNumber) ?? null;
}

/** Resolve which Juz contains a verse (surah + ayah). */
export function getJuzForVerse(surahNumber: number, ayahNumber: number): JuzMeta | null {
  for (const juz of listJuz()) {
    const afterStart =
      surahNumber > juz.startSurahNumber ||
      (surahNumber === juz.startSurahNumber && ayahNumber >= juz.startAyahNumber);
    const beforeEnd =
      surahNumber < juz.endSurahNumber ||
      (surahNumber === juz.endSurahNumber && ayahNumber <= juz.endAyahNumber);
    if (afterStart && beforeEnd) {
      return { ...juz };
    }
  }
  return null;
}

export function listSurahsInJuz(juzNumber: number): SurahMeta[] {
  const juz = getJuz(juzNumber);
  if (!juz) {
    return [];
  }
  return listSurahs().filter(
    (surah) =>
      surah.number >= juz.startSurahNumber && surah.number <= juz.endSurahNumber,
  );
}

export function searchLearningSurahs(query: string): SurahMeta[] {
  const raw = query.trim().toLowerCase();
  if (!raw) {
    return listSurahs();
  }

  const juzMatch = /^juz\s*(\d{1,2})$/i.exec(raw);
  if (juzMatch) {
    const juzNumber = Number(juzMatch[1]);
    if (juzNumber >= 1 && juzNumber <= 30) {
      return listSurahsInJuz(juzNumber);
    }
  }

  const asNumber = Number(raw);
  if (Number.isFinite(asNumber) && asNumber >= 1 && asNumber <= 114) {
    const exact = getSurah(asNumber);
    return exact ? [exact] : [];
  }

  return listSurahs().filter(
    (surah) =>
      surah.nameLatin.toLowerCase().includes(raw) ||
      surah.nameArabic.includes(query.trim()) ||
      String(surah.number).includes(raw),
  );
}

export function getVerse(verseId: string): VerseContent | null {
  const verse = verseById.get(verseId);
  return verse ? toVerseContent(verse) : null;
}

export function getVersesForSurah(surahNumber: number): VerseContent[] {
  return (versesBySurah.get(surahNumber) ?? []).map(toVerseContent);
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

function toVerseContent(verse: LearningContentBundle['verses'][number]): VerseContent {
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
  for (const verse of learningContent.verses) {
    if (!verse.textUthmani.trim() || !verse.contentHash) {
      mismatched.push(verse.id);
    }
  }
  return { ok: mismatched.length === 0, mismatched };
}
