import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useI18n } from '@/i18n';

import { useQisasAudio } from '../hooks/useQisasAudio';
import { useQisasProgress } from '../hooks/useQisasProgress';
import { useQisasQuiz } from '../hooks/useQisasQuiz';
import { getNarrator } from '../content/narrators';
import { getQisasStory } from '../content';
import { audioSlotForLanguage } from '../services/catalog';
import { isLicensedAudioSlot, licensedAudioUrl } from '../services/permission';
import { localizeText } from '../services/localize';
import type { QisasLanguage, QisasMode, QisasNarratorId, QisasQuestion } from '../types';
import { QisasAudioControls } from './QisasAudioControls';
import { QisasQuizPanel } from './QisasQuizPanel';

type QisasStoryScreenProps = {
  storyId: string;
};

const EMPTY_QUESTIONS: QisasQuestion[] = [];

const MODES: { id: QisasMode; labelKey: 'qisas.read' | 'qisas.listen' | 'qisas.learn' | 'qisas.play' }[] =
  [
    { id: 'read', labelKey: 'qisas.read' },
    { id: 'listen', labelKey: 'qisas.listen' },
    { id: 'learn', labelKey: 'qisas.learn' },
    { id: 'play', labelKey: 'qisas.play' },
  ];

export function QisasStoryScreen({ storyId }: QisasStoryScreenProps) {
  const router = useRouter();
  const { t, language: uiLanguage } = useI18n();
  const story = getQisasStory(storyId);
  const [language, setLanguage] = useState<QisasLanguage>(
    uiLanguage === 'so' ? 'so' : 'en',
  );
  const [mode, setMode] = useState<QisasMode>('read');
  const [chapterIndex, setChapterIndex] = useState(0);
  const progressApi = useQisasProgress(storyId, language);
  const learnQuiz = useQisasQuiz(story?.learnQuestions ?? EMPTY_QUESTIONS, language, {
    onComplete: (correct, total) => progressApi.recordLearn(total, correct),
  });
  const playQuiz = useQisasQuiz(story?.gameQuestions ?? EMPTY_QUESTIONS, language, {
    onComplete: () => progressApi.markGameComplete(),
  });

  useEffect(() => {
    if (mode === 'read') {
      progressApi.markRead();
    }
  }, [mode, progressApi.markRead]);

  const audioSlot = story ? audioSlotForLanguage(story, language) : null;
  const licensedUrl = audioSlot ? licensedAudioUrl(audioSlot) : null;
  const licensed = audioSlot ? isLicensedAudioSlot(audioSlot) : false;
  const narrator = audioSlot
    ? getNarrator(audioSlot.narratorId as QisasNarratorId)
    : null;
  const chapter = story?.chapters[chapterIndex];

  const audio = useQisasAudio({
    audioUrl: mode === 'listen' ? licensedUrl : null,
    metadata: story
      ? {
          title: localizeText(story.title, language),
          artist: narrator?.name,
          albumTitle: 'Qisas al-Anbiya',
        }
      : undefined,
    onPlaybackComplete: () => {
      progressApi.markListenComplete();
    },
  });

  const fullStoryText = useMemo(() => {
    if (!story) {
      return '';
    }
    return story.chapters
      .map((item) => `${localizeText(item.title, language)}\n\n${localizeText(item.body, language)}`)
      .join('\n\n');
  }, [language, story]);

  if (!story || !chapter) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600 px-6">
        <Text className="text-center text-xl font-bold text-white">{t('qisas.notFound')}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(app)/qisas' as never)}
          className="mt-4 min-h-12 items-center justify-center"
        >
          <Text className="text-base text-brand-100">{t('qisas.backToStories')}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const chapterCount = story.chapters.length;

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
          accessibilityLabel={t('qisas.backToStories')}
          onPress={() => router.back()}
          className="min-h-11 justify-center"
        >
          <Text className="text-sm font-semibold text-brand-100">← {t('qisas.seriesTitle')}</Text>
        </Pressable>

        <Text className="mt-2 text-sm font-semibold uppercase tracking-wide text-brand-100">
          {t('qisas.seriesTitle')}
        </Text>
        <Text className="mt-2 text-3xl font-bold text-white">
          {localizeText(story.title, language)}
        </Text>
        <Text className="mt-1 text-base text-brand-100">
          {t('qisas.prophet')}: {localizeText(story.prophetName, language)}
        </Text>
        <Text className="mt-2 text-sm text-brand-100">{t('qisas.notQuran')}</Text>

        <Text className="mb-2 mt-5 text-sm font-semibold uppercase tracking-wide text-brand-100">
          {t('qisas.chooseLanguage')}
        </Text>
        <View className="flex-row gap-2">
          {(['en', 'so'] as const).map((code) => (
            <Pressable
              key={code}
              accessibilityRole="button"
              accessibilityLabel={code === 'en' ? t('qisas.english') : t('qisas.somali')}
              onPress={() => {
                setLanguage(code);
                setChapterIndex(0);
                void audio.stop();
              }}
              className={`min-h-12 flex-1 items-center justify-center rounded-2xl px-3 ${
                language === code ? 'bg-white' : 'bg-white/15'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  language === code ? 'text-brand-800' : 'text-white'
                }`}
              >
                {code === 'en' ? t('qisas.english') : t('qisas.somali')}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-4 flex-row flex-wrap gap-2">
          {MODES.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={t(item.labelKey)}
              onPress={() => {
                setMode(item.id);
                progressApi.setLastMode(item.id);
                if (item.id !== 'listen') {
                  void audio.stop();
                }
                if (item.id === 'read') {
                  progressApi.markRead();
                }
              }}
              className={`min-h-12 min-w-[46%] flex-1 items-center justify-center rounded-2xl px-3 ${
                mode === item.id ? 'bg-white' : 'bg-white/15'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  mode === item.id ? 'text-brand-800' : 'text-white'
                }`}
              >
                {t(item.labelKey)}
              </Text>
            </Pressable>
          ))}
        </View>

        <ProgressStrip
          read={Boolean(progressApi.progress?.readCompleted)}
          listen={Boolean(progressApi.progress?.listenCompleted)}
          learn={(progressApi.progress?.questionsAnswered ?? 0) > 0}
          play={Boolean(progressApi.progress?.gameCompleted)}
        />

        {mode === 'read' ? (
          <View className="mt-4 rounded-3xl bg-white px-4 py-5">
            <Text className="text-sm text-brand-600">{t('qisas.readHelp')}</Text>
            <Text className="mt-4 text-base leading-7 text-brand-800">{fullStoryText}</Text>
            {narrator ? (
              <Text className="mt-4 text-xs text-brand-500">
                {t('qisas.narrator')}: {narrator.name} · {audioSlot?.permissionStatus}
              </Text>
            ) : null}
          </View>
        ) : null}

        {mode === 'listen' ? (
          <View className="mt-4 rounded-3xl bg-white px-4 py-5">
            <Text className="text-sm text-brand-600">{t('qisas.listenHelp')}</Text>
            <Text className="mt-3 text-lg font-bold text-brand-800">
              {localizeText(chapter.title, language)}
            </Text>
            <Text className="mt-2 text-base leading-7 text-brand-800">
              {localizeText(chapter.body, language)}
            </Text>
            {narrator ? (
              <Text className="mt-3 text-sm font-semibold text-brand-700">
                {t('qisas.narrator')}: {narrator.name}
              </Text>
            ) : null}
            {!licensed ? (
              <>
                <Text className="mt-3 text-base font-semibold text-brand-800">
                  {t('qisas.audioComingSoon')}
                </Text>
                <Text className="mt-1 text-sm leading-5 text-brand-600">
                  {t('qisas.audioComingSoonHelp')}
                </Text>
                <Text className="mt-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                  {audioSlot?.permissionStatus ?? 'PERMISSION_REQUIRED'}
                </Text>
              </>
            ) : null}
            <QisasAudioControls
              isPlaying={audio.isPlaying}
              currentTime={audio.status.currentTime}
              duration={audio.status.duration}
              canGoPrevious={chapterIndex > 0}
              canGoNext={chapterIndex < chapterCount - 1}
              chapterIndicator={t('qisas.chapterOf', {
                n: chapterIndex + 1,
                total: chapterCount,
              })}
              licensed={licensed}
              onPlay={() => {
                void audio.play();
              }}
              onPause={() => {
                void audio.pause();
              }}
              onStop={() => {
                void audio.stop();
              }}
              onPrevious={() => setChapterIndex((value) => Math.max(0, value - 1))}
              onNext={() =>
                setChapterIndex((value) => Math.min(chapterCount - 1, value + 1))
              }
              onSeek={(seconds) => {
                void audio.seekTo(seconds);
              }}
            />
            {audio.error ? (
              <Text className="mt-2 text-center text-sm text-red-600">{audio.error}</Text>
            ) : null}
          </View>
        ) : null}

        {mode === 'learn' ? (
          <View className="mt-4">
            <Text className="text-sm font-semibold text-brand-100">
              {t('qisas.whatDidWeLearn')}
            </Text>
            <Text className="mt-1 text-sm text-brand-100">{t('qisas.learnHelp')}</Text>
            <QisasQuizPanel
              current={learnQuiz.current}
              index={learnQuiz.index}
              total={learnQuiz.total}
              phase={learnQuiz.phase}
              feedback={learnQuiz.feedback}
              orderDraft={learnQuiz.orderDraft}
              correctCount={learnQuiz.correctCount}
              completeTitle={t('qisas.whatDidWeLearn')}
              onSelect={learnQuiz.submitChoice}
              onMoveOrder={learnQuiz.moveOrder}
              onSubmitOrder={learnQuiz.submitOrder}
              onRetry={learnQuiz.retry}
              onContinue={learnQuiz.continueAfterFeedback}
              onRestart={learnQuiz.restart}
              onDone={() => setMode('play')}
            />
          </View>
        ) : null}

        {mode === 'play' ? (
          <View className="mt-4">
            <Text className="text-sm font-semibold text-brand-100">{t('qisas.storyGame')}</Text>
            <Text className="mt-1 text-sm text-brand-100">{t('qisas.playHelp')}</Text>
            <QisasQuizPanel
              current={playQuiz.current}
              index={playQuiz.index}
              total={playQuiz.total}
              phase={playQuiz.phase}
              feedback={playQuiz.feedback}
              orderDraft={playQuiz.orderDraft}
              correctCount={playQuiz.correctCount}
              completeTitle={t('qisas.gameComplete')}
              onSelect={playQuiz.submitChoice}
              onMoveOrder={playQuiz.moveOrder}
              onSubmitOrder={playQuiz.submitOrder}
              onRetry={playQuiz.retry}
              onContinue={playQuiz.continueAfterFeedback}
              onRestart={playQuiz.restart}
            />
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('qisas.openSources')}
          onPress={() => router.push('/(app)/qisas/sources' as never)}
          className="mt-6 min-h-12 items-center justify-center rounded-2xl bg-white/10 px-4"
        >
          <Text className="text-sm font-semibold text-white">{t('qisas.openSources')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProgressStrip({
  read,
  listen,
  learn,
  play,
}: {
  read: boolean;
  listen: boolean;
  learn: boolean;
  play: boolean;
}) {
  const { t } = useI18n();
  const items = [
    { label: t('qisas.readDone'), done: read },
    { label: t('qisas.listenDone'), done: listen },
    { label: t('qisas.learnDone'), done: learn },
    { label: t('qisas.playDone'), done: play },
  ];
  return (
    <View className="mt-4 flex-row flex-wrap gap-2">
      {items.map((item) => (
        <View
          key={item.label}
          className={`rounded-full px-3 py-1 ${item.done ? 'bg-white' : 'bg-white/15'}`}
        >
          <Text className={`text-xs font-semibold ${item.done ? 'text-brand-800' : 'text-brand-100'}`}>
            {item.done ? '✓ ' : ''}
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
