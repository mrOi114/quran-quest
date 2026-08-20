import type { TafsirAyahRecord, TafsirSourceMeta } from '../schemas';

/**
 * Intended Somali tafsir source: Sheekh Maxamed Cabdi Umal.
 *
 * Duruus Online is a public catalog/host, not a confirmed copyright owner.
 * Permission is NOT verified. Do not add audio URLs or bundle MP3s until
 * written permission is received from the rights holder.
 */
export const SOMALI_TAFSIR_SOURCE: TafsirSourceMeta = {
  scholar: 'Sheekh Maxamed Cabdi Umal',
  translator: 'Sheekh Maxamed Cabdi Umal',
  publisher: '',
  version: '',
  license: 'pending-verification',
  permissionVerified: false,
  sourceUrl: '',
  catalogUrl:
    'https://www.duruusonline.com/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal/',
  distributionMode: 'none',
  surahStart: 1,
  surahEnd: 114,
  ayahRangeLabel: '1:1–114:6',
};

/** Empty until written permission is confirmed. Never populate from unlicensed hosts. */
export const SOMALI_TAFSIR_AYAHS: TafsirAyahRecord[] = [];

export function isTafsirSourceLicensed(source: TafsirSourceMeta): boolean {
  return (
    source.permissionVerified === true &&
    source.license.trim().length > 0 &&
    source.license !== 'pending-verification' &&
    source.distributionMode !== 'none' &&
    source.scholar.trim().length > 0
  );
}

export function allowsTafsirAudioCache(source: TafsirSourceMeta): boolean {
  return isTafsirSourceLicensed(source) && source.distributionMode === 'bundle-allowed';
}
