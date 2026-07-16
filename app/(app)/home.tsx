import { Redirect } from 'expo-router';

import { useAuth } from '@/features/auth';
import { HomeDashboard } from '@/features/home';

export default function HomeScreen() {
  const { activeLearner, isGuest } = useAuth();

  if (!activeLearner) {
    return <Redirect href={isGuest ? '/(auth)/welcome' : '/(app)/family'} />;
  }

  return <HomeDashboard />;
}
