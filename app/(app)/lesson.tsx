import { useLocalSearchParams } from 'expo-router';

import { LessonScreen } from '@/features/learning';

function resolveLessonKey(lessonId: string | string[] | undefined): string | undefined {
  if (typeof lessonId === 'string') {
    return lessonId;
  }
  if (Array.isArray(lessonId)) {
    return lessonId[0];
  }
  return undefined;
}

export default function LessonRoute() {
  const { lessonId } = useLocalSearchParams<{
    lessonId?: string | string[];
  }>();

  return <LessonScreen lessonKey={resolveLessonKey(lessonId)} />;
}
