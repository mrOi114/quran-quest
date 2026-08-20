import type { ActiveLearner } from '@/features/auth';
import { isChildFamilyLearner, isGuestLearner } from '@/features/auth';
import type { Json } from '@/types';

import { t } from '@/i18n';

import type {
  LearningSnapshot,
  LessonCompletionRecord,
  LessonMasteryResult,
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
  getRequiredPriorLessons,
  isLessonCompleted,
  isLessonUnlocked,
  resolveCurrentLessonPlan,
  toLessonSummary,
} from './lessonPlanner';
import { didPassLessonTest, lessonTestPercent } from './lessonMastery';
import {
  emptyVerseProgress,
  isLearnedStatus,
  recomputeSurahProgress,
  backfillImpliedCompletions,
} from './progressHelpers';

function usesCloudProgress(learner: ActiveLearner): boolean {
  return !isGuestLearner(learner) && !isChildFamilyLearner(learner);
}

export async function loadLearningSnapshot(
  learner: ActiveLearner,
): Promise<LearningSnapshot> {
  const ageGroup = resolveAgeGroup(learner);
  let snapshot: LearningSnapshot;
  if (isGuestLearner(learner)) {
    snapshot = await ensureGuestLearningSnapshot(ageGroup);
  } else if (isChildFamilyLearner(learner)) {
    snapshot = await loadChildFamilyLearningSnapshot(learner.id, ageGroup);
  } else {
    snapshot = await loadCloudLearningSnapshot(learner.id, ageGroup);
  }
  const migrated = backfillImpliedCompletions(snapshot, ageGroup);
  if (migrated.lessonCompletions.length !== snapshot.lessonCompletions.length) {
    await persistSnapshot(learner, migrated);
  }
  return migrated;
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

  if (!unlocked) {
    const latest = snapshot;
    const prior = getRequiredPriorLessons(lesson, latest, ageGroup);
    const verses = getVersesInRange(
      lesson.surahNumber,
      lesson.startAyah,
      lesson.endAyah,
    ).map((verse) => ({
      ...verse,
      progress: latest.verseProgress[verse.id] ?? emptyVerseProgress(verse.id),
    }));
    return {
      lesson,
      summary: toLessonSummary(lesson, latest, ageGroup),
      verses,
      mode: 'locked',
      canCompleteLesson: false,
      nextLessonKey: getNextLessonPlan(lesson, ageGroup)?.lessonKey ?? null,
      unlockPracticeLessonKey: prior[0]?.lessonKey ?? current.lessonKey,
    };
  }

  const complete = isLessonCompleted(lesson, snapshot);
  const mode: LessonSession['mode'] = complete ? 'review' : 'learn';

  if (!snapshot.hasStarted || snapshot.state.currentLessonKey !== lesson.lessonKey) {
    const nextState = {
      ...snapshot.state,
      currentSurahNumber: lesson.surahNumber,
      currentAyahNumber: lesson.startAyah,
      currentLessonKey: lesson.lessonKey,
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
        lessonKey: lesson.lessonKey,
        eventType: 'lesson_started',
      });
    }
  }

  const latest = await loadLearningSnapshot(learner);
  const verses = getVersesInRange(
    lesson.surahNumber,
    lesson.startAyah,
    lesson.endAyah,
  ).map((verse) => ({
    ...verse,
    progress: latest.verseProgress[verse.id] ?? emptyVerseProgress(verse.id),
  }));

  const canCompleteLesson =
    mode === 'learn' &&
    lesson.verseIds.every((id) => isLearnedStatus(latest.verseProgress[id]?.status));

  const nextLesson = getNextLessonPlan(lesson, ageGroup);

  return {
    lesson,
    summary: toLessonSummary(lesson, latest, ageGroup),
    verses,
    mode,
    canCompleteLesson,
    nextLessonKey: nextLesson?.lessonKey ?? null,
    unlockPracticeLessonKey: null,
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

function applyLessonCompletion(
  snapshot: LearningSnapshot,
  lesson: LessonPlan,
  ageGroup: ReturnType<typeof resolveAgeGroup>,
  now: string,
  options: {
    verseStatus: 'learned' | 'mastered' | 'unchanged';
    testScorePercent?: number;
    currentLesson: LessonPlan;
  },
): LearningSnapshot {
  const verseProgress = { ...snapshot.verseProgress };
  if (options.verseStatus !== 'unchanged') {
    for (const verseId of lesson.verseIds) {
      const existing = verseProgress[verseId] ?? emptyVerseProgress(verseId);
      verseProgress[verseId] = {
        ...existing,
        status: options.verseStatus,
        learnedAt: existing.learnedAt ?? now,
        lastPracticedAt: now,
        practiceCount: existing.practiceCount + 1,
        memoryScore: options.testScorePercent ?? existing.memoryScore,
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
    testScorePercent: options.testScorePercent,
  };

  const lessonCompletions = [
    ...snapshot.lessonCompletions.filter((item) => item.lessonKey !== lesson.lessonKey),
    completion,
  ];

  const touchedSurahs = new Set<number>([
    ...Object.keys(snapshot.surahProgress).map(Number),
    lesson.surahNumber,
  ]);
  const surahProgress = { ...snapshot.surahProgress };
  for (const surahNumber of touchedSurahs) {
    surahProgress[surahNumber] = recomputeSurahProgress(surahNumber, verseProgress);
  }

  return {
    state: {
      currentSurahNumber: options.currentLesson.surahNumber,
      currentAyahNumber: options.currentLesson.startAyah,
      currentLessonKey: options.currentLesson.lessonKey,
      ageGroupSnapshot: ageGroup,
      updatedAt: now,
    },
    verseProgress,
    surahProgress,
    lessonCompletions,
    hasStarted: true,
  };
}

async function persistCompletedLessons(
  learner: ActiveLearner,
  snapshot: LearningSnapshot,
  completed: LessonPlan[],
  eventPayload?: Json,
): Promise<void> {
  await persistSnapshot(learner, snapshot);
  if (!usesCloudProgress(learner)) {
    return;
  }
  for (const lesson of completed) {
    for (const verseId of lesson.verseIds) {
      const record = snapshot.verseProgress[verseId];
      if (record) {
        await upsertCloudVerseProgress(learner.id, record);
      }
    }
    const completion = snapshot.lessonCompletions.find(
      (item) => item.lessonKey === lesson.lessonKey,
    );
    if (completion) {
      await upsertCloudLessonCompletion(learner.id, completion);
    }
    await insertCloudLearningEvent({
      learnerId: learner.id,
      lessonKey: lesson.lessonKey,
      eventType: 'lesson_completed',
      payload: eventPayload,
    });
  }
  await saveCloudLearningState(learner.id, snapshot.state);
}

export async function completeLesson(
  learner: ActiveLearner,
  lesson: LessonPlan,
  options?: { testScorePercent?: number },
): Promise<{ session: LessonSession; nextLessonKey: string | null }> {
  const ageGroup = resolveAgeGroup(learner);
  const snapshot = await loadLearningSnapshot(learner);
  const now = new Date().toISOString();
  const nextLesson = getNextLessonPlan(lesson, ageGroup);
  const nextStateLesson = nextLesson ?? lesson;

  const nextSnapshot = applyLessonCompletion(snapshot, lesson, ageGroup, now, {
    verseStatus: 'learned',
    testScorePercent: options?.testScorePercent,
    currentLesson: nextStateLesson,
  });

  await persistCompletedLessons(learner, nextSnapshot, [lesson], {
    kind: 'lesson_mastery',
    percent: options?.testScorePercent ?? null,
    passed: true,
  });

  const session = await openLessonSession(
    learner,
    nextLesson?.lessonKey ?? lesson.lessonKey,
  );
  return { session, nextLessonKey: nextLesson?.lessonKey ?? null };
}

async function recordPracticeAttempt(
  learner: ActiveLearner,
  lesson: LessonPlan,
  percent: number,
): Promise<void> {
  const snapshot = await loadLearningSnapshot(learner);
  const now = new Date().toISOString();
  const verseProgress = { ...snapshot.verseProgress };
  for (const verseId of lesson.verseIds) {
    const existing = verseProgress[verseId] ?? emptyVerseProgress(verseId);
    verseProgress[verseId] = {
      ...existing,
      lastPracticedAt: now,
      practiceCount: existing.practiceCount + 1,
      memoryScore: existing.memoryScore ?? percent,
    };
  }
  const nextSnapshot: LearningSnapshot = {
    ...snapshot,
    verseProgress,
    hasStarted: true,
    state: {
      ...snapshot.state,
      updatedAt: now,
    },
  };
  await persistSnapshot(learner, nextSnapshot);
  if (usesCloudProgress(learner)) {
    for (const verseId of lesson.verseIds) {
      const record = verseProgress[verseId];
      if (record) {
        await upsertCloudVerseProgress(learner.id, record);
      }
    }
    await insertCloudLearningEvent({
      learnerId: learner.id,
      lessonKey: lesson.lessonKey,
      eventType: 'verse_reviewed',
      payload: { kind: 'lesson_test', percent, passed: false },
    });
  }
}

export async function submitLessonMasteryTest(
  learner: ActiveLearner,
  lesson: LessonPlan,
  correctCount: number,
  totalCount: number,
): Promise<LessonMasteryResult> {
  const percent = lessonTestPercent(correctCount, totalCount);
  const passed = didPassLessonTest(correctCount, totalCount);
  const nextLesson = getNextLessonPlan(lesson, resolveAgeGroup(learner));

  if (!passed) {
    await recordPracticeAttempt(learner, lesson, percent);
    const session = await openLessonSession(learner, lesson.lessonKey);
    return {
      passed: false,
      percent,
      correctCount,
      totalCount,
      nextLessonKey: session.nextLessonKey,
      practiceLessonKey: lesson.lessonKey,
      message:
        percent >= 40
          ? t('test.notYet', learner.preferred_language)
          : t('test.keepGoing', learner.preferred_language),
    };
  }

  const { nextLessonKey } = await completeLesson(learner, lesson, {
    testScorePercent: percent,
  });
  return {
    passed: true,
    percent,
    correctCount,
    totalCount,
    nextLessonKey,
    practiceLessonKey: null,
    message: nextLesson
      ? percent >= 90
        ? t('test.mastered', learner.preferred_language)
        : t('test.nextPart', learner.preferred_language)
      : t('test.quranComplete', learner.preferred_language),
  };
}

export async function submitLessonUnlockCheck(
  learner: ActiveLearner,
  lesson: LessonPlan,
  correctCount: number,
  totalCount: number,
): Promise<LessonMasteryResult> {
  const ageGroup = resolveAgeGroup(learner);
  const snapshot = await loadLearningSnapshot(learner);
  const prior = getRequiredPriorLessons(lesson, snapshot, ageGroup);
  const percent = lessonTestPercent(correctCount, totalCount);
  const passed = didPassLessonTest(correctCount, totalCount);
  const practiceLessonKey = prior[0]?.lessonKey ?? snapshot.state.currentLessonKey;

  if (!passed) {
    if (prior[0]) {
      await recordPracticeAttempt(learner, prior[0], percent);
    }
    return {
      passed: false,
      percent,
      correctCount,
      totalCount,
      nextLessonKey: null,
      practiceLessonKey,
      message: t('test.unlockFail', learner.preferred_language),
    };
  }

  const now = new Date().toISOString();
  let nextSnapshot = snapshot;
  for (const priorLesson of prior) {
    nextSnapshot = applyLessonCompletion(nextSnapshot, priorLesson, ageGroup, now, {
      verseStatus: 'learned',
      testScorePercent: percent,
      currentLesson: lesson,
    });
  }
  nextSnapshot = {
    ...nextSnapshot,
    state: {
      currentSurahNumber: lesson.surahNumber,
      currentAyahNumber: lesson.startAyah,
      currentLessonKey: lesson.lessonKey,
      ageGroupSnapshot: ageGroup,
      updatedAt: now,
    },
    hasStarted: true,
  };

  await persistCompletedLessons(learner, nextSnapshot, prior, {
    kind: 'knowledge_check',
    percent,
    passed: true,
    unlockedLessonKey: lesson.lessonKey,
  });

  return {
    passed: true,
    percent,
    correctCount,
    totalCount,
    nextLessonKey: lesson.lessonKey,
    practiceLessonKey: null,
    message: t('test.unlockPass', learner.preferred_language),
  };
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
