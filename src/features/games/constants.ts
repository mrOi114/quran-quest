import type { AgeGroupId } from '@/features/auth';

import type { GameAchievementId, GameDefinition, GameId } from './types';

/** Points per unique completed game challenge — same effort ledger as lessons. */
export const GAME_CHALLENGE_POINTS = 20;

/** Soft guest prompt after this many unique game completions. */
export const GAMES_KEEP_JOURNEY_MIN_COMPLETIONS = 2;

export const GAME_PROGRESS_VERSION = 1 as const;

export const GAME_DEFINITIONS: GameDefinition[] = [
  {
    id: 'wudu',
    category: 'wudu',
    title: 'Wudu Challenge',
    subtitle: 'Learn the steps of purification.',
    icon: '💧',
    phase: 2,
    available: true,
    questionsPerRound: 4,
  },
  {
    id: 'salah',
    category: 'salah',
    title: 'Salah Challenge',
    subtitle: 'Learn the daily prayers.',
    icon: '🕌',
    phase: 2,
    available: true,
    questionsPerRound: 5,
  },
  {
    id: 'prophets',
    category: 'prophets',
    title: 'Who Am I?',
    subtitle: 'Discover the Prophets through clues.',
    icon: '👳',
    phase: 2,
    available: true,
    questionsPerRound: 5,
  },
  {
    id: 'character',
    category: 'character',
    title: 'Good Character',
    subtitle: 'Practice kindness in real situations.',
    icon: '❤️',
    phase: 2,
    available: true,
    questionsPerRound: 5,
  },
  {
    id: 'knowledge',
    category: 'knowledge',
    title: 'Islamic Knowledge',
    subtitle: 'A friendly quiz about Islam.',
    icon: '🧠',
    phase: 2,
    available: true,
    questionsPerRound: 5,
  },
  {
    id: 'hajj',
    category: 'hajj',
    title: 'Hajj & Umrah',
    subtitle: 'Journey through sacred places.',
    icon: '🕋',
    phase: 3,
    available: false,
    questionsPerRound: 5,
  },
  {
    id: 'ramadan',
    category: 'ramadan',
    title: 'Ramadan Quest',
    subtitle: 'Learn about the blessed month.',
    icon: '🌙',
    phase: 3,
    available: false,
    questionsPerRound: 5,
  },
  {
    id: 'quran',
    category: 'quran',
    title: 'Qur’an Knowledge',
    subtitle: 'Surahs, Juz, and Qur’an facts.',
    icon: '📖',
    phase: 3,
    available: false,
    questionsPerRound: 5,
  },
  {
    id: 'dua',
    category: 'dua',
    title: 'Du’a Match',
    subtitle: 'Match situations to everyday du’as.',
    icon: '🤲',
    phase: 3,
    available: false,
    questionsPerRound: 4,
  },
  {
    id: 'history',
    category: 'history',
    title: 'Islamic History',
    subtitle: 'Explore Makkah, Madinah, and more.',
    icon: '🌍',
    phase: 3,
    available: false,
    questionsPerRound: 5,
  },
  {
    id: 'memory',
    category: 'knowledge',
    title: 'Memory Match',
    subtitle: 'Find matching Islamic pairs.',
    icon: '🧩',
    phase: 4,
    available: false,
    questionsPerRound: 6,
  },
  {
    id: 'adventure',
    category: 'islam_basics',
    title: 'Islamic Adventure',
    subtitle: 'Travel through Islamic learning worlds.',
    icon: '🌍',
    phase: 4,
    available: false,
    questionsPerRound: 6,
  },
  {
    id: 'daily',
    category: 'daily',
    title: 'Daily Challenge',
    subtitle: 'One short challenge every day.',
    icon: '⭐',
    phase: 4,
    available: false,
    questionsPerRound: 1,
  },
];

export const ACHIEVEMENT_DEFINITIONS: Record<
  GameAchievementId,
  { title: string; description: string; icon: string }
> = {
  islam_explorer: {
    title: 'Islam Explorer',
    description: 'Complete your first Islamic game.',
    icon: '🏅',
  },
  wudu_master: {
    title: 'Wudu Master',
    description: 'Complete the Wudu Challenge.',
    icon: '💧',
  },
  salah_star: {
    title: 'Salah Star',
    description: 'Complete Salah learning challenges.',
    icon: '🕌',
  },
  prophet_explorer: {
    title: 'Prophet Explorer',
    description: 'Complete Prophet learning challenges.',
    icon: '👳',
  },
  ramadan_explorer: {
    title: 'Ramadan Explorer',
    description: 'Complete Ramadan challenges.',
    icon: '🌙',
  },
  quran_explorer: {
    title: 'Qur’an Explorer',
    description: 'Complete Qur’an knowledge challenges.',
    icon: '📖',
  },
  character_hero: {
    title: 'Good Character Hero',
    description: 'Complete good-character challenges.',
    icon: '❤️',
  },
  knowledge_seeker: {
    title: 'Knowledge Seeker',
    description: 'Complete challenges from multiple categories.',
    icon: '🧠',
  },
};

/** Max difficulty by age — games filter questions to this ceiling. */
export const MAX_DIFFICULTY_BY_AGE: Record<AgeGroupId, 1 | 2 | 3 | 4> = {
  child_3_6: 1,
  child_7_10: 2,
  child_11_14: 3,
  teen_15_17: 4,
  adult_18_plus: 4,
};

export const QUESTIONS_PER_ROUND_BY_AGE: Record<AgeGroupId, number> = {
  child_3_6: 3,
  child_7_10: 4,
  child_11_14: 5,
  teen_15_17: 5,
  adult_18_plus: 5,
};

export function isGameId(value: string): value is GameId {
  return GAME_DEFINITIONS.some((game) => game.id === value);
}

export function getGameDefinition(gameId: GameId): GameDefinition | undefined {
  return GAME_DEFINITIONS.find((game) => game.id === gameId);
}
