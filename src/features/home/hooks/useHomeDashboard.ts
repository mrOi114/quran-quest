import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth';

import { buildHomeDashboard } from '../services';
import type { HomeDashboardModel } from '../types';

type UseHomeDashboardResult = {
  dashboard: HomeDashboardModel | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

export function useHomeDashboard(): UseHomeDashboardResult {
  const { activeLearner, profile, isGuest, guestProgress } = useAuth();
  const [dashboard, setDashboard] = useState<HomeDashboardModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Yield so state updates are not synchronous inside the effect body.
      await Promise.resolve();
      if (cancelled) {
        return;
      }

      if (!activeLearner) {
        setDashboard(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const model = await buildHomeDashboard({
          activeLearner,
          profile,
          isGuest,
          guestProgress,
        });
        if (!cancelled) {
          setDashboard(model);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [activeLearner, guestProgress, isGuest, profile, reloadKey]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setReloadKey((value) => value + 1);
  }, []);

  return { dashboard, isLoading, refresh };
}
