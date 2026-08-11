import type { ActiveLearner } from '@/features/auth';
import { resolveAgeGroup } from '@/features/learning';
import { computeEffortBreakdown } from '@/features/leaderboard/services/effortPoints';
import { loadLearningSnapshot } from '@/features/learning';

import { GAME_DEFINITIONS, GAMES_KEEP_JOURNEY_MIN_COMPLETIONS } from '../constants';
import type { GamesHomeModel } from '../types';
import {
  computeGameBonusPoints,
  countUniqueCompletions,
  loadGameProgress,
} from './gameProgressStore';

export async function buildGamesHomeModel(options: {
  activeLearner: ActiveLearner;
  isGuest: boolean;
}): Promise<GamesHomeModel> {
  const { activeLearner, isGuest } = options;
  const ageGroup = resolveAgeGroup(activeLearner);
  const [learningSnapshot, gameProgress] = await Promise.all([
    loadLearningSnapshot(activeLearner),
    loadGameProgress(activeLearner),
  ]);

  const gameBonusPoints = computeGameBonusPoints(gameProgress);
  const effort = computeEffortBreakdown(learningSnapshot, { gameBonusPoints });
  const gamesCompleted = countUniqueCompletions(gameProgress);

  return {
    ageGroup,
    xpPoints: effort.totalPoints,
    gameBonusPoints,
    gamesCompleted,
    achievementsUnlocked: gameProgress.achievements.length,
    streakDays: Math.max(effort.streakDays, gameProgress.streakDays),
    availableGames: GAME_DEFINITIONS.filter((game) => game.available),
    comingSoonGames: GAME_DEFINITIONS.filter((game) => !game.available),
    achievements: gameProgress.achievements,
    showKeepJourney: isGuest && gamesCompleted >= GAMES_KEEP_JOURNEY_MIN_COMPLETIONS,
  };
}

export {
  computeGameBonusPoints,
  countUniqueCompletions,
  createEmptyGameProgress,
  loadGameProgress,
  mergeGameProgress,
  mergeMigratedGuestGamesProgress,
  saveGameProgress,
  stageGuestGamesForMigration,
} from './gameProgressStore';
export { recordGameCompletion } from './gameRewards';
export {
  filterQuestionsForAge,
  maxDifficultyForAge,
  pickQuestionsForRound,
  questionsPerRoundForAge,
  shuffle,
  todayDateKey,
} from './ageDifficulty';
export { evaluateAchievementsAfterCompletion } from './achievements';
