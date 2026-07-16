import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth';
import { resolveAgeGroup } from '@/features/learning/services/ageGroup';
import type { AudioRepeatCount } from '@/types';

import {
  loadBrowsableSurahs,
  loadBrowseVerses,
  resolveBrowseStart,
} from '../services/browseAccess';
import {
  loadReaderBrowseState,
  loadReaderPreferences,
  saveReaderBrowseState,
  saveReaderPreferences,
} from '../services/readerPreferencesStore';
import type { BrowsableSurah, ReaderPreferences, ReaderVerseViewModel } from '../types';

type UseBrowseReaderArgs = {
  surahParam?: number;
  ayahParam?: number;
};

type UseBrowseReaderResult = {
  surahs: BrowsableSurah[];
  surah: BrowsableSurah | null;
  verses: ReaderVerseViewModel[];
  activeAyahNumber: number;
  preferences: ReaderPreferences | null;
  isLoading: boolean;
  error: string | null;
  setActiveAyahNumber: (ayah: number) => void;
  selectSurah: (surahNumber: number) => Promise<void>;
  setShowTranslation: (value: boolean) => Promise<void>;
  setRepeatCount: (value: AudioRepeatCount) => Promise<void>;
  ageGroup: ReturnType<typeof resolveAgeGroup> | null;
};

export function useBrowseReader({
  surahParam,
  ayahParam,
}: UseBrowseReaderArgs): UseBrowseReaderResult {
  const { activeLearner } = useAuth();
  const [surahs, setSurahs] = useState<BrowsableSurah[]>([]);
  const [surah, setSurah] = useState<BrowsableSurah | null>(null);
  const [verses, setVerses] = useState<ReaderVerseViewModel[]>([]);
  const [activeAyahNumber, setActiveAyahNumberState] = useState(1);
  const [preferences, setPreferences] = useState<ReaderPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persistPosition = useCallback(
    async (surahNumber: number, ayahNumber: number) => {
      if (!activeLearner) {
        return;
      }
      try {
        await saveReaderBrowseState(activeLearner, {
          lastSurahNumber: surahNumber,
          lastAyahNumber: ayahNumber,
        });
      } catch {
        // Non-critical; browsing still works.
      }
    },
    [activeLearner],
  );

  const openSurah = useCallback(
    async (
      learner: NonNullable<typeof activeLearner>,
      prefs: ReaderPreferences,
      surahNumber: number,
      ayahNumber: number,
    ) => {
      const loaded = await loadBrowseVerses(learner, surahNumber, prefs);
      if (!loaded) {
        setError('This surah is not unlocked yet. Keep learning in order.');
        setSurah(null);
        setVerses([]);
        return;
      }
      const ayah = Math.min(Math.max(ayahNumber, 1), loaded.surah.maxBrowsableAyah);
      setSurah(loaded.surah);
      setVerses(loaded.verses);
      setActiveAyahNumberState(ayah);
      setError(null);
      await persistPosition(loaded.surah.number, ayah);
    },
    [persistPosition],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await Promise.resolve();
      if (cancelled || !activeLearner) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const prefs = await loadReaderPreferences(activeLearner);
        const saved = await loadReaderBrowseState(activeLearner);
        const start = await resolveBrowseStart(
          activeLearner,
          surahParam ?? saved.lastSurahNumber,
          ayahParam ?? saved.lastAyahNumber,
        );
        const list = await loadBrowsableSurahs(activeLearner);
        if (cancelled) {
          return;
        }
        setPreferences(prefs);
        setSurahs(list);
        await openSurah(activeLearner, prefs, start.surahNumber, start.ayahNumber);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not open the reader.');
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
  }, [activeLearner, ayahParam, openSurah, surahParam]);

  const setActiveAyahNumber = useCallback(
    (ayah: number) => {
      setActiveAyahNumberState(ayah);
      if (surah && activeLearner) {
        void persistPosition(surah.number, ayah);
      }
    },
    [activeLearner, persistPosition, surah],
  );

  const selectSurah = useCallback(
    async (surahNumber: number) => {
      if (!activeLearner || !preferences) {
        return;
      }
      setIsLoading(true);
      try {
        await openSurah(activeLearner, preferences, surahNumber, 1);
      } finally {
        setIsLoading(false);
      }
    },
    [activeLearner, openSurah, preferences],
  );

  const persistPrefs = useCallback(
    async (next: ReaderPreferences) => {
      if (!activeLearner) {
        return;
      }
      setPreferences(next);
      await saveReaderPreferences(activeLearner, next);
    },
    [activeLearner],
  );

  const setShowTranslation = useCallback(
    async (value: boolean) => {
      if (!preferences) {
        return;
      }
      await persistPrefs({ ...preferences, showTranslation: value });
    },
    [persistPrefs, preferences],
  );

  const setRepeatCount = useCallback(
    async (value: AudioRepeatCount) => {
      if (!preferences) {
        return;
      }
      await persistPrefs({ ...preferences, repeatCount: value });
    },
    [persistPrefs, preferences],
  );

  return {
    surahs,
    surah,
    verses,
    activeAyahNumber,
    preferences,
    isLoading,
    error,
    setActiveAyahNumber,
    selectSurah,
    setShowTranslation,
    setRepeatCount,
    ageGroup: activeLearner ? resolveAgeGroup(activeLearner) : null,
  };
}
