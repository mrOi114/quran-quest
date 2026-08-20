import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

type AudioProgressBarProps = {
  currentTime: number;
  duration: number;
  onSeek?: (seconds: number) => void;
};

export function AudioProgressBar({
  currentTime,
  duration,
  onSeek,
}: AudioProgressBarProps) {
  const [width, setWidth] = useState(1);
  const pct =
    duration > 0 ? Math.max(0, Math.min(100, (currentTime / duration) * 100)) : 0;

  return (
    <View className="mt-3">
      <Pressable
        accessibilityRole="adjustable"
        accessibilityLabel="Audio progress"
        disabled={!onSeek || duration <= 0}
        onLayout={(event) => {
          setWidth(Math.max(1, event.nativeEvent.layout.width));
        }}
        onPress={(event) => {
          if (!onSeek || duration <= 0) {
            return;
          }
          const x = event.nativeEvent.locationX;
          onSeek(Math.max(0, Math.min(duration, (x / width) * duration)));
        }}
        className="h-3 justify-center"
      >
        <View className="h-2 overflow-hidden rounded-full bg-brand-100">
          <View className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
        </View>
      </Pressable>
      <View className="mt-1 flex-row justify-between">
        <Text className="text-xs text-brand-500">{formatTime(currentTime)}</Text>
        <Text className="text-xs text-brand-500">{formatTime(duration)}</Text>
      </View>
    </View>
  );
}
