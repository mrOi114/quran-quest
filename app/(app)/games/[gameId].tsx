import { useLocalSearchParams } from 'expo-router';

import { GamePlayScreen } from '@/features/games';

export default function GamePlayRoute() {
  const params = useLocalSearchParams<{ gameId?: string | string[] }>();
  const raw = params.gameId;
  const gameId = Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');

  return <GamePlayScreen gameIdParam={gameId} />;
}
