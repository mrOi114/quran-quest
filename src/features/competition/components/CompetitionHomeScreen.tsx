import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, TextField, useAuth } from '@/features/auth';
import { useI18n } from '@/i18n';

import { useCompetitionChallenge } from '../hooks/useCompetitionChallenge';
import { fetchWeeklyLeaders, resolveCompetitionAgeBand, resumeActiveChallenge } from '../services';
import { rememberLiveChallenge } from '../services/activeRoom';
import { playGreetingOnce } from '../services/competitionVoice';
import { motivationToneForLearner } from '../services/motivationClips';
import { useMotivationSound } from '../services/voicePreference';
import type { CompetitionPlayerRewards, CompetitionWeeklyLeader } from '../types';
import { CompetitionSoundToggle } from './CompetitionSoundToggle';
import { QuranRangePicker } from './QuranRangePicker';
import {
  DEFAULT_QURAN_RANGE,
  isQuranRangePlayable,
  type QuranRangeId,
} from '../services/quranRange';

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

export function CompetitionHomeScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { activeLearner } = useAuth();
  const { enabled: soundEnabled } = useMotivationSound();
  const tone = motivationToneForLearner(activeLearner);
  const playful = tone === 'playful';
  const { joinPublic, createInvite, joinCode, joining, error } = useCompetitionChallenge();
  const [code, setCode] = useState('');
  const [quranRange, setQuranRange] = useState<QuranRangeId>(DEFAULT_QURAN_RANGE);
  const [leaders, setLeaders] = useState<CompetitionWeeklyLeader[]>([]);
  const [progress, setProgress] = useState<CompetitionPlayerRewards | null>(null);
  const [restoring, setRestoring] = useState(true);

  const ageBand = activeLearner ? resolveCompetitionAgeBand(activeLearner) : null;
  const guestName = activeLearner?.display_name?.trim() ?? '';
  const rangeReady = isQuranRangePlayable(quranRange);

  useEffect(() => {
    let cancelled = false;
    void resumeActiveChallenge()
      .then(async (state) => {
        if (cancelled || !state?.challenge.code) {
          return false;
        }
        await rememberLiveChallenge(state.challenge.code, state.challenge.status);
        if (cancelled) {
          return false;
        }
        router.replace({
          pathname: '/(app)/competition/[code]',
          params: { code: state.challenge.code },
        } as unknown as Href);
        return true;
      })
      .catch(() => false)
      .then((moved) => {
        if (!cancelled && !moved) {
          setRestoring(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    void fetchWeeklyLeaders()
      .then((next) => {
        if (!cancelled) {
          setLeaders(next.leaders);
          setProgress(next.progress);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLeaders([]);
          setProgress(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function go(nextCode: string | undefined) {
    if (!nextCode) return;
    router.push({
      pathname: '/(app)/competition/[code]',
      params: { code: nextCode },
    } as unknown as Href);
  }

  if (restoring) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <Text className="text-base text-white">{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-600">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
      >
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-100">
          {t('nav.competition')}
        </Text>
        <Text className="mt-2 text-3xl font-bold text-white">{t('competition.title')}</Text>
        <Text className="mt-2 text-base text-brand-100">{t('competition.subtitle')}</Text>
        {playful ? (
          <Text className="mt-2 text-base font-semibold text-white">{t('competition.playfulWelcome')}</Text>
        ) : null}
        <CompetitionSoundToggle />
        {guestName ? (
          <Text className="mt-3 text-base font-semibold text-white">
            {t('competition.playingAs', { name: guestName })}
          </Text>
        ) : null}

        <View className="mt-5 rounded-3xl bg-white px-5 py-5">
          <QuranRangePicker value={quranRange} onChange={setQuranRange} />
        </View>

        {progress ? (
          <View className="mt-5 rounded-3xl bg-white px-5 py-5">
            <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
              {t('competition.quranPower')}
            </Text>
            <Text className="mt-3 text-2xl font-bold text-brand-800">
              {progress.avatar_emoji} {t('competition.powerTotal', { power: progress.power })}
            </Text>
            <Text className="mt-1 text-sm text-brand-600">{powerLevelLabel(progress.level_key, t)}</Text>
          </View>
        ) : null}

        <View className="mt-5 rounded-3xl bg-white px-5 py-5">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('competition.weeklyLeaders')}
          </Text>
          {leaders.length === 0 ? (
            <Text className="mt-3 text-sm text-brand-600">{t('competition.weeklyLeadersEmpty')}</Text>
          ) : (
            leaders.map((leader, index) => (
              <Text key={`${leader.display_label}-${index}`} className="mt-2 text-base text-brand-800">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {leader.display_label}
                {leader.score > 0 ? ` · ${leader.score}` : ''}
              </Text>
            ))
          )}
        </View>

        <View className="mt-5 rounded-3xl bg-white px-5 py-5">
          {ageBand ? (
            <Text className="mb-4 text-sm text-brand-600">
              {t('competition.matchedGroup', {
                group:
                  ageBand === 'child'
                    ? t('competition.groupChild')
                    : ageBand === 'teen'
                      ? t('competition.groupTeen')
                      : t('competition.groupAdult'),
              })}
            </Text>
          ) : null}

          <PrimaryButton
            label={t('competition.joinPublic')}
            loading={joining}
            disabled={!rangeReady}
            onPress={() => {
              if (!rangeReady) return;
              playGreetingOnce({ enabled: soundEnabled, tone });
              void joinPublic(quranRange).then((state) => go(state?.challenge.code));
            }}
          />
          <Text className="mb-4 text-sm leading-5 text-brand-600">
            {t('competition.publicHelp')}
          </Text>

          <PrimaryButton
            label={t('competition.invite')}
            variant="secondary"
            loading={joining}
            disabled={!rangeReady}
            onPress={() => {
              if (!rangeReady) return;
              playGreetingOnce({ enabled: soundEnabled, tone });
              void createInvite(quranRange).then((state) => go(state?.challenge.code));
            }}
          />
          <Text className="mb-4 text-sm leading-5 text-brand-600">
            {t('competition.inviteHelp')}
          </Text>

          <TextField
            label={t('competition.enterCode')}
            value={code}
            onChangeText={(value) => setCode(value.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            accessibilityLabel={t('competition.enterCode')}
          />
          <Pressable
            accessibilityRole="button"
            disabled={joining}
            onPress={() => {
              playGreetingOnce({ enabled: soundEnabled, tone });
              void joinCode(code).then((state) => go(state?.challenge.code));
            }}
            className="min-h-12 items-center justify-center rounded-xl border border-brand-600 px-4 py-3"
          >
            <Text className="text-sm font-semibold text-brand-700">
              {t('competition.joinWithCode')}
            </Text>
          </Pressable>

          {error ? <Text className="mt-4 text-sm text-red-700">{error}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
