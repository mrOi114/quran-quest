import type { ActiveLearner } from '@/features/auth';
import { isChildFamilyLearner, isGuestLearner } from '@/features/auth';

import type {
  LearningSnapshot,
  LessonCompletionRecord,
  LessonPlan,
  LessonSession,
  LessonSummary,
  VerseProgressRecord,
} from '../types';
import { getVersesInRange } from '../content';
import { resolveAgeGroup } from './ageGroup';
import {
  loadChildFamilyLearningSnapshot,
  saveChildFamilyLearningSnapshot,
} from './childFamilyProgressStore';
import {
  insertCloudLearningEvent,
  loadCloudLearningSnapshot,
  replaceCloudSnapshot,
  saveCloudLearningState,
  upsertCloudLessonCompletion,
  upsertCloudVerseProgress,
} from './cloudProgressStore';
import {
  ensureGuestLearningSnapshot,
  saveGuestLearningSnapshot,
} from './guestProgressStore';
import {
  getLessonPlan,
  getNextLessonPlan,
  isLessonCompleted,
  isLessonUnlocked,
  resolveCurrentLessonPlan,
  toLessonSummary,
} from './lessonPlanner';
import {
  emptyVerseProgress,
  isLearnedStatus,
  recomputeSurahProgress,
} from './progressHelpers';

function usesCloudProgress(learner: ActiveLearner): boolean {
  return !isGuestLearner(learner) && !isChildFamilyLearner(learner);
}

export async function loadLearningSnapshot(
  learner: ActiveLearner,
): Promise<LearningSnapshot> {
  const ageGroup = resolveAgeGroup(learner);
  if (isGuestLearner(learner)) {
    return ensureGuestLearningSnapshot(ageGroup);
  }
  if (isChildFamilyLearner(learner)) {
    return loadChildFamilyLearningSnapshot(learner.id, ageGroup);
  }
  return loadCloudLearningSnapshot(learner.id, ageGroup);
}

export async function getCurrentLessonSummary(
  learner: ActiveLearner,
): Promise<LessonSummary> {
  const ageGroup = resolveAgeGroup(learner);
  const snapshot = await loadLearningSnapshot(learner);
  const lesson = resolveCurrentLessonPlan(snapshot, ageGroup);
  return toLessonSummary(lesson, snapshot, ageGroup);
}

export async function openLessonSession(
  learner: ActiveLearner,
  lessonKey: string,
): Promise<LessonSession> {
  const ageGroup = resolveAgeGroup(learner);
  const snapshot = await loadLearningSnapshot(learner);
  const requested = getLessonPlan(lessonKey, ageGroup);
  const current = resolveCurrentLessonPlan(snapshot, ageGroup);

  const lesson = requested ?? current;
  const unlocked = isLessonUnlocked(lesson, snapshot, ageGroup);
  const effective = unlocked ? lesson : current;
  const complete = isLessonCompleted(effective, snapshot);
  const mode: LessonSession['mode'] = complete ? 'review' : 'learn';

  if (!snapshot.hasStarted || snapshot.state.currentLessonKey !== effective.lessonKey) {
    const nextState = {
      ...snapshot.state,
      currentSurahNumber: effective.surahNumber,
      currentAyahNumber: effective.startAyah,
      currentLessonKey: effective.lessonKey,
      ageGroupSnapshot: ageGroup,
      updatedAt: new Date().toISOString(),
    };
    const nextSnapshot: LearningSnapshot = {
      ...snapshot,
      state: nextState,
      hasStarted: true,
    };
    await persistSnapshot(learner, nextSnapshot);
    if (usesCloudProgress(learner)) {
      await insertCloudLearningEvent({
        learnerId: learner.id,
        lessonKey: effective.lessonKey,
        eventType: 'lesson_started',
      });
    }
  }

  const latest = await loadLearningSnapshot(learner);
  const verses = getVersesInRange(
    effective.surahNumber,
    effective.startAyah,
    effective.endAyah,
  ).map((verse) => ({
    ...verse,
    progress: latest.verseProgress[verse.id] ?? emptyVerseProgress(verse.id),
  }));

  const canCompleteLesson =
    mode === 'learn' &&
    effective.verseIds.every((id) => isLearnedStatus(latest.verseProgress[id]?.status));

  const nextLesson = getNextLessonPlan(effective, ageGroup);

  return {
    lesson: effective,
    summary: toLessonSummary(effective, latest, ageGroup),
    verses,
    mode,
    canCompleteLesson,
    nextLessonKey: nextLesson?.lessonKey ?? null,
  };
}

export async function markVerseLearned(
  learner: ActiveLearner,
  verseId: string,
  lessonKey: string,
): Promise<LessonSession> {
  const ageGroup = resolveAgeGroup(learner);
  const snapshot = await loadLearningSnapshot(learner);
  const now = new Date().toISOString();
  const existing = snapshot.verseProgress[verseId] ?? emptyVerseProgress(verseId);

  const record: VerseProgressRecord = {
    ...existing,
    verseId,
    status: 'learned',
    learnedAt: existing.learnedAt ?? now,
    lastPracticedAt: now,
    practiceCount: existing.practiceCount + 1,
  };

  const verseProgress = { ...snapshot.verseProgress, [verseId]: record };
  const surahNumber = Number(verseId.split(':')[0]);
  const surahProgress = {
    ...snapshot.surahProgress,
    [surahNumber]: recomputeSurahProgress(surahNumber, verseProgress),
  };

  const nextSnapshot: LearningSnapshot = {
    ...snapshot,
    verseProgress,
    surahProgress,
    hasStarted: true,
    state: {
      ...snapshot.state,
      currentLessonKey: lessonKey,
      ageGroupSnapshot: ageGroup,
      updatedAt: now,
    },
  };

  await persistSnapshot(learner, nextSnapshot);

  if (usesCloudProgress(learner)) {
    await upsertCloudVerseProgress(learner.id, record);
    await insertCloudLearningEvent({
      learnerId: learner.id,
      verseId,
      lessonKey,
      eventType: 'verse_marked_learned',
    });
  }

  return openLessonSession(learner, lessonKey);
}

export async function completeLesson(
  learner: ActiveLearner,
  lesson: LessonPlan,
): Promise<{ session: LessonSession; nextLessonKey: string | null }> {
  const ageGroup = resolveAgeGroup(learner);
  const snapshot = await loadLearningSnapshot(learner);
  const now = new Date().toISOString();

  // Ensure all verses in the lesson are learned.
  const verseProgress = { ...snapshot.verseProgress };
  for (const verseId of lesson.verseIds) {
    const existing = verseProgress[verseId] ?? emptyVerseProgress(verseId);
    if (!isLearnedStatus(existing.status)) {
      verseProgress[verseId] = {
        ...existing,
        status: 'learned',
        learnedAt: existing.learnedAt ?? now,
        lastPracticedAt: now,
        practiceCount: existing.practiceCount + 1,
      };
    }
  }

  const completion: LessonCompletionRecord = {
    lessonKey: lesson.lessonKey,
    surahNumber: lesson.surahNumber,
    startAyah: lesson.startAyah,
    endAyah: lesson.endAyah,
    ageGroup,
    completedAt: now,
  };

  const lessonCompletions = [
    ...snapshot.lessonCompletions.filter((item) => item.lessonKey !== lesson.lessonKey),
    completion,
  ];

  const surahProgress = {
    ...snapshot.surahProgress,
    [lesson.surahNumber]: recomputeSurahProgress(lesson.surahNumber, verseProgress),
  };

  const nextLesson = getNextLessonPlan(lesson, ageGroup);
  const nextStateLesson = nextLesson ?? lesson;

  const nextSnapshot: LearningSnapshot = {
    state: {
      currentSurahNumber: nextStateLesson.surahNumber,
      currentAyahNumber: nextStateLesson.startAyah,
      currentLessonKey: nextStateLesson.lessonKey,
      ageGroupSnapshot: ageGroup,
      updatedAt: now,
    },
    verseProgress,
    surahProgress,
    lessonCompletions,
    hasStarted: true,
  };

  await persistSnapshot(learner, nextSnapshot);

  if (usesCloudProgress(learner)) {
    for (const verseId of lesson.verseIds) {
      const record = verseProgress[verseId];
      if (record) {
        await upsertCloudVerseProgress(learner.id, record);
      }
    }
    await upsertCloudLessonCompletion(learner.id, completion);
    await saveCloudLearningState(learner.id, nextSnapshot.state);
    await insertCloudLearningEvent({
      learnerId: learner.id,
      lessonKey: lesson.lessonKey,
      eventType: 'lesson_completed',
    });
  }

  const session = await openLessonSession(
    learner,
    nextLesson?.lessonKey ?? lesson.lessonKey,
  );
  return { session, nextLessonKey: nextLesson?.lessonKey ?? null };
}

async function persistSnapshot(
  learner: ActiveLearner,
  snapshot: LearningSnapshot,
): Promise<void> {
  const ageGroup = resolveAgeGroup(learner);
  if (isGuestLearner(learner)) {
    await saveGuestLearningSnapshot(snapshot, ageGroup);
    return;
  }
  if (isChildFamilyLearner(learner)) {
    await saveChildFamilyLearningSnapshot(learner.id, snapshot);
    return;
  }
  await replaceCloudSnapshot(learner.id, snapshot);
}

export async function resolveContinueLessonKey(learner: ActiveLearner): Promise<string> {
  const ageGroup = resolveAgeGroup(learner);
  const snapshot = await loadLearningSnapshot(learner);
  return resolveCurrentLessonPlan(snapshot, ageGroup).lessonKey;
}

export { mergeMigratedGuestProgress } from './guestMigration';
