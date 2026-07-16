import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { createServiceClient, createUserClient } from '../_shared/supabase.ts';

type Body = {
  child_id?: string;
  pin?: string;
  device_key?: string;
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
    const deviceKey = body.device_key?.trim();

    if (!childId || !pin || !deviceKey || !isValidPin(pin)) {
      return jsonResponse(
        { error: 'child_id, device_key, and a 4–6 digit PIN are required' },
        400,
      );
    }

    const service = createServiceClient();

    const { data: parent, error: parentError } = await service
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (parentError || !parent || parent.role !== 'parent') {
      return jsonResponse({ error: 'Only parents can unlock child profiles' }, 403);
    }

    const { data: device } = await service
      .from('approved_devices')
      .select('id')
      .eq('parent_id', user.id)
      .eq('device_key', deviceKey)
      .maybeSingle();

    if (!device) {
      return jsonResponse({ error: 'This device is not approved for child unlock' }, 403);
    }

    const { data: child, error: childError } = await service
      .from('profiles')
      .select('id, role, parent_id, pin_hash, pin_locked_until, display_name')
      .eq('id', childId)
      .single();

    if (childError || !child || child.role !== 'child' || child.parent_id !== user.id) {
      return jsonResponse({ error: 'Child not found' }, 404);
    }

    if (child.pin_locked_until && new Date(child.pin_locked_until) > new Date()) {
      return jsonResponse(
        {
          error: 'PIN temporarily locked. Try again later or ask a parent to reset it.',
          locked_until: child.pin_locked_until,
        },
        429,
      );
    }

    if (!child.pin_hash) {
      return jsonResponse({ error: 'Child PIN is not set' }, 400);
    }

    const matches = await bcrypt.compare(pin, child.pin_hash);

    if (!matches) {
      const { data: failure } = await service.rpc('record_pin_failure', {
        p_child_id: childId,
        p_max_attempts: 5,
        p_lock_minutes: 15,
      });

      return jsonResponse(
        {
          error: 'Incorrect PIN',
          failed_attempts: failure?.[0]?.failed_attempts ?? null,
          locked_until: failure?.[0]?.locked_until ?? null,
        },
        401,
      );
    }

    await service.rpc('clear_pin_failures', { p_child_id: childId });

    return jsonResponse({
      ok: true,
      child: {
        id: child.id,
        display_name: child.display_name,
      },
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      500,
    );
  }
});
