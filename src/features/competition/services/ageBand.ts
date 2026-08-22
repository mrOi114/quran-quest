import type { ActiveLearner, AgeGroupId } from '@/features/auth';
import { resolveAgeGroup } from '@/features/learning';

import type { CompetitionAgeBand } from '../types';

export function ageGroupToCompetitionBand(ageGroup: AgeGroupId): CompetitionAgeBand {
  if (ageGroup === 'teen_15_17') {
    return 'teen';
  }
  if (ageGroup === 'adult_18_plus') {
    return 'adult';
  }
  return 'child';
}

export function resolveCompetitionAgeBand(learner: ActiveLearner): CompetitionAgeBand {
  return ageGroupToCompetitionBand(resolveAgeGroup(learner));
}
