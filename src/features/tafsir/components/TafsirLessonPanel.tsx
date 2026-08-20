import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { useAuth } from '@/features/auth';
import { loadLearningSnapshot } from '@/features/learning/services/progressService';
import { resolveLearnerAgeYears } from '@/features/learning/services/ageGroup';
import { useI18n } from '@/i18n';

import { useTafsirAudio } from '../hooks/useTafsirAudio';
import { getTafsirAudioUrl, getTafsirSourceMeta } from '../services/tafsirCatalog';
import { getTafsirAudioStatus } from '../services/tafsirAudioPlayer';
import { resolveCachedTafsirAudioUrl } from '../services/tafsirAudioCache';
import { tafsirListenedPercent } from '../services/tafsirProgressStore';
import { buildUnderstandingQuestion } from '../services/understandingQuestions';
import { TafsirAudioControls } from './TafsirAudioControls';
import { TafsirUnderstandingCard } from './TafsirUnderstandingCard';
import type { TafsirVerseProgress } from '../schemas';

type TafsirLessonPanelProps = {
  verseId: string;
  surahNumber: number;
  ayahNumber: number;
  lessonIndex: number;
  startAyah: number;
  endAyah: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  autoPlay: boolean;
  progress?: TafsirVerseProgress;
  onPrevious: () => void;
  onNext: () => void;
  onListenProgress: (
    currentTime: number,
    duration: number,
    completed: boolean,
  ) => void;
  onUnderstanding: (correct: boolean) => void;
};

export function TafsirLessonPanel({
  verseId,
  surahNumber,
  ayahNumber,
  lessonIndex,
  startAyah,
  endAyah,
  canGoPrevious,
  canGoNext,
  autoPlay,
  progress,
  onPrevious,
  onNext,
  onListenProgress,
  onUnderstanding,
}: TafsirLessonPanelProps) {
  const { t, language } = useI18n();
  const { activeLearner } = useAuth();
  const source = getTafsirSourceMeta();
  const licensedUrl = getTafsirAudioUrl(surahNumber, ayahNumber);
  const [playableUrl, setPlayableUrl] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(Boolean(progress?.understood));
  const [question, setQuestion] = useState<ReturnType<typeof buildUnderstandingQuestion>>(null);

  useEffect(() => {
    let cancelled = false;
    void resolveCachedTafsirAudioUrl(licensedUrl, source).then((url) => {
      if (!cancelled) {
        setPlayableUrl(url);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [licensedUrl, source]);

  useEffect(() => {
    setSelectedId(null);
    setAnswered(Boolean(progress?.understood));
  }, [verseId, progress?.understood]);

  useEffect(() => {
    let cancelled = false;
    async function loadQuestion() {
      if (!activeLearner) {
        setQuestion(null);
        return;
      }
      const snapshot = await loadLearningSnapshot(activeLearner);
      const next = buildUnderstandingQuestion(
        verseId,
        language,
        snapshot,
        resolveLearnerAgeYears(activeLearner),
      );
      if (!cancelled) {
        setQuestion(next);
      }
    }
    void loadQuestion();
    return () => {
      cancelled = true;
    };
  }, [activeLearner, language, verseId]);

  const lastPersistRef = useRef(0);
  const audio = useTafsirAudio({
    audioUrl: playableUrl,
    autoPlay: autoPlay && Boolean(playableUrl),
    startAt: progress?.completed ? 0 : progress?.lastPosition ?? 0,
    metadata: {
      title: t('tafsir.nowPlaying', { surah: surahNumber, ayah: ayahNumber }),
      artist: source.scholar || t('tafsir.title'),
      albumTitle: 'QuranFamily Tafsir',
    },
    onPlaybackComplete: () => {
      const latest = getTafsirAudioStatus();
      onListenProgress(
        latest.duration || latest.currentTime,
        latest.duration,
        true,
      );
    },
    onStatus: (status) => {
      if (!status.playing) {
        return;
      }
      const bucket = Math.floor(status.currentTime / 5);
      if (bucket > 0 && bucket !== lastPersistRef.current) {
        lastPersistRef.current = bucket;
        onListenProgress(status.currentTime, status.duration, false);
      }
    },
  });

  const indicator = useMemo(
    () =>
      t('tafsir.lessonIndicator', {
        lesson: lessonIndex,
        surah: surahNumber,
        ayah: ayahNumber,
        start: startAyah,
        end: endAyah,
      }),
    [ayahNumber, endAyah, lessonIndex, startAyah, surahNumber, t],
  );

  const listened = tafsirListenedPercent(progress);

  return (
    <View className="mt-4 rounded-2xl border-2 border-teal-200 bg-teal-50 px-4 py-4">
      <Text className="text-center text-lg font-bold text-teal-900">{t('tafsir.arabicLabel')}</Text>
      <Text className="mt-1 text-center text-sm font-semibold text-teal-700">
        {t('tafsir.englishLabel')}
      </Text>
      <Text className="mt-2 text-center text-xs text-teal-700">{t('tafsir.notQuran')}</Text>

      {playableUrl ? (
        <TafsirAudioControls
          isPlaying={audio.isPlaying}
          currentTime={audio.status.currentTime}
          duration={audio.status.duration}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          lessonIndicator={indicator}
          onPlay={() => {
            void audio.play();
          }}
          onPause={() => {
            void audio.pause();
            onListenProgress(audio.status.currentTime, audio.status.duration, false);
          }}
          onPrevious={onPrevious}
          onNext={onNext}
          onSeek={(seconds) => {
            void audio.seekTo(seconds);
          }}
        />
      ) : (
        <Text className="mt-3 text-center text-sm leading-5 text-teal-800">
          {t('tafsir.audioUnavailable')}
        </Text>
      )}

      {audio.error ? (
        <Text className="mt-2 text-center text-sm text-teal-800">{t('tafsir.audioUnavailable')}</Text>
      ) : null}

      <Text className="mt-3 text-center text-xs text-teal-700">
        {t('tafsir.listenedPercent', { percent: listened })}
        {progress?.completed ? ` · ${t('tafsir.completed')}` : ''}
      </Text>

      {question ? (
        <TafsirUnderstandingCard
          question={question}
          selectedId={selectedId}
          answered={answered}
          onSelect={(choiceId) => {
            setSelectedId(choiceId);
            setAnswered(true);
            onUnderstanding(choiceId === question.correctChoiceId);
          }}
        />
      ) : null}
    </View>
  );
}
