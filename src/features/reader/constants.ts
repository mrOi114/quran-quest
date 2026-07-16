import type { AgeGroupId } from '@/features/auth';
import { DEFAULT_BEGINNER_RECITER_KEY } from '@/features/learning/constants';
import type { AudioRepeatCount } from '@/types';

export const FALLBACK_TRANSLATION_ID = 'en-sahih-international';
export const FALLBACK_TRANSLATION_LANGUAGE = 'en';

export const READER_PREFS_STORAGE_KEY = 'qq.reader.prefs';
export const READER_STATE_STORAGE_KEY = 'qq.reader.state';

export const ARABIC_FONT_FAMILY = 'Amiri_400Regular';

export const DEFAULT_READER_REPEAT: AudioRepeatCount = '1';

/** Beginner-friendly default repeat for younger learners. */
export function defaultRepeatForAgeGroup(ageGroup: AgeGroupId): AudioRepeatCount {
  if (ageGroup === 'child_3_6' || ageGroup === 'child_7_10') {
    return '3';
  }
  return DEFAULT_READER_REPEAT;
}

export function defaultShowTranslation(preferredLanguage: string): boolean {
  return preferredLanguage !== 'ar';
}

export const DEFAULT_RECITER_KEY = DEFAULT_BEGINNER_RECITER_KEY;

export const ARABIC_FONT_SIZE: Record<AgeGroupId, number> = {
  child_3_6: 40,
  child_7_10: 36,
  child_11_14: 32,
  teen_15_17: 30,
  adult_18_plus: 28,
};

/** Multipliers for optional reader fontScale preference (display only). */
export const FONT_SCALE_MULTIPLIER = {
  default: 1,
  large: 1.12,
  xlarge: 1.25,
} as const;

export const EASTERN_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;
