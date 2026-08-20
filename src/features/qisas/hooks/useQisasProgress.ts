import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/features/auth';

import {
  getStoryProgress,
  loadQisasProgress,
  markQisasGameComplete,
  markQisasListenComplete,
  markQisasRead,
  recordQisasLearn,
  setQisasLastMode,
} from '../services/qisasProgressStore';
import type { QisasLanguage, QisasMode, QisasStoryProgress } from '../schemas';

export function useQisasProgress(storyId: string, language: QisasLanguage) {
  const { activeLearner } = useAuth();
  const [progress, setProgress] = useState<QisasStoryProgress | null>(null);
  const learnerRef = useRef(activeLearner);
  learnerRef.current = activeLearner;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!activeLearner) {
        setProgress(null);
        return;
      }
      const payload = await loadQisasProgress(activeLearner);
      if (!cancelled) {
        setProgress(getStoryProgress(payload, storyId, language));
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [activeLearner, language, storyId]);

  const update = useCallback(
    async (
      fn: (
        learner: NonNullable<typeof activeLearner>,
      ) => Promise<QisasStoryProgress>,
    ) => {
      const learner = learnerRef.current;
      if (!learner) {
        return;
      }
      const next = await fn(learner);
      setProgress(next);
    },
    [],
  );

  const markRead = useCallback(() => {
    void update((learner) => markQisasRead(learner, storyId, language));
  }, [language, storyId, update]);

  const markListenComplete = useCallback(() => {
    void update((learner) => markQisasListenComplete(learner, storyId, language));
  }, [language, storyId, update]);

  const recordLearn = useCallback(
    (answered: number, correct: number) => {
      void update((learner) =>
        recordQisasLearn(learner, storyId, language, answered, correct),
      );
    },
    [language, storyId, update],
  );

  const markGameComplete = useCallback(() => {
    void update((learner) => markQisasGameComplete(learner, storyId, language));
  }, [language, storyId, update]);

  const setLastMode = useCallback(
    (mode: QisasMode) => {
      void update((learner) => setQisasLastMode(learner, storyId, language, mode));
    },
    [language, storyId, update],
  );

  return {
    progress,
    markRead,
    markListenComplete,
    recordLearn,
    markGameComplete,
    setLastMode,
  };
}
