import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth';

import {
  loadTafsirProgress,
  recordTafsirListenProgress,
  recordTafsirUnderstanding,
  setTafsirEnabled as persistEnabled,
} from '../services/tafsirProgressStore';
import type { TafsirProgressPayload, TafsirVerseProgress } from '../schemas';

export function useTafsirMode() {
  const { activeLearner } = useAuth();
  const [payload, setPayload] = useState<TafsirProgressPayload>({
    version: 1,
    enabled: false,
    verses: {},
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!activeLearner) {
        setPayload({ version: 1, enabled: false, verses: {} });
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const next = await loadTafsirProgress(activeLearner);
      if (!cancelled) {
        setPayload(next);
        setIsLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [activeLearner]);

  const setEnabled = useCallback(
    async (enabled: boolean) => {
      if (!activeLearner) {
        return;
      }
      const next = await persistEnabled(activeLearner, enabled);
      setPayload(next);
    },
    [activeLearner],
  );

  const saveListenProgress = useCallback(
    async (
      verseId: string,
      currentTime: number,
      duration: number,
      completed: boolean,
    ) => {
      if (!activeLearner) {
        return;
      }
      const next = await recordTafsirListenProgress(
        activeLearner,
        verseId,
        currentTime,
        duration,
        completed,
      );
      setPayload(next);
    },
    [activeLearner],
  );

  const saveUnderstanding = useCallback(
    async (verseId: string, correct: boolean) => {
      if (!activeLearner) {
        return;
      }
      const next = await recordTafsirUnderstanding(activeLearner, verseId, correct);
      setPayload(next);
    },
    [activeLearner],
  );

  const verseProgress = useCallback(
    (verseId: string): TafsirVerseProgress | undefined => payload.verses[verseId],
    [payload.verses],
  );

  return {
    enabled: payload.enabled,
    payload,
    isLoading,
    setEnabled,
    saveListenProgress,
    saveUnderstanding,
    verseProgress,
  };
}
