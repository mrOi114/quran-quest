import { useLocalSearchParams } from 'expo-router';

import { CircleSettingsScreen } from '@/features/circles';

export default function CircleSettingsRoute() {
  const params = useLocalSearchParams<{ id: string }>();
  return <CircleSettingsScreen circleId={String(params.id ?? '')} />;
}
