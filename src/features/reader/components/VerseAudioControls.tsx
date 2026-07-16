import { Pressable, Text, View } from 'react-native';

import type { AudioRepeatCount } from '@/types';

type VerseAudioControlsProps = {
  isPlaying: boolean;
  repeatCount: AudioRepeatCount;
  error: string | null;
  onPlay: () => void;
  onPause: () => void;
  onReplay: () => void;
  onCycleRepeat: () => void;
};

const REPEAT_LABEL: Record<AudioRepeatCount, string> = {
  '1': 'Once',
  '3': '×3',
  loop: 'Loop',
};

export function VerseAudioControls({
  isPlaying,
  repeatCount,
  error,
  onPlay,
  onPause,
  onReplay,
  onCycleRepeat,
}: VerseAudioControlsProps) {
  return (
    <View className="mt-4">
      <Text className="mb-2 text-center text-xs text-brand-400">Beginner Qari</Text>
      <View className="flex-row flex-wrap items-center justify-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause audio' : 'Listen'}
          onPress={isPlaying ? onPause : onPlay}
          className="min-h-12 min-w-[112px] items-center justify-center rounded-xl bg-brand-600 px-4"
        >
          <Text className="text-base font-semibold text-white">
            {isPlaying ? 'Pause' : 'Listen'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Play again"
          onPress={onReplay}
          className="min-h-12 min-w-[88px] items-center justify-center rounded-xl bg-brand-100 px-4"
        >
          <Text className="text-base font-semibold text-brand-700">Again</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Repeat setting ${REPEAT_LABEL[repeatCount]}. Tap to change.`}
          onPress={onCycleRepeat}
          className="min-h-12 min-w-[88px] items-center justify-center rounded-xl border border-brand-200 bg-white px-4"
        >
          <Text className="text-sm font-semibold text-brand-600">
            {REPEAT_LABEL[repeatCount]}
          </Text>
        </Pressable>
      </View>
      {error ? (
        <Text className="mt-2 text-center text-sm text-red-700">{error}</Text>
      ) : null}
    </View>
  );
}
