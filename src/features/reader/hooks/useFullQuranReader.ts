import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/features/auth';
import { resolveAgeGroup } from '@/features/learning/services/ageGroup';
import type { AudioRepeatCount } from '@/types';

import { getJuzForVerse, getMushafSurah, listSurahsInJuz } from '../content';
import {
  listAllMushafSurahs,
  listJuzOptions,
  loadMushafSurahVerses,
  resolveMushafStart,
  searchBrowsableSurahs,
} from '../services/mushafAccess';
import {
  loadReaderBrowseState,
  loadReaderPreferences,
  saveReaderBrowseState,
  saveReaderPreferences,
} from '../services/readerPreferencesStore';
import type { BrowsableSurah, ReaderPreferences, ReaderVerseViewModel } from '../types';

export type ReaderListenMode = 'read' | 'listen';

type UseFullQuranReaderArgs = {
  surahParam?: number;
  ayahParam?: number;
};

type UseFullQuranReaderResult = {
  surahs: BrowsableSurah[];
  filteredSurahs: BrowsableSurah[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  juzNumber: number;
  juzOptions: ReturnType<typeof listJuzOptions>;
  surah: BrowsableSurah | null;
  verses: ReaderVerseViewModel[];
  activeAyahNumber: number;
  preferences: ReaderPreferences | null;
  listenMode: ReaderListenMode;
  audioEnabled: boolean;
  autoPlayPending: boolean;
  isLoading: boolean;
  error: string | null;
  setActiveAyahNumber: (ayah: number, options?: { autoPlay?: boolean }) => void;
  selectSurah: (surahNumber: number, ayahNumber?: number) => Promise<void>;
  selectJuz: (juzNumber: number) => Promise<void>;
  goToPreviousAyah: (options?: { autoPlay?: boolean }) => void;
  goToNextAyah: (options?: { autoPlay?: boolean }) => void;
  clearAutoPlayPending: () => void;
  setListenMode: (mode: ReaderListenMode) => Promise<void>;
  setAudioEnabled: (value: boolean) => void;
  setShowTranslation: (value: boolean) => Promise<void>;
  setRepeatCount: (value: AudioRepeatCount) => Promise<void>;
  handleVersePlaybackComplete: () => void;
  ageGroup: ReturnType<typeof resolveAgeGroup> | null;
};

export function useFullQuranReader({
  surahParam,
  ayahParam,
}: UseFullQuranReaderArgs): UseFullQuranReaderResult {
  const { activeLearner } = useAuth();
  const [surahs] = useState<BrowsableSurah[]>(() => listAllMushafSurahs());
  const [searchQuery, setSearchQuery] = useState('');
  const [juzNumber, setJuzNumber] = useState(1);
  const [surah, setSurah] = useState<BrowsableSurah | null>(null);
  const [verses, setVerses] = useState<ReaderVerseViewModel[]>([]);
  const [activeAyahNumber, setActiveAyahNumberState] = useState(1);
  const [preferences, setPreferences] = useState<ReaderPreferences | null>(null);
  const [listenMode, setListenModeState] = useState<ReaderListenMode>('read');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [autoPlayPending, setAutoPlayPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const juzOptions = useMemo(() => listJuzOptions(), []);

  const filteredSurahs = useMemo(() => {
    if (searchQuery.trim()) {
      return searchBrowsableSurahs(searchQuery);
    }
    return listSurahsInJuz(juzNumber).map((surah) => ({
      number: surah.number,
      nameArabic: surah.nameArabic,
      nameLatin: surah.nameLatin,
      ayahCount: surah.ayahCount,
      maxBrowsableAyah: surah.ayahCount,
      isFullyUnlocked: true,
    }));
  }, [juzNumber, searchQuery]);

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
        // Non-critical; reading still works.
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
      options?: { autoPlay?: boolean },
    ) => {
      const loaded = await loadMushafSurahVerses(learner, surahNumber, prefs);
      if (!loaded) {
        setError('Could not open this surah.');
        setSurah(null);
        setVerses([]);
        return;
      }
      const ayah = Math.min(Math.max(ayahNumber, 1), loaded.surah.ayahCount);
      const juz = getJuzForVerse(loaded.surah.number, ayah);
      setSurah(loaded.surah);
      setVerses(loaded.verses);
      setActiveAyahNumberState(ayah);
      setJuzNumber(juz?.number ?? 1);
      setAutoPlayPending(Boolean(options?.autoPlay));
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
        const start = resolveMushafStart(
          surahParam,
          ayahParam,
          saved.lastSurahNumber,
          saved.lastAyahNumber,
        );
        if (cancelled) {
          return;
        }
        setPreferences(prefs);
        setListenModeState(prefs.futureSettings.autoPlayNextVerse ? 'listen' : 'read');
        setJuzNumber(start.juzNumber);
        await openSurah(activeLearner, prefs, start.surahNumber, start.ayahNumber);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not open the Qur’an reader.');
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
    (ayah: number, options?: { autoPlay?: boolean }) => {
      const max = surah?.ayahCount ?? 1;
      const next = Math.min(Math.max(ayah, 1), max);
      setActiveAyahNumberState(next);
      setAutoPlayPending(Boolean(options?.autoPlay));
      if (surah && activeLearner) {
        const juz = getJuzForVerse(surah.number, next);
        if (juz) {
          setJuzNumber(juz.number);
        }
        void persistPosition(surah.number, next);
      }
    },
    [activeLearner, persistPosition, surah],
  );

  const selectSurah = useCallback(
    async (surahNumber: number, ayahNumber = 1) => {
      if (!activeLearner || !preferences) {
        return;
      }
      setIsLoading(true);
      try {
        await openSurah(activeLearner, preferences, surahNumber, ayahNumber);
      } finally {
        setIsLoading(false);
      }
    },
    [activeLearner, openSurah, preferences],
  );

  const selectJuz = useCallback(
    async (nextJuzNumber: number) => {
      const juz = juzOptions.find((item) => item.number === nextJuzNumber);
      if (!juz) {
        return;
      }
      setJuzNumber(nextJuzNumber);
      setSearchQuery('');
      await selectSurah(juz.startSurahNumber, juz.startAyahNumber);
    },
    [juzOptions, selectSurah],
  );

  const goToPreviousAyah = useCallback(
    (options?: { autoPlay?: boolean }) => {
      if (!surah || !activeLearner || !preferences) {
        return;
      }
      if (activeAyahNumber > 1) {
        setActiveAyahNumber(activeAyahNumber - 1, options);
        return;
      }
      if (surah.number <= 1) {
        return;
      }
      const previous = getMushafSurah(surah.number - 1);
      if (!previous) {
        return;
      }
      void openSurah(
        activeLearner,
        preferences,
        previous.number,
        previous.ayahCount,
        options,
      );
    },
    [
      activeAyahNumber,
      activeLearner,
      openSurah,
      preferences,
      setActiveAyahNumber,
      surah,
    ],
  );

  const goToNextAyah = useCallback(
    (options?: { autoPlay?: boolean }) => {
      if (!surah) {
        return;
      }
      if (activeAyahNumber < surah.ayahCount) {
        setActiveAyahNumber(activeAyahNumber + 1, options);
        return;
      }
      // End of surah — stop (do not auto-cross into next surah).
      setAutoPlayPending(false);
    },
    [activeAyahNumber, setActiveAyahNumber, surah],
  );

  const handleVersePlaybackComplete = useCallback(() => {
    if (listenMode !== 'listen' || !audioEnabled || !surah) {
      setAutoPlayPending(false);
      return;
    }
    if (activeAyahNumber >= surah.ayahCount) {
      setAutoPlayPending(false);
      return;
    }
    setActiveAyahNumber(activeAyahNumber + 1, { autoPlay: true });
  }, [activeAyahNumber, audioEnabled, listenMode, setActiveAyahNumber, surah]);

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

  const setListenMode = useCallback(
    async (mode: ReaderListenMode) => {
      if (!preferences) {
        return;
      }
      setListenModeState(mode);
      if (mode === 'listen' && audioEnabled) {
        setAutoPlayPending(true);
      } else {
        setAutoPlayPending(false);
      }
      await persistPrefs({
        ...preferences,
        futureSettings: {
          ...preferences.futureSettings,
          autoPlayNextVerse: mode === 'listen',
        },
      });
    },
    [audioEnabled, persistPrefs, preferences],
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
    filteredSurahs,
    searchQuery,
    setSearchQuery,
    juzNumber,
    juzOptions,
    surah,
    verses,
    activeAyahNumber,
    preferences,
    listenMode,
    audioEnabled,
    autoPlayPending,
    isLoading,
    error,
    setActiveAyahNumber,
    selectSurah,
    selectJuz,
    goToPreviousAyah,
    goToNextAyah,
    clearAutoPlayPending: () => setAutoPlayPending(false),
    setListenMode,
    setAudioEnabled: (value: boolean) => {
      setAudioEnabled(value);
      if (!value) {
        setAutoPlayPending(false);
      }
    },
    setShowTranslation,
    setRepeatCount,
    handleVersePlaybackComplete,
    ageGroup: activeLearner ? resolveAgeGroup(activeLearner) : null,
  };
}
