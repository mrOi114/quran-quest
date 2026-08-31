import { useEffect } from 'react';
import { AppState } from 'react-native';

import {
  advanceChallenge,
  closeChallengeRound,
  getChallengeState,
} from '../services/competitionService';
import {
  clearActiveChallengeCode,
  peekActiveChallengeCode,
  rememberLiveChallenge,
} from '../services/activeRoom';

const HEARTBEAT_MS = 12_000;

/**
 * Keeps the player in their Competition room while they use the rest of the app.
 * Screen navigation is not a leave. Explicit Leave Competition clears membership.
 */
export function CompetitionMembershipHost() {
  useEffect(() => {
    let cancelled = false;
    let inFlight = false;

    async function beat() {
      if (cancelled || inFlight) {
        return;
      }
      const code = await peekActiveChallengeCode();
      if (!code) {
        return;
      }
      inFlight = true;
      try {
        let state = await getChallengeState(code);
        const status = state.challenge.status;
        const now = Date.now();
        if (
          status === 'question' &&
          state.challenge.question_ends_at &&
          Date.parse(state.challenge.question_ends_at) <= now
        ) {
          state = await closeChallengeRound(code);
        } else if (
          status === 'reveal' &&
          state.challenge.reveal_until &&
          Date.parse(state.challenge.reveal_until) <= now
        ) {
          state = await advanceChallenge(code);
        }
        await rememberLiveChallenge(state.challenge.code, state.challenge.status);
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : '';
        if (
          message === 'not_member' ||
          message === 'not_found' ||
          message === 'expired' ||
          message === 'cancelled'
        ) {
          await clearActiveChallengeCode();
        }
      } finally {
        inFlight = false;
      }
    }

    void beat();
    const timer = setInterval(() => {
      void beat();
    }, HEARTBEAT_MS);
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        void beat();
      }
    });
    return () => {
      cancelled = true;
      clearInterval(timer);
      sub.remove();
    };
  }, []);

  return null;
}
