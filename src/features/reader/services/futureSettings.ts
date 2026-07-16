import { defaultFutureSettings } from '../schemas';
import type { ReaderFutureSettings } from '../types';

export function emptyFutureSettings(): ReaderFutureSettings {
  return { ...defaultFutureSettings };
}

/**
 * Field-by-field empty-only merge for reserved future Reader settings.
 * Set cloud values win; null cloud keys take the guest value.
 */
export function mergeFutureSettingsEmptyOnly(
  cloud: ReaderFutureSettings | null | undefined,
  guest: ReaderFutureSettings,
): ReaderFutureSettings {
  const c = cloud ?? emptyFutureSettings();

  return {
    autoPlayNextVerse:
      c.autoPlayNextVerse === null ? guest.autoPlayNextVerse : c.autoPlayNextVerse,
    playbackSpeed: c.playbackSpeed === null ? guest.playbackSpeed : c.playbackSpeed,
    mushafStyle: c.mushafStyle === null ? guest.mushafStyle : c.mushafStyle,
    nightMode: c.nightMode === null ? guest.nightMode : c.nightMode,
  };
}

export function parseFutureSettings(raw: unknown): ReaderFutureSettings {
  if (!raw || typeof raw !== 'object') {
    return emptyFutureSettings();
  }
  const record = raw as Record<string, unknown>;
  return {
    autoPlayNextVerse:
      typeof record.autoPlayNextVerse === 'boolean' ? record.autoPlayNextVerse : null,
    playbackSpeed:
      typeof record.playbackSpeed === 'number' &&
      record.playbackSpeed > 0 &&
      record.playbackSpeed <= 2
        ? record.playbackSpeed
        : null,
    mushafStyle:
      record.mushafStyle === 'uthmani_standard' || record.mushafStyle === 'indopak'
        ? record.mushafStyle
        : null,
    nightMode:
      record.nightMode === 'system' ||
      record.nightMode === 'light' ||
      record.nightMode === 'dark'
        ? record.nightMode
        : null,
  };
}
