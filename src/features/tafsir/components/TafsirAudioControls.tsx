import { Pressable, Text, View } from 'react-native';

import { AudioProgressBar } from '@/features/audio';
import { useI18n } from '@/i18n';

type TafsirAudioControlsProps = {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  lessonIndicator: string;
  onPlay: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
};

export function TafsirAudioControls({
  isPlaying,
  currentTime,
  duration,
  canGoPrevious,
  canGoNext,
  lessonIndicator,
  onPlay,
  onPause,
  onPrevious,
  onNext,
  onSeek,
}: TafsirAudioControlsProps) {
  const { t } = useI18n();
  return (
    <View className="mt-3">
      <Text className="text-center text-sm font-semibold text-teal-800">{lessonIndicator}</Text>
      <AudioProgressBar currentTime={currentTime} duration={duration} onSeek={onSeek} />
      <View className="mt-3 flex-row flex-wrap items-center justify-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.prev')}
          disabled={!canGoPrevious}
          onPress={onPrevious}
          className={`min-h-12 min-w-[72px] items-center justify-center rounded-xl px-3 ${
            canGoPrevious ? 'bg-teal-100' : 'bg-teal-50 opacity-50'
          }`}
        >
          <Text className="text-base font-semibold text-teal-800">{t('common.prev')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? t('reader.pause') : t('tafsir.listen')}
          onPress={isPlaying ? onPause : onPlay}
          className="min-h-12 min-w-[112px] items-center justify-center rounded-xl bg-teal-700 px-4"
        >
          <Text className="text-base font-semibold text-white">
            {isPlaying ? t('reader.pause') : t('tafsir.listen')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.next')}
          disabled={!canGoNext}
          onPress={onNext}
          className={`min-h-12 min-w-[72px] items-center justify-center rounded-xl px-3 ${
            canGoNext ? 'bg-teal-100' : 'bg-teal-50 opacity-50'
          }`}
        >
          <Text className="text-base font-semibold text-teal-800">{t('common.next')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
