import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  AppState,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/features/auth';
import { useI18n, type MessageKey } from '@/i18n';

import { JUZ_CHALLENGES, LEADERBOARD_VIEWS, type LeaderboardViewId } from '../constants';
import { useLeaderboard } from '../hooks/useLeaderboard';
import type { LeaderboardBoard, LeaderboardEntry, LeaderboardModel } from '../types';
import { KeepJourneyCard } from './KeepJourneyCard';

function medalForRank(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

function RankRow({ entry }: { entry: LeaderboardEntry }) {
  const { t } = useI18n();
  const initial = entry.displayName.trim().slice(0, 1).toUpperCase() || '•';
  return (
    <View
      className={`rounded-2xl px-4 py-4 ${
        entry.isCurrentUser ? 'bg-brand-50 border border-brand-200' : 'bg-brand-900/5'
      }`}
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-3">
          <Text className="w-10 text-base font-bold text-brand-800">
            {medalForRank(entry.rank)}
          </Text>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-100">
            <Text className="text-base font-bold text-brand-800">{initial}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-brand-800">
              {entry.flag ? `${entry.flag} ` : ''}
              {entry.displayName}
              {entry.isCurrentUser ? t('leaderboard.youSuffix') : ''}
            </Text>
            <Text className="mt-1 text-xs text-brand-500">
              {entry.flag
                ? t('leaderboard.rankCountry', { rank: entry.rank })
                : t('leaderboard.rankOnly', { rank: entry.rank })}
            </Text>
          </View>
        </View>
        <Text className="text-base font-bold text-brand-700">
          {t('leaderboard.pts', { points: entry.points.toLocaleString() })}
        </Text>
      </View>
    </View>
  );
}

function YourPositionCard({ board }: { board: LeaderboardBoard }) {
  const { t } = useI18n();
  const { you } = board;
  return (
    <View className="mb-4 rounded-3xl bg-white px-4 py-4">
      <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
        {t('leaderboard.yourPosition')}
      </Text>
      <Text className="mt-2 text-3xl font-bold text-brand-800">#{you.rank}</Text>
      <Text className="mt-1 text-base text-brand-600">
        {t('leaderboard.pointsStudents', {
          points: you.points.toLocaleString(),
          total: you.totalInBoard,
        })}
      </Text>
      {you.pointsBehindNext != null && you.pointsBehindNext > 0 ? (
        <Text className="mt-3 text-sm font-semibold text-brand-700">
          {t('leaderboard.behind', {
            points: you.pointsBehindNext,
            rank: you.rank - 1,
          })}
        </Text>
      ) : null}
      {you.placesMoved != null && you.placesMoved > 0 ? (
        <Text className="mt-2 text-sm font-semibold text-emerald-700">
          {t('leaderboard.placesUp', { count: you.placesMoved })}
        </Text>
      ) : null}
      {you.placesMoved != null && you.placesMoved < 0 ? (
        <Text className="mt-2 text-sm font-semibold text-brand-600">
          {t('leaderboard.keepLearning')}
        </Text>
      ) : null}
    </View>
  );
}

function viewLabel(viewId: LeaderboardViewId, t: (key: MessageKey) => string): string {
  if (viewId === 'age') return t('leaderboard.viewAge');
  if (viewId === 'juz') return t('leaderboard.viewJuz');
  return t('leaderboard.viewAll');
}

function boardTitle(
  board: LeaderboardBoard,
  model: LeaderboardModel,
  t: (key: MessageKey, vars?: Record<string, string | number>) => string,
): string {
  if (board.view === 'age') {
    return t(`age.${model.ageGroup}` as MessageKey);
  }
  if (board.view === 'juz') {
    return t('leaderboard.juzChallenge', { n: board.juzNumber ?? 30 });
  }
  return t('leaderboard.viewAll');
}

function boardSubtitle(
  board: LeaderboardBoard,
  t: (key: MessageKey) => string,
): string {
  if (board.view === 'age') return t('leaderboard.ageSubtitle');
  if (board.view === 'juz') {
    return board.juzStatus === 'active'
      ? t('leaderboard.juzActiveSubtitle')
      : t('leaderboard.juzUpcomingSubtitle');
  }
  return t('leaderboard.allSubtitle');
}

function motivationText(
  id: string,
  board: LeaderboardBoard,
  model: LeaderboardModel,
  t: (key: MessageKey, vars?: Record<string, string | number>) => string,
  fallback: string,
): string {
  switch (id) {
    case 'streak':
      return t('leaderboard.motivation.streak', { count: model.effort.streakDays });
    case 'gap':
      return t('leaderboard.motivation.gap', { points: board.you.pointsBehindNext ?? 0 });
    case 'top':
      return t('leaderboard.motivation.top');
    case 'lessons':
      return t('leaderboard.motivation.lessons', { count: model.effort.lessonsCompleted });
    case 'games':
      return t('leaderboard.motivation.games');
    case 'rose':
      return t('leaderboard.motivation.rose', { count: board.you.placesMoved ?? 0 });
    case 'nudge':
      return t('leaderboard.motivation.nudge');
    case 'start':
      return t('leaderboard.motivation.start');
    default:
      return fallback;
  }
}

export function LeaderboardScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [view, setView] = useState<LeaderboardViewId>('all');
  const [selectedJuz, setSelectedJuz] = useState<(typeof JUZ_CHALLENGES)[number]['juzNumber']>(30);
  const [dismissGuestCard, setDismissGuestCard] = useState(false);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const { model, isLoading, error, refresh } = useLeaderboard(selectedJuz);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      setAppActive(next === 'active');
    });
    return () => sub.remove();
  }, []);

  const board = useMemo(() => {
    if (!model) {
      return null;
    }
    return model.boards[view];
  }, [model, view]);

  if (isLoading && !model) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <ActivityIndicator color="#FFFFFF" size="large" />
        <Text className="mt-3 text-base text-brand-50">{t('leaderboard.loading')}</Text>
      </SafeAreaView>
    );
  }

  if (error || !model || !board) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-brand-600 px-6">
        <View className="rounded-3xl bg-white px-5 py-6">
          <Text className="text-2xl font-semibold text-brand-800">{t('leaderboard.title')}</Text>
          <Text className="mt-3 text-base text-brand-600">
            {error ?? t('leaderboard.chooseLearner')}
          </Text>
          <View className="mt-6">
            <PrimaryButton label={t('common.tryAgain')} onPress={() => void refresh()} />
            <PrimaryButton
              label={t('common.backToHome')}
              onPress={() => router.replace('/(app)/home')}
              variant="secondary"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-600">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4 rounded-3xl bg-white px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('leaderboard.headline')}
          </Text>
          <Text className="mt-2 text-3xl font-bold text-brand-800">
            {model.displayName}
          </Text>
          <Text className="mt-2 text-base text-brand-600">{t('leaderboard.effortCounts')}</Text>
          <Text className="mt-3 text-sm font-semibold text-brand-700">
            {t('leaderboard.ptsAge', {
              points: model.effort.totalPoints.toLocaleString(),
              age: t(`age.${model.ageGroup}` as MessageKey),
            })}
          </Text>
        </View>

        <View className="mb-4 rounded-2xl bg-white px-2 py-2">
          <View className="flex-row gap-2">
            {LEADERBOARD_VIEWS.map((item) => {
              const selected = view === item.id;
              const label = viewLabel(item.id, t);
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={label}
                  onPress={() => setView(item.id)}
                  className={`min-h-11 flex-1 items-center justify-center rounded-xl px-2 ${
                    selected ? 'bg-brand-600' : 'bg-brand-50'
                  }`}
                >
                  <Text
                    className={`text-center text-xs font-semibold ${
                      selected ? 'text-white' : 'text-brand-700'
                    }`}
                    numberOfLines={2}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {view === 'juz' ? (
          <View className="mb-4 flex-row flex-wrap gap-2">
            {JUZ_CHALLENGES.map((challenge) => {
              const selected = selectedJuz === challenge.juzNumber;
              return (
                <Pressable
                  key={challenge.juzNumber}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setSelectedJuz(challenge.juzNumber)}
                  className={`min-h-11 rounded-xl px-4 py-3 ${
                    selected ? 'bg-white' : 'bg-brand-700'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selected ? 'text-brand-700' : 'text-white'
                    }`}
                  >
                    {t('common.juz')} {challenge.juzNumber}
                    {challenge.status === 'upcoming' ? t('leaderboard.juzSoonTag') : ''}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View className="mb-4 rounded-3xl bg-white px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('leaderboard.learningNow')}
          </Text>
          {appActive && model.learningNow.length > 0 ? (
            model.learningNow.map((person) => (
              <Text key={person.id} className="mt-2 text-base text-brand-800">
                🟢 {person.displayName}
              </Text>
            ))
          ) : (
            <Text className="mt-2 text-sm text-brand-600">{t('leaderboard.learningNowEmpty')}</Text>
          )}
        </View>

        <YourPositionCard board={board} />

        <View className="mb-4 rounded-3xl bg-white/10 px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-200">
            {t('leaderboard.challenge')}
          </Text>
          {board.motivations.map((message) => (
            <Text key={message.id} className="mt-2 text-base text-white">
              {motivationText(message.id, board, model, t, message.text)}
            </Text>
          ))}
        </View>

        {model.isGuest && !dismissGuestCard ? (
          <KeepJourneyCard
            points={model.effort.totalPoints}
            variant="banner"
            onMaybeLater={() => setDismissGuestCard(true)}
          />
        ) : null}

        <View className="mb-4 rounded-3xl bg-white px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('leaderboard.allTime')}
          </Text>
          <Text className="mt-1 text-sm text-brand-600">{boardSubtitle(board, t)}</Text>
          <Text className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand-400">
            {t('leaderboard.columns')}
          </Text>

          {board.juzStatus === 'upcoming' ? (
            <View className="mt-4 rounded-2xl bg-brand-50 px-4 py-4">
              <Text className="text-base font-semibold text-brand-800">
                {t('leaderboard.juzSoon', { n: board.juzNumber ?? selectedJuz })}
              </Text>
              <Text className="mt-2 text-sm text-brand-600">{t('leaderboard.juzSoonBody')}</Text>
            </View>
          ) : null}

          <View className="mt-4 gap-3">
            {board.entries.length === 0 ? (
              <Text className="text-sm text-brand-600">{t('leaderboard.realEmpty')}</Text>
            ) : (
              board.entries.map((entry) => <RankRow key={entry.id} entry={entry} />)
            )}
          </View>
        </View>

        <View className="rounded-3xl bg-white px-4 py-4">
          <PrimaryButton
            label={t('leaderboard.continue')}
            onPress={() => router.push('/(app)/lesson')}
          />
          {!model.isGuest ? (
            <PrimaryButton
              label={t('leaderboard.openCircle')}
              onPress={() => router.push('/(app)/gates/circle' as never)}
              variant="secondary"
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
