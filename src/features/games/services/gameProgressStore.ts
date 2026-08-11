import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ActiveLearner } from '@/features/auth';
import { isGuestLearner } from '@/features/auth';

import { GAME_CHALLENGE_POINTS, GAME_PROGRESS_VERSION } from '../constants';
import { gameProgressSnapshotSchema } from '../schemas';
import type { GameProgressSnapshot } from '../types';

const GUEST_GAMES_KEY = 'qq.guest.games';
const LEARNER_GAMES_PREFIX = 'qq.games.progress.';
export const GUEST_GAMES_MIGRATION_PREFIX = 'qq.migrated_games.';

export function createEmptyGameProgress(): GameProgressSnapshot {
  return {
    version: GAME_PROGRESS_VERSION,
    completions: [],
    achievements: [],
    streakDays: 0,
    lastPlayedDate: null,
    dailyChallengeDate: null,
  };
}

function storageKeyForLearner(learner: ActiveLearner): string {
  if (isGuestLearner(learner)) {
    return GUEST_GAMES_KEY;
  }
  return `${LEARNER_GAMES_PREFIX}${learner.id}`;
}

function parseProgress(raw: string | null): GameProgressSnapshot {
  if (!raw) {
    return createEmptyGameProgress();
  }
  try {
    const parsed = gameProgressSnapshotSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return createEmptyGameProgress();
    }
    return parsed.data;
  } catch {
    return createEmptyGameProgress();
  }
}

export async function loadGameProgress(
  learner: ActiveLearner,
): Promise<GameProgressSnapshot> {
  const raw = await AsyncStorage.getItem(storageKeyForLearner(learner));
  return parseProgress(raw);
}

export async function saveGameProgress(
  learner: ActiveLearner,
  snapshot: GameProgressSnapshot,
): Promise<void> {
  await AsyncStorage.setItem(storageKeyForLearner(learner), JSON.stringify(snapshot));
}

export async function loadGuestGameProgressRaw(): Promise<string | null> {
  return AsyncStorage.getItem(GUEST_GAMES_KEY);
}

export async function stageGuestGamesForMigration(userId: string): Promise<boolean> {
  const raw = await AsyncStorage.getItem(GUEST_GAMES_KEY);
  if (!raw) {
    return false;
  }
  await AsyncStorage.setItem(
    `${GUEST_GAMES_MIGRATION_PREFIX}${userId}`,
    JSON.stringify({
      progress: parseProgress(raw),
      migratedAt: new Date().toISOString(),
    }),
  );
  await AsyncStorage.removeItem(GUEST_GAMES_KEY);
  return true;
}

export async function mergeMigratedGuestGamesProgress(
  userId: string,
  learner: ActiveLearner,
): Promise<boolean> {
  const stagedKey = `${GUEST_GAMES_MIGRATION_PREFIX}${userId}`;
  const raw = await AsyncStorage.getItem(stagedKey);
  if (!raw) {
    return false;
  }

  let guestProgress = createEmptyGameProgress();
  try {
    const staged = JSON.parse(raw) as { progress?: unknown };
    const parsed = gameProgressSnapshotSchema.safeParse(staged.progress);
    if (parsed.success) {
      guestProgress = parsed.data;
    }
  } catch {
    guestProgress = createEmptyGameProgress();
  }

  const existing = await loadGameProgress(learner);
  const merged = mergeGameProgress(existing, guestProgress);
  await saveGameProgress(learner, merged);
  await AsyncStorage.removeItem(stagedKey);
  return true;
}

export function mergeGameProgress(
  primary: GameProgressSnapshot,
  secondary: GameProgressSnapshot,
): GameProgressSnapshot {
  const completionMap = new Map<string, (typeof primary.completions)[number]>();
  for (const item of [...secondary.completions, ...primary.completions]) {
    const existing = completionMap.get(item.challengeKey);
    if (!existing || item.completedAt > existing.completedAt) {
      completionMap.set(item.challengeKey, item);
    }
  }

  const achievements = Array.from(
    new Set([...primary.achievements, ...secondary.achievements]),
  );

  return {
    version: GAME_PROGRESS_VERSION,
    completions: [...completionMap.values()].sort((a, b) =>
      a.completedAt.localeCompare(b.completedAt),
    ),
    achievements,
    streakDays: Math.max(primary.streakDays, secondary.streakDays),
    lastPlayedDate: pickLaterDate(primary.lastPlayedDate, secondary.lastPlayedDate),
    dailyChallengeDate: pickLaterDate(
      primary.dailyChallengeDate,
      secondary.dailyChallengeDate,
    ),
  };
}

function pickLaterDate(a: string | null, b: string | null): string | null {
  if (!a) {
    return b;
  }
  if (!b) {
    return a;
  }
  return a >= b ? a : b;
}

export function countUniqueCompletions(snapshot: GameProgressSnapshot): number {
  return snapshot.completions.length;
}

export function computeGameBonusPoints(snapshot: GameProgressSnapshot): number {
  // Unique challenge completions only — never farm the same challenge for more XP.
  return snapshot.completions.length * GAME_CHALLENGE_POINTS;
}
