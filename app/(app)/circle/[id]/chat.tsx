import { useLocalSearchParams } from 'expo-router';

import { CircleChatScreen } from '@/features/circles';

export default function CircleChatRoute() {
  const params = useLocalSearchParams<{ id: string }>();
  return <CircleChatScreen circleId={String(params.id ?? '')} />;
}
