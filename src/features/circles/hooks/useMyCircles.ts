import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth';

import { fetchMyCircles, fetchMyTeacherStatus } from '../services';
import type { CircleSummary } from '../types';
import type { TeacherApprovalStatus } from '@/types';

export function useMyCircles() {
  const { session, isGuest, profile } = useAuth();
  const [circles, setCircles] = useState<CircleSummary[]>([]);
  const [teacherStatus, setTeacherStatus] = useState<TeacherApprovalStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!session || isGuest) {
      setCircles([]);
      setTeacherStatus(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [nextCircles, nextTeacher] = await Promise.all([
        fetchMyCircles(),
        profile?.id ? fetchMyTeacherStatus(profile.id) : Promise.resolve(null),
      ]);
      setCircles(nextCircles);
      setTeacherStatus(nextTeacher);
    } catch (err) {
      setCircles([]);
      setError(err instanceof Error ? err.message : 'Access denied');
    } finally {
      setLoading(false);
    }
  }, [isGuest, profile?.id, session]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    circles,
    teacherStatus,
    error,
    loading,
    reload,
    publicCircles: circles.filter((circle) => circle.kind === 'public'),
    madrasahCircles: circles.filter((circle) => circle.kind === 'madrasah'),
  };
}
