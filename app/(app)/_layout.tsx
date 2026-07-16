import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/features/auth';

export default function AppLayout() {
  const { isBootstrapping, session, isEmailVerified, isGuest } = useAuth();

  if (isBootstrapping) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-600">
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  if (!session && !isGuest) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (session && !isEmailVerified) {
    return <Redirect href="/(auth)/verify-email" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
