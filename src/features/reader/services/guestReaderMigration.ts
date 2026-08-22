import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ActiveLearner } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import type { AudioRepeatCount, Json } from '@/types';

import { DEFAULT_RECITER_KEY } from '../constants';
import { readerBrowseStateSchema, readerPreferencesSchema } from '../schemas';
import type {
  CloudReaderPreferenceFields,
  ReaderBrowseState,
  ReaderPreferences,
} from '../types';
import {
  emptyFutureSettings,
  mergeFutureSettingsEmptyOnly,
  parseFutureSettings,
} from './futureSettings';

export const GUEST_READER_MIGRATION_PREFIX = 'qq.migrated_reader.';
/** Set after a successful cloud merge so prefs are never migrated twice. */
export const GUEST_READER_MIGRATION_DONE_PREFIX = 'qq.reader.migration_complete.';

type StagedGuestReaderPayload = {
  readerPreferences: unknown | null;
  readerBrowseState: unknown | null;
  guestId: string;
  migratedAt: string;
};

/**
 * Field-by-field empty-only merge.
 * Copy guest only when the cloud field is empty/null. Never overwrite set cloud values.
 * Font size stays age-derived: `fontScale` is always null (not migrated from guest).
 */
export function mergeReaderPreferencesEmptyOnly(
  cloud: CloudReaderPreferenceFields | null,
  guest: ReaderPreferences,
): ReaderPreferences {
  if (!cloud || !cloud.rowExists) {
    return {
      ...guest,
      // Age-derived sizing — do not persist guest font overrides in V1.
      fontScale: null,
      futureSettings: mergeFutureSettingsEmptyOnly(null, guest.futureSettings),
    };
  }

  const cloudReciter = cloud.preferredReciterKey?.trim() ?? '';
  const cloudTranslation = cloud.preferredTranslationId?.trim() ?? '';

  return {
    showTranslation:
      cloud.showTranslation === null ? guest.showTranslation : cloud.showTranslation,
    repeatCount: cloud.repeatCount === null ? guest.repeatCount : cloud.repeatCount,
    preferredReciterKey:
      cloudReciter.length > 0 ? cloudReciter : guest.preferredReciterKey,
    preferredTranslationId:
      cloudTranslation.length > 0 ? cloudTranslation : guest.preferredTranslationId,
    fontScale: null,
    futureSettings: mergeFutureSettingsEmptyOnly(
      cloud.futureSettings,
      guest.futureSettings,
    ),
  };
}

/** Browse resume: keep cloud position when present; otherwise take guest. */
export function mergeReaderBrowseStateEmptyOnly(
  cloud: ReaderBrowseState | null,
  guest: ReaderBrowseState | null,
): ReaderBrowseState | null {
  if (cloud) {
    return cloud;
  }
  return guest ? { ...guest } : null;
}

export function readerMigrationDoneKey(userId: string): string {
  return `${GUEST_READER_MIGRATION_DONE_PREFIX}${userId}`;
}

export async function isGuestReaderMigrationComplete(userId: string): Promise<boolean> {
  const value = await AsyncStorage.getItem(readerMigrationDoneKey(userId));
  return value === 'true';
}

export async function markGuestReaderMigrationComplete(userId: string): Promise<void> {
  await AsyncStorage.setItem(readerMigrationDoneKey(userId), 'true');
}

function parseGuestPreferences(raw: unknown): ReaderPreferences | null {
  if (!raw) {
    return null;
  }
  const parsed = readerPreferencesSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

function parseGuestBrowseState(raw: unknown): ReaderBrowseState | null {
  if (!raw) {
    return null;
  }
  const parsed = readerBrowseStateSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

async function loadCloudPreferenceFields(
  learnerId: string,
): Promise<CloudReaderPreferenceFields | null> {
  const { data, error } = await supabase
    .from('learner_reader_preferences')
    .select(
      'show_translation, repeat_count, preferred_reciter_key, preferred_translation_id, future_settings',
    )
    .eq('learner_id', learnerId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const repeat = data.repeat_count as AudioRepeatCount;
  return {
    rowExists: true,
    showTranslation: data.show_translation,
    repeatCount:
      repeat === '1' || repeat === '2' || repeat === '3' || repeat === 'loop' ? repeat : null,
    preferredReciterKey: data.preferred_reciter_key?.trim()
      ? data.preferred_reciter_key
      : null,
    preferredTranslationId: data.preferred_translation_id,
    futureSettings: parseFutureSettings(data.future_settings),
  };
}

async function loadCloudBrowseStateRow(
  learnerId: string,
): Promise<ReaderBrowseState | null> {
  const { data, error } = await supabase
    .from('learner_reader_state')
    .select('last_surah_number, last_ayah_number')
    .eq('learner_id', learnerId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    lastSurahNumber: data.last_surah_number,
    lastAyahNumber: data.last_ayah_number,
  };
}

function preferencesChanged(
  before: CloudReaderPreferenceFields | null,
  after: ReaderPreferences,
): boolean {
  if (!before || !before.rowExists) {
    return true;
  }
  const beforeFuture = before.futureSettings ?? emptyFutureSettings();
  return (
    before.showTranslation !== after.showTranslation ||
    before.repeatCount !== after.repeatCount ||
    (before.preferredReciterKey ?? '') !== after.preferredReciterKey ||
    (before.preferredTranslationId ?? null) !== after.preferredTranslationId ||
    beforeFuture.autoPlayNextVerse !== after.futureSettings.autoPlayNextVerse ||
    beforeFuture.playbackSpeed !== after.futureSettings.playbackSpeed ||
    beforeFuture.mushafStyle !== after.futureSettings.mushafStyle ||
    beforeFuture.nightMode !== after.futureSettings.nightMode
  );
}

/**
 * Consumes staged guest reader prefs/state into cloud tables.
 * Idempotent: skips when migration_complete marker is set; marks complete after success.
 * Does not overwrite non-empty cloud preference fields. Does not touch Qur'an content.
 */
export async function mergeMigratedGuestReaderSettings(
  userId: string,
  _learner: ActiveLearner,
): Promise<boolean> {
  if (await isGuestReaderMigrationComplete(userId)) {
    const stagedKey = `${GUEST_READER_MIGRATION_PREFIX}${userId}`;
    await AsyncStorage.removeItem(stagedKey);
    return false;
  }

  const key = `${GUEST_READER_MIGRATION_PREFIX}${userId}`;
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return false;
  }

  try {
    const staged = JSON.parse(raw) as StagedGuestReaderPayload;
    const guestPrefs = parseGuestPreferences(staged.readerPreferences);
    const guestBrowse = parseGuestBrowseState(staged.readerBrowseState);

    if (guestPrefs) {
      const cloudFields = await loadCloudPreferenceFields(userId);
      const mergedPrefs = mergeReaderPreferencesEmptyOnly(cloudFields, guestPrefs);

      if (preferencesChanged(cloudFields, mergedPrefs)) {
        const { error: prefsError } = await supabase
          .from('learner_reader_preferences')
          .upsert(
            {
              learner_id: userId,
              show_translation: mergedPrefs.showTranslation,
              repeat_count: mergedPrefs.repeatCount,
              preferred_reciter_key:
                mergedPrefs.preferredReciterKey || DEFAULT_RECITER_KEY,
              preferred_translation_id: mergedPrefs.preferredTranslationId,
              font_scale: null,
              future_settings: mergedPrefs.futureSettings as unknown as Json,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'learner_id' },
          );
        if (prefsError) {
          throw new Error(prefsError.message);
        }
      }
    }

    const cloudBrowse = await loadCloudBrowseStateRow(userId);
    const mergedBrowse = mergeReaderBrowseStateEmptyOnly(cloudBrowse, guestBrowse);
    if (!cloudBrowse && mergedBrowse) {
      const { error: stateError } = await supabase.from('learner_reader_state').upsert(
        {
          learner_id: userId,
          last_surah_number: mergedBrowse.lastSurahNumber,
          last_ayah_number: mergedBrowse.lastAyahNumber,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'learner_id' },
      );
      if (stateError) {
        throw new Error(stateError.message);
      }
    }

    await AsyncStorage.removeItem(key);
    await markGuestReaderMigrationComplete(userId);
    return true;
  } catch {
    return false;
  }
}
