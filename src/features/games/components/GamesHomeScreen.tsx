import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KeepJourneyCard } from '@/features/leaderboard';
import { localizeAchievement, localizeGameDefinition, useI18n } from '@/i18n';

import { useGamesHome } from '../hooks/useGamesHome';
import { GameCategoryTile } from './GameCategoryTile';
import { GamesProgressCard } from './GamesProgressCard';

export function GamesHomeScreen() {
  const router = useRouter();
  const { t, language } = useI18n();
  const { model, isLoading, error, refresh } = useGamesHome();

  if (isLoading || !model) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <ActivityIndicator color="#FFFFFF" size="large" />
        <Text className="mt-3 text-base text-brand-50">{t('games.loading')}</Text>
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
          {t('games.title')}
        </Text>
        <Text className="mt-2 text-3xl font-bold text-white">{t('games.headline')}</Text>
        <Text className="mt-2 text-base text-brand-100">{t('games.tagline')}</Text>

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
          {t('games.chooseAdventure')}
        </Text>
        <View className="gap-3">
          {model.availableGames.map((game) => (
            <GameCategoryTile
              key={game.id}
              game={localizeGameDefinition(game, language)}
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
              {t('games.comingSoon')}
            </Text>
            <View className="gap-3">
              {model.comingSoonGames.map((game) => (
                <GameCategoryTile
                  key={game.id}
                  game={localizeGameDefinition(game, language)}
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
              {t('home.achievements')}
            </Text>
            <View className="mt-3 gap-2">
              {model.achievements.map((id) => {
                const item = localizeAchievement(id, language);
                return (
                  <Text key={id} className="text-base text-brand-800">
                    {item.title} — {item.description}
                  </Text>
                );
              })}
            </View>
          </View>
        ) : null}

        <View className="mt-6 rounded-3xl bg-white/10 px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-100">
            {t('games.alsoPractice')}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.practiceWithAi')}
            onPress={() => router.push('/(app)/companion')}
            className="mt-3 min-h-12 justify-center active:opacity-90"
          >
            <Text className="text-base font-semibold text-white">{t('games.aiDrill')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('nav.circle')}
            onPress={() => router.push('/(app)/gates/circle')}
            className="mt-2 min-h-12 justify-center active:opacity-90"
          >
            <Text className="text-base font-semibold text-white">
              {t('games.circleChallenge')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
