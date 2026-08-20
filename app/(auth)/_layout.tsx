import { Redirect, Stack, usePathname } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/features/auth';

export default function AuthLayout() {
  const pathname = usePathname();
  const {
    isBootstrapping,
    isAccountHydrating,
    session,
    isEmailVerified,
    activeLearner,
    isGuest,
    isChildFamilySession,
    needsPasswordReset,
  } = useAuth();

  if (isBootstrapping || (isAccountHydrating && !isGuest)) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-600">
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  const onResetPassword =
    pathname.includes('reset-password') || pathname.includes('callback');

  if (needsPasswordReset && session && !onResetPassword) {
    return <Redirect href="/(auth)/reset-password" />;
  }

  if (needsPasswordReset && onResetPassword) {
    return <Stack screenOptions={{ headerShown: false }} />;
  }

  // Guests may open register/login from milestone prompts. Restore them into
  // the app on every other auth screen so Guest Mode survives refresh/restart.
  if (isGuest && activeLearner) {
    const onAccountFlow =
      pathname.includes('register') ||
      pathname.includes('login') ||
      pathname.includes('verify-email') ||
      pathname.includes('callback') ||
      pathname.includes('reset-password') ||
      pathname.includes('forgot-password');
    if (!onAccountFlow) {
      return <Redirect href="/(app)/home" />;
    }
    return <Stack screenOptions={{ headerShown: false }} />;
  }

  if (isChildFamilySession && activeLearner && !onResetPassword) {
    const onChildEntry =
      pathname.includes('child-entry') || pathname.includes('child-unlock');
    if (!onChildEntry) {
      return <Redirect href="/(app)/home" />;
    }
  }

  if (session && isEmailVerified && activeLearner && !onResetPassword) {
    return <Redirect href="/(app)/home" />;
  }

  if (session && isEmailVerified && !activeLearner && !onResetPassword) {
    return <Redirect href="/(app)/family/learners" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
