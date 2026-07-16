import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ActiveLearner } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import type { AudioRepeatCount } from '@/types';

import { DEFAULT_RECITER_KEY } from '../constants';
import { readerBrowseStateSchema, readerPreferencesSchema } from '../schemas';
import type { ReaderBrowseState, ReaderPreferences } from '../types';

export const GUEST_READER_MIGRATION_PREFIX = 'qq.migrated_reader.';

type StagedGuestReaderPayload = {
  readerPreferences: unknown | null;
  readerBrowseState: unknown | null;
  guestId: string;
  migratedAt: string;
};

/**
 * Merge guest reader prefs into cloud prefs.
 * - No cloud row → take guest values (repeat, translation visibility, reciter, etc.).
 * - Existing cloud row → fill only empty fields; never overwrite set values.
 *
 * Font size is age-derived (not persisted); it follows the learner age group after register.
 */
export function mergeReaderPreferencesEmptyOnly(
  cloud: ReaderPreferences | null,
  guest: ReaderPreferences,
): ReaderPreferences {
  if (!cloud) {
    return { ...guest };
  }

  return {
    showTranslation: cloud.showTranslation,
    repeatCount: cloud.repeatCount,
    preferredReciterKey: cloud.preferredReciterKey.trim()
      ? cloud.preferredReciterKey
      : guest.preferredReciterKey,
    preferredTranslationId: cloud.preferredTranslationId ?? guest.preferredTranslationId,
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

async function loadCloudPreferencesRow(
  learnerId: string,
): Promise<ReaderPreferences | null> {
  const { data, error } = await supabase
    .from('learner_reader_preferences')
    .select(
      'show_translation, repeat_count, preferred_reciter_key, preferred_translation_id',
    )
    .eq('learner_id', learnerId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const repeat = data.repeat_count as AudioRepeatCount;
  return {
    showTranslation: data.show_translation,
    repeatCount: repeat === '1' || repeat === '3' || repeat === 'loop' ? repeat : '1',
    preferredReciterKey: data.preferred_reciter_key || DEFAULT_RECITER_KEY,
    preferredTranslationId: data.preferred_translation_id,
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
  before: ReaderPreferences | null,
  after: ReaderPreferences,
): boolean {
  if (!before) {
    return true;
  }
  return (
    before.showTranslation !== after.showTranslation ||
    before.repeatCount !== after.repeatCount ||
    before.preferredReciterKey !== after.preferredReciterKey ||
    before.preferredTranslationId !== after.preferredTranslationId
  );
}

/**
 * Consumes staged guest reader prefs/state into cloud tables.
 * Safe to call multiple times — removes the staged key after success.
 * Does not overwrite non-empty cloud preference fields.
 */
export async function mergeMigratedGuestReaderSettings(
  userId: string,
  _learner: ActiveLearner,
): Promise<boolean> {
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
      const cloudPrefs = await loadCloudPreferencesRow(userId);
      const mergedPrefs = mergeReaderPreferencesEmptyOnly(cloudPrefs, guestPrefs);

      if (preferencesChanged(cloudPrefs, mergedPrefs)) {
        const { error: prefsError } = await supabase
          .from('learner_reader_preferences')
          .upsert(
            {
              learner_id: userId,
              show_translation: mergedPrefs.showTranslation,
              repeat_count: mergedPrefs.repeatCount,
              preferred_reciter_key: mergedPrefs.preferredReciterKey,
              preferred_translation_id: mergedPrefs.preferredTranslationId,
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
    return true;
  } catch {
    return false;
  }
}
