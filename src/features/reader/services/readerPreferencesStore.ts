import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ActiveLearner } from '@/features/auth';
import { isChildFamilyLearner, isGuestLearner } from '@/features/auth';
import { resolveAgeGroup } from '@/features/learning/services/ageGroup';
import { supabase } from '@/lib/supabase';
import type { AudioRepeatCount, Json } from '@/types';

import {
  DEFAULT_RECITER_KEY,
  READER_PREFS_STORAGE_KEY,
  READER_STATE_STORAGE_KEY,
  defaultRepeatForAgeGroup,
  defaultShowTranslation,
} from '../constants';
import { readerBrowseStateSchema, readerPreferencesSchema } from '../schemas';
import type { ReaderBrowseState, ReaderPreferences } from '../types';
import { emptyFutureSettings, parseFutureSettings } from './futureSettings';

function localPrefsKey(learnerId: string): string {
  return `${READER_PREFS_STORAGE_KEY}.${learnerId}`;
}

function localStateKey(learnerId: string): string {
  return `${READER_STATE_STORAGE_KEY}.${learnerId}`;
}

function usesLocalReaderStore(learner: ActiveLearner): boolean {
  return isGuestLearner(learner) || isChildFamilyLearner(learner);
}

export function buildDefaultPreferences(learner: ActiveLearner): ReaderPreferences {
  const ageGroup = resolveAgeGroup(learner);
  return {
    showTranslation: defaultShowTranslation(learner.preferred_language),
    repeatCount: defaultRepeatForAgeGroup(ageGroup),
    preferredReciterKey: DEFAULT_RECITER_KEY,
    preferredTranslationId: null,
    fontScale: null,
    futureSettings: emptyFutureSettings(),
  };
}

export function buildDefaultBrowseState(): ReaderBrowseState {
  return {
    lastSurahNumber: 1,
    lastAyahNumber: 1,
  };
}

export async function loadReaderPreferences(
  learner: ActiveLearner,
): Promise<ReaderPreferences> {
  const defaults = buildDefaultPreferences(learner);

  if (usesLocalReaderStore(learner)) {
    const raw = await AsyncStorage.getItem(localPrefsKey(learner.id));
    if (!raw) {
      return defaults;
    }
    try {
      const parsed = readerPreferencesSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) {
        return defaults;
      }
      return {
        ...parsed.data,
        // V1: Arabic size stays age-derived.
        fontScale: null,
      };
    } catch {
      return defaults;
    }
  }

  const { data, error } = await supabase
    .from('learner_reader_preferences')
    .select(
      'show_translation, repeat_count, preferred_reciter_key, preferred_translation_id, future_settings',
    )
    .eq('learner_id', learner.id)
    .maybeSingle();

  if (error || !data) {
    return defaults;
  }

  const repeat = data.repeat_count as AudioRepeatCount;
  return {
    showTranslation: data.show_translation,
    repeatCount:
      repeat === '1' || repeat === '3' || repeat === 'loop'
        ? repeat
        : defaults.repeatCount,
    preferredReciterKey: data.preferred_reciter_key || DEFAULT_RECITER_KEY,
    preferredTranslationId: data.preferred_translation_id,
    fontScale: null,
    futureSettings: parseFutureSettings(data.future_settings),
  };
}

export async function saveReaderPreferences(
  learner: ActiveLearner,
  prefs: ReaderPreferences,
): Promise<void> {
  const validated = readerPreferencesSchema.parse({
    ...prefs,
    fontScale: null,
  });

  if (usesLocalReaderStore(learner)) {
    await AsyncStorage.setItem(localPrefsKey(learner.id), JSON.stringify(validated));
    return;
  }

  const { error } = await supabase.from('learner_reader_preferences').upsert(
    {
      learner_id: learner.id,
      show_translation: validated.showTranslation,
      repeat_count: validated.repeatCount,
      preferred_reciter_key: validated.preferredReciterKey,
      preferred_translation_id: validated.preferredTranslationId,
      font_scale: null,
      future_settings: validated.futureSettings as unknown as Json,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'learner_id' },
  );

  if (error) {
    throw new Error(error.message || 'Could not save reader preferences.');
  }
}

export async function loadReaderBrowseState(
  learner: ActiveLearner,
): Promise<ReaderBrowseState> {
  const defaults = buildDefaultBrowseState();

  // Local cache supports full mushaf (1–114). Prefer it when present.
  const localRaw = await AsyncStorage.getItem(localStateKey(learner.id));
  if (localRaw) {
    try {
      const parsed = readerBrowseStateSchema.safeParse(JSON.parse(localRaw));
      if (parsed.success) {
        return parsed.data;
      }
    } catch {
      // Fall through to cloud / defaults.
    }
  }

  if (usesLocalReaderStore(learner)) {
    return defaults;
  }

  const { data, error } = await supabase
    .from('learner_reader_state')
    .select('last_surah_number, last_ayah_number')
    .eq('learner_id', learner.id)
    .maybeSingle();

  if (error || !data) {
    return defaults;
  }

  const fromCloud = readerBrowseStateSchema.safeParse({
    lastSurahNumber: data.last_surah_number,
    lastAyahNumber: data.last_ayah_number,
  });
  return fromCloud.success ? fromCloud.data : defaults;
}

export async function saveReaderBrowseState(
  learner: ActiveLearner,
  state: ReaderBrowseState,
): Promise<void> {
  const validated = readerBrowseStateSchema.parse(state);

  // Always persist locally so full-mushaf positions survive (cloud FK is Juz 30 only).
  await AsyncStorage.setItem(localStateKey(learner.id), JSON.stringify(validated));

  if (usesLocalReaderStore(learner)) {
    return;
  }

  // Cloud table references seeded Juz 30 surahs only — sync when in range.
  if (validated.lastSurahNumber < 78 || validated.lastSurahNumber > 114) {
    return;
  }

  const { error } = await supabase.from('learner_reader_state').upsert(
    {
      learner_id: learner.id,
      last_surah_number: validated.lastSurahNumber,
      last_ayah_number: validated.lastAyahNumber,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'learner_id' },
  );

  if (error) {
    // Local cache already saved; cloud sync is best-effort (Juz 30 FK limits).
    return;
  }
}
