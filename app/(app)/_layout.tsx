import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/features/auth';
import { WebAppShell } from '@/components/ui/WebAppShell';

export default function AppLayout() {
  const { isBootstrapping, session, isEmailVerified, isGuest, needsPasswordReset } =
    useAuth();

  if (isBootstrapping) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-600">
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  if (needsPasswordReset && session) {
    return <Redirect href="/(auth)/reset-password" />;
  }

  if (!session && !isGuest) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (session && !isEmailVerified) {
    return <Redirect href="/(auth)/verify-email" />;
  }

  return (
    <WebAppShell>
      <Stack screenOptions={{ headerShown: false }} />
    </WebAppShell>
  );
}
