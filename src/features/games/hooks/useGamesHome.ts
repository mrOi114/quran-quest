import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth';

import type { GamesHomeModel } from '../types';
import { buildGamesHomeModel } from '../services';

export function useGamesHome() {
  const { activeLearner, isGuest } = useAuth();
  const [model, setModel] = useState<GamesHomeModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        setModel(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const next = await buildGamesHomeModel({ activeLearner, isGuest });
        if (!cancelled) {
          setModel(next);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load games.');
          setModel(null);
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
  }, [activeLearner, isGuest, reloadKey]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setReloadKey((value) => value + 1);
  }, []);

  return { model, isLoading, error, refresh };
}
