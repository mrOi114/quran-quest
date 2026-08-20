import { Pressable, Text, View } from 'react-native';

import { localizeAchievement, useI18n } from '@/i18n';

import type { GameSessionResult } from '../types';

type GameCompletionCardProps = {
  correctCount: number;
  totalCount: number;
  result: GameSessionResult | null;
  isSaving?: boolean;
  onPlayAgain: () => void;
  onBackToGames: () => void;
};

export function GameCompletionCard({
  correctCount,
  totalCount,
  result,
  isSaving,
  onPlayAgain,
  onBackToGames,
}: GameCompletionCardProps) {
  const { t, language } = useI18n();
  return (
    <View className="rounded-3xl bg-white px-5 py-6">
      <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
        {t('games.challengeComplete')}
      </Text>
      <Text className="mt-2 text-3xl font-bold text-brand-800">{t('games.wellDone')}</Text>
      <Text className="mt-2 text-base leading-6 text-brand-600">
        {t('games.gotRight', { correct: correctCount, total: totalCount })}
      </Text>

      {isSaving ? (
        <Text className="mt-4 text-sm text-brand-500">{t('games.saving')}</Text>
      ) : null}

      {result && !result.alreadyCompleted && result.pointsAwarded > 0 ? (
        <Text className="mt-4 text-base font-semibold text-brand-700">
          {t('games.xpAdded', { xp: result.pointsAwarded })}
        </Text>
      ) : null}

      {result?.alreadyCompleted ? (
        <Text className="mt-4 text-sm text-brand-600">{t('games.alreadyXp')}</Text>
      ) : null}

      {result && result.newlyUnlockedAchievements.length > 0 ? (
        <View className="mt-4 gap-2">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('games.newAchievements')}
          </Text>
          {result.newlyUnlockedAchievements.map((id) => {
            const item = localizeAchievement(id, language);
            return (
              <Text key={id} className="text-base text-brand-800">
                {item.title}
              </Text>
            );
          })}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('games.playAgain')}
        onPress={onPlayAgain}
        className="mt-5 min-h-12 items-center justify-center rounded-xl bg-brand-600 px-4 py-3 active:opacity-90"
      >
        <Text className="text-base font-semibold text-white">{t('games.playAgain')}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('games.backToGames')}
        onPress={onBackToGames}
        className="mt-2 min-h-12 items-center justify-center"
      >
        <Text className="text-sm font-semibold text-brand-600">{t('games.backToGames')}</Text>
      </Pressable>
    </View>
  );
}
