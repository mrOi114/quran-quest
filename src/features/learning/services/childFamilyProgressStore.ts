import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AgeGroupId } from '@/features/auth';

import type { LearningSnapshot } from '../types';
import { createEmptySnapshot } from './progressHelpers';

const PREFIX = 'qq.child_family.learning.';

/**
 * Device-local learning store for family-code child sessions.
 * Cloud RLS requires an authenticated parent/learner JWT; until a scoped
 * progress token/API ships, family-code devices keep progress locally.
 */
export async function loadChildFamilyLearningSnapshot(
  learnerId: string,
  ageGroup: AgeGroupId,
): Promise<LearningSnapshot> {
  const raw = await AsyncStorage.getItem(`${PREFIX}${learnerId}`);
  if (!raw) {
    return createEmptySnapshot(ageGroup);
  }
  try {
    const parsed = JSON.parse(raw) as LearningSnapshot;
    if (!parsed?.state) {
      return createEmptySnapshot(ageGroup);
    }
    return parsed;
  } catch {
    return createEmptySnapshot(ageGroup);
  }
}

export async function saveChildFamilyLearningSnapshot(
  learnerId: string,
  snapshot: LearningSnapshot,
): Promise<void> {
  await AsyncStorage.setItem(`${PREFIX}${learnerId}`, JSON.stringify(snapshot));
}
