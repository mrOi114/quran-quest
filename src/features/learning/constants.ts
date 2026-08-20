import type { AgeGroupId } from '@/features/auth';

export const JUZ_30_NUMBER = 30;
export const JUZ_30_SURAH_START = 78;
export const JUZ_30_SURAH_END = 114;

/** Full mushaf bounds for Hifz lessons (all 30 Juz). */
export const MUSHAF_SURAH_START = 1;
export const MUSHAF_SURAH_END = 114;
export const MUSHAF_JUZ_COUNT = 30;

/** Target verses per lesson by age group (approved Feature 004 plan). */
export const VERSES_PER_LESSON: Record<AgeGroupId, number> = {
  child_3_6: 1,
  child_7_10: 2,
  child_11_14: 3,
  teen_15_17: 4,
  adult_18_plus: 5,
};

/** Lesson / unlock knowledge-check pass mark (inclusive). */
export const LESSON_PASS_PERCENT = 60;

export const MASTERY_ENCOURAGEMENT = {
  pass: '🌟 Amazing! You know this. Let’s keep going.',
  fail: '🌱 Almost there! Let’s practice once more.',
  keepGoing: '💚 Keep going — you’re getting stronger.',
  unlockPass: '✅ You know this!',
  unlockFail: '🌱 Keep practicing!',
  quranComplete: '🏆 Qur’an completed — you kept going all the way.',
} as const;

export const DEFAULT_TRANSLATION_LANGUAGE = 'en';

/**
 * V1 default beginner Qari (Mahmoud Khalil Al-Husary).
 * Do not hard-code other reciters in UI — resolve via content helpers.
 */
export const DEFAULT_BEGINNER_RECITER_KEY = 'husary_128';

export const LEARNING_PAYLOAD_VERSION = 1 as const;
