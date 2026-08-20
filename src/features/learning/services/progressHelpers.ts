import type { AgeGroupId } from '@/features/auth';

import { getSurah } from '../content';
import type {
  GuestLearningPayloadV1,
  LearnerLearningState,
  LearningSnapshot,
  LessonCompletionRecord,
  SurahProgressRecord,
  VerseLearningStatus,
  VerseProgressRecord,
} from '../types';
import { LEARNING_PAYLOAD_VERSION } from '../constants';
import { getFirstLessonPlan, parseLessonKey, planSurahLessons } from './lessonPlanner';

export function emptyVerseProgress(verseId: string): VerseProgressRecord {
  return {
    verseId,
    status: 'not_started',
    learnedAt: null,
    revisionStatus: 'none',
    memoryScore: null,
    lastPracticedAt: null,
    practiceCount: 0,
  };
}

export function createInitialState(ageGroup: AgeGroupId): LearnerLearningState {
  const first = getFirstLessonPlan(ageGroup);
  return {
    currentSurahNumber: first.surahNumber,
    currentAyahNumber: first.startAyah,
    currentLessonKey: first.lessonKey,
    ageGroupSnapshot: ageGroup,
    updatedAt: new Date().toISOString(),
  };
}

export function createEmptySnapshot(ageGroup: AgeGroupId): LearningSnapshot {
  return {
    state: createInitialState(ageGroup),
    verseProgress: {},
    surahProgress: {},
    lessonCompletions: [],
    hasStarted: false,
  };
}

export function isLearnedStatus(status: VerseLearningStatus | undefined): boolean {
  return status === 'learned' || status === 'mastered';
}

/**
 * Lessons moved past under the old “all verses learned = complete” rule
 * keep their unlock, without auto-passing the lesson the child is on now.
 */
export function backfillImpliedCompletions(
  snapshot: LearningSnapshot,
  ageGroup: AgeGroupId,
  now: string = new Date().toISOString(),
): LearningSnapshot {
  const parsed = parseLessonKey(snapshot.state.currentLessonKey);
  if (!parsed) {
    return snapshot;
  }

  const existing = new Set(snapshot.lessonCompletions.map((item) => item.lessonKey));
  const additions: LessonCompletionRecord[] = [];

  for (let surahNumber = 1; surahNumber <= parsed.surahNumber; surahNumber += 1) {
    const plans = planSurahLessons(surahNumber, ageGroup);
    for (const lesson of plans) {
      if (surahNumber === parsed.surahNumber && lesson.lessonIndex >= parsed.lessonIndex) {
        break;
      }
      if (existing.has(lesson.lessonKey)) {
        continue;
      }
      const allLearned = lesson.verseIds.every((verseId) =>
        isLearnedStatus(snapshot.verseProgress[verseId]?.status),
      );
      if (!allLearned) {
        continue;
      }
      additions.push({
        lessonKey: lesson.lessonKey,
        surahNumber: lesson.surahNumber,
        startAyah: lesson.startAyah,
        endAyah: lesson.endAyah,
        ageGroup,
        completedAt: now,
      });
      existing.add(lesson.lessonKey);
    }
  }

  if (additions.length === 0) {
    return snapshot;
  }

  return {
    ...snapshot,
    lessonCompletions: [...snapshot.lessonCompletions, ...additions],
  };
}

export function recomputeSurahProgress(
  surahNumber: number,
  verseProgress: Record<string, VerseProgressRecord>,
): SurahProgressRecord {
  const surah = getSurah(surahNumber);
  const versesTotal = surah?.ayahCount ?? 0;
  let versesLearned = 0;
  for (let ayah = 1; ayah <= versesTotal; ayah += 1) {
    const id = `${surahNumber}:${ayah}`;
    if (isLearnedStatus(verseProgress[id]?.status)) {
      versesLearned += 1;
    }
  }

  let status: SurahProgressRecord['status'] = 'not_started';
  if (versesLearned >= versesTotal && versesTotal > 0) {
    status = 'completed';
  } else if (versesLearned > 0) {
    status = 'in_progress';
  }

  const existingCompletedAt = undefined;
  return {
    surahNumber,
    versesLearned,
    versesTotal,
    status,
    completedAt:
      status === 'completed' ? (existingCompletedAt ?? new Date().toISOString()) : null,
  };
}

export function snapshotToGuestPayload(
  snapshot: LearningSnapshot,
): GuestLearningPayloadV1 {
  const surahProgress: GuestLearningPayloadV1['surahProgress'] = {};
  for (const [key, value] of Object.entries(snapshot.surahProgress)) {
    surahProgress[Number(key)] = value;
  }
  return {
    version: LEARNING_PAYLOAD_VERSION,
    state: snapshot.state,
    verseProgress: snapshot.verseProgress,
    lessonCompletions: snapshot.lessonCompletions,
    surahProgress,
  };
}

export function guestPayloadToSnapshot(
  payload: GuestLearningPayloadV1 | null | undefined,
  ageGroup: AgeGroupId,
): LearningSnapshot {
  if (!payload || payload.version !== LEARNING_PAYLOAD_VERSION) {
    return createEmptySnapshot(ageGroup);
  }

  const surahProgress: Record<number, SurahProgressRecord> = {};
  for (const [key, value] of Object.entries(payload.surahProgress ?? {})) {
    surahProgress[Number(key)] = value;
  }

  return {
    state: payload.state ?? createInitialState(ageGroup),
    verseProgress: payload.verseProgress ?? {},
    surahProgress,
    lessonCompletions: payload.lessonCompletions ?? [],
    hasStarted:
      Boolean(payload.state) ||
      Object.keys(payload.verseProgress ?? {}).length > 0 ||
      (payload.lessonCompletions?.length ?? 0) > 0,
  };
}

export function mergeSnapshots(
  primary: LearningSnapshot,
  secondary: LearningSnapshot,
  ageGroup: AgeGroupId,
): LearningSnapshot {
  const verseProgress: Record<string, VerseProgressRecord> = {
    ...secondary.verseProgress,
  };

  for (const [verseId, record] of Object.entries(primary.verseProgress)) {
    const existing = verseProgress[verseId];
    if (!existing || learnedRank(record.status) >= learnedRank(existing.status)) {
      verseProgress[verseId] = {
        ...record,
        practiceCount: Math.max(record.practiceCount, existing?.practiceCount ?? 0),
      };
    }
  }

  const completionMap = new Map<string, LessonCompletionRecord>();
  for (const item of [...secondary.lessonCompletions, ...primary.lessonCompletions]) {
    completionMap.set(item.lessonKey, item);
  }

  const surahNumbers = new Set<number>([
    ...Object.keys(primary.surahProgress).map(Number),
    ...Object.keys(secondary.surahProgress).map(Number),
  ]);
  for (const record of Object.values(verseProgress)) {
    const surahNumber = Number(record.verseId.split(':')[0]);
    if (Number.isFinite(surahNumber)) {
      surahNumbers.add(surahNumber);
    }
  }

  const surahProgress: Record<number, SurahProgressRecord> = {};
  for (const surahNumber of surahNumbers) {
    const recomputed = recomputeSurahProgress(surahNumber, verseProgress);
    const prior =
      primary.surahProgress[surahNumber] ?? secondary.surahProgress[surahNumber];
    if (recomputed.status === 'completed') {
      recomputed.completedAt =
        prior?.completedAt ?? recomputed.completedAt ?? new Date().toISOString();
    }
    surahProgress[surahNumber] = recomputed;
  }

  const hasStarted = primary.hasStarted || secondary.hasStarted;
  const state =
    pickNewerState(primary.state, secondary.state) ?? createInitialState(ageGroup);

  return {
    state,
    verseProgress,
    surahProgress,
    lessonCompletions: [...completionMap.values()].sort((a, b) =>
      a.completedAt.localeCompare(b.completedAt),
    ),
    hasStarted,
  };
}

function learnedRank(status: VerseLearningStatus): number {
  switch (status) {
    case 'mastered':
      return 3;
    case 'learned':
      return 2;
    case 'in_progress':
      return 1;
    default:
      return 0;
  }
}

function pickNewerState(
  a: LearnerLearningState,
  b: LearnerLearningState,
): LearnerLearningState {
  return a.updatedAt >= b.updatedAt ? a : b;
}
