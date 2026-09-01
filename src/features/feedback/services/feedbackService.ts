import { assertFunctionOk } from '@/features/auth';
import { getOrCreateParticipantKey } from '@/features/competition/services/participantKey';
import { supabase } from '@/lib/supabase';

import type { FeedbackCategory, StudentFeedbackItem } from '../types';

export async function submitStudentFeedback(input: {
  category: FeedbackCategory;
  message: string;
  displayName: string;
  isGuest: boolean;
  language: string;
}): Promise<void> {
  const participant_key = await getOrCreateParticipantKey();
  await assertFunctionOk(
    await supabase.functions.invoke('student-feedback', {
      body: {
        action: 'submit',
        category: input.category,
        message: input.message.trim(),
        display_name: input.displayName,
        is_guest: input.isGuest,
        language: input.language,
        participant_key,
      },
    }),
  );
}

export async function listStudentFeedback(): Promise<StudentFeedbackItem[]> {
  const participant_key = await getOrCreateParticipantKey();
  const data = await assertFunctionOk<{ ok: true; items: StudentFeedbackItem[] }>(
    await supabase.functions.invoke('student-feedback', {
      body: { action: 'list', participant_key },
    }),
  );
  return Array.isArray(data.items) ? data.items : [];
}
