import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/features/auth';

import {
  fetchFamilyCircle,
  resolveFamilyActor,
} from '../services/familyMembership';
import type { FamilyCircleState } from '../types';

export function useFamilyCircle() {
  const { profile, activeLearner, isGuest } = useAuth();
  const [circle, setCircle] = useState<FamilyCircleState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const actor = useMemo(
    () =>
      resolveFamilyActor({
        profile,
        activeLearnerId: activeLearner?.id ?? null,
        activeLearnerRole: activeLearner?.role ?? null,
        activeLearnerParentId: activeLearner?.parent_id ?? null,
      }),
    [activeLearner?.id, activeLearner?.parent_id, activeLearner?.role, profile],
  );

  const reload = useCallback(async () => {
    if (!actor || isGuest) {
      setCircle(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setCircle(await fetchFamilyCircle(actor));
    } catch (err) {
      setCircle(null);
      setError(err instanceof Error ? err.message : 'Access denied');
    } finally {
      setLoading(false);
    }
  }, [actor, isGuest]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    actor,
    circle,
    error,
    loading,
    canUseFamilyComms: Boolean(actor) && !isGuest,
    reload,
  };
}
