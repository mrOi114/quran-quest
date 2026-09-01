import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/features/auth';
import { computeGameBonusPoints, loadGameProgress } from '@/features/games';
import { loadLearningSnapshot, resolveAgeGroup } from '@/features/learning';

import { computeCurrentPower, computeEffortBreakdown, latestLearningActivityAt } from '../services/effortPoints';
import { publishPublicLeaderboard } from '../services/publicBoard';

const PUBLISH_MS = 45_000;

/** Publishes this learner onto the public student board while they use the app. */
export function LeaderboardPresenceHost() {
  const { activeLearner } = useAuth();

  useEffect(() => {
    if (!activeLearner) {
      return;
    }
    let cancelled = false;
    let inFlight = false;

    async function beat() {
      if (cancelled || inFlight || !activeLearner) {
        return;
      }
      inFlight = true;
      try {
        const snapshot = await loadLearningSnapshot(activeLearner);
        const gameProgress = await loadGameProgress(activeLearner);
        const effort = computeEffortBreakdown(snapshot, {
          gameBonusPoints: computeGameBonusPoints(gameProgress),
        });
        const lastActivityAt = latestLearningActivityAt(snapshot, [
          gameProgress.lastPlayedDate,
          ...gameProgress.completions.map((item) => item.completedAt),
        ]);
        await publishPublicLeaderboard({
          learner: activeLearner,
          ageGroup: resolveAgeGroup(activeLearner),
          lifetimePoints: effort.totalPoints,
          juzPoints: effort.juz30VersePoints,
          currentPower: computeCurrentPower(effort.totalPoints, lastActivityAt),
          juzCurrentPower: computeCurrentPower(effort.juz30VersePoints, lastActivityAt),
        });
      } catch {
        // Presence is best-effort; the leaderboard screen still retries via sync.
      } finally {
        inFlight = false;
      }
    }

    void beat();
    const timer = setInterval(() => {
      void beat();
    }, PUBLISH_MS);
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
  }, [activeLearner]);

  return null;
}
