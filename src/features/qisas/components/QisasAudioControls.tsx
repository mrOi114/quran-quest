import { Pressable, Text, View } from 'react-native';

import { AudioProgressBar } from '@/features/audio';
import { useI18n } from '@/i18n';

type QisasAudioControlsProps = {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  chapterIndicator: string;
  licensed: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
};

export function QisasAudioControls({
  isPlaying,
  currentTime,
  duration,
  canGoPrevious,
  canGoNext,
  chapterIndicator,
  licensed,
  onPlay,
  onPause,
  onStop,
  onPrevious,
  onNext,
  onSeek,
}: QisasAudioControlsProps) {
  const { t } = useI18n();
  return (
    <View className="mt-3">
      <Text className="text-center text-sm font-semibold text-brand-800">{chapterIndicator}</Text>
      {licensed ? (
        <AudioProgressBar currentTime={currentTime} duration={duration} onSeek={onSeek} />
      ) : null}
      <View className="mt-3 flex-row flex-wrap items-center justify-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.prev')}
          disabled={!canGoPrevious}
          onPress={onPrevious}
          className={`min-h-12 min-w-[72px] items-center justify-center rounded-xl px-3 ${
            canGoPrevious ? 'bg-brand-100' : 'bg-brand-50 opacity-50'
          }`}
        >
          <Text className="text-base font-semibold text-brand-800">{t('common.prev')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? t('reader.pause') : t('qisas.listen')}
          disabled={!licensed}
          onPress={isPlaying ? onPause : onPlay}
          className={`min-h-12 min-w-[112px] items-center justify-center rounded-xl px-4 ${
            licensed ? 'bg-brand-700' : 'bg-brand-200'
          }`}
        >
          <Text className="text-base font-semibold text-white">
            {isPlaying ? t('reader.pause') : t('qisas.listen')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.next')}
          disabled={!canGoNext}
          onPress={onNext}
          className={`min-h-12 min-w-[72px] items-center justify-center rounded-xl px-3 ${
            canGoNext ? 'bg-brand-100' : 'bg-brand-50 opacity-50'
          }`}
        >
          <Text className="text-base font-semibold text-brand-800">{t('common.next')}</Text>
        </Pressable>
      </View>
      {licensed && isPlaying ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('qisas.stop')}
          onPress={onStop}
          className="mt-2 min-h-11 items-center justify-center"
        >
          <Text className="text-sm font-semibold text-brand-700">{t('qisas.stop')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
