import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/features/auth';
import { HomeDashboard } from '@/features/home';

export default function HomeScreen() {
  const { activeLearner, isGuest, isBootstrapping } = useAuth();

  if (isBootstrapping || (isGuest && !activeLearner)) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-600">
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  if (!activeLearner) {
    return <Redirect href="/(app)/family" />;
  }

  return <HomeDashboard />;
}
