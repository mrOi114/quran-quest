import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth';
import { useI18n } from '@/i18n';

import {
  markVerseLearned,
  openLessonSession,
  resolveContinueLessonKey,
  completeLesson,
  submitLessonMasteryTest,
  submitLessonUnlockCheck,
} from '../services';
import type { LessonMasteryResult, LessonSession } from '../types';

type UseLessonSessionResult = {
  session: LessonSession | null;
  /** Lesson key this `session` was opened for. Used to avoid URL bounce while navigating. */
  openedForLessonKey: string | undefined;
  isLoading: boolean;
  error: string | null;
  activeVerseIndex: number;
  setActiveVerseIndex: (index: number) => void;
  markCurrentVerseLearned: () => Promise<void>;
  completeCurrentLesson: () => Promise<string | null>;
  submitMasteryTest: (
    correctCount: number,
    totalCount: number,
  ) => Promise<LessonMasteryResult | null>;
  submitUnlockCheck: (
    correctCount: number,
    totalCount: number,
  ) => Promise<LessonMasteryResult | null>;
  reload: () => Promise<void>;
};

export function useLessonSession(lessonKey: string | undefined): UseLessonSessionResult {
  const { activeLearner, refreshGuestProgress } = useAuth();
  const { t } = useI18n();
  const [session, setSession] = useState<LessonSession | null>(null);
  const [openedForLessonKey, setOpenedForLessonKey] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVerseIndex, setActiveVerseIndex] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!activeLearner) {
        if (!cancelled) {
          setSession(null);
          setOpenedForLessonKey(undefined);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const resolvedKey = lessonKey ?? (await resolveContinueLessonKey(activeLearner));
        const next = await openLessonSession(activeLearner, resolvedKey);
        if (!cancelled) {
          setSession(next);
          setOpenedForLessonKey(resolvedKey);
          const firstUnlearned = next.verses.findIndex(
            (verse) =>
              verse.progress.status !== 'learned' && verse.progress.status !== 'mastered',
          );
          setActiveVerseIndex(firstUnlearned >= 0 ? firstUnlearned : 0);
          await refreshGuestProgress();
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t('lesson.openError'));
          setSession(null);
          setOpenedForLessonKey(undefined);
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
  }, [activeLearner, lessonKey, refreshGuestProgress, reloadKey, t]);

  const reload = useCallback(async () => {
    setReloadKey((value) => value + 1);
  }, []);

  const markCurrentVerseLearned = useCallback(async () => {
    if (!activeLearner || !session) {
      return;
    }
    const verse = session.verses[activeVerseIndex];
    if (!verse) {
      return;
    }
    setIsLoading(true);
    try {
      const next = await markVerseLearned(
        activeLearner,
        verse.id,
        session.lesson.lessonKey,
      );
      setSession(next);
      await refreshGuestProgress();
      const nextIndex = Math.min(activeVerseIndex + 1, next.verses.length - 1);
      setActiveVerseIndex(nextIndex);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('lesson.saveError'));
    } finally {
      setIsLoading(false);
    }
  }, [activeLearner, activeVerseIndex, refreshGuestProgress, session, t]);

  const completeCurrentLesson = useCallback(async () => {
    if (!activeLearner || !session) {
      return null;
    }
    setIsLoading(true);
    try {
      const { nextLessonKey, session: nextSession } = await completeLesson(
        activeLearner,
        session.lesson,
      );
      setSession(nextSession);
      setOpenedForLessonKey(nextLessonKey ?? session.lesson.lessonKey);
      await refreshGuestProgress();
      return nextLessonKey;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('lesson.completeError'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [activeLearner, refreshGuestProgress, session, t]);

  const submitMasteryTest = useCallback(
    async (correctCount: number, totalCount: number) => {
      if (!activeLearner || !session) {
        return null;
      }
      setIsLoading(true);
      try {
        const result = await submitLessonMasteryTest(
          activeLearner,
          session.lesson,
          correctCount,
          totalCount,
        );
        await refreshGuestProgress();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : t('lesson.testSaveError'));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [activeLearner, refreshGuestProgress, session, t],
  );

  const submitUnlockCheck = useCallback(
    async (correctCount: number, totalCount: number) => {
      if (!activeLearner || !session) {
        return null;
      }
      setIsLoading(true);
      try {
        const result = await submitLessonUnlockCheck(
          activeLearner,
          session.lesson,
          correctCount,
          totalCount,
        );
        await refreshGuestProgress();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : t('lesson.checkError'));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [activeLearner, refreshGuestProgress, session, t],
  );

  return {
    session,
    openedForLessonKey,
    isLoading,
    error,
    activeVerseIndex,
    setActiveVerseIndex,
    markCurrentVerseLearned,
    completeCurrentLesson,
    submitMasteryTest,
    submitUnlockCheck,
    reload,
  };
}
