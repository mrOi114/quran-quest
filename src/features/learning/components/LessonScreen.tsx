import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, useAuth } from '@/features/auth';
import {
  ReaderVerseFocus,
  lessonVerseToReaderViewModel,
  useReaderPreferences,
} from '@/features/reader';
import type { AudioRepeatCount } from '@/types';

import {
  getJuz,
  getJuzForVerse,
  listJuz,
  listSurahsInJuz,
  searchLearningSurahs,
} from '../content';
import { useLessonSession } from '../hooks/useLessonSession';
import { resolveAgeGroup } from '../services/ageGroup';
import { listLessonSummariesForSurah } from '../services/lessonPlanner';
import { loadLearningSnapshot } from '../services/progressService';
import type { LessonSummary, SurahMeta } from '../types';
import { LessonBrowserSheet } from './LessonBrowserSheet';

type LessonScreenProps = {
  lessonKey?: string;
};

function nextRepeat(current: AudioRepeatCount): AudioRepeatCount {
  if (current === '1') return '3';
  if (current === '3') return 'loop';
  return '1';
}

export function LessonScreen({ lessonKey }: LessonScreenProps) {
  const router = useRouter();
  const { activeLearner } = useAuth();
  const {
    preferences,
    setShowTranslation,
    setRepeatCount,
    isLoading: prefsLoading,
  } = useReaderPreferences();
  const {
    session,
    isLoading,
    error,
    activeVerseIndex,
    setActiveVerseIndex,
    markCurrentVerseLearned,
    completeCurrentLesson,
  } = useLessonSession(lessonKey);

  const [playedVerseIds, setPlayedVerseIds] = useState<Record<string, true>>({});
  const [listenHint, setListenHint] = useState<string | null>(null);
  const [browserOpen, setBrowserOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [juzNumber, setJuzNumber] = useState(30);
  const [browseSurahNumber, setBrowseSurahNumber] = useState<number | null>(null);
  const [lessonSummaries, setLessonSummaries] = useState<LessonSummary[]>([]);

  const ageGroup = activeLearner ? resolveAgeGroup(activeLearner) : 'adult_18_plus';
  const encourageListenFirst = ageGroup === 'child_3_6';
  const juzOptions = useMemo(() => listJuz(), []);

  useEffect(() => {
    if (!session || !lessonKey) {
      return;
    }
    if (session.lesson.lessonKey !== lessonKey) {
      router.replace({
        pathname: '/(app)/lesson',
        params: { lessonId: session.lesson.lessonKey },
      });
    }
  }, [lessonKey, router, session]);

  useEffect(() => {
    if (!session) {
      return;
    }
    const juz =
      getJuzForVerse(session.lesson.surahNumber, session.lesson.startAyah) ??
      getJuz(30);
    if (juz) {
      setJuzNumber(juz.number);
    }
    setBrowseSurahNumber(session.lesson.surahNumber);
  }, [session]);

  const filteredSurahs: SurahMeta[] = useMemo(() => {
    if (searchQuery.trim()) {
      return searchLearningSurahs(searchQuery);
    }
    return listSurahsInJuz(juzNumber);
  }, [juzNumber, searchQuery]);

  const refreshLessonSummaries = useCallback(
    async (surahNumber: number) => {
      if (!activeLearner) {
        setLessonSummaries([]);
        return;
      }
      const snapshot = await loadLearningSnapshot(activeLearner);
      setLessonSummaries(listLessonSummariesForSurah(surahNumber, snapshot, ageGroup));
    },
    [activeLearner, ageGroup],
  );

  useEffect(() => {
    if (!browseSurahNumber || !browserOpen) {
      return;
    }
    void refreshLessonSummaries(browseSurahNumber);
  }, [browseSurahNumber, browserOpen, refreshLessonSummaries]);

  const handlePlayedOnce = useCallback((verseId: string) => {
    setPlayedVerseIds((current) =>
      current[verseId] ? current : { ...current, [verseId]: true },
    );
    setListenHint(null);
  }, []);

  const selectVerse = useCallback(
    (index: number) => {
      setListenHint(null);
      setActiveVerseIndex(index);
    },
    [setActiveVerseIndex],
  );

  if ((isLoading || prefsLoading) && !session) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <ActivityIndicator color="#FFFFFF" size="large" />
        <Text className="mt-3 text-base text-brand-50">Opening your lesson…</Text>
      </SafeAreaView>
    );
  }

  if (error && !session) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-brand-50 px-6">
        <Text className="mb-2 text-2xl font-semibold text-brand-800">Lesson</Text>
        <Text className="mb-6 text-base text-brand-600">{error}</Text>
        <PrimaryButton
          label="Back to Home"
          onPress={() => router.replace('/(app)/home')}
        />
      </SafeAreaView>
    );
  }

  if (!session || !activeLearner || !preferences) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-brand-50 px-6">
        <Text className="mb-6 text-base text-brand-600">No lesson available yet.</Text>
        <PrimaryButton
          label="Back to Home"
          onPress={() => router.replace('/(app)/home')}
        />
      </SafeAreaView>
    );
  }

  const activeVerse = session.verses[activeVerseIndex];
  const learnedCount = session.verses.filter(
    (verse) =>
      verse.progress.status === 'learned' || verse.progress.status === 'mastered',
  ).length;
  const isReview = session.mode === 'review';
  const activeLearned =
    activeVerse?.progress.status === 'learned' ||
    activeVerse?.progress.status === 'mastered';

  const readerVerse = activeVerse
    ? lessonVerseToReaderViewModel(activeVerse, activeLearner, preferences)
    : null;
  const hasPlayedOnce = activeVerse ? Boolean(playedVerseIds[activeVerse.id]) : false;

  async function handleComplete() {
    const nextKey = await completeCurrentLesson();
    if (nextKey) {
      router.replace({
        pathname: '/(app)/lesson',
        params: { lessonId: nextKey },
      });
      return;
    }
    router.replace('/(app)/home');
  }

  function handleMarkLearned() {
    if (encourageListenFirst && !hasPlayedOnce && !activeLearned) {
      setListenHint('Listen first, then mark this ayah.');
      return;
    }
    setListenHint(null);
    void markCurrentVerseLearned();
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-600">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Home"
          onPress={() => router.replace('/(app)/home')}
          className="mb-4 min-h-11 justify-center self-start"
        >
          <Text className="text-base text-brand-100">← Home</Text>
        </Pressable>

        <Text
          className="text-center text-3xl text-white"
          style={{ writingDirection: 'rtl' }}
        >
          {session.summary.surahArabic}
        </Text>
        <Text className="mt-1 text-center text-lg text-brand-50">
          {session.summary.surahName}
        </Text>
        <Text className="mt-2 text-center text-base font-medium text-white">
          {session.summary.lessonLabel}
          {isReview ? ' · Review' : ''}
        </Text>
        <Text className="mt-1 text-center text-sm text-brand-100">
          Ayah {session.summary.startAyah}
          {session.summary.endAyah !== session.summary.startAyah
            ? `–${session.summary.endAyah}`
            : ''}
          {' · '}
          {learnedCount}/{session.verses.length} learned
          {' · '}
          Juz {juzNumber}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose Juz, Surah, or lesson"
          onPress={() => setBrowserOpen((value) => !value)}
          className="mt-4 min-h-12 items-center justify-center self-center rounded-2xl bg-white px-5 py-3"
        >
          <Text className="text-base font-semibold text-brand-700">
            {browserOpen ? 'Hide lesson picker' : 'Choose Juz / Surah / Lesson'}
          </Text>
        </Pressable>
        <Text className="mt-2 text-center text-xs text-brand-100">
          All 30 Juz available · {session.verses.length}-ayah Hifz chunks
        </Text>

        <LessonBrowserSheet
          visible={browserOpen}
          juzNumber={juzNumber}
          juzOptions={juzOptions}
          surahs={filteredSurahs}
          selectedSurahNumber={browseSurahNumber}
          lessons={lessonSummaries}
          searchQuery={searchQuery}
          onChangeSearch={setSearchQuery}
          onSelectJuz={(nextJuz) => {
            setSearchQuery('');
            setJuzNumber(nextJuz);
            const first = listSurahsInJuz(nextJuz)[0];
            setBrowseSurahNumber(first?.number ?? null);
          }}
          onSelectSurah={(surahNumber) => {
            setBrowseSurahNumber(surahNumber);
          }}
          onSelectLesson={(nextLessonKey) => {
            router.replace({
              pathname: '/(app)/lesson',
              params: { lessonId: nextLessonKey },
            });
          }}
          onClose={() => setBrowserOpen(false)}
        />

        <View className="mt-5">
          {readerVerse ? (
            <ReaderVerseFocus
              key={readerVerse.id}
              verse={readerVerse}
              ageGroup={ageGroup}
              mode="lesson"
              showTranslation={preferences.showTranslation}
              repeatCount={preferences.repeatCount}
              fontScale={preferences.fontScale}
              onToggleTranslation={() => {
                void setShowTranslation(!preferences.showTranslation);
              }}
              onCycleRepeat={() => {
                void setRepeatCount(nextRepeat(preferences.repeatCount));
              }}
              onPlayedOnce={() => handlePlayedOnce(readerVerse.id)}
            />
          ) : null}
        </View>

        {session.verses.length > 1 ? (
          <View className="mt-4 flex-row flex-wrap justify-center gap-2">
            {session.verses.map((verse, index) => {
              const learned =
                verse.progress.status === 'learned' ||
                verse.progress.status === 'mastered';
              const selected = index === activeVerseIndex;
              return (
                <Pressable
                  key={verse.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Go to ayah ${verse.ayahNumber}`}
                  onPress={() => selectVerse(index)}
                  className={`min-h-11 min-w-11 items-center justify-center rounded-xl px-3 ${
                    selected ? 'bg-white' : learned ? 'bg-brand-400' : 'bg-brand-700'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selected ? 'text-brand-700' : 'text-white'
                    }`}
                  >
                    {verse.ayahNumber}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View className="mt-6 rounded-2xl bg-brand-50 px-4 py-4">
          {error ? <Text className="mb-3 text-sm text-red-700">{error}</Text> : null}
          {listenHint ? (
            <Text className="mb-3 text-center text-sm text-brand-600">{listenHint}</Text>
          ) : null}

          {!isReview && activeVerse && !activeLearned ? (
            <PrimaryButton
              label="I learned this ayah"
              loading={isLoading}
              onPress={handleMarkLearned}
            />
          ) : null}

          {!isReview && session.canCompleteLesson ? (
            <PrimaryButton
              label={session.nextLessonKey ? 'Complete & continue' : 'Complete lesson'}
              loading={isLoading}
              onPress={() => {
                void handleComplete();
              }}
            />
          ) : null}

          {isReview ? (
            <>
              <Text className="mb-3 text-center text-base text-brand-600">
                You can review these ayahs anytime. Next chunks unlock in order within
                this Surah.
              </Text>
              {session.nextLessonKey ? (
                <PrimaryButton
                  label="Continue to next lesson"
                  onPress={() => {
                    const nextLessonKey = session.nextLessonKey;
                    if (!nextLessonKey) {
                      return;
                    }
                    router.replace({
                      pathname: '/(app)/lesson',
                      params: { lessonId: nextLessonKey },
                    });
                  }}
                />
              ) : (
                <PrimaryButton
                  label="Back to Home"
                  onPress={() => router.replace('/(app)/home')}
                />
              )}
            </>
          ) : null}

          {!isReview && !session.canCompleteLesson && activeLearned ? (
            <PrimaryButton
              label="Next ayah"
              variant="secondary"
              disabled={activeVerseIndex >= session.verses.length - 1}
              onPress={() =>
                selectVerse(Math.min(activeVerseIndex + 1, session.verses.length - 1))
              }
            />
          ) : null}
        </View>

        <Text className="mt-4 text-center text-xs text-brand-100">
          Arabic is for memorization. Translation helps understanding only.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
