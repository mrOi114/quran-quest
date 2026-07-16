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
