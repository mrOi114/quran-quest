import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  isChildFamilyLearner,
  isGuestLearner,
  useAuth,
  type ActiveLearner,
  type FamilyMember,
} from '@/features/auth';
import { loadLearningSnapshot } from '@/features/learning';
import type { Profile } from '@/types';

import type { JuzChallengeNumber } from '../constants';
import { buildLeaderboardModel } from '../services/leaderboardService';
import type { LeaderboardModel } from '../types';

function toFamilyMember(profile: Profile | FamilyMember): FamilyMember {
  return {
    id: profile.id,
    role: profile.role,
    display_name: profile.display_name,
    age: profile.age,
    avatar_key: profile.avatar_key,
    country_code: profile.country_code,
    preferred_language: profile.preferred_language,
    parent_id: profile.parent_id,
  };
}

function familyLearnersForBoard(options: {
  activeLearner: ActiveLearner;
  profile: Profile | null;
  children: Profile[];
}): ActiveLearner[] {
  const { activeLearner, profile, children } = options;
  if (isGuestLearner(activeLearner) || isChildFamilyLearner(activeLearner)) {
    return [activeLearner];
  }

  const byId = new Map<string, ActiveLearner>();
  byId.set(activeLearner.id, activeLearner);
  if (profile) {
    byId.set(profile.id, toFamilyMember(profile));
  }
  for (const child of children) {
    byId.set(child.id, toFamilyMember(child));
  }
  return [...byId.values()];
}

export function useLeaderboard(selectedJuz?: JuzChallengeNumber) {
  const { activeLearner, isGuest, profile, children } = useAuth();
  const [model, setModel] = useState<LeaderboardModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const familyLearners = useMemo(() => {
    if (!activeLearner) {
      return [];
    }
    return familyLearnersForBoard({ activeLearner, profile, children });
  }, [activeLearner, children, profile]);

  const refresh = useCallback(async () => {
    if (!activeLearner) {
      setModel(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const snapshot = await loadLearningSnapshot(activeLearner);
      const next = await buildLeaderboardModel({
        activeLearner,
        snapshot,
        isGuest,
        familyLearners,
        selectedJuz,
      });
      setModel(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the leaderboard.');
      setModel(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeLearner, familyLearners, isGuest, selectedJuz]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { model, isLoading, error, refresh };
}
