import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/features/auth';

export default function AuthLayout() {
  const { isBootstrapping, session, isEmailVerified, activeLearner, isGuest } = useAuth();

  if (isBootstrapping) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-600">
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  // Guests may open register/login from milestone prompts; only auto-redirect when
  // they land on auth without intentionally navigating to create an account.
  if (isGuest && activeLearner) {
    return <Stack screenOptions={{ headerShown: false }} />;
  }

  if (session && isEmailVerified && activeLearner) {
    return <Redirect href="/(app)/home" />;
  }

  if (session && isEmailVerified && !activeLearner) {
    return <Redirect href="/(app)/family" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
