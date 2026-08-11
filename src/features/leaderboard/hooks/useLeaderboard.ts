import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth';
import { loadLearningSnapshot } from '@/features/learning';

import type { JuzChallengeNumber } from '../constants';
import { buildLeaderboardModel } from '../services/leaderboardService';
import type { LeaderboardModel } from '../types';

export function useLeaderboard(selectedJuz?: JuzChallengeNumber) {
  const { activeLearner, isGuest } = useAuth();
  const [model, setModel] = useState<LeaderboardModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!activeLearner) {
      setModel(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const snapshot = await loadLearningSnapshot(activeLearner);
      const next = await buildLeaderboardModel({
        activeLearner,
        snapshot,
        isGuest,
        selectedJuz,
      });
      setModel(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the leaderboard.');
      setModel(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeLearner, isGuest, selectedJuz]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { model, isLoading, error, refresh };
}
