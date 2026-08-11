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
  onPrevious?: () => void;
  onNext?: () => void;
  audioEnabled?: boolean;
  onToggleAudioEnabled?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
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
  onPrevious,
  onNext,
  audioEnabled = true,
  onToggleAudioEnabled,
  canGoPrevious = true,
  canGoNext = true,
}: VerseAudioControlsProps) {
  return (
    <View className="mt-4">
      <Text className="mb-2 text-center text-xs text-brand-400">Beginner Qari</Text>
      <View className="flex-row flex-wrap items-center justify-center gap-2">
        {onPrevious ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous verse"
            disabled={!canGoPrevious}
            onPress={onPrevious}
            className={`min-h-12 min-w-[72px] items-center justify-center rounded-xl px-3 ${
              canGoPrevious ? 'bg-brand-100' : 'bg-brand-50 opacity-50'
            }`}
          >
            <Text className="text-base font-semibold text-brand-700">Prev</Text>
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause audio' : 'Listen'}
          disabled={!audioEnabled}
          onPress={isPlaying ? onPause : onPlay}
          className={`min-h-12 min-w-[112px] items-center justify-center rounded-xl px-4 ${
            audioEnabled ? 'bg-brand-600' : 'bg-brand-200'
          }`}
        >
          <Text className="text-base font-semibold text-white">
            {!audioEnabled ? 'Audio off' : isPlaying ? 'Pause' : 'Listen'}
          </Text>
        </Pressable>

        {onNext ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next verse"
            disabled={!canGoNext}
            onPress={onNext}
            className={`min-h-12 min-w-[72px] items-center justify-center rounded-xl px-3 ${
              canGoNext ? 'bg-brand-100' : 'bg-brand-50 opacity-50'
            }`}
          >
            <Text className="text-base font-semibold text-brand-700">Next</Text>
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Play again"
          disabled={!audioEnabled}
          onPress={onReplay}
          className={`min-h-12 min-w-[88px] items-center justify-center rounded-xl px-4 ${
            audioEnabled ? 'bg-brand-100' : 'bg-brand-50 opacity-50'
          }`}
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

        {onToggleAudioEnabled ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={audioEnabled ? 'Turn audio off' : 'Turn audio on'}
            onPress={onToggleAudioEnabled}
            className="min-h-12 min-w-[88px] items-center justify-center rounded-xl border border-brand-200 bg-white px-4"
          >
            <Text className="text-sm font-semibold text-brand-600">
              {audioEnabled ? 'Sound on' : 'Sound off'}
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
