export const COMPETITION_MAX_PARTICIPANTS = 5;
export const COMPETITION_QUESTION_SECONDS = 60;
export const PRODUCTION_WEB_ORIGIN = 'https://quran-quest-5640.vercel.app';
export const PARTICIPANT_KEY_STORAGE = 'qq.competition.participant_key';
export const PENDING_CHALLENGE_STORAGE = 'qq.competition.pending_code';
export const ACTIVE_CHALLENGE_STORAGE = 'qq.competition.active_code';
export const MOTIVATION_SOUND_STORAGE = 'qq.competition.voice_enabled';

export const QUESTION_COUNT_BY_TIER = {
  1: 5,
  2: 5,
  3: 5,
} as const;
