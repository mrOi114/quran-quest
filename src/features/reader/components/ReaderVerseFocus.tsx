import { View } from 'react-native';

import type { AgeGroupId } from '@/features/auth';
import type { AudioRepeatCount } from '@/types';

import { useVerseAudio } from '../hooks/useVerseAudio';
import type { ReaderFontScale, ReaderMode, ReaderVerseViewModel } from '../types';
import { ArabicVerseText } from './ArabicVerseText';
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
  audioEnabled?: boolean;
  onToggleAudioEnabled?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
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
  audioEnabled = true,
  onToggleAudioEnabled,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: ReaderVerseFocusProps) {
  const audio = useVerseAudio({
    audioUrl: audioEnabled ? verse.audioUrl : null,
    repeatCount,
    metadata: {
      title: `Surah ${verse.surahNumber} · Ayah ${verse.ayahNumber}`,
      artist: 'Mahmoud Khalil Al-Husary',
      albumTitle: 'QuranFamily',
    },
    onPlayedOnce,
    onPlaybackComplete,
    autoPlay: autoPlay && audioEnabled,
  });

  return (
    <View className="rounded-2xl bg-white px-4 py-5">
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

      <TranslationPanel
        meaning={verse.meaning}
        explanation={verse.explanation}
        visible={showTranslation}
        onToggleVisible={onToggleTranslation}
      />
    </View>
  );
}
