import { Stack } from 'expo-router';

import { CompetitionVoiceHost } from '@/features/competition/components/CompetitionVoiceHost';

export default function CompetitionLayout() {
  return (
    <>
      <CompetitionVoiceHost />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
