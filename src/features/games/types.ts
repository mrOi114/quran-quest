import type { AgeGroupId } from '@/features/auth';

export type GameId =
  | 'wudu'
  | 'salah'
  | 'prophets'
  | 'character'
  | 'knowledge'
  | 'hajj'
  | 'ramadan'
  | 'quran'
  | 'dua'
  | 'history'
  | 'memory'
  | 'adventure'
  | 'daily';

export type GameCategoryId =
  | 'islam_basics'
  | 'quran'
  | 'salah'
  | 'wudu'
  | 'ramadan'
  | 'hajj'
  | 'prophets'
  | 'character'
  | 'dua'
  | 'history'
  | 'knowledge'
  | 'daily';

export type GameQuestionType = 'multiple_choice' | 'ordering' | 'clue';

export type GameChoice = {
  id: string;
  label: string;
};

export type GameQuestion = {
  id: string;
  gameId: GameId;
  category: GameCategoryId;
  /** Age groups allowed to see this question. Empty = all. */
  ageGroups: AgeGroupId[];
  /** 1 = youngest / simplest … 4 = oldest / deepest */
  difficulty: 1 | 2 | 3 | 4;
  type: GameQuestionType;
  prompt: string;
  choices?: GameChoice[];
  correctChoiceId?: string;
  /** Correct order is the array order; UI shuffles for play. */
  orderItems?: GameChoice[];
  clue?: string;
  answerLabel?: string;
  explanation: string;
  hint?: string;
  /** Short citation note for maintainers (not always shown in UI). */
  sourceNote?: string;
};

export type GameDefinition = {
  id: GameId;
  category: GameCategoryId;
  title: string;
  subtitle: string;
  icon: string;
  phase: 2 | 3 | 4;
  available: boolean;
  questionsPerRound: number;
};

export type GameAchievementId =
  | 'islam_explorer'
  | 'wudu_master'
  | 'salah_star'
  | 'prophet_explorer'
  | 'ramadan_explorer'
  | 'quran_explorer'
  | 'character_hero'
  | 'knowledge_seeker';

export type GameCompletionRecord = {
  /** Unique key so the same challenge is never scored twice. */
  challengeKey: string;
  gameId: GameId;
  category: GameCategoryId;
  completedAt: string;
  correctCount: number;
  totalCount: number;
  ageGroup: AgeGroupId;
};

export type GameProgressSnapshot = {
  version: 1;
  completions: GameCompletionRecord[];
  achievements: GameAchievementId[];
  streakDays: number;
  lastPlayedDate: string | null;
  dailyChallengeDate: string | null;
};

export type GameSessionResult = {
  gameId: GameId;
  challengeKey: string;
  correctCount: number;
  totalCount: number;
  newlyUnlockedAchievements: GameAchievementId[];
  pointsAwarded: number;
  alreadyCompleted: boolean;
};

export type GamesHomeModel = {
  ageGroup: AgeGroupId;
  xpPoints: number;
  gameBonusPoints: number;
  gamesCompleted: number;
  achievementsUnlocked: number;
  streakDays: number;
  availableGames: GameDefinition[];
  comingSoonGames: GameDefinition[];
  achievements: GameAchievementId[];
  showKeepJourney: boolean;
};
