import type { AgeGroupId, ActiveLearner } from '@/features/auth';

import { GAME_CHALLENGE_POINTS, getGameDefinition } from '../constants';
import type {
  GameCompletionRecord,
  GameId,
  GameProgressSnapshot,
  GameSessionResult,
} from '../types';
import { evaluateAchievementsAfterCompletion } from './achievements';
import { todayDateKey } from './ageDifficulty';
import {
  computeGameBonusPoints,
  loadGameProgress,
  saveGameProgress,
} from './gameProgressStore';

function updateStreak(progress: GameProgressSnapshot, today: string): number {
  if (!progress.lastPlayedDate) {
    return 1;
  }
  if (progress.lastPlayedDate === today) {
    return Math.max(progress.streakDays, 1);
  }

  const last = new Date(`${progress.lastPlayedDate}T12:00:00.000Z`);
  const now = new Date(`${today}T12:00:00.000Z`);
  const diffDays = Math.round((now.getTime() - last.getTime()) / 86_400_000);

  if (diffDays === 1) {
    return progress.streakDays + 1;
  }
  return 1;
}

/**
 * Records a completed learning round once per challengeKey.
 * XP is derived later via effortPoints — never award a second ledger here.
 */
export async function recordGameCompletion(options: {
  learner: ActiveLearner;
  gameId: GameId;
  challengeKey: string;
  correctCount: number;
  totalCount: number;
  ageGroup: AgeGroupId;
}): Promise<GameSessionResult> {
  const { learner, gameId, challengeKey, correctCount, totalCount, ageGroup } = options;
  const definition = getGameDefinition(gameId);
  if (!definition) {
    throw new Error(`Unknown game: ${gameId}`);
  }

  // Require meaningful learning effort — at least half correct.
  const passed = totalCount > 0 && correctCount / totalCount >= 0.5;
  if (!passed) {
    return {
      gameId,
      challengeKey,
      correctCount,
      totalCount,
      newlyUnlockedAchievements: [],
      pointsAwarded: 0,
      alreadyCompleted: false,
    };
  }

  const progress = await loadGameProgress(learner);
  const already = progress.completions.some((item) => item.challengeKey === challengeKey);
  const today = todayDateKey();
  const streakDays = updateStreak(progress, today);

  if (already) {
    const next: GameProgressSnapshot = {
      ...progress,
      streakDays,
      lastPlayedDate: today,
    };
    await saveGameProgress(learner, next);
    return {
      gameId,
      challengeKey,
      correctCount,
      totalCount,
      newlyUnlockedAchievements: [],
      pointsAwarded: 0,
      alreadyCompleted: true,
    };
  }

  const completion: GameCompletionRecord = {
    challengeKey,
    gameId,
    category: definition.category,
    completedAt: new Date().toISOString(),
    correctCount,
    totalCount,
    ageGroup,
  };

  const withCompletion: GameProgressSnapshot = {
    ...progress,
    completions: [...progress.completions, completion],
    streakDays,
    lastPlayedDate: today,
  };

  const newlyUnlocked = evaluateAchievementsAfterCompletion(withCompletion, gameId);
  const next: GameProgressSnapshot = {
    ...withCompletion,
    achievements: [...new Set([...withCompletion.achievements, ...newlyUnlocked])],
  };

  const pointsBefore = computeGameBonusPoints(progress);
  await saveGameProgress(learner, next);
  const pointsAfter = computeGameBonusPoints(next);

  return {
    gameId,
    challengeKey,
    correctCount,
    totalCount,
    newlyUnlockedAchievements: newlyUnlocked,
    pointsAwarded: Math.max(0, pointsAfter - pointsBefore) || GAME_CHALLENGE_POINTS,
    alreadyCompleted: false,
  };
}
