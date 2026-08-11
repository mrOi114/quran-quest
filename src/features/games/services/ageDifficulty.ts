import type { AgeGroupId } from '@/features/auth';

import { MAX_DIFFICULTY_BY_AGE, QUESTIONS_PER_ROUND_BY_AGE } from '../constants';
import type { GameQuestion } from '../types';

export function maxDifficultyForAge(ageGroup: AgeGroupId): 1 | 2 | 3 | 4 {
  return MAX_DIFFICULTY_BY_AGE[ageGroup];
}

export function questionsPerRoundForAge(ageGroup: AgeGroupId): number {
  return QUESTIONS_PER_ROUND_BY_AGE[ageGroup];
}

/**
 * Prefer questions matching the age band; if too few, allow easier ones.
 * Never serve questions above the age max difficulty.
 */
export function filterQuestionsForAge(
  questions: GameQuestion[],
  ageGroup: AgeGroupId,
): GameQuestion[] {
  const maxDifficulty = maxDifficultyForAge(ageGroup);
  const withinDifficulty = questions.filter((q) => q.difficulty <= maxDifficulty);
  const ageMatched = withinDifficulty.filter(
    (q) => q.ageGroups.length === 0 || q.ageGroups.includes(ageGroup),
  );

  if (ageMatched.length >= 3) {
    return ageMatched;
  }

  return withinDifficulty;
}

export function pickQuestionsForRound(
  questions: GameQuestion[],
  ageGroup: AgeGroupId,
  count: number,
): GameQuestion[] {
  const pool = filterQuestionsForAge(questions, ageGroup);
  const shuffled = shuffle(pool);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = next[i];
    next[i] = next[j]!;
    next[j] = temp!;
  }
  return next;
}

export function todayDateKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}
