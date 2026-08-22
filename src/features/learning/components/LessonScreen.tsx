import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, useAuth } from '@/features/auth';
import {
  ReaderVerseFocus,
  lessonVerseToReaderViewModel,
  useReaderPreferences,
} from '@/features/reader';
import { localizeLessonTestQuestion, useI18n } from '@/i18n';
import { TafsirLessonPanel, stopTafsirAudio, useTafsirMode } from '@/features/tafsir';
import type { AudioRepeatCount } from '@/types';

import {
  getJuz,
  getJuzForVerse,
  listJuz,
  listSurahsInJuz,
  searchLearningSurahs,
} from '../content';
import { useLessonSession } from '../hooks/useLessonSession';
import { resolveAgeGroup, resolveLearnerAgeYears } from '../services/ageGroup';
import {
  getRequiredPriorLessons,
  listLessonSummariesForSurah,
} from '../services/lessonPlanner';
import {
  buildMasteryQuestions,
  buildUnlockQuestions,
  type AdaptiveQuizOptions,
} from '../services/lessonMastery';
import type { QuizStyle } from '../services/lessonAbility';
import { loadLearningSnapshot } from '../services/progressService';
import type { LessonMasteryResult, LessonSummary, LessonTestQuestion, SurahMeta } from '../types';
import { LessonBrowserSheet } from './LessonBrowserSheet';
import { LessonLockedGate } from './LessonLockedGate';
import { LessonMasteryResultCard } from './LessonMasteryResultCard';
import { LessonMasteryTest } from './LessonMasteryTest';

type LessonScreenProps = {
  lessonKey?: string;
};

type TestKind = 'mastery' | 'unlock';

type TestRun = {
  kind: TestKind;
  style: QuizStyle;
  questions: LessonTestQuestion[];
  index: number;
  correct: number;
  selectedId: string | null;
};

type TestOutcome = LessonMasteryResult & { kind: TestKind; style: QuizStyle };

function nextRepeat(current: AudioRepeatCount): AudioRepeatCount {
  if (current === '1') return '3';
  if (current === '3') return 'loop';
  return '1';
}

export function LessonScreen({ lessonKey }: LessonScreenProps) {
  const router = useRouter();
  const { activeLearner } = useAuth();
  const { language, t, lessonLabel, ayahRange } = useI18n();
  const {
    preferences,
    setShowTranslation,
    setRepeatCount,
    isLoading: prefsLoading,
  } = useReaderPreferences();
  const {
    session,
    openedForLessonKey,
    isLoading,
    error,
    activeVerseIndex,
    setActiveVerseIndex,
    markCurrentVerseLearned,
    submitMasteryTest,
    submitUnlockCheck,
    reload,
  } = useLessonSession(lessonKey);

  const [playedVerseIds, setPlayedVerseIds] = useState<Record<string, true>>({});
  const [listenHint, setListenHint] = useState<string | null>(null);
  const [browserOpen, setBrowserOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [juzNumber, setJuzNumber] = useState(30);
  const [browseSurahNumber, setBrowseSurahNumber] = useState<number | null>(null);
  const [lessonSummaries, setLessonSummaries] = useState<LessonSummary[]>([]);
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [outcome, setOutcome] = useState<TestOutcome | null>(null);
  const [tafsirAutoPlay, setTafsirAutoPlay] = useState(false);
  const submittingRef = useRef(false);
  const tafsir = useTafsirMode();

  useEffect(() => {
    if (tafsir.enabled) {
      return;
    }
    void stopTafsirAudio();
    setTafsirAutoPlay(false);
  }, [tafsir.enabled]);

  const ageGroup = activeLearner ? resolveAgeGroup(activeLearner) : 'adult_18_plus';
  const encourageListenFirst = ageGroup === 'child_3_6';
  const juzOptions = useMemo(() => listJuz(), []);

  useEffect(() => {
    if (!session || !lessonKey) {
      return;
    }
    // Only rewrite the URL after the session for *this* lessonId has loaded.
    // Otherwise a stale session bounces "next lesson" back to the previous one.
    if (openedForLessonKey !== lessonKey) {
      return;
    }
    if (session.mode === 'locked') {
      return;
    }
    if (session.lesson.lessonKey !== lessonKey) {
      router.replace({
        pathname: '/(app)/lesson',
        params: { lessonId: session.lesson.lessonKey },
      });
    }
  }, [lessonKey, openedForLessonKey, router, session]);

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

  useEffect(() => {
    setTestRun(null);
    setOutcome(null);
    setTafsirAutoPlay(false);
    submittingRef.current = false;
  }, [lessonKey]);

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
      setTafsirAutoPlay(false);
      setActiveVerseIndex(index);
    },
    [setActiveVerseIndex],
  );

  const startUnlockCheck = useCallback(async () => {
    if (!session || !activeLearner) {
      return;
    }
    const snapshot = await loadLearningSnapshot(activeLearner);
    const prior = getRequiredPriorLessons(session.lesson, snapshot, ageGroup);
    const options: AdaptiveQuizOptions = {
      ageYears: resolveLearnerAgeYears(activeLearner),
      snapshot,
      style: 'test',
    };
    const questions = buildUnlockQuestions(
      prior.length > 0 ? prior : [session.lesson],
      options,
    );
    if (questions.length === 0) {
      return;
    }
    setOutcome(null);
    setTestRun({
      kind: 'unlock',
      style: 'test',
      questions,
      index: 0,
      correct: 0,
      selectedId: null,
    });
  }, [activeLearner, ageGroup, session]);

  const startMasteryQuiz = useCallback(
    async (style: QuizStyle) => {
      if (!session || !activeLearner) {
        return;
      }
      const snapshot = await loadLearningSnapshot(activeLearner);
      const questions = buildMasteryQuestions(session.lesson, {
        ageYears: resolveLearnerAgeYears(activeLearner),
        snapshot,
        style,
      });
      if (questions.length === 0) {
        return;
      }
      setOutcome(null);
      setTestRun({
        kind: 'mastery',
        style,
        questions,
        index: 0,
        correct: 0,
        selectedId: null,
      });
    },
    [activeLearner, session],
  );

  async function confirmAnswer() {
    if (!testRun || !testRun.selectedId || submittingRef.current) {
      return;
    }
    const current = testRun.questions[testRun.index];
    if (!current) {
      return;
    }
    const nextCorrect =
      testRun.correct + (testRun.selectedId === current.correctChoiceId ? 1 : 0);
    if (testRun.index + 1 < testRun.questions.length) {
      setTestRun({
        ...testRun,
        index: testRun.index + 1,
        correct: nextCorrect,
        selectedId: null,
      });
      return;
    }

    submittingRef.current = true;
    const result =
      testRun.kind === 'unlock'
        ? await submitUnlockCheck(nextCorrect, testRun.questions.length)
        : await submitMasteryTest(nextCorrect, testRun.questions.length);
    submittingRef.current = false;
    if (!result) {
      return;
    }
    setTestRun(null);
    if (testRun.kind === 'mastery' && result.passed && result.nextLessonKey) {
      goToLesson(result.nextLessonKey);
      return;
    }
    setOutcome({ ...result, kind: testRun.kind, style: testRun.style });
  }

  function goToLesson(nextLessonKey: string) {
    setOutcome(null);
    setTestRun(null);
    router.replace({
      pathname: '/(app)/lesson',
      params: { lessonId: nextLessonKey },
    });
  }

  async function handleOutcomeContinue() {
    if (!outcome || !session) {
      return;
    }
    if (outcome.kind === 'unlock' && outcome.passed) {
      setOutcome(null);
      await reload();
      return;
    }
    if (outcome.passed && outcome.nextLessonKey) {
      goToLesson(outcome.nextLessonKey);
      return;
    }
    if (outcome.passed) {
      router.replace('/(app)/progress');
      return;
    }
    if (outcome.practiceLessonKey && outcome.practiceLessonKey !== session.lesson.lessonKey) {
      goToLesson(outcome.practiceLessonKey);
      return;
    }
    setOutcome(null);
  }

  if ((isLoading || prefsLoading) && !session) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <ActivityIndicator color="#FFFFFF" size="large" />
        <Text className="mt-3 text-base text-brand-50">{t('lesson.loading')}</Text>
      </SafeAreaView>
    );
  }

  if (error && !session) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-brand-50 px-6">
        <Text className="mb-2 text-2xl font-semibold text-brand-800">{t('lesson.title')}</Text>
        <Text className="mb-6 text-base text-brand-600">{error}</Text>
        <PrimaryButton
          label={t('common.backToHome')}
          onPress={() => router.replace('/(app)/home')}
        />
      </SafeAreaView>
    );
  }

  if (!session || !activeLearner || !preferences) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-brand-50 px-6">
        <Text className="mb-6 text-base text-brand-600">{t('lesson.none')}</Text>
        <PrimaryButton
          label={t('common.backToHome')}
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
  const isLocked = session.mode === 'locked';
  const showingTest = Boolean(testRun) || Boolean(outcome);
  const activeLearned =
    activeVerse?.progress.status === 'learned' ||
    activeVerse?.progress.status === 'mastered';

  const readerVerse = activeVerse
    ? lessonVerseToReaderViewModel(activeVerse, activeLearner, preferences)
    : null;
  const hasPlayedOnce = activeVerse ? Boolean(playedVerseIds[activeVerse.id]) : false;
  const currentQuestion = testRun?.questions[testRun.index]
    ? localizeLessonTestQuestion(testRun.questions[testRun.index]!, language)
    : null;

  function handleMarkLearned() {
    if (encourageListenFirst && !hasPlayedOnce && !activeLearned) {
      setListenHint(t('lesson.listenFirst'));
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
          accessibilityLabel={t('common.backToHome')}
          onPress={() => router.replace('/(app)/home')}
          className="mb-4 min-h-11 justify-center self-start"
        >
          <Text className="text-base text-brand-100">← {t('nav.home')}</Text>
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
          {lessonLabel(session.summary.lessonIndex)}
          {isReview ? ` · ${t('lesson.review')}` : ''}
          {isLocked ? ` · ${t('common.locked')}` : ''}
        </Text>
        <Text className="mt-1 text-center text-sm text-brand-100">
          {ayahRange(session.summary.startAyah, session.summary.endAyah)}
          {' · '}
          {t('lesson.learnedCount', {
            learned: learnedCount,
            total: session.verses.length,
          })}
          {' · '}
          {t('lesson.juz', { n: juzNumber })}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('lesson.chooseA11y')}
          onPress={() => setBrowserOpen((value) => !value)}
          className="mt-4 min-h-12 items-center justify-center self-center rounded-2xl bg-white px-5 py-3"
        >
          <Text className="text-base font-semibold text-brand-700">
            {browserOpen ? t('lesson.hidePicker') : t('lesson.choosePicker')}
          </Text>
        </Pressable>
        <Text className="mt-2 text-center text-xs text-brand-100">
          {t('lesson.chunksHint', { count: session.verses.length })}
        </Text>

        <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
          <View className="flex-1 pr-3">
            <Text className="text-sm font-semibold text-white">{t('tafsir.toggleLabel')}</Text>
            <Text className="mt-1 text-xs text-brand-100">{t('tafsir.hifzNote')}</Text>
          </View>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: tafsir.enabled }}
            onPress={() => {
              const next = !tafsir.enabled;
              if (!next) {
                void stopTafsirAudio();
                setTafsirAutoPlay(false);
              }
              void tafsir.setEnabled(next);
            }}
            className={`min-h-11 min-w-[84px] items-center justify-center rounded-xl px-3 ${
              tafsir.enabled ? 'bg-white' : 'bg-brand-700'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                tafsir.enabled ? 'text-brand-700' : 'text-white'
              }`}
            >
              {tafsir.enabled ? t('tafsir.on') : t('tafsir.off')}
            </Text>
          </Pressable>
        </View>

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
            goToLesson(nextLessonKey);
          }}
          onClose={() => setBrowserOpen(false)}
        />

        {isLocked && !showingTest ? (
          <LessonLockedGate
            lessonLabel={lessonLabel(session.summary.lessonIndex)}
            onStartCheck={() => {
              void startUnlockCheck();
            }}
            onGoBack={() => {
              if (session.unlockPracticeLessonKey) {
                goToLesson(session.unlockPracticeLessonKey);
                return;
              }
              router.replace('/(app)/home');
            }}
          />
        ) : null}

        {currentQuestion && testRun ? (
          <LessonMasteryTest
            key={currentQuestion.id}
            title={
              testRun.kind === 'unlock'
                ? t('test.unlockTitle')
                : testRun.style === 'game'
                  ? t('test.gameTitle')
                  : t('test.title')
            }
            subtitle={
              testRun.kind === 'unlock'
                ? t('test.unlockSubtitle')
                : testRun.style === 'game'
                  ? t('test.gameSubtitle')
                  : t('test.subtitle')
            }
            question={currentQuestion}
            questionNumber={testRun.index + 1}
            questionCount={testRun.questions.length}
            selectedChoiceId={testRun.selectedId}
            disabled={isLoading}
            onSelectChoice={(choiceId) => {
              setTestRun({ ...testRun, selectedId: choiceId });
            }}
            onConfirm={() => {
              void confirmAnswer();
            }}
          />
        ) : null}

        {outcome ? (
          <LessonMasteryResultCard
            passed={outcome.passed}
            percent={outcome.percent}
            correctCount={outcome.correctCount}
            totalCount={outcome.totalCount}
            message={outcome.message}
            hasNextLesson={Boolean(
              outcome.kind === 'unlock'
                ? outcome.passed
                : outcome.nextLessonKey,
            )}
            onContinue={() => {
              void handleOutcomeContinue();
            }}
            onRetry={() => {
              if (outcome.kind === 'unlock') {
                void startUnlockCheck();
                return;
              }
              void startMasteryQuiz(outcome.style);
            }}
            onPractice={() => {
              void handleOutcomeContinue();
            }}
          />
        ) : null}

        {!isLocked && !showingTest ? (
          <>
            <View className="mt-5">
              {readerVerse ? (
                <>
                <ReaderVerseFocus
                  key={readerVerse.id}
                  verse={readerVerse}
                  ageGroup={ageGroup}
                  mode="lesson"
                  showTranslation={preferences.showTranslation}
                  repeatCount={preferences.repeatCount}
                  fontScale={preferences.fontScale}
                  quranLayerTitle={tafsir.enabled ? t('tafsir.quranArabic') : undefined}
                  quranLayerSubtitle={tafsir.enabled ? t('tafsir.quranEnglish') : undefined}
                  meaningHeading={
                    tafsir.enabled ? t('tafsir.meaningHeading') : undefined
                  }
                  onToggleTranslation={() => {
                    void setShowTranslation(!preferences.showTranslation);
                  }}
                  onCycleRepeat={() => {
                    void setRepeatCount(nextRepeat(preferences.repeatCount));
                  }}
                  onPlayedOnce={() => handlePlayedOnce(readerVerse.id)}
                  onPlaybackComplete={() => {
                    if (tafsir.enabled && !isReview) {
                      setTafsirAutoPlay(true);
                    }
                  }}
                  onPrevious={
                    tafsir.enabled
                      ? () => selectVerse(Math.max(0, activeVerseIndex - 1))
                      : undefined
                  }
                  onNext={
                    tafsir.enabled
                      ? () =>
                          selectVerse(
                            Math.min(session.verses.length - 1, activeVerseIndex + 1),
                          )
                      : undefined
                  }
                  canGoPrevious={tafsir.enabled ? activeVerseIndex > 0 : undefined}
                  canGoNext={
                    tafsir.enabled
                      ? activeVerseIndex < session.verses.length - 1
                      : undefined
                  }
                />
                {tafsir.enabled && activeVerse ? (
                  <TafsirLessonPanel
                    verseId={activeVerse.id}
                    surahNumber={activeVerse.surahNumber}
                    ayahNumber={activeVerse.ayahNumber}
                    lessonIndex={session.summary.lessonIndex}
                    startAyah={session.summary.startAyah}
                    endAyah={session.summary.endAyah}
                    canGoPrevious={activeVerseIndex > 0}
                    canGoNext={activeVerseIndex < session.verses.length - 1}
                    autoPlay={tafsirAutoPlay && !isReview}
                    progress={tafsir.verseProgress(activeVerse.id)}
                    onPrevious={() => selectVerse(Math.max(0, activeVerseIndex - 1))}
                    onNext={() =>
                      selectVerse(Math.min(session.verses.length - 1, activeVerseIndex + 1))
                    }
                    onListenProgress={(currentTime, duration, completed) => {
                      void tafsir.saveListenProgress(
                        activeVerse.id,
                        currentTime,
                        duration,
                        completed,
                      );
                    }}
                    onUnderstanding={(correct) => {
                      void tafsir.saveUnderstanding(activeVerse.id, correct);
                    }}
                  />
                ) : null}
                </>
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
                      accessibilityLabel={t('lesson.goToAyah', { ayah: verse.ayahNumber })}
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
                  label={t('lesson.iLearned')}
                  loading={isLoading}
                  onPress={handleMarkLearned}
                />
              ) : null}

              {!isReview && session.canCompleteLesson ? (
                <PrimaryButton
                  label={t('lesson.nextLesson')}
                  loading={isLoading}
                  onPress={() => {
                    void startMasteryQuiz('test');
                  }}
                />
              ) : null}

              {isReview ? (
                <>
                  <Text className="mb-3 text-center text-base text-brand-600">
                    {t('lesson.reviewHelp')}
                  </Text>
                  {session.nextLessonKey ? (
                    <PrimaryButton
                      label={t('lesson.nextLesson')}
                      onPress={() => {
                        const nextLessonKey = session.nextLessonKey;
                        if (!nextLessonKey) {
                          return;
                        }
                        goToLesson(nextLessonKey);
                      }}
                    />
                  ) : (
                    <PrimaryButton
                      label={t('test.seeProgress')}
                      onPress={() => router.replace('/(app)/progress')}
                    />
                  )}
                </>
              ) : null}

              {!isReview && !session.canCompleteLesson && activeLearned ? (
                <PrimaryButton
                  label={t('lesson.nextAyah')}
                  variant="secondary"
                  disabled={activeVerseIndex >= session.verses.length - 1}
                  onPress={() =>
                    selectVerse(Math.min(activeVerseIndex + 1, session.verses.length - 1))
                  }
                />
              ) : null}
            </View>
          </>
        ) : null}

        <Text className="mt-4 text-center text-xs text-brand-100">
          {t('lesson.arabicNote')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
