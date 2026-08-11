import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/features/auth';

import { isGameId } from '../constants';
import { useGameSession } from '../hooks/useGameSession';
import type { GameId } from '../types';
import { AnswerChoices } from './AnswerChoices';
import { FeedbackPanel } from './FeedbackPanel';
import { GameCompletionCard } from './GameCompletionCard';
import { OrderingChallenge } from './OrderingChallenge';

type GamePlayScreenProps = {
  gameIdParam: string;
};

export function GamePlayScreen({ gameIdParam }: GamePlayScreenProps) {
  const router = useRouter();

  if (!isGameId(gameIdParam)) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600 px-6">
        <Text className="text-center text-xl font-bold text-white">Game not found</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(app)/games')}
          className="mt-4 min-h-12 items-center justify-center"
        >
          <Text className="text-base text-brand-100">Back to Games</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return <GamePlayBody gameId={gameIdParam} />;
}

function GamePlayBody({ gameId }: { gameId: GameId }) {
  const router = useRouter();
  const { activeLearner } = useAuth();
  const session = useGameSession({ gameId, learner: activeLearner });

  if (!session.ready || !session.definition) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <ActivityIndicator color="#FFFFFF" size="large" />
      </SafeAreaView>
    );
  }

  if (session.phase === 'complete') {
    return (
      <SafeAreaView className="flex-1 bg-brand-600">
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 40,
          }}
        >
          <GameCompletionCard
            correctCount={session.correctCount}
            totalCount={session.total}
            result={session.result}
            isSaving={session.isSaving}
            onPlayAgain={session.restart}
            onBackToGames={() => router.replace('/(app)/games')}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const current = session.current;
  if (!current) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600 px-6">
        <Text className="text-center text-base text-white">
          No questions are available for this age group yet.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(app)/games')}
          className="mt-4"
        >
          <Text className="text-brand-100">Back to Games</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-600">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to games"
          onPress={() => router.back()}
          className="min-h-11 justify-center"
        >
          <Text className="text-sm font-semibold text-brand-100">← Games</Text>
        </Pressable>

        <Text className="mt-2 text-sm font-semibold uppercase tracking-wide text-brand-100">
          {session.definition.icon} {session.definition.title}
        </Text>
        <Text className="mt-1 text-base text-brand-100">
          Question {session.index + 1} of {session.total}
        </Text>

        <View className="mt-4 h-2 overflow-hidden rounded-full bg-brand-500/40">
          <View
            className="h-full rounded-full bg-white"
            style={{
              width: `${((session.index + 1) / Math.max(session.total, 1)) * 100}%`,
            }}
          />
        </View>

        <View className="mt-5 rounded-3xl bg-white px-4 py-5">
          {current.clue ? (
            <Text className="mb-3 text-base leading-6 text-brand-600">
              “{current.clue}”
            </Text>
          ) : null}
          <Text className="text-2xl font-bold text-brand-800">{current.prompt}</Text>

          {session.phase === 'playing' && current.type === 'ordering' ? (
            <OrderingChallenge
              items={session.orderDraft}
              onMove={session.moveOrderItem}
              onSubmit={session.submitOrdering}
            />
          ) : null}

          {session.phase === 'playing' &&
          (current.type === 'multiple_choice' || current.type === 'clue') &&
          current.choices ? (
            <AnswerChoices choices={current.choices} onSelect={session.submitChoice} />
          ) : null}

          {session.phase === 'feedback' && session.feedback ? (
            <FeedbackPanel
              feedback={session.feedback}
              onRetry={session.retryCurrent}
              onContinue={() => {
                void session.continueAfterFeedback();
              }}
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
