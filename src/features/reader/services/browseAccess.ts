import type { ActiveLearner } from '@/features/auth';
import {
  getSurah,
  getVersesForSurah,
  listJuz30Surahs,
  resolveVerseAudio,
} from '@/features/learning/content';
import {
  buildLinearLessonPath,
  isLessonUnlocked,
  planSurahLessons,
} from '@/features/learning/services/lessonPlanner';
import { loadLearningSnapshot } from '@/features/learning/services/progressService';
import { resolveAgeGroup } from '@/features/learning/services/ageGroup';
import type { LearningSnapshot } from '@/features/learning/types';
import { JUZ_30_SURAH_START } from '@/features/learning/constants';

import { DEFAULT_RECITER_KEY } from '../constants';
import type { BrowsableSurah, ReaderPreferences, ReaderVerseViewModel } from '../types';
import { resolveVerseExplanation, resolveVerseMeaning } from './translationResolver';

function isVerseLearned(snapshot: LearningSnapshot, verseId: string): boolean {
  const status = snapshot.verseProgress[verseId]?.status;
  return status === 'learned' || status === 'mastered';
}

/** Max ayah number the learner may browse in a surah (unlocked/completed lessons). */
export function getMaxBrowsableAyah(
  surahNumber: number,
  snapshot: LearningSnapshot,
  ageGroup: ReturnType<typeof resolveAgeGroup>,
): number {
  const lessons = planSurahLessons(surahNumber, ageGroup);
  let maxAyah = 0;
  for (const lesson of lessons) {
    if (isLessonUnlocked(lesson, snapshot, ageGroup)) {
      maxAyah = Math.max(maxAyah, lesson.endAyah);
    }
  }
  return maxAyah;
}

export function isSurahBrowsable(
  surahNumber: number,
  snapshot: LearningSnapshot,
  ageGroup: ReturnType<typeof resolveAgeGroup>,
): boolean {
  return getMaxBrowsableAyah(surahNumber, snapshot, ageGroup) > 0;
}

export function listBrowsableSurahs(
  snapshot: LearningSnapshot,
  ageGroup: ReturnType<typeof resolveAgeGroup>,
): BrowsableSurah[] {
  // Progress-gated browse stays Juz 30 scoped; full mushaf uses FullQuranReader.
  return listJuz30Surahs()
    .map((surah) => {
      const maxBrowsableAyah = getMaxBrowsableAyah(surah.number, snapshot, ageGroup);
      if (maxBrowsableAyah <= 0) {
        return null;
      }
      return {
        number: surah.number,
        nameArabic: surah.nameArabic,
        nameLatin: surah.nameLatin,
        ayahCount: surah.ayahCount,
        maxBrowsableAyah,
        isFullyUnlocked: maxBrowsableAyah >= surah.ayahCount,
      } satisfies BrowsableSurah;
    })
    .filter((item): item is BrowsableSurah => item !== null);
}

export function toReaderVerseViewModel(
  verse: {
    id: string;
    surahNumber: number;
    ayahNumber: number;
    textUthmani: string;
  },
  snapshot: LearningSnapshot,
  learner: ActiveLearner,
  prefs: ReaderPreferences,
): ReaderVerseViewModel {
  const audio = resolveVerseAudio(
    verse.id,
    prefs.preferredReciterKey || DEFAULT_RECITER_KEY,
  );
  const meaning = resolveVerseMeaning(
    verse.id,
    learner.preferred_language,
    prefs.preferredTranslationId,
  );
  const explanation = resolveVerseExplanation(verse.id, learner.preferred_language);

  return {
    id: verse.id,
    surahNumber: verse.surahNumber,
    ayahNumber: verse.ayahNumber,
    textUthmani: verse.textUthmani,
    meaning,
    explanation,
    audioUrl: audio?.audioUrl ?? null,
    reciterKey: audio?.reciterKey ?? DEFAULT_RECITER_KEY,
    isLearned: isVerseLearned(snapshot, verse.id),
  };
}

export async function loadBrowsableSurahs(
  learner: ActiveLearner,
): Promise<BrowsableSurah[]> {
  const ageGroup = resolveAgeGroup(learner);
  const snapshot = await loadLearningSnapshot(learner);
  return listBrowsableSurahs(snapshot, ageGroup);
}

export async function loadBrowseVerses(
  learner: ActiveLearner,
  surahNumber: number,
  prefs: ReaderPreferences,
): Promise<{ surah: BrowsableSurah; verses: ReaderVerseViewModel[] } | null> {
  const ageGroup = resolveAgeGroup(learner);
  const snapshot = await loadLearningSnapshot(learner);
  const maxAyah = getMaxBrowsableAyah(surahNumber, snapshot, ageGroup);
  if (maxAyah <= 0) {
    return null;
  }

  const meta = getSurah(surahNumber);
  if (!meta) {
    return null;
  }

  const surah: BrowsableSurah = {
    number: meta.number,
    nameArabic: meta.nameArabic,
    nameLatin: meta.nameLatin,
    ayahCount: meta.ayahCount,
    maxBrowsableAyah: maxAyah,
    isFullyUnlocked: maxAyah >= meta.ayahCount,
  };

  const verses = getVersesForSurah(surahNumber)
    .filter((verse) => verse.ayahNumber <= maxAyah)
    .map((verse) => toReaderVerseViewModel(verse, snapshot, learner, prefs));

  return { surah, verses };
}

/** Resolve a safe starting surah for browse (unlocked, else An-Naba if unlocked). */
export async function resolveBrowseStart(
  learner: ActiveLearner,
  requestedSurah?: number,
  requestedAyah?: number,
): Promise<{ surahNumber: number; ayahNumber: number }> {
  const ageGroup = resolveAgeGroup(learner);
  const snapshot = await loadLearningSnapshot(learner);
  const browsable = listBrowsableSurahs(snapshot, ageGroup);

  if (browsable.length === 0) {
    // First lesson is always unlocked at path start.
    return { surahNumber: JUZ_30_SURAH_START, ayahNumber: 1 };
  }

  if (requestedSurah && isSurahBrowsable(requestedSurah, snapshot, ageGroup)) {
    const maxAyah = getMaxBrowsableAyah(requestedSurah, snapshot, ageGroup);
    const ayah = Math.min(Math.max(requestedAyah ?? 1, 1), maxAyah);
    return { surahNumber: requestedSurah, ayahNumber: ayah };
  }

  const path = buildLinearLessonPath(ageGroup);
  const current = path.find(
    (lesson) => lesson.lessonKey === snapshot.state.currentLessonKey,
  );
  if (current && isSurahBrowsable(current.surahNumber, snapshot, ageGroup)) {
    return {
      surahNumber: current.surahNumber,
      ayahNumber: current.startAyah,
    };
  }

  const first = browsable[0];
  return {
    surahNumber: first?.number ?? JUZ_30_SURAH_START,
    ayahNumber: 1,
  };
}
