import type { TafsirAyahRecord, TafsirSourceMeta } from '../schemas';

/**
 * Licensed Somali tafsir slot.
 *
 * No tafsir audio or tafsir text is bundled until redistribution/use in
 * Quran Quest is legally verified. Somali meaning in the app is the published
 * QuranEnc somali_yacob translation, which is not tafsir.
 */
export const SOMALI_TAFSIR_SOURCE: TafsirSourceMeta = {
  scholar: '',
  translator: '',
  publisher: '',
  version: '',
  license: 'pending-verification',
  permissionVerified: false,
  sourceUrl: '',
  surahStart: 1,
  surahEnd: 114,
  ayahRangeLabel: '1:1–114:6',
};

/** Empty until a verified licensed dataset is imported. */
export const SOMALI_TAFSIR_AYAHS: TafsirAyahRecord[] = [];

export function isTafsirSourceLicensed(source: TafsirSourceMeta): boolean {
  return (
    source.permissionVerified === true &&
    source.license.trim().length > 0 &&
    source.license !== 'pending-verification' &&
    source.sourceUrl.trim().length > 0
  );
}
