import { QURANENC_SOMALI_KEY, somaliYacobContent } from './somaliYacob';

/**
 * Official QuranEnc per-ayah MP3s.
 * Docs: https://quranenc.com/en/home/api/
 * https://d.quranenc.com/data/audio/{translation_key}/{sura_3digits}{aya_3digits}.mp3
 */
export const QURANENC_AUDIO_BASE = 'https://d.quranenc.com/data/audio';

export const SOMALI_MEANING_AUDIO_TITLE = 'Somali Qur’an Meaning Audio';

export type SomaliYacobAudioAttribution = {
  title: string;
  translator: string;
  source: string;
  translationKey: string;
  version: string;
};

export function getSomaliYacobAudioAttribution(): SomaliYacobAudioAttribution {
  return {
    title: SOMALI_MEANING_AUDIO_TITLE,
    translator: somaliYacobContent.meta.translator,
    source: somaliYacobContent.meta.source,
    translationKey: somaliYacobContent.meta.key,
    version: somaliYacobContent.meta.version,
  };
}

export function getSomaliYacobAudioUrl(surahNumber: number, ayahNumber: number): string {
  const sura = String(surahNumber).padStart(3, '0');
  const aya = String(ayahNumber).padStart(3, '0');
  return `${QURANENC_AUDIO_BASE}/${QURANENC_SOMALI_KEY}/${sura}${aya}.mp3`;
}

export function somaliYacobAudioMetadata(surahNumber: number, ayahNumber: number) {
  const attribution = getSomaliYacobAudioAttribution();
  return {
    title: `${attribution.title} · Surah ${surahNumber} · Ayah ${ayahNumber}`,
    artist: attribution.translator,
    albumTitle: attribution.source,
  };
}
