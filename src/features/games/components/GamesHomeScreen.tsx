import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KeepJourneyCard } from '@/features/leaderboard';

import { ACHIEVEMENT_DEFINITIONS } from '../constants';
import { useGamesHome } from '../hooks/useGamesHome';
import { GameCategoryTile } from './GameCategoryTile';
import { GamesProgressCard } from './GamesProgressCard';

export function GamesHomeScreen() {
  const router = useRouter();
  const { model, isLoading, error, refresh } = useGamesHome();

  if (isLoading || !model) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <ActivityIndicator color="#FFFFFF" size="large" />
        <Text className="mt-3 text-base text-brand-50">Loading games…</Text>
        {error ? (
          <Text className="mt-2 px-6 text-center text-sm text-brand-100">{error}</Text>
        ) : null}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-600">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-100">
          Games
        </Text>
        <Text className="mt-2 text-3xl font-bold text-white">Islamic Learning</Text>
        <Text className="mt-2 text-base text-brand-100">
          Learn Islam. Play. Discover. Grow.
        </Text>

        <View className="mt-5">
          <GamesProgressCard
            xpPoints={model.xpPoints}
            gamesCompleted={model.gamesCompleted}
            achievements={model.achievementsUnlocked}
            streakDays={model.streakDays}
          />
        </View>

        {model.showKeepJourney ? (
          <View className="mt-4">
            <KeepJourneyCard
              points={model.xpPoints}
              variant="banner"
              onMaybeLater={() => {
                void refresh();
              }}
            />
          </View>
        ) : null}

        <Text className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-brand-100">
          Choose your adventure
        </Text>
        <View className="gap-3">
          {model.availableGames.map((game) => (
            <GameCategoryTile
              key={game.id}
              game={game}
              onPress={() =>
                router.push({
                  pathname: '/(app)/games/[gameId]',
                  params: { gameId: game.id },
                })
              }
            />
          ))}
        </View>

        {model.comingSoonGames.length > 0 ? (
          <>
            <Text className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-brand-100">
              Coming soon
            </Text>
            <View className="gap-3">
              {model.comingSoonGames.map((game) => (
                <GameCategoryTile
                  key={game.id}
                  game={game}
                  locked
                  onPress={() => undefined}
                />
              ))}
            </View>
          </>
        ) : null}

        {model.achievements.length > 0 ? (
          <View className="mt-6 rounded-3xl bg-white px-4 py-4">
            <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
              Achievements
            </Text>
            <View className="mt-3 gap-2">
              {model.achievements.map((id) => {
                const item = ACHIEVEMENT_DEFINITIONS[id];
                return (
                  <Text key={id} className="text-base text-brand-800">
                    {item.icon} {item.title} — {item.description}
                  </Text>
                );
              })}
            </View>
          </View>
        ) : null}

        <View className="mt-6 rounded-3xl bg-white/10 px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-100">
            Also practice
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open AI companion"
            onPress={() => router.push('/(app)/companion')}
            className="mt-3 min-h-12 justify-center active:opacity-90"
          >
            <Text className="text-base font-semibold text-white">
              🤖 AI Companion Drill
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open circle"
            onPress={() => router.push('/(app)/gates/circle')}
            className="mt-2 min-h-12 justify-center active:opacity-90"
          >
            <Text className="text-base font-semibold text-white">
              👥 Circle Challenge
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
