import { useLocalSearchParams } from 'expo-router';

import { QisasStoryScreen } from '@/features/qisas';

export default function QisasStoryRoute() {
  const params = useLocalSearchParams<{ storyId?: string | string[] }>();
  const raw = params.storyId;
  const storyId = Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');

  return <QisasStoryScreen storyId={storyId} />;
}
