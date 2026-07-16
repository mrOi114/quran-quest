import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth';

/**
 * Parent tools are never available during an active child learning session.
 */
export default function ParentLayout() {
  const { canManageFamily, isGuest } = useAuth();

  if (isGuest || !canManageFamily) {
    return <Redirect href="/(app)/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
