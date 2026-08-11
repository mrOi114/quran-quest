import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/features/auth';

import { JUZ_CHALLENGES, LEADERBOARD_VIEWS, type LeaderboardViewId } from '../constants';
import { useLeaderboard } from '../hooks/useLeaderboard';
import type { LeaderboardBoard, LeaderboardEntry } from '../types';
import { KeepJourneyCard } from './KeepJourneyCard';

function medalForRank(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

function RankRow({ entry }: { entry: LeaderboardEntry }) {
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
          <View className="flex-1">
            <Text className="text-base font-semibold text-brand-800">
              {entry.flag} {entry.displayName}
              {entry.isCurrentUser ? ' (You)' : ''}
            </Text>
            <Text className="mt-1 text-xs text-brand-500">
              Rank {entry.rank} · Country shown only
            </Text>
          </View>
        </View>
        <Text className="text-base font-bold text-brand-700">
          {entry.points.toLocaleString()} pts
        </Text>
      </View>
    </View>
  );
}

function YourPositionCard({ board }: { board: LeaderboardBoard }) {
  const { you } = board;
  return (
    <View className="mb-4 rounded-3xl bg-white px-4 py-4">
      <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
        Your Position
      </Text>
      <Text className="mt-2 text-3xl font-bold text-brand-800">#{you.rank}</Text>
      <Text className="mt-1 text-base text-brand-600">
        {you.points.toLocaleString()} points · {you.totalInBoard} students on this board
      </Text>
      {you.pointsBehindNext != null && you.pointsBehindNext > 0 ? (
        <Text className="mt-3 text-sm font-semibold text-brand-700">
          You are only {you.pointsBehindNext} points behind #{you.rank - 1}.
        </Text>
      ) : null}
      {you.placesMoved != null && you.placesMoved > 0 ? (
        <Text className="mt-2 text-sm font-semibold text-emerald-700">
          ↑ {you.placesMoved} places this week
        </Text>
      ) : null}
      {you.placesMoved != null && you.placesMoved < 0 ? (
        <Text className="mt-2 text-sm font-semibold text-brand-600">
          Keep learning — your next climb starts with one lesson.
        </Text>
      ) : null}
    </View>
  );
}

export function LeaderboardScreen() {
  const router = useRouter();
  const [view, setView] = useState<LeaderboardViewId>('age');
  const [selectedJuz, setSelectedJuz] = useState<(typeof JUZ_CHALLENGES)[number]['juzNumber']>(30);
  const [dismissGuestCard, setDismissGuestCard] = useState(false);
  const { model, isLoading, error, refresh } = useLeaderboard(selectedJuz);

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
        <Text className="mt-3 text-base text-brand-50">Opening the leaderboard…</Text>
      </SafeAreaView>
    );
  }

  if (error || !model || !board) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-brand-600 px-6">
        <View className="rounded-3xl bg-white px-5 py-6">
          <Text className="text-2xl font-semibold text-brand-800">Leaderboard</Text>
          <Text className="mt-3 text-base text-brand-600">
            {error ?? 'Choose a learner profile to see rankings.'}
          </Text>
          <View className="mt-6">
            <PrimaryButton label="Try again" onPress={() => void refresh()} />
            <PrimaryButton
              label="Back to Home"
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
            🏆 Leaderboard
          </Text>
          <Text className="mt-2 text-3xl font-bold text-brand-800">
            {model.flag} {model.displayName}
          </Text>
          <Text className="mt-2 text-base text-brand-600">
            Every genuine learning effort counts — reading, lessons, revision, and
            consistency.
          </Text>
          <Text className="mt-3 text-sm font-semibold text-brand-700">
            {model.effort.totalPoints.toLocaleString()} pts · {model.ageGroupLabel}
          </Text>
        </View>

        <View className="mb-4 rounded-2xl bg-white px-2 py-2">
          <View className="flex-row gap-2">
            {LEADERBOARD_VIEWS.map((item) => {
              const selected = view === item.id;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Open ${item.label} leaderboard`}
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
                    {item.label}
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
                    Juz {challenge.juzNumber}
                    {challenge.status === 'upcoming' ? ' · Soon' : ''}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <YourPositionCard board={board} />

        <View className="mb-4 rounded-3xl bg-white/10 px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-200">
            Challenge
          </Text>
          {board.motivations.map((message) => (
            <Text key={message.id} className="mt-2 text-base text-white">
              {message.text}
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
            {board.title}
          </Text>
          <Text className="mt-1 text-sm text-brand-600">{board.subtitle}</Text>
          <Text className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand-400">
            Rank · Student · Country · Points
          </Text>

          {board.juzStatus === 'upcoming' ? (
            <View className="mt-4 rounded-2xl bg-brand-50 px-4 py-4">
              <Text className="text-base font-semibold text-brand-800">
                Juz {board.juzNumber} Challenge is opening soon
              </Text>
              <Text className="mt-2 text-sm text-brand-600">
                Keep learning Juz 30 — your effort already builds the habits for the next
                challenge.
              </Text>
            </View>
          ) : null}

          <View className="mt-4 gap-3">
            {board.entries.slice(0, 12).map((entry) => (
              <RankRow key={entry.id} entry={entry} />
            ))}
          </View>
        </View>

        <View className="rounded-3xl bg-white px-4 py-4">
          <PrimaryButton
            label="Continue learning"
            onPress={() => router.push('/(app)/lesson')}
          />
          <PrimaryButton
            label="Open Circle"
            onPress={() => router.push('/(app)/gates/circle' as never)}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
