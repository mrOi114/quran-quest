import { useRouter, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/features/auth';
import { useI18n } from '@/i18n';

import { useCompetitionChallenge } from '../hooks/useCompetitionChallenge';
import {
  buildChallengeUrl,
  buildInviteMessage,
  formatCompetitionTimer,
  localizeCompetitionQuestion,
  shareChallengeInvite,
} from '../services';
import type { CompetitionState } from '../types';

function opponentOf(state: CompetitionState) {
  return state.challenge.players.find((player) => !player.is_you) ?? null;
}

function useLiveRemaining(endsAt: string | null, active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active || !endsAt) {
      return;
    }
    const timer = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(timer);
  }, [active, endsAt]);
  if (!endsAt || !active) {
    return 0;
  }
  return Math.max(0, Date.parse(endsAt) - now);
}

export function CompetitionMatchScreen({ code }: { code: string }) {
  const router = useRouter();
  const { t, language } = useI18n();
  const { state, loading, error, readyUp, submit, rematch, joining } =
    useCompetitionChallenge(code);
  const [shareNote, setShareNote] = useState<string | null>(null);

  const remaining = useLiveRemaining(
    state?.challenge.question_ends_at ?? null,
    state?.challenge.status === 'question',
  );

  const localized = useMemo(() => {
    if (!state?.challenge.question) {
      return null;
    }
    return localizeCompetitionQuestion(state.challenge.question, language);
  }, [language, state?.challenge.question]);

  async function onInvite() {
    if (!state) return;
    const url = buildChallengeUrl(state.challenge.code);
    const message = buildInviteMessage({
      title: t('competition.shareTitle'),
      challengeLine: t('competition.shareChallenge'),
      detailsLine: t('competition.shareDetails', { count: state.challenge.question_count }),
      joinLine: t('competition.shareJoin'),
      url,
      codeLine: t('competition.shareCode', { code: state.challenge.code }),
    });
    try {
      const result = await shareChallengeInvite(message);
      setShareNote(result === 'copied' ? t('competition.copied') : null);
    } catch {
      setShareNote(t('competition.shareFailed'));
    }
  }

  if (loading && !state) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <Text className="text-base text-white">{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  if (!state) {
    return (
      <SafeAreaView className="flex-1 bg-brand-600 px-6 pt-8">
        <Text className="text-2xl font-bold text-white">{t('competition.title')}</Text>
        <Text className="mt-3 text-base text-red-100">{error ?? t('competition.notFound')}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(app)/competition' as Href)}
          className="mt-6 min-h-12 items-center justify-center rounded-xl bg-white px-4"
        >
          <Text className="font-semibold text-brand-800">{t('common.back')}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const opponent = opponentOf(state);
  const you = state.challenge.players.find((player) => player.is_you);
  const waiting = state.challenge.status === 'waiting';
  const readyCheck = state.challenge.status === 'ready_check';
  const inQuestion = state.challenge.status === 'question';
  const revealing = state.challenge.status === 'reveal';
  const complete = state.challenge.status === 'complete';

  const last = state.challenge.last_round_result;
  const myRound = last?.players.find((player) => player.participant_id === state.me.participant_id);
  const opponentRound = last?.players.find(
    (player) => player.participant_id !== state.me.participant_id,
  );
  const correctChoice = localized?.choices.find((choice) => choice.id === last?.correct_choice_id);

  return (
    <SafeAreaView className="flex-1 bg-brand-600">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
      >
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-100">
          {t('competition.title')}
        </Text>
        <Text className="mt-1 text-lg font-semibold text-white">
          {t('competition.tierLabel', { n: state.challenge.tier })}
        </Text>

        {waiting || readyCheck ? (
          <View className="mt-5 rounded-3xl bg-white px-5 py-5">
            <Text className="text-xl font-bold text-brand-800">
              {opponent ? t('competition.opponentJoined') : t('competition.waiting')}
            </Text>
            <Text className="mt-3 text-base text-brand-700">
              {t('competition.codeLabel', { code: state.challenge.code })}
            </Text>
            <Text className="mt-2 text-sm text-brand-600">
              {t('competition.joinedCount', {
                count: state.challenge.participant_count,
                max: state.challenge.max_participants,
              })}
              {state.challenge.is_full ? ` · ${t('competition.full')}` : ''}
            </Text>

            <PrimaryButton label={t('competition.invite')} onPress={() => void onInvite()} />
            {shareNote ? <Text className="mb-3 text-sm text-brand-600">{shareNote}</Text> : null}

            {readyCheck || opponent ? (
              state.me.is_ready ? (
                <Text className="text-base text-brand-700">{t('competition.youAreReady')}</Text>
              ) : (
                <PrimaryButton
                  label={t('competition.ready')}
                  onPress={() => {
                    void readyUp();
                  }}
                />
              )
            ) : null}
            {readyCheck && opponent && !opponent.is_ready ? (
              <Text className="mt-2 text-sm text-brand-600">{t('competition.waitingReady')}</Text>
            ) : null}
          </View>
        ) : null}

        {(inQuestion || revealing) && localized ? (
          <View className="mt-5 rounded-3xl bg-white px-5 py-5">
            <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
              {t('competition.questionProgress', {
                current: state.challenge.current_index + 1,
                total: state.challenge.question_count,
              })}
            </Text>
            {inQuestion ? (
              <Text className="mt-2 text-2xl font-bold text-brand-800">
                {t('competition.timer', { time: formatCompetitionTimer(remaining) })}
              </Text>
            ) : null}
            <Text className="mt-4 text-lg font-semibold leading-6 text-brand-900">
              {localized.prompt}
            </Text>

            <View className="mt-4 gap-3">
              {localized.choices.map((choice) => {
                const selected = state.me.my_choice_id === choice.id;
                const showCorrect = revealing && last?.correct_choice_id === choice.id;
                return (
                  <Pressable
                    key={choice.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${choice.letter}. ${choice.label}`}
                    disabled={!inQuestion || Boolean(state.me.my_choice_id)}
                    onPress={() => {
                      void submit(choice.id);
                    }}
                    className={`min-h-14 justify-center rounded-2xl border px-4 py-3 ${
                      showCorrect
                        ? 'border-emerald-600 bg-emerald-50'
                        : selected
                          ? 'border-brand-600 bg-brand-50'
                          : 'border-brand-200 bg-brand-50'
                    }`}
                  >
                    <Text className="text-base font-semibold text-brand-800">
                      {choice.letter}. {choice.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {revealing ? (
              <View className="mt-5 rounded-2xl bg-brand-50 px-4 py-4">
                <Text className="text-base font-semibold text-brand-800">
                  {t('competition.correctAnswer', {
                    answer: correctChoice
                      ? `${correctChoice.letter}. ${correctChoice.label}`
                      : last?.correct_choice_id?.toUpperCase() ?? '',
                  })}
                </Text>
                <Text className="mt-2 text-base text-brand-800">
                  {myRound?.correct ? t('competition.youCorrect') : t('competition.youIncorrect')}
                </Text>
                <Text className="mt-1 text-base text-brand-800">
                  {opponentRound?.correct
                    ? t('competition.opponentCorrect')
                    : t('competition.opponentIncorrect')}
                </Text>
                <Text className="mt-3 text-sm text-brand-600">
                  {t('competition.youPoints', { points: myRound?.points ?? 0 })}
                </Text>
                <Text className="text-sm text-brand-600">
                  {t('competition.opponentPoints', { points: opponentRound?.points ?? 0 })}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {complete ? (
          <View className="mt-5 rounded-3xl bg-white px-5 py-5">
            <Text className="text-2xl font-bold text-brand-800">{t('competition.complete')}</Text>
            <Text className="mt-4 text-lg text-brand-800">
              {t('competition.youScore', {
                score: you?.score ?? state.me.score,
                total: state.challenge.question_count,
              })}
            </Text>
            <Text className="mt-1 text-lg text-brand-800">
              {t('competition.opponentScore', {
                score: opponent?.score ?? 0,
                total: state.challenge.question_count,
              })}
            </Text>
            <Text className="mt-4 text-xl font-semibold text-brand-900">
              {(you?.score ?? 0) === (opponent?.score ?? 0)
                ? t('competition.draw')
                : (you?.score ?? 0) > (opponent?.score ?? 0)
                  ? t('competition.youWon')
                  : t('competition.wellPlayed')}
            </Text>
            <Text className="mt-3 text-base leading-6 text-brand-600">
              {t('competition.continueJourney')}
            </Text>

            {state.challenge.tier < 3 ? (
              <PrimaryButton
                label={t('competition.harder')}
                loading={joining}
                onPress={() => {
                  void rematch().then((next) => {
                    if (next) {
                      router.replace({
                        pathname: '/(app)/competition/[code]',
                        params: { code: next.challenge.code },
                      } as Href);
                    }
                  });
                }}
              />
            ) : null}

            <PrimaryButton
              label={t('common.backToHome')}
              variant="secondary"
              onPress={() => router.replace('/(app)/home')}
            />
          </View>
        ) : null}

        {error ? <Text className="mt-4 text-sm text-red-100">{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
