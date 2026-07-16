import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ActiveLearner } from '@/features/auth';
import { isGuestLearner } from '@/features/auth';
import { JUZ_30_SURAH_START } from '@/features/learning/constants';
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

function guestPrefsKey(learnerId: string): string {
  return `${READER_PREFS_STORAGE_KEY}.${learnerId}`;
}

function guestStateKey(learnerId: string): string {
  return `${READER_STATE_STORAGE_KEY}.${learnerId}`;
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
    lastSurahNumber: JUZ_30_SURAH_START,
    lastAyahNumber: 1,
  };
}

export async function loadReaderPreferences(
  learner: ActiveLearner,
): Promise<ReaderPreferences> {
  const defaults = buildDefaultPreferences(learner);

  if (isGuestLearner(learner)) {
    const raw = await AsyncStorage.getItem(guestPrefsKey(learner.id));
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

  if (isGuestLearner(learner)) {
    await AsyncStorage.setItem(guestPrefsKey(learner.id), JSON.stringify(validated));
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

  if (isGuestLearner(learner)) {
    const raw = await AsyncStorage.getItem(guestStateKey(learner.id));
    if (!raw) {
      return defaults;
    }
    try {
      const parsed = readerBrowseStateSchema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : defaults;
    } catch {
      return defaults;
    }
  }

  const { data, error } = await supabase
    .from('learner_reader_state')
    .select('last_surah_number, last_ayah_number')
    .eq('learner_id', learner.id)
    .maybeSingle();

  if (error || !data) {
    return defaults;
  }

  return {
    lastSurahNumber: data.last_surah_number,
    lastAyahNumber: data.last_ayah_number,
  };
}

export async function saveReaderBrowseState(
  learner: ActiveLearner,
  state: ReaderBrowseState,
): Promise<void> {
  const validated = readerBrowseStateSchema.parse(state);

  if (isGuestLearner(learner)) {
    await AsyncStorage.setItem(guestStateKey(learner.id), JSON.stringify(validated));
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
    throw new Error(error.message || 'Could not save reader position.');
  }
}
