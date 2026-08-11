import { Pressable, Text, View } from 'react-native';

import { ACHIEVEMENT_DEFINITIONS } from '../constants';
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
  return (
    <View className="rounded-3xl bg-white px-5 py-6">
      <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
        Challenge Complete
      </Text>
      <Text className="mt-2 text-3xl font-bold text-brand-800">🌟 Well done!</Text>
      <Text className="mt-2 text-base leading-6 text-brand-600">
        You got {correctCount} of {totalCount} right. Keep learning with kindness and
        curiosity.
      </Text>

      {isSaving ? (
        <Text className="mt-4 text-sm text-brand-500">Saving your progress…</Text>
      ) : null}

      {result && !result.alreadyCompleted && result.pointsAwarded > 0 ? (
        <Text className="mt-4 text-base font-semibold text-brand-700">
          +{result.pointsAwarded} XP added to your learning journey
        </Text>
      ) : null}

      {result?.alreadyCompleted ? (
        <Text className="mt-4 text-sm text-brand-600">
          You already earned today’s XP for this game. Practice still helps you learn!
        </Text>
      ) : null}

      {result && result.newlyUnlockedAchievements.length > 0 ? (
        <View className="mt-4 gap-2">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            New achievements
          </Text>
          {result.newlyUnlockedAchievements.map((id) => {
            const item = ACHIEVEMENT_DEFINITIONS[id];
            return (
              <Text key={id} className="text-base text-brand-800">
                {item.icon} {item.title}
              </Text>
            );
          })}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Play again"
        onPress={onPlayAgain}
        className="mt-5 min-h-12 items-center justify-center rounded-xl bg-brand-600 px-4 py-3 active:opacity-90"
      >
        <Text className="text-base font-semibold text-white">Play Again</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to games"
        onPress={onBackToGames}
        className="mt-2 min-h-12 items-center justify-center"
      >
        <Text className="text-sm font-semibold text-brand-600">Back to Games</Text>
      </Pressable>
    </View>
  );
}
