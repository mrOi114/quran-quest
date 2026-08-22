import { useLocalSearchParams } from 'expo-router';

import { ChallengeLandingScreen } from '@/features/competition';

export default function ChallengeLinkRoute() {
  const params = useLocalSearchParams<{ code?: string | string[] }>();
  const raw = Array.isArray(params.code) ? params.code[0] : params.code;
  return <ChallengeLandingScreen codeParam={raw ?? ''} />;
}
