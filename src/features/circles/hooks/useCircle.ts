import { useCallback, useEffect, useState } from 'react';

import { fetchCircle } from '../services';
import type { CircleSummary } from '../types';

export function useCircle(circleId: string | undefined) {
  const [circle, setCircle] = useState<CircleSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!circleId) {
      setCircle(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setCircle(await fetchCircle(circleId));
    } catch (err) {
      setCircle(null);
      setError(err instanceof Error ? err.message : 'Access denied');
    } finally {
      setLoading(false);
    }
  }, [circleId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { circle, error, loading, reload, setCircle };
}
