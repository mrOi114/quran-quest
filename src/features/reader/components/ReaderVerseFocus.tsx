import { Text, View } from 'react-native';

import type { AgeGroupId } from '@/features/auth';
import { useI18n } from '@/i18n';
import type { AudioRepeatCount } from '@/types';

import { getSomaliYacobAudioUrl, somaliYacobAudioMetadata } from '../content/somaliYacobAudio';
import { useVerseAudio } from '../hooks/useVerseAudio';
import type { QuranListenKind } from '../services/quranListenQueue';
import type { ReaderFontScale, ReaderMode, ReaderVerseViewModel } from '../types';
import { ArabicVerseText } from './ArabicVerseText';
import { MeaningAudioAttribution } from './MeaningAudioAttribution';
import { TranslationPanel } from './TranslationPanel';
import { VerseAudioControls } from './VerseAudioControls';

type ReaderVerseFocusProps = {
  verse: ReaderVerseViewModel;
  ageGroup: AgeGroupId;
  mode: ReaderMode;
  showTranslation: boolean;
  repeatCount: AudioRepeatCount;
  fontScale?: ReaderFontScale | null;
  onToggleTranslation: () => void;
  onCycleRepeat: () => void;
  onPlayedOnce?: () => void;
  onPlaybackComplete?: () => void;
  autoPlay?: boolean;
  /** Keep the listen queue advancing after each ayah (independent of autoPlay). */
  continuous?: boolean;
  audioEnabled?: boolean;
  onToggleAudioEnabled?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  quranLayerTitle?: string;
  quranLayerSubtitle?: string;
  meaningHeading?: string;
  audioKind?: QuranListenKind;
};

export function ReaderVerseFocus({
  verse,
  ageGroup,
  mode: _mode,
  showTranslation,
  repeatCount,
  fontScale = null,
  onToggleTranslation,
  onCycleRepeat,
  onPlayedOnce,
  onPlaybackComplete,
  autoPlay = false,
  continuous,
  audioEnabled = true,
  onToggleAudioEnabled,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  quranLayerTitle,
  quranLayerSubtitle,
  meaningHeading,
  audioKind = 'quran',
}: ReaderVerseFocusProps) {
  const { t } = useI18n();
  const isMeaningAudio = audioKind === 'meaning';
  const audioUrl = audioEnabled
    ? isMeaningAudio
      ? getSomaliYacobAudioUrl(verse.surahNumber, verse.ayahNumber)
      : verse.audioUrl
    : null;
  const audio = useVerseAudio({
    audioUrl,
    repeatCount,
    kind: audioKind,
    metadata: isMeaningAudio
      ? somaliYacobAudioMetadata(verse.surahNumber, verse.ayahNumber)
      : {
          title: t('reader.nowPlaying', {
            surah: verse.surahNumber,
            ayah: verse.ayahNumber,
          }),
          artist: 'Mahmoud Khalil Al-Husary',
          albumTitle: 'QuranFamily',
        },
    onPlayedOnce,
    onPlaybackComplete,
    autoPlay: autoPlay && audioEnabled,
    continuous: continuous ?? (autoPlay && audioEnabled),
    cursor: {
      surahNumber: verse.surahNumber,
      ayahNumber: verse.ayahNumber,
    },
  });

  return (
    <View className="rounded-2xl bg-white px-4 py-5">
      {quranLayerTitle ? (
        <View className="mb-3">
          <Text className="text-center text-lg font-bold text-brand-800">{quranLayerTitle}</Text>
          {quranLayerSubtitle ? (
            <Text className="mt-1 text-center text-sm font-semibold text-brand-500">
              {quranLayerSubtitle}
            </Text>
          ) : null}
        </View>
      ) : null}
      <ArabicVerseText
        textUthmani={verse.textUthmani}
        ayahNumber={verse.ayahNumber}
        ageGroup={ageGroup}
        isLearned={verse.isLearned}
        fontScale={fontScale}
      />

      <VerseAudioControls
        isPlaying={audio.isPlaying}
        repeatCount={repeatCount}
        error={audio.error}
        currentTime={audio.currentTime}
        duration={audio.duration}
        caption={isMeaningAudio ? t('reader.meaningAudioCaption') : undefined}
        onSeek={(seconds) => {
          void audio.seekTo(seconds);
        }}
        audioEnabled={audioEnabled}
        onToggleAudioEnabled={onToggleAudioEnabled}
        onPrevious={onPrevious}
        onNext={onNext}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        onPlay={() => {
          void audio.play();
        }}
        onPause={() => {
          void audio.pause();
        }}
        onReplay={() => {
          void audio.replay();
        }}
        onCycleRepeat={onCycleRepeat}
      />

      {isMeaningAudio ? <MeaningAudioAttribution /> : null}

      <TranslationPanel
        meaning={verse.meaning}
        explanation={verse.explanation}
        visible={showTranslation}
        heading={meaningHeading}
        onToggleVisible={onToggleTranslation}
      />
    </View>
  );
}
