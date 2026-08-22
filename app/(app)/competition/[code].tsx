import { useLocalSearchParams } from 'expo-router';

import { CompetitionMatchScreen, normalizeChallengeCode } from '@/features/competition';

export default function CompetitionMatchRoute() {
  const params = useLocalSearchParams<{ code?: string | string[] }>();
  const raw = Array.isArray(params.code) ? params.code[0] : params.code;
  const code = normalizeChallengeCode(raw ?? '');
  return <CompetitionMatchScreen code={code} />;
}
