import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Text, View } from 'react-native';

import { PrimaryButton } from '@/features/auth';
import { useI18n } from '@/i18n';

import { buildCelebrationSummary } from '../services/finalRanking';
import type { CompetitionPlayerRewards, CompetitionPlayerView } from '../types';

function powerLevelLabel(
  key: CompetitionPlayerRewards['level_key'],
  t: (key: 'competition.level.beginner' | 'competition.level.star' | 'competition.level.gold' | 'competition.level.diamond' | 'competition.level.champion') => string,
) {
  if (key === 'champion') return t('competition.level.champion');
  if (key === 'diamond') return t('competition.level.diamond');
  if (key === 'gold') return t('competition.level.gold');
  if (key === 'star') return t('competition.level.star');
  return t('competition.level.beginner');
}

export function CompetitionCelebration({
  challengeId,
  players,
  questionCount,
  rewards,
  showChallengeAgain,
  joining,
  playful,
  onChallengeAgain,
  onBack,
}: {
  challengeId: string;
  players: CompetitionPlayerView[];
  questionCount: number;
  rewards: CompetitionPlayerRewards | null;
  showChallengeAgain: boolean;
  joining: boolean;
  playful?: boolean;
  onChallengeAgain: () => void;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const summary = useMemo(
    () => buildCelebrationSummary(players, questionCount),
    [players, questionCount],
  );
  const [phase, setPhase] = useState<'complete' | 'headline' | 'results'>('complete');
  const burst = useRef(new Animated.Value(0.4)).current;
  const headline = useRef(new Animated.Value(0)).current;
  const results = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setPhase('complete');
    burst.setValue(0.4);
    headline.setValue(0);
    results.setValue(0);

    Animated.spring(burst, { toValue: 1, friction: 4, useNativeDriver: true }).start();

    let second: ReturnType<typeof setTimeout> | undefined;
    let third: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled) return;
      if (reduceMotion) {
        headline.setValue(1);
        results.setValue(1);
        setPhase('results');
        return;
      }
      second = setTimeout(() => {
        if (cancelled) return;
        setPhase('headline');
        Animated.timing(headline, { toValue: 1, duration: 280, useNativeDriver: true }).start();
      }, 700);
      third = setTimeout(() => {
        if (cancelled) return;
        setPhase('results');
        Animated.timing(results, { toValue: 1, duration: 280, useNativeDriver: true }).start();
      }, 1500);
    });

    return () => {
      cancelled = true;
      if (second) clearTimeout(second);
      if (third) clearTimeout(third);
    };
  }, [burst, challengeId, headline, results]);

  const showHeadline = phase !== 'complete';
  const showResults = phase === 'results';

  return (
    <View className="mt-5 rounded-3xl bg-white px-5 py-5">
      <Animated.Text
        className="text-center"
        style={{ fontSize: 56, transform: [{ scale: burst }] }}
      >
        🎉
      </Animated.Text>
      <Text className="mt-2 text-center text-2xl font-bold text-brand-800">
        {t('competition.celebrationComplete')}
      </Text>
      {playful ? (
        <Text className="mt-2 text-center text-base font-semibold text-brand-700">
          {t('competition.cheerComplete')}
        </Text>
      ) : null}

      {showHeadline ? (
        <Animated.View style={{ opacity: headline }}>
          <Text className="mt-4 text-center text-2xl font-bold text-brand-900">
            {summary.isDraw || !summary.winnerName
              ? t('competition.draw')
              : t('competition.playerWins', { name: summary.winnerName })}
          </Text>
        </Animated.View>
      ) : null}

      {showResults ? (
        <Animated.View style={{ opacity: results }}>
          <Text className="mt-5 text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('competition.finalResults')}
          </Text>
          {summary.rows.map((row) => (
            <Text
              key={row.participant_id}
              className={`mt-3 text-lg ${row.is_you ? 'font-bold text-brand-900' : 'text-brand-800'}`}
            >
              {row.medal} {row.display_label}
              {row.is_you ? ` ${t('competition.youTag')}` : ''} — {row.score}/{questionCount} — {row.percent}%
            </Text>
          ))}
          {rewards ? (
            <View className="mt-4 rounded-2xl bg-brand-50 px-4 py-4">
              <Text className="text-base font-semibold text-brand-800">
                {rewards.avatar_emoji} {t('competition.quranPower')}
              </Text>
              <Text className="mt-1 text-sm text-brand-700">
                {t('competition.powerTotal', { power: rewards.power })}
              </Text>
              {rewards.earned > 0 ? (
                <Text className="mt-1 text-sm text-brand-700">
                  {t('competition.powerEarned', { power: rewards.earned })}
                </Text>
              ) : null}
              <Text className="mt-1 text-sm text-brand-600">
                {powerLevelLabel(rewards.level_key, t)}
              </Text>
            </View>
          ) : null}
          <Text className="mt-4 text-base leading-6 text-brand-600">
            {t('competition.continueJourney')}
          </Text>
          {showChallengeAgain ? (
            <PrimaryButton
              label={t('competition.challengeAgain')}
              loading={joining}
              onPress={onChallengeAgain}
            />
          ) : null}
          <PrimaryButton
            label={t('competition.backToCompetition')}
            variant="secondary"
            onPress={onBack}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}
