import bundle from './somaliYacob.json';

export const QURANENC_SOMALI_KEY = 'somali_yacob';

export type QuranEncSomaliVerse = {
  surah: number;
  ayah: number;
  translation: string;
  footnotes: string;
};

export type QuranEncSomaliMeta = {
  key: string;
  translator: string;
  translatorAsPublished: string;
  titleAsPublished: string;
  source: string;
  sourceUrl: string;
  api: string;
  version: string;
  lastUpdate: number;
  languageIsoCode: string;
  surahCount: number;
  ayahCount: number;
  fetchedAt: string;
  arabicSource: string;
};

export type QuranEncSomaliBundle = {
  meta: QuranEncSomaliMeta;
  verses: QuranEncSomaliVerse[];
};

export const somaliYacobContent = bundle as QuranEncSomaliBundle;

const verseByKey = new Map(
  somaliYacobContent.verses.map((verse) => [`${verse.surah}:${verse.ayah}`, verse] as const),
);

export function getSomaliYacobVerse(
  surahNumber: number,
  ayahNumber: number,
): QuranEncSomaliVerse | null {
  return verseByKey.get(`${surahNumber}:${ayahNumber}`) ?? null;
}
