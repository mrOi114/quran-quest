import { Pressable, Text, View } from 'react-native';

import { AudioProgressBar } from '@/features/audio';
import { useI18n } from '@/i18n';
import type { AudioRepeatCount } from '@/types';

type VerseAudioControlsProps = {
  isPlaying: boolean;
  repeatCount: AudioRepeatCount;
  error: string | null;
  currentTime?: number;
  duration?: number;
  caption?: string;
  onSeek?: (seconds: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onReplay: () => void;
  onCycleRepeat: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  audioEnabled?: boolean;
  onToggleAudioEnabled?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
};

export function VerseAudioControls({
  isPlaying,
  repeatCount,
  error,
  currentTime = 0,
  duration = 0,
  caption,
  onSeek,
  onPlay,
  onPause,
  onReplay,
  onCycleRepeat,
  onPrevious,
  onNext,
  audioEnabled = true,
  onToggleAudioEnabled,
  canGoPrevious = true,
  canGoNext = true,
}: VerseAudioControlsProps) {
  const { t } = useI18n();
  const repeatLabel: Record<AudioRepeatCount, string> = {
    '1': t('reader.once'),
    '2': t('reader.times2'),
    '3': t('reader.times3'),
    loop: t('reader.loop'),
  };
  return (
    <View className="mt-4">
      <Text className="mb-2 text-center text-xs text-brand-400">
        {caption ?? t('reader.beginnerQari')}
      </Text>
      <AudioProgressBar
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
      />
      <View className="mt-3 flex-row flex-wrap items-center justify-center gap-2">
        {onPrevious ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('reader.previousVerse')}
            disabled={!canGoPrevious}
            onPress={onPrevious}
            className={`min-h-12 min-w-[72px] items-center justify-center rounded-xl px-3 ${
              canGoPrevious ? 'bg-brand-100' : 'bg-brand-50 opacity-50'
            }`}
          >
            <Text className="text-base font-semibold text-brand-700">{t('common.prev')}</Text>
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? t('reader.pause') : t('reader.listenBtn')}
          disabled={!audioEnabled}
          onPress={isPlaying ? onPause : onPlay}
          className={`min-h-12 min-w-[112px] items-center justify-center rounded-xl px-4 ${
            audioEnabled ? 'bg-brand-600' : 'bg-brand-200'
          }`}
        >
          <Text className="text-base font-semibold text-white">
            {!audioEnabled
              ? t('reader.audioOff')
              : isPlaying
                ? t('reader.pause')
                : t('reader.listenBtn')}
          </Text>
        </Pressable>

        {onNext ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('reader.nextVerse')}
            disabled={!canGoNext}
            onPress={onNext}
            className={`min-h-12 min-w-[72px] items-center justify-center rounded-xl px-3 ${
              canGoNext ? 'bg-brand-100' : 'bg-brand-50 opacity-50'
            }`}
          >
            <Text className="text-base font-semibold text-brand-700">{t('common.next')}</Text>
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('reader.playAgain')}
          disabled={!audioEnabled}
          onPress={onReplay}
          className={`min-h-12 min-w-[88px] items-center justify-center rounded-xl px-4 ${
            audioEnabled ? 'bg-brand-100' : 'bg-brand-50 opacity-50'
          }`}
        >
          <Text className="text-base font-semibold text-brand-700">{t('reader.again')}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${repeatLabel[repeatCount]}`}
          onPress={onCycleRepeat}
          className="min-h-12 min-w-[88px] items-center justify-center rounded-xl border border-brand-200 bg-white px-4"
        >
          <Text className="text-sm font-semibold text-brand-600">
            {repeatLabel[repeatCount]}
          </Text>
        </Pressable>

        {onToggleAudioEnabled ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={audioEnabled ? t('reader.turnAudioOff') : t('reader.turnAudioOn')}
            onPress={onToggleAudioEnabled}
            className="min-h-12 min-w-[88px] items-center justify-center rounded-xl border border-brand-200 bg-white px-4"
          >
            <Text className="text-sm font-semibold text-brand-600">
            {audioEnabled ? t('reader.soundOn') : t('reader.soundOff')}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text className="mt-2 text-center text-sm text-red-700">{error}</Text>
      ) : null}
    </View>
  );
}
