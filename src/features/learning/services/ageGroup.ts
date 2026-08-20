import { AGE_GROUPS, type AgeGroupId } from '@/features/auth';
import type { ActiveLearner } from '@/features/auth';
import { isGuestLearner } from '@/features/auth';

export function ageToAgeGroup(age: number): AgeGroupId {
  for (const group of AGE_GROUPS) {
    if (age >= group.minAge && age <= group.maxAge) {
      return group.id;
    }
  }
  return 'adult_18_plus';
}

export function resolveAgeGroup(learner: ActiveLearner): AgeGroupId {
  if (isGuestLearner(learner)) {
    return learner.age_group;
  }
  if (learner.role === 'child' && typeof learner.age === 'number') {
    return ageToAgeGroup(learner.age);
  }
  return 'adult_18_plus';
}

/** Best available age in years (profile age, else a gentle midpoint for the age group). */
export function resolveLearnerAgeYears(learner: ActiveLearner): number {
  if (typeof learner.age === 'number' && Number.isFinite(learner.age) && learner.age > 0) {
    return learner.age;
  }
  switch (resolveAgeGroup(learner)) {
    case 'child_3_6':
      return 5;
    case 'child_7_10':
      return 8;
    case 'child_11_14':
      return 12;
    case 'teen_15_17':
      return 16;
    default:
      return 18;
  }
}
