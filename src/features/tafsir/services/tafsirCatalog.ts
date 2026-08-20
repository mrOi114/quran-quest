import {
  isTafsirSourceLicensed,
  SOMALI_TAFSIR_AYAHS,
  SOMALI_TAFSIR_SOURCE,
} from '../content/catalog';
import type { TafsirAyahRecord, TafsirSourceMeta } from '../schemas';

export function getTafsirSourceMeta(): TafsirSourceMeta {
  return SOMALI_TAFSIR_SOURCE;
}

export function hasLicensedTafsirAudio(): boolean {
  return isTafsirSourceLicensed(SOMALI_TAFSIR_SOURCE) && SOMALI_TAFSIR_AYAHS.length > 0;
}

export function getTafsirForVerse(
  surahNumber: number,
  ayahNumber: number,
): TafsirAyahRecord | null {
  if (!isTafsirSourceLicensed(SOMALI_TAFSIR_SOURCE)) {
    return null;
  }
  return (
    SOMALI_TAFSIR_AYAHS.find(
      (item) =>
        item.surahNumber === surahNumber &&
        ayahNumber >= item.startAyah &&
        ayahNumber <= item.endAyah,
    ) ?? null
  );
}

export function getTafsirAudioUrl(
  surahNumber: number,
  ayahNumber: number,
): string | null {
  const record = getTafsirForVerse(surahNumber, ayahNumber);
  if (!record?.audioUrl) {
    return null;
  }
  return record.audioUrl;
}
