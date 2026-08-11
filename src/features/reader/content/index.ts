import fullQuranBundle from './fullQuran.json';

import { DEFAULT_BEGINNER_RECITER_KEY } from '@/features/learning/constants';
import type { ReciterMeta, VerseAudioRef } from '@/features/learning/content';
import type { SurahMeta, VerseContent } from '@/features/learning/types';

export type JuzMeta = {
  number: number;
  startSurahNumber: number;
  startAyahNumber: number;
  endSurahNumber: number;
  endAyahNumber: number;
};

export type FullQuranBundle = {
  meta: {
    surahStart: number;
    surahEnd: number;
    verseCount: number;
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
  juz: JuzMeta[];
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

export const fullQuranContent = fullQuranBundle as FullQuranBundle;

const verseById = new Map(
  fullQuranContent.verses.map((verse) => [verse.id, verse] as const),
);

const versesBySurah = new Map<number, FullQuranBundle['verses']>();
for (const verse of fullQuranContent.verses) {
  const list = versesBySurah.get(verse.surahNumber);
  if (list) {
    list.push(verse);
  } else {
    versesBySurah.set(verse.surahNumber, [verse]);
  }
}

function getDefaultReciterFromBundle(): ReciterMeta {
  const fromFlag = fullQuranContent.reciters.find((item) => item.isDefaultBeginner);
  if (fromFlag) {
    return { ...fromFlag };
  }
  const fromKey = fullQuranContent.reciters.find(
    (item) => item.key === fullQuranContent.defaultReciterKey,
  );
  if (fromKey) {
    return { ...fromKey };
  }
  const fallback = fullQuranContent.reciters[0];
  if (!fallback) {
    throw new Error('No reciters available in full Qur’an content bundle');
  }
  return { ...fallback };
}

function getReciterFromBundle(reciterKey: string): ReciterMeta | null {
  const found = fullQuranContent.reciters.find((item) => item.key === reciterKey);
  return found ? { ...found } : null;
}

export function getFullQuranMeta() {
  return fullQuranContent.meta;
}

export function listJuz(): JuzMeta[] {
  return fullQuranContent.juz.map((item) => ({ ...item }));
}

export function getJuz(juzNumber: number): JuzMeta | null {
  return listJuz().find((item) => item.number === juzNumber) ?? null;
}

/** Resolve which Juz contains a verse (surah + ayah). */
export function getJuzForVerse(surahNumber: number, ayahNumber: number): JuzMeta | null {
  for (const juz of fullQuranContent.juz) {
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

export function listMushafSurahs(): SurahMeta[] {
  return fullQuranContent.surahs.map((surah) => ({
    number: surah.number,
    nameArabic: surah.nameArabic,
    nameLatin: surah.nameLatin,
    ayahCount: surah.ayahCount,
    revelationPlace: surah.revelationPlace,
    sortOrder: surah.sortOrder,
  }));
}

export function getMushafSurah(surahNumber: number): SurahMeta | null {
  return listMushafSurahs().find((surah) => surah.number === surahNumber) ?? null;
}

export function getMushafVerse(verseId: string): VerseContent | null {
  const verse = verseById.get(verseId);
  return verse ? toVerseContent(verse) : null;
}

export function getMushafVersesForSurah(surahNumber: number): VerseContent[] {
  return (versesBySurah.get(surahNumber) ?? []).map(toVerseContent);
}

export function listSurahsInJuz(juzNumber: number): SurahMeta[] {
  const juz = getJuz(juzNumber);
  if (!juz) {
    return [];
  }
  return listMushafSurahs().filter(
    (surah) =>
      surah.number >= juz.startSurahNumber && surah.number <= juz.endSurahNumber,
  );
}

/**
 * Search by surah number, Latin/Arabic name, or "juz N".
 */
export function searchMushafSurahs(query: string): SurahMeta[] {
  const raw = query.trim().toLowerCase();
  if (!raw) {
    return listMushafSurahs();
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
    const exact = getMushafSurah(asNumber);
    return exact ? [exact] : [];
  }

  return listMushafSurahs().filter((surah) => {
    return (
      surah.nameLatin.toLowerCase().includes(raw) ||
      surah.nameArabic.includes(query.trim()) ||
      String(surah.number).includes(raw)
    );
  });
}

/**
 * Same EveryAyah / beginner Qari pattern as Lesson `resolveVerseAudio`.
 */
export function resolveMushafVerseAudio(
  verseId: string,
  reciterKey: string = DEFAULT_BEGINNER_RECITER_KEY,
): VerseAudioRef | null {
  const verse = verseById.get(verseId);
  if (!verse) {
    return null;
  }

  const defaultReciter = getDefaultReciterFromBundle();
  const requested = getReciterFromBundle(reciterKey) ?? defaultReciter;
  const effectiveKey = requested.key;

  if (
    effectiveKey === defaultReciter.key ||
    effectiveKey === fullQuranContent.defaultReciterKey
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

function toVerseContent(verse: FullQuranBundle['verses'][number]): VerseContent {
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
