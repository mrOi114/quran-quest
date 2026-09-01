import { useRouter, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, useAuth } from '@/features/auth';
import { useI18n } from '@/i18n';

import { useCompetitionChallenge } from '../hooks/useCompetitionChallenge';
import { useCompetitionVoiceFeedback } from '../hooks/useCompetitionVoice';
import {
  buildChallengeUrl,
  buildInviteMessage,
  formatCompetitionTimer,
  localizeCompetitionQuestion,
  shareChallengeInvite,
} from '../services';
import { playGreetingOnce, playMotivationEvent } from '../services/competitionVoice';
import { motivationToneForLearner } from '../services/motivationClips';
import { useMotivationSound } from '../services/voicePreference';
import { CompetitionSoundToggle } from './CompetitionSoundToggle';
import { ListenToQuestionButton } from './ListenToQuestionButton';
import { QuranRangePicker } from './QuranRangePicker';
import { CompetitionCelebration } from './CompetitionCelebration';
import {
  DEFAULT_QURAN_RANGE,
  isQuranRangeId,
  isQuranRangePlayable,
  rangeLabelKey,
  type QuranRangeId,
} from '../services/quranRange';

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
  const { activeLearner } = useAuth();
  const { enabled: soundEnabled } = useMotivationSound();
  const tone = motivationToneForLearner(activeLearner);
  const playful = tone === 'playful';
  const { state, loading, error, readyUp, submit, rematch, joining, challengePlayer, respondChallenge, leaveRoom } =
    useCompetitionChallenge(code);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [challengeRange, setChallengeRange] = useState<QuranRangeId>(DEFAULT_QURAN_RANGE);

  const remaining = useLiveRemaining(
    state?.challenge.question_ends_at ?? null,
    state?.challenge.status === 'question',
  );

  useEffect(() => {
    if (state?.challenge.code && state.challenge.code !== code) {
      router.replace({
        pathname: '/(app)/competition/[code]',
        params: { code: state.challenge.code },
      } as unknown as Href);
    }
  }, [code, router, state?.challenge.code]);

  useEffect(() => {
    if (isQuranRangeId(state?.challenge.quran_range)) {
      setChallengeRange(state.challenge.quran_range);
    }
  }, [state?.challenge.quran_range]);

  const localized = useMemo(() => {
    if (!state?.challenge.question) {
      return null;
    }
    return localizeCompetitionQuestion(state.challenge.question, language);
  }, [language, state?.challenge.question]);

  const revealingNow = state?.challenge.status === 'reveal';
  const lastRound = state?.challenge.last_round_result;
  const myRoundResult = lastRound?.players.find(
    (player) => player.participant_id === state?.me.participant_id,
  );

  useCompetitionVoiceFeedback({
    enabled: soundEnabled,
    tone,
    status: state?.challenge.status,
    questionIndex: lastRound?.question_index ?? state?.challenge.current_index ?? 0,
    questionCount: state?.challenge.question_count ?? 0,
    myCorrect: revealingNow ? myRoundResult?.correct : undefined,
    challengeCode: state?.challenge.code,
  });

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

  const waiting = state.challenge.status === 'waiting';
  const readyCheck = state.challenge.status === 'ready_check';
  const inQuestion = state.challenge.status === 'question';
  const revealing = state.challenge.status === 'reveal';
  const complete = state.challenge.status === 'complete';
  const others = state.challenge.players.filter((player) => !player.is_you);
  const available = state.challenge.available_players ?? [];
  const pending = state.challenge.pending_challenge;

  const last = state.challenge.last_round_result;
  const myRound = last?.players.find((player) => player.participant_id === state.me.participant_id);
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
        <CompetitionSoundToggle />

        {waiting || readyCheck ? (
          <View className="mt-5 rounded-3xl bg-white px-5 py-5">
            <Text className="text-xl font-bold text-brand-800">
              {others.length > 0 ? t('competition.opponentJoined') : t('competition.waiting')}
            </Text>
            <Text className="mt-3 text-base text-brand-700">
              {t('competition.codeLabel', { code: state.challenge.code })}
            </Text>
            <Text className="mt-2 text-sm text-brand-600">
              {t('competition.playersCount', {
                count: state.challenge.participant_count,
                max: state.challenge.max_participants,
              })}
              {state.challenge.is_full ? ` · ${t('competition.full')}` : ''}
            </Text>
            <Text className="mt-2 text-sm font-semibold text-brand-700">
              {t(rangeLabelKey(state.challenge.quran_range))}
            </Text>
            <Text className="mt-3 text-sm leading-5 text-brand-600">
              {t('competition.waitingStay')}
            </Text>
            <PrimaryButton
              label={t('competition.keepLearningWhileWaiting')}
              variant="secondary"
              onPress={() => router.push('/(app)/home' as Href)}
            />

            {state.challenge.players.map((player) => (
              <Text key={player.participant_id} className="mt-2 text-base text-brand-800">
                {player.display_label}
                {player.is_you ? ` · ${t('competition.youTag')}` : ''}
                {player.is_ready ? ` · ${t('competition.playerReady')}` : ''}
              </Text>
            ))}

            {pending ? (
              <View className="mt-4 rounded-2xl bg-brand-50 px-4 py-4">
                <Text className="text-base font-semibold text-brand-800">
                  {t('competition.challengeRequest')}
                </Text>
                <Text className="mt-2 text-base text-brand-800">
                  {t('competition.wantsToChallenge', { name: pending.label })}
                </Text>
                <Text className="mt-3 text-sm font-semibold text-brand-700">
                  {t('competition.requestRange')}
                </Text>
                <Text className="text-base text-brand-800">
                  {t(rangeLabelKey(pending.quran_range))}
                </Text>
                <Text className="mt-2 text-sm text-brand-700">
                  {t('competition.tierLabel', { n: pending.tier ?? state.challenge.tier })}
                </Text>
                <Text className="text-sm text-brand-700">
                  {t('competition.requestQuestions', {
                    count: pending.question_count ?? state.challenge.question_count,
                  })}
                </Text>
                <Text className="text-sm text-brand-700">
                  {t('competition.requestSeconds', {
                    seconds: pending.question_seconds ?? 60,
                  })}
                </Text>
                <PrimaryButton
                  label={t('competition.accept')}
                  onPress={() => {
                    void respondChallenge(true);
                  }}
                />
                <PrimaryButton
                  label={t('competition.decline')}
                  variant="secondary"
                  onPress={() => {
                    void respondChallenge(false);
                  }}
                />
              </View>
            ) : null}

            {state.challenge.visibility === 'invite' || others.length > 0 ? (
              <View className="mt-4">
                <QuranRangePicker value={challengeRange} locked />
              </View>
            ) : null}

            {state.challenge.visibility === 'public' ? (
              <View className="mt-4">
                {others.length === 0 ? (
                  <View className="mb-3">
                    <QuranRangePicker value={challengeRange} onChange={setChallengeRange} />
                  </View>
                ) : null}
                <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
                  {t('competition.availableOnline')}
                </Text>
                {available.length === 0 ? (
                  <Text className="mt-2 text-sm text-brand-600">{t('competition.waiting')}</Text>
                ) : (
                  available.map((player) => {
                    const canChallenge = others.length === 0 && isQuranRangePlayable(challengeRange);
                    return (
                    <View
                      key={player.code}
                      className="mt-3 flex-row items-center justify-between rounded-2xl border border-brand-100 px-3 py-3"
                    >
                      <View className="flex-1 pr-3">
                        <Text className="text-base font-semibold text-brand-800">
                          {player.display_label}
                        </Text>
                        <Text className="text-sm text-brand-600">
                          {t(rangeLabelKey(player.quran_range))}
                        </Text>
                        <Text className="text-sm text-brand-600">
                          {t('competition.tierLabel', { n: player.tier })}
                        </Text>
                        <Text className="text-sm text-brand-600">
                          {player.is_ready ? t('competition.playerReady') : t('competition.waiting')}
                        </Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ disabled: !canChallenge }}
                        disabled={!canChallenge}
                        onPress={() => {
                          if (!canChallenge) return;
                          void challengePlayer(player.code, challengeRange);
                        }}
                        className={`min-h-11 items-center justify-center rounded-xl px-3 ${
                          canChallenge ? 'bg-brand-600' : 'bg-brand-200'
                        }`}
                      >
                        <Text className="text-sm font-semibold text-white">
                          {t('competition.challengePlayer')}
                        </Text>
                      </Pressable>
                    </View>
                    );
                  })
                )}
              </View>
            ) : null}

            {!state.challenge.is_full ? (
              <>
                <PrimaryButton label={t('competition.invite')} onPress={() => void onInvite()} />
                {shareNote ? <Text className="mb-3 text-sm text-brand-600">{shareNote}</Text> : null}
              </>
            ) : null}

            {others.length > 0 ? (
              state.me.is_ready ? (
                <Text className="mt-4 text-base text-brand-700">{t('competition.youAreReady')}</Text>
              ) : (
                <PrimaryButton
                  label={t('competition.ready')}
                  onPress={() => {
                    playGreetingOnce({ enabled: soundEnabled, tone });
                    void readyUp();
                  }}
                />
              )
            ) : null}
            {others.length > 0 && others.some((player) => !player.is_ready) ? (
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
            <View className="mt-4 flex-row items-start">
              <Text className="flex-1 text-lg font-semibold leading-6 text-brand-900">
                {localized.prompt}
              </Text>
              {language === 'en' && state.challenge.question ? (
                <ListenToQuestionButton englishText={state.challenge.question.prompt_en} />
              ) : null}
            </View>

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
                {playful ? (
                  <Text className="mb-2 text-lg font-bold text-brand-800">
                    {myRound?.correct ? t('competition.cheerCorrect') : t('competition.cheerIncorrect')}
                  </Text>
                ) : null}
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
              </View>
            ) : null}
          </View>
        ) : null}

        {complete ? (
          <CompetitionCelebration
            challengeId={state.challenge.id}
            players={state.challenge.players}
            questionCount={state.challenge.question_count}
            rewards={state.me.rewards}
            showChallengeAgain={state.challenge.tier < 3}
            joining={joining}
            playful={playful}
            onChallengeAgain={() => {
              void playMotivationEvent('next_challenge', { enabled: soundEnabled, tone });
              void rematch().then((next) => {
                if (next) {
                  router.replace({
                    pathname: '/(app)/competition/[code]',
                    params: { code: next.challenge.code },
                  } as unknown as Href);
                }
              });
            }}
            onBack={() => router.replace('/(app)/competition' as Href)}
          />
        ) : null}

        {error ? <Text className="mt-4 text-sm text-red-100">{error}</Text> : null}

        {!complete ? (
          <View className="mt-5">
            <PrimaryButton
              label={t('competition.leaveCompetition')}
              variant="secondary"
              onPress={() => {
                void leaveRoom().then(() => {
                  router.replace('/(app)/competition' as Href);
                });
              }}
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
