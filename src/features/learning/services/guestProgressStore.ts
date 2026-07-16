import { getGuestProgress, saveGuestProgress, type GuestProgress } from '@/features/auth';
import type { AgeGroupId } from '@/features/auth';

import { guestLearningPayloadSchema } from '../schemas';
import type { GuestLearningPayloadV1, LearningSnapshot } from '../types';
import { countCompletedSurahs, resolveCurrentLessonPlan } from './lessonPlanner';
import {
  createEmptySnapshot,
  guestPayloadToSnapshot,
  snapshotToGuestPayload,
} from './progressHelpers';

function parsePayload(
  learningPayload: Record<string, unknown>,
): GuestLearningPayloadV1 | null {
  const parsed = guestLearningPayloadSchema.safeParse(learningPayload);
  if (!parsed.success) {
    return null;
  }

  const surahProgress: GuestLearningPayloadV1['surahProgress'] = {};
  for (const [key, value] of Object.entries(parsed.data.surahProgress)) {
    surahProgress[Number(key)] = value;
  }

  return {
    version: parsed.data.version,
    state: parsed.data.state,
    verseProgress: parsed.data.verseProgress,
    lessonCompletions: parsed.data.lessonCompletions,
    surahProgress,
  };
}

export async function loadGuestLearningSnapshot(
  ageGroup: AgeGroupId,
): Promise<LearningSnapshot> {
  const progress = await getGuestProgress();
  const payload = parsePayload(progress.learningPayload);
  return guestPayloadToSnapshot(payload, ageGroup);
}

export async function saveGuestLearningSnapshot(
  snapshot: LearningSnapshot,
  ageGroup: AgeGroupId,
): Promise<GuestProgress> {
  const current = await getGuestProgress();
  const currentLesson = resolveCurrentLessonPlan(snapshot, ageGroup);
  const nextSnapshot: LearningSnapshot = {
    ...snapshot,
    state: {
      ...snapshot.state,
      currentSurahNumber: currentLesson.surahNumber,
      currentAyahNumber: currentLesson.startAyah,
      currentLessonKey: currentLesson.lessonKey,
      ageGroupSnapshot: ageGroup,
      updatedAt: new Date().toISOString(),
    },
  };

  const payload = snapshotToGuestPayload(nextSnapshot);
  const learningPayload: Record<string, unknown> = {
    version: payload.version,
    state: payload.state,
    verseProgress: payload.verseProgress,
    lessonCompletions: payload.lessonCompletions,
    surahProgress: Object.fromEntries(
      Object.entries(payload.surahProgress).map(([key, value]) => [String(key), value]),
    ),
  };
  const next: GuestProgress = {
    ...current,
    juz30SurahsCompleted: countCompletedSurahs(nextSnapshot),
    learningPayload,
    updatedAt: new Date().toISOString(),
  };
  await saveGuestProgress(next);
  return next;
}

export async function ensureGuestLearningSnapshot(
  ageGroup: AgeGroupId,
): Promise<LearningSnapshot> {
  const existing = await loadGuestLearningSnapshot(ageGroup);
  if (existing.hasStarted || existing.state.currentLessonKey) {
    return existing;
  }
  const empty = createEmptySnapshot(ageGroup);
  await saveGuestLearningSnapshot(empty, ageGroup);
  return empty;
}
