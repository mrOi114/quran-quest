import type { ActiveLearner } from '@/features/auth';
import { resolveVerseAudio } from '@/features/learning/content';
import type { LessonSessionVerse } from '@/features/learning/types';

import { DEFAULT_RECITER_KEY } from '../constants';
import type { ReaderPreferences, ReaderVerseViewModel } from '../types';
import { resolveVerseExplanation, resolveVerseMeaning } from './translationResolver';

export function lessonVerseToReaderViewModel(
  verse: LessonSessionVerse,
  learner: ActiveLearner,
  prefs: ReaderPreferences,
): ReaderVerseViewModel {
  const audio = resolveVerseAudio(
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
    audioUrl: audio?.audioUrl ?? verse.audioUrl,
    reciterKey: audio?.reciterKey ?? DEFAULT_RECITER_KEY,
    isLearned:
      verse.progress.status === 'learned' || verse.progress.status === 'mastered',
  };
}
