import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

import { createAnonClient } from './supabase.ts';

export type IssuedChildSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number | null;
  token_type: string;
};

function childInternalEmail(childId: string): string {
  return `child.${childId.replace(/-/g, '')}@users.internal.quranfamily.app`;
}

function randomPassword(): string {
  return `${crypto.randomUUID()}Aa1!${crypto.randomUUID()}`;
}

/**
 * After PIN verification, issue a normal Supabase Auth session for the child
 * so Family Chat / Calls can use the existing JWT + RLS path. The password is
 * rotated immediately; PIN remains the only unlock method.
 */
export async function issueChildAuthSession(
  service: SupabaseClient,
  childId: string,
  parentId: string,
): Promise<IssuedChildSession> {
  const email = childInternalEmail(childId);
  const { data: existing } = await service.auth.admin.getUserById(childId);

  if (!existing.user) {
    const { error: createError } = await service.auth.admin.createUser({
      id: childId,
      email,
      email_confirm: true,
      password: randomPassword(),
      user_metadata: { role: 'child', parent_id: parentId },
      app_metadata: { provider: 'child_pin', role: 'child', parent_id: parentId },
    });
    if (createError) {
      throw new Error(createError.message || 'Could not create child session');
    }
  } else if (!existing.user.email_confirmed_at) {
    await service.auth.admin.updateUserById(childId, { email_confirm: true });
  }

  const password = randomPassword();
  const { error: passwordError } = await service.auth.admin.updateUserById(childId, {
    password,
    email_confirm: true,
  });
  if (passwordError) {
    throw new Error(passwordError.message || 'Could not issue child session');
  }

  const anon = createAnonClient();
  const { data, error: signInError } = await anon.auth.signInWithPassword({
    email,
    password,
  });

  await service.auth.admin.updateUserById(childId, {
    password: randomPassword(),
    email_confirm: true,
  });

  if (signInError || !data.session?.access_token || !data.session.refresh_token) {
    throw new Error(signInError?.message || 'Could not sign in child session');
  }

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in ?? null,
    token_type: data.session.token_type ?? 'bearer',
  };
}