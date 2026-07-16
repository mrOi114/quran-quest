import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ActiveLearner } from '@/features/auth';

import { guestLearningPayloadSchema } from '../schemas';
import type { LearningSnapshot } from '../types';
import { resolveAgeGroup } from './ageGroup';
import { loadCloudLearningSnapshot, replaceCloudSnapshot } from './cloudProgressStore';
import { resolveCurrentLessonPlan } from './lessonPlanner';
import {
  createEmptySnapshot,
  guestPayloadToSnapshot,
  mergeSnapshots,
} from './progressHelpers';

const MIGRATION_PREFIX = 'qq.migrated_progress.';

/**
 * Consumes Feature 001 staged guest progress into cloud learning tables.
 * Safe to call multiple times — removes the staged key after a successful merge.
 */
export async function mergeMigratedGuestProgress(
  userId: string,
  learner: ActiveLearner,
): Promise<boolean> {
  const key = `${MIGRATION_PREFIX}${userId}`;
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return false;
  }

  try {
    const staged = JSON.parse(raw) as {
      progress?: { learningPayload?: Record<string, unknown> };
    };
    const ageGroup = resolveAgeGroup(learner);
    const parsed = guestLearningPayloadSchema.safeParse(
      staged.progress?.learningPayload ?? {},
    );

    const guestSnapshot = parsed.success
      ? guestPayloadToSnapshot(
          {
            version: parsed.data.version,
            state: parsed.data.state,
            verseProgress: parsed.data.verseProgress,
            lessonCompletions: parsed.data.lessonCompletions,
            surahProgress: Object.fromEntries(
              Object.entries(parsed.data.surahProgress).map(([k, value]) => [
                Number(k),
                value,
              ]),
            ),
          },
          ageGroup,
        )
      : createEmptySnapshot(ageGroup);

    const cloud = await loadCloudLearningSnapshot(userId, ageGroup);
    const merged: LearningSnapshot = mergeSnapshots(cloud, guestSnapshot, ageGroup);
    const current = resolveCurrentLessonPlan(merged, ageGroup);
    merged.state = {
      ...merged.state,
      currentLessonKey: current.lessonKey,
      currentSurahNumber: current.surahNumber,
      currentAyahNumber: current.startAyah,
      ageGroupSnapshot: ageGroup,
      updatedAt: new Date().toISOString(),
    };
    merged.hasStarted =
      merged.hasStarted ||
      guestSnapshot.hasStarted ||
      Object.keys(merged.verseProgress).length > 0;

    await replaceCloudSnapshot(userId, merged);
    await AsyncStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
