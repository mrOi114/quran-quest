import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth';
import type { AudioRepeatCount } from '@/types';

import {
  buildDefaultPreferences,
  loadReaderPreferences,
  saveReaderPreferences,
} from '../services/readerPreferencesStore';
import type { ReaderPreferences } from '../types';

type UseReaderPreferencesResult = {
  preferences: ReaderPreferences | null;
  isLoading: boolean;
  error: string | null;
  setShowTranslation: (value: boolean) => Promise<void>;
  setRepeatCount: (value: AudioRepeatCount) => Promise<void>;
  reload: () => Promise<void>;
};

export function useReaderPreferences(): UseReaderPreferencesResult {
  const { activeLearner } = useAuth();
  const [preferences, setPreferences] = useState<ReaderPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await Promise.resolve();
      if (cancelled) {
        return;
      }
      if (!activeLearner) {
        setPreferences(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const next = await loadReaderPreferences(activeLearner);
        if (!cancelled) {
          setPreferences(next);
        }
      } catch (err) {
        if (!cancelled) {
          setPreferences(buildDefaultPreferences(activeLearner));
          setError(
            err instanceof Error ? err.message : 'Could not load reader settings.',
          );
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
  }, [activeLearner, reloadKey]);

  const persist = useCallback(
    async (next: ReaderPreferences) => {
      if (!activeLearner) {
        return;
      }
      setPreferences(next);
      try {
        await saveReaderPreferences(activeLearner, next);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save reader settings.');
      }
    },
    [activeLearner],
  );

  const setShowTranslation = useCallback(
    async (value: boolean) => {
      if (!preferences) {
        return;
      }
      await persist({ ...preferences, showTranslation: value });
    },
    [persist, preferences],
  );

  const setRepeatCount = useCallback(
    async (value: AudioRepeatCount) => {
      if (!preferences) {
        return;
      }
      await persist({ ...preferences, repeatCount: value });
    },
    [persist, preferences],
  );

  return {
    preferences,
    isLoading,
    error,
    setShowTranslation,
    setRepeatCount,
    reload: async () => {
      setReloadKey((value) => value + 1);
    },
  };
}
