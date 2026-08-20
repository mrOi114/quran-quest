import { Redirect } from 'expo-router';

import { useAuth } from '@/features/auth';
import { FamilyHubScreen } from '@/features/family';

export default function FamilyEntryScreen() {
  const { isChildFamilySession } = useAuth();

  if (isChildFamilySession) {
    return <Redirect href="/(app)/home" />;
  }

  return <FamilyHubScreen />;
}
