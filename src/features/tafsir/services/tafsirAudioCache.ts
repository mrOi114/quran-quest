import AsyncStorage from '@react-native-async-storage/async-storage';

import { allowsTafsirAudioCache, isTafsirSourceLicensed } from '../content/catalog';
import type { TafsirSourceMeta } from '../schemas';

const CACHE_INDEX_KEY = 'qq.tafsir.audioCache.v1';

type CacheIndex = Record<string, string>;

async function readIndex(): Promise<CacheIndex> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as CacheIndex;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Resolve a playable URI for licensed tafsir audio only.
 * Unlicensed URLs are never downloaded or cached.
 */
export async function resolveCachedTafsirAudioUrl(
  audioUrl: string | null,
  source: TafsirSourceMeta,
): Promise<string | null> {
  if (!audioUrl || !isTafsirSourceLicensed(source)) {
    return null;
  }
  if (source.distributionMode === 'stream-only') {
    return audioUrl;
  }
  const index = await readIndex();
  return index[audioUrl] ?? audioUrl;
}

/** No-op until a licensed dataset exists — does not fetch unlicensed audio. */
export async function cacheLicensedTafsirAudio(
  audioUrl: string,
  source: TafsirSourceMeta,
): Promise<void> {
  if (!allowsTafsirAudioCache(source) || !audioUrl) {
    return;
  }
}
