export const COMPETITION_MAX_PARTICIPANTS = 2;
export const COMPETITION_QUESTION_SECONDS = 15;
export const PRODUCTION_WEB_ORIGIN = 'https://quran-quest-5640.vercel.app';
export const PARTICIPANT_KEY_STORAGE = 'qq.competition.participant_key';
export const PENDING_CHALLENGE_STORAGE = 'qq.competition.pending_code';

export const QUESTION_COUNT_BY_TIER = {
  1: 5,
  2: 5,
  3: 5,
} as const;

export const AI_OPPONENT_LABEL = '🤖 AI Opponent';
export const AI_FALLBACK_WAIT_MS = 20_000;
