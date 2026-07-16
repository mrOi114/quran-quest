import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { createServiceClient, createUserClient } from '../_shared/supabase.ts';

type Body = {
  child_id?: string;
  pin?: string;
};

function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization' }, 401);
    }

    const userClient = createUserClient(authHeader);
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const body = (await request.json()) as Body;
    const childId = body.child_id?.trim();
    const pin = body.pin?.trim();

    if (!childId || !pin || !isValidPin(pin)) {
      return jsonResponse({ error: 'child_id and a 4–6 digit PIN are required' }, 400);
    }

    const service = createServiceClient();

    const { data: parent, error: parentError } = await service
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (parentError || !parent || parent.role !== 'parent') {
      return jsonResponse({ error: 'Only parents can set child PINs' }, 403);
    }

    const { data: child, error: childError } = await service
      .from('profiles')
      .select('id, role, parent_id')
      .eq('id', childId)
      .single();

    if (childError || !child || child.role !== 'child' || child.parent_id !== user.id) {
      return jsonResponse({ error: 'Child not found' }, 404);
    }

    const pinHash = await bcrypt.hash(pin);
    const { error: updateError } = await service.rpc('set_child_pin_hash', {
      p_child_id: childId,
      p_pin_hash: pinHash,
    });

    if (updateError) {
      return jsonResponse({ error: updateError.message }, 400);
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      500,
    );
  }
});
