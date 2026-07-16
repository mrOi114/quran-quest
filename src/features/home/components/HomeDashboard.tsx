import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MilestonePrompt, useAuth } from '@/features/auth';

import { useHomeDashboard } from '../hooks/useHomeDashboard';
import { resolveContinueLesson } from '../services';
import { AchievementsSection } from './AchievementsSection';
import { ContinueLearningButton } from './ContinueLearningButton';
import { DailyRevisionCard } from './DailyRevisionCard';
import { GuestAccountReminder } from './GuestAccountReminder';
import { HifzCirclePlaceholder } from './HifzCirclePlaceholder';
import { ParentAccessLink } from './ParentAccessLink';
import { PracticeWithAiButton } from './PracticeWithAiButton';
import { TodaysLessonCard } from './TodaysLessonCard';
import { WelcomeSection } from './WelcomeSection';

export function HomeDashboard() {
  const router = useRouter();
  const {
    activeLearner,
    isGuest,
    showMilestonePrompt,
    dismissGuestMilestone,
    clearActiveLearner,
    endGuestSession,
    signOut,
  } = useAuth();
  const { dashboard, isLoading, refresh } = useHomeDashboard();

  async function handleContinueLearning() {
    if (!activeLearner || !dashboard) {
      return;
    }
    const lesson = await resolveContinueLesson(activeLearner);
    await refresh();
    router.push({
      pathname: '/(app)/lesson',
      params: { lessonId: lesson.lessonId },
    });
  }

  if (isLoading || !dashboard) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <ActivityIndicator color="#FFFFFF" size="large" />
        <Text className="mt-3 text-base text-brand-50">Loading your home…</Text>
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
          paddingBottom: 36,
        }}
        showsVerticalScrollIndicator={false}
      >
        <WelcomeSection
          greetingLine={dashboard.greetingLine}
          encouragement={dashboard.encouragement}
        />

        <ContinueLearningButton
          hasStarted={dashboard.todaysLesson.hasStarted}
          onPress={() => {
            void handleContinueLearning();
          }}
        />

        <TodaysLessonCard lesson={dashboard.todaysLesson} />

        <DailyRevisionCard
          verseCount={dashboard.revisionVerseCount}
          onBegin={() => router.push('/(app)/revision')}
        />

        <PracticeWithAiButton onPress={() => router.push('/(app)/companion')} />

        <HifzCirclePlaceholder />

        <AchievementsSection achievements={dashboard.achievements} />

        {dashboard.showParentAccess ? (
          <ParentAccessLink onPress={() => router.push('/(app)/parent/children')} />
        ) : null}

        {dashboard.showGuestReminder ? (
          <GuestAccountReminder onCreateAccount={() => router.push('/(auth)/register')} />
        ) : null}

        <View className="mt-2 border-t border-white/15 pt-4">
          {isGuest ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="End guest trial"
              onPress={() => {
                void endGuestSession().then(() => router.replace('/(auth)/welcome'));
              }}
              className="min-h-12 items-center justify-center py-2"
            >
              <Text className="text-sm text-brand-100">End guest trial</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  dashboard.isChildSession
                    ? 'Switch learner for parent'
                    : 'Switch learner'
                }
                onPress={() => {
                  void clearActiveLearner().then(() => router.replace('/(app)/family'));
                }}
                className="min-h-12 items-center justify-center py-2"
              >
                <Text className="text-sm text-brand-100">
                  {dashboard.isChildSession
                    ? 'Switch learner (parent)'
                    : 'Switch learner'}
                </Text>
              </Pressable>
              {!dashboard.isChildSession ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Log out"
                  onPress={() => {
                    void signOut().then(() => router.replace('/(auth)/welcome'));
                  }}
                  className="min-h-12 items-center justify-center py-2"
                >
                  <Text className="text-sm text-brand-100">Log out</Text>
                </Pressable>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>

      <MilestonePrompt
        visible={showMilestonePrompt}
        onLater={() => {
          void dismissGuestMilestone();
        }}
      />
    </SafeAreaView>
  );
}
