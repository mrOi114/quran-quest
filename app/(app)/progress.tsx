import { Redirect } from 'expo-router';

/** Legacy progress route — Leaderboard is now the primary compete tab. */
export default function ProgressRoute() {
  return <Redirect href={'/(app)/leaderboard' as never} />;
}
