import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MilestonePrompt, useAuth } from '@/features/auth';
import { FamilyCommsEntry } from '@/features/family-comms';
import { useTafsirMode } from '@/features/tafsir';
import { useI18n } from '@/i18n';

import { useHomeDashboard } from '../hooks/useHomeDashboard';
import { resolveContinueLesson } from '../services';
import { AchievementsSection } from './AchievementsSection';
import { ContinueLearningButton } from './ContinueLearningButton';
import { DailyRevisionCard } from './DailyRevisionCard';
import { GuestAccountReminder } from './GuestAccountReminder';
import { HifzCirclePlaceholder } from './HifzCirclePlaceholder';
import { LearningModeChooser } from './LearningModeChooser';
import { ParentAccessLink } from './ParentAccessLink';
import { PracticeWithAiButton } from './PracticeWithAiButton';
import { ReadJuz30Button } from './ReadJuz30Button';
import { TodaysLessonCard } from './TodaysLessonCard';
import { WelcomeSection } from './WelcomeSection';

export function HomeDashboard() {
  const router = useRouter();
  const {
    activeLearner,
    profile,
    isGuest,
    isChildFamilySession,
    showMilestonePrompt,
    dismissGuestMilestone,
    clearActiveLearner,
    endChildFamilySession,
    endGuestSession,
    signOut,
  } = useAuth();
  const { dashboard, isLoading, refresh } = useHomeDashboard();
  const { t } = useI18n();
  const tafsir = useTafsirMode();

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
        <Text className="mt-3 text-base text-brand-50">{t('home.loading')}</Text>
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

        <View className="mb-4 rounded-3xl bg-white px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            QuranFamily
          </Text>
          <Text className="mt-2 text-2xl font-bold text-brand-800">
            {dashboard.xpPoints} XP
          </Text>
          <Text className="mt-1 text-sm text-brand-600">
            {t('home.xpKeepGoing', { xp: dashboard.nextMilestoneXp })}
          </Text>
          <View className="mt-4 h-3 overflow-hidden rounded-full bg-brand-100">
            <View
              className="h-full rounded-full bg-brand-500"
              style={{
                width: `${Math.max(
                  8,
                  Math.min(100, (dashboard.xpPoints / dashboard.nextMilestoneXp) * 100),
                )}%`,
              }}
            />
          </View>
        </View>

        <ContinueLearningButton
          hasStarted={dashboard.todaysLesson.hasStarted}
          onPress={() => {
            void handleContinueLearning();
          }}
        />

        <LearningModeChooser
          tafsirEnabled={tafsir.enabled}
          onReadQuran={() => router.push('/(app)/reader')}
          onQuranAudio={() =>
            router.push({
              pathname: '/(app)/reader',
              params: { mode: 'listen' },
            })
          }
          onSomaliMeaningAudio={() =>
            router.push({
              pathname: '/(app)/reader',
              params: { mode: 'meaning' },
            })
          }
          onSomaliTafsir={() => {
            void tafsir.setEnabled(true).then(() => handleContinueLearning());
          }}
          onToggleTafsir={(enabled) => {
            void tafsir.setEnabled(enabled);
          }}
        />

        <TodaysLessonCard
          lesson={dashboard.todaysLesson}
          onPress={() => {
            void handleContinueLearning();
          }}
        />

        <ReadJuz30Button onPress={() => router.push('/(app)/reader')} />

        <DailyRevisionCard
          verseCount={dashboard.revisionVerseCount}
          onBegin={() => router.push('/(app)/revision')}
        />

        <PracticeWithAiButton onPress={() => router.push('/(app)/companion')} />

        <HifzCirclePlaceholder
          title={dashboard.circlePreview.title}
          subtitle={dashboard.circlePreview.subtitle}
          trackLabel={dashboard.circlePreview.trackLabel}
          roomCountLabel={dashboard.circlePreview.roomCountLabel}
          onPress={() => router.push('/(app)/gates/circle')}
        />

        {!isGuest &&
        (profile?.role === 'parent' ||
          profile?.role === 'child' ||
          activeLearner?.role === 'child' ||
          activeLearner?.role === 'parent') ? (
          <FamilyCommsEntry />
        ) : null}

        <View className="mb-4 rounded-2xl bg-white px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('home.translationSpotlight')}
          </Text>
          <Text
            className="mt-3 text-center text-3xl font-bold text-brand-800"
            style={{ writingDirection: 'rtl' }}
          >
            {dashboard.featuredVerse.textUthmani}
          </Text>
          <Text className="mt-2 text-center text-base text-brand-600">
            {t('home.ayahRef', {
              arabic: dashboard.featuredVerse.surahArabic,
              name: dashboard.featuredVerse.surahName,
              ayah: dashboard.featuredVerse.ayahNumber,
            })}
          </Text>
          <Text className="mt-4 text-base leading-6 text-brand-700">
            {dashboard.featuredVerse.translationText}
          </Text>
          {dashboard.featuredVerse.translationFootnotes ? (
            <Text className="mt-2 text-sm leading-5 text-brand-500">
              {dashboard.featuredVerse.translationFootnotes}
            </Text>
          ) : null}
          {dashboard.featuredVerse.translationAttribution &&
          !dashboard.featuredVerse.isTranslationFallback ? (
            <View className="mt-2">
              <Text className="text-xs font-semibold uppercase tracking-wide text-brand-400">
                {t('reader.somaliMeaning')}
              </Text>
              <Text className="mt-1 text-xs text-brand-500">
                {dashboard.featuredVerse.translationAttribution.translator}
              </Text>
              <Text className="text-xs text-brand-500">
                {t('reader.attributionSource', {
                  source: dashboard.featuredVerse.translationAttribution.source,
                })}
              </Text>
              <Text className="text-xs text-brand-500">
                {t('reader.attributionKey', {
                  key: dashboard.featuredVerse.translationAttribution.translationKey,
                })}
              </Text>
              <Text className="text-xs text-brand-500">
                {t('reader.attributionVersion', {
                  version: dashboard.featuredVerse.translationAttribution.version,
                })}
              </Text>
            </View>
          ) : (
            <Text className="mt-2 text-xs text-brand-500">
              {t('home.source', { source: dashboard.featuredVerse.translationSourceLabel })}
              {dashboard.featuredVerse.isTranslationFallback
                ? ` · ${t('language.englishUntilAvailable')}`
                : ''}
            </Text>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.openReaderAyah')}
            onPress={() =>
              router.push({
                pathname: '/(app)/reader',
                params: {
                  surah: String(dashboard.featuredVerse.surahNumber),
                  ayah: String(dashboard.featuredVerse.ayahNumber),
                },
              })
            }
            className="mt-4 min-h-12 items-center justify-center rounded-xl bg-brand-600 px-4 py-3 active:opacity-90"
          >
            <Text className="text-base font-semibold text-white">{t('home.openInReader')}</Text>
          </Pressable>
        </View>

        <AchievementsSection achievements={dashboard.achievements} />

        {dashboard.showParentAccess ? (
          <ParentAccessLink onPress={() => router.push('/(app)/parent/dashboard')} />
        ) : null}

        {dashboard.showGuestReminder ? (
          <GuestAccountReminder onCreateAccount={() => router.push('/(auth)/register')} />
        ) : null}

        <View className="mt-2 border-t border-white/15 pt-4">
          {isGuest ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.endGuestTrial')}
              onPress={() => {
                void endGuestSession().then(() => router.replace('/(auth)/welcome'));
              }}
              className="min-h-12 items-center justify-center py-2"
            >
              <Text className="text-sm text-brand-100">{t('common.endGuestTrial')}</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  dashboard.isChildSession
                    ? t('common.switchLearnerParent')
                    : t('common.switchLearner')
                }
                onPress={() => {
                  if (isChildFamilySession) {
                    void endChildFamilySession().then(() =>
                      router.replace('/(auth)/child-entry'),
                    );
                    return;
                  }
                  void clearActiveLearner().then(() =>
                    router.replace('/(app)/family/learners'),
                  );
                }}
                className="min-h-12 items-center justify-center py-2"
              >
                <Text className="text-sm text-brand-100">
                  {dashboard.isChildSession
                    ? t('common.switchLearnerParent')
                    : t('common.switchLearner')}
                </Text>
              </Pressable>
              {!dashboard.isChildSession ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('common.logOut')}
                  onPress={() => {
                    void signOut().then(() => router.replace('/(auth)/welcome'));
                  }}
                  className="min-h-12 items-center justify-center py-2"
                >
                  <Text className="text-sm text-brand-100">{t('common.logOut')}</Text>
                </Pressable>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>

      <MilestonePrompt
        visible={showMilestonePrompt}
        pointsEarned={dashboard.xpPoints}
        onLater={() => {
          void dismissGuestMilestone();
        }}
      />
    </SafeAreaView>
  );
}
