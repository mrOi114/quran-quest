import { useLocalSearchParams } from 'expo-router';

import { CircleDetailScreen } from '@/features/circles';

export default function CircleDetailRoute() {
  const params = useLocalSearchParams<{ id: string }>();
  return <CircleDetailScreen circleId={String(params.id ?? '')} />;
}
