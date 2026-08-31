import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth, type ActiveLearner } from '@/features/auth';
import { useI18n } from '@/i18n';

import {
  advanceChallenge,
  challengePublicPlayer,
  closeChallengeRound,
  createInviteChallenge,
  fetchWeeklyLeaders,
  getChallengeState,
  joinChallengeByCode,
  joinPublicChallenge,
  listPublicPlayers,
  localizeCompetitionError,
  requestHarderChallenge,
  resolveCompetitionAgeBand,
  respondPublicChallenge,
  setChallengeReady,
  submitChallengeAnswer,
} from '../services';
import type { CompetitionState } from '../types';
import type { QuranRangeId } from '../services/quranRange';
import { DEFAULT_QURAN_RANGE } from '../services/quranRange';

function identityFromLearner(learner: ActiveLearner) {
  return {
    displayLabel: learner.display_name,
    ageBand: resolveCompetitionAgeBand(learner),
    profileId: learner.role === 'guest' ? null : learner.id,
  };
}

export function useCompetitionChallenge(code?: string) {
  const { activeLearner } = useAuth();
  const { t } = useI18n();
  const [state, setState] = useState<CompetitionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);
  const codeRef = useRef(code);

  codeRef.current = code;

  const apply = useCallback((next: CompetitionState) => {
    setState(next);
    setError(null);
  }, []);

  const fail = useCallback(
    (caught: unknown) => {
      const message = caught instanceof Error ? caught.message : 'error';
      setError(
        localizeCompetitionError(message, (key) => t(key)),
      );
    },
    [t],
  );

  const joinPublic = useCallback(async (quranRange: QuranRangeId = DEFAULT_QURAN_RANGE) => {
    if (!activeLearner) return null;
    setJoining(true);
    setError(null);
    try {
      const next = await joinPublicChallenge(identityFromLearner(activeLearner), quranRange);
      apply(next);
      return next;
    } catch (caught) {
      fail(caught);
      return null;
    } finally {
      setJoining(false);
    }
  }, [activeLearner, apply, fail]);

  const createInvite = useCallback(async (quranRange: QuranRangeId = DEFAULT_QURAN_RANGE) => {
    if (!activeLearner) return null;
    setJoining(true);
    setError(null);
    try {
      const next = await createInviteChallenge(identityFromLearner(activeLearner), quranRange);
      apply(next);
      return next;
    } catch (caught) {
      fail(caught);
      return null;
    } finally {
      setJoining(false);
    }
  }, [activeLearner, apply, fail]);

  const joinCode = useCallback(
    async (nextCode: string) => {
      if (!activeLearner) return null;
      setJoining(true);
      setError(null);
      try {
        const next = await joinChallengeByCode(nextCode, identityFromLearner(activeLearner));
        apply(next);
        return next;
      } catch (caught) {
        fail(caught);
        return null;
      } finally {
        setJoining(false);
      }
    },
    [activeLearner, apply, fail],
  );

  const refresh = useCallback(async () => {
    const currentCode = codeRef.current ?? state?.challenge.code;
    if (!currentCode || busyRef.current) {
      return;
    }
    busyRef.current = true;
    try {
      const next = await getChallengeState(currentCode);
      apply(next);
    } catch (caught) {
      fail(caught);
    } finally {
      busyRef.current = false;
    }
  }, [apply, fail, state?.challenge.code]);

  useEffect(() => {
    if (!code || !activeLearner) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    void joinChallengeByCode(code, identityFromLearner(activeLearner))
      .then((next) => {
        if (!cancelled) {
          apply(next);
        }
      })
      .catch((caught) => {
        if (!cancelled) {
          fail(caught);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeLearner, apply, code, fail]);

  useEffect(() => {
    const status = state?.challenge.status;
    if (!status || status === 'complete' || status === 'expired' || status === 'cancelled') {
      return;
    }
    const ms =
      status === 'question' ? 2000 : status === 'reveal' ? 900 : 1500;
    const timer = setInterval(() => {
      void refresh();
    }, ms);
    return () => clearInterval(timer);
  }, [refresh, state?.challenge.status]);

  const remainingMs = useMemo(() => {
    const ends = state?.challenge.question_ends_at;
    if (!ends || state?.challenge.status !== 'question') {
      return 0;
    }
    return Math.max(0, Date.parse(ends) - Date.now());
  }, [state?.challenge.question_ends_at, state?.challenge.status, state]);

  useEffect(() => {
    if (state?.challenge.status !== 'question' || !state.challenge.question_ends_at) {
      return;
    }
    const wait = Date.parse(state.challenge.question_ends_at) - Date.now();
    const timer = setTimeout(
      () => {
        void closeChallengeRound(state.challenge.code).then(apply).catch(fail);
      },
      Math.max(0, wait + 50),
    );
    return () => clearTimeout(timer);
  }, [apply, fail, state?.challenge.code, state?.challenge.question_ends_at, state?.challenge.status]);

  useEffect(() => {
    if (state?.challenge.status !== 'reveal' || !state.challenge.reveal_until) {
      return;
    }
    const wait = Date.parse(state.challenge.reveal_until) - Date.now();
    const timer = setTimeout(
      () => {
        void advanceChallenge(state.challenge.code).then(apply).catch(fail);
      },
      Math.max(0, wait + 50),
    );
    return () => clearTimeout(timer);
  }, [apply, fail, state?.challenge.code, state?.challenge.reveal_until, state?.challenge.status]);

  const readyUp = useCallback(async () => {
    if (!state) return;
    try {
      apply(await setChallengeReady(state.challenge.code));
    } catch (caught) {
      fail(caught);
    }
  }, [apply, fail, state]);

  const submit = useCallback(
    async (choiceId: string) => {
      if (!state || state.me.my_choice_id) return;
      try {
        apply(await submitChallengeAnswer(state.challenge.code, choiceId));
      } catch (caught) {
        fail(caught);
      }
    },
    [apply, fail, state],
  );

  const rematch = useCallback(async () => {
    if (!state) return null;
    try {
      const next = await requestHarderChallenge(state.challenge.code);
      apply(next);
      return next;
    } catch (caught) {
      fail(caught);
      return null;
    }
  }, [apply, fail, state]);

  const challengePlayer = useCallback(
    async (targetCode: string, quranRange: QuranRangeId = DEFAULT_QURAN_RANGE) => {
      if (!state) return;
      try {
        apply(await challengePublicPlayer(state.challenge.code, targetCode, quranRange));
      } catch (caught) {
        fail(caught);
      }
    },
    [apply, fail, state],
  );

  const respondChallenge = useCallback(
    async (accept: boolean) => {
      if (!state) return;
      try {
        apply(await respondPublicChallenge(state.challenge.code, accept));
      } catch (caught) {
        fail(caught);
      }
    },
    [apply, fail, state],
  );

  return {
    state,
    loading,
    joining,
    error,
    remainingMs,
    joinPublic,
    createInvite,
    joinCode,
    refresh,
    readyUp,
    submit,
    rematch,
    challengePlayer,
    respondChallenge,
    loadWeeklyLeaders: fetchWeeklyLeaders,
    loadPublicPlayers: listPublicPlayers,
  };
}
