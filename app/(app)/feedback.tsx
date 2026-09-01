import { Redirect } from 'expo-router';

import { isReservedFounderNickname, useAuth } from '@/features/auth';
import { FounderFeedbackInbox } from '@/features/feedback';

export default function FeedbackRoute() {
  const { activeLearner } = useAuth();
  if (!isReservedFounderNickname(activeLearner?.display_name ?? '')) {
    return <Redirect href="/(app)/home" />;
  }
  return <FounderFeedbackInbox />;
}
