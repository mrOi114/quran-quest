import AsyncStorage from '@react-native-async-storage/async-storage';

import { RANK_DELTA_STORAGE_KEY } from '../constants';
import type { LeaderboardViewId } from '../constants';

type RankSnapshot = {
  updatedAt: string;
  ranks: Partial<Record<LeaderboardViewId, number>>;
};

export async function loadRankSnapshot(): Promise<RankSnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(RANK_DELTA_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as RankSnapshot;
  } catch {
    return null;
  }
}

export async function saveRankSnapshot(
  ranks: Partial<Record<LeaderboardViewId, number>>,
): Promise<void> {
  const payload: RankSnapshot = {
    updatedAt: new Date().toISOString(),
    ranks,
  };
  await AsyncStorage.setItem(RANK_DELTA_STORAGE_KEY, JSON.stringify(payload));
}

export function computePlacesMoved(
  previousRank: number | undefined,
  currentRank: number,
): number | null {
  if (previousRank == null || previousRank <= 0 || currentRank <= 0) {
    return null;
  }
  return previousRank - currentRank;
}
