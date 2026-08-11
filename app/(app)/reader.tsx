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
  const params = useLocalSearchParams<{ surah?: string; ayah?: string }>();
  return (
    <FullQuranReaderScreen
      surah={parsePositiveInt(params.surah)}
      ayah={parsePositiveInt(params.ayah)}
    />
  );
}
