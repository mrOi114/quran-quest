import type { ActiveLearner } from '@/features/auth';
import { loadLearningSnapshot } from '@/features/learning/services/progressService';

import {
  getJuzForVerse,
  getMushafSurah,
  getMushafVersesForSurah,
  listJuz,
  listMushafSurahs,
  resolveMushafVerseAudio,
  searchMushafSurahs,
} from '../content';
import { DEFAULT_RECITER_KEY } from '../constants';
import type {
  BrowsableSurah,
  ReaderPreferences,
  ReaderVerseViewModel,
} from '../types';
import { resolveVerseExplanation, resolveVerseMeaning } from './translationResolver';

function isVerseLearned(
  verseProgress: Record<string, { status?: string } | undefined>,
  verseId: string,
): boolean {
  const status = verseProgress[verseId]?.status;
  return status === 'learned' || status === 'mastered';
}

export function toMushafSurahView(surahNumber: number): BrowsableSurah | null {
  const meta = getMushafSurah(surahNumber);
  if (!meta) {
    return null;
  }
  return {
    number: meta.number,
    nameArabic: meta.nameArabic,
    nameLatin: meta.nameLatin,
    ayahCount: meta.ayahCount,
    maxBrowsableAyah: meta.ayahCount,
    isFullyUnlocked: true,
  };
}

export function listAllMushafSurahs(): BrowsableSurah[] {
  return listMushafSurahs().map((surah) => ({
    number: surah.number,
    nameArabic: surah.nameArabic,
    nameLatin: surah.nameLatin,
    ayahCount: surah.ayahCount,
    maxBrowsableAyah: surah.ayahCount,
    isFullyUnlocked: true,
  }));
}

export function searchBrowsableSurahs(query: string): BrowsableSurah[] {
  return searchMushafSurahs(query).map((surah) => ({
    number: surah.number,
    nameArabic: surah.nameArabic,
    nameLatin: surah.nameLatin,
    ayahCount: surah.ayahCount,
    maxBrowsableAyah: surah.ayahCount,
    isFullyUnlocked: true,
  }));
}

export function listJuzOptions() {
  return listJuz();
}

export async function loadMushafSurahVerses(
  learner: ActiveLearner,
  surahNumber: number,
  prefs: ReaderPreferences,
): Promise<{ surah: BrowsableSurah; verses: ReaderVerseViewModel[] } | null> {
  const surah = toMushafSurahView(surahNumber);
  if (!surah) {
    return null;
  }

  let verseProgress: Record<string, { status?: string } | undefined> = {};
  try {
    const snapshot = await loadLearningSnapshot(learner);
    verseProgress = snapshot.verseProgress;
  } catch {
    // Reader works without progress; learned markers are optional.
  }

  const verses = getMushafVersesForSurah(surahNumber).map((verse) => {
    const audio = resolveMushafVerseAudio(
      verse.id,
      prefs.preferredReciterKey || DEFAULT_RECITER_KEY,
    );
    return {
      id: verse.id,
      surahNumber: verse.surahNumber,
      ayahNumber: verse.ayahNumber,
      textUthmani: verse.textUthmani,
      meaning: resolveVerseMeaning(
        verse.id,
        learner.preferred_language,
        prefs.preferredTranslationId,
      ),
      explanation: resolveVerseExplanation(verse.id, learner.preferred_language),
      audioUrl: audio?.audioUrl ?? null,
      reciterKey: audio?.reciterKey ?? DEFAULT_RECITER_KEY,
      isLearned: isVerseLearned(verseProgress, verse.id),
    } satisfies ReaderVerseViewModel;
  });

  return { surah, verses };
}

export function resolveMushafStart(
  requestedSurah?: number,
  requestedAyah?: number,
  savedSurah?: number,
  savedAyah?: number,
): { surahNumber: number; ayahNumber: number; juzNumber: number } {
  const surahNumber = requestedSurah ?? savedSurah ?? 1;
  const clampedSurah = Math.min(Math.max(surahNumber, 1), 114);
  const meta = getMushafSurah(clampedSurah);
  const maxAyah = meta?.ayahCount ?? 1;
  const ayahNumber = Math.min(Math.max(requestedAyah ?? savedAyah ?? 1, 1), maxAyah);
  const juz = getJuzForVerse(clampedSurah, ayahNumber);
  return {
    surahNumber: clampedSurah,
    ayahNumber,
    juzNumber: juz?.number ?? 1,
  };
}
