import { useLocalSearchParams } from 'expo-router';

import { FullQuranReaderScreen } from '@/features/reader';

function parsePositiveInt(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return undefined;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export default function ReaderRoute() {
  const params = useLocalSearchParams<{ surah?: string; ayah?: string; mode?: string }>();
  const modeRaw = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  return (
    <FullQuranReaderScreen
      surah={parsePositiveInt(params.surah)}
      ayah={parsePositiveInt(params.ayah)}
      listen={modeRaw === 'listen'}
      meaningAudio={modeRaw === 'meaning'}
    />
  );
}
