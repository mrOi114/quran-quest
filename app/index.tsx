import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/features/auth';

export default function Index() {
  const {
    isBootstrapping,
    session,
    user,
    isEmailVerified,
    activeLearner,
    isGuest,
    isChildFamilySession,
    needsPasswordReset,
  } = useAuth();

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

  if ((isGuest || isChildFamilySession) && activeLearner) {
    return <Redirect href="/(app)/home" />;
  }

  if (!session && !isGuest && !isChildFamilySession) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (session && !user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (session && !isEmailVerified) {
    return <Redirect href="/(auth)/verify-email" />;
  }

  if (session && !activeLearner) {
    return <Redirect href="/(app)/family/learners" />;
  }

  return <Redirect href="/(app)/home" />;
}
