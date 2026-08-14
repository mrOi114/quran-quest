import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase.ts';

type Body = {
  family_code?: string;
  child_id?: string;
  pin?: string;
  device_key?: string;
  device_label?: string;
};

function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}

function normalizeCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = (await request.json()) as Body;
    const familyCode = normalizeCode(body.family_code ?? '');
    const childId = body.child_id?.trim();
    const pin = body.pin?.trim();
    const deviceKey = body.device_key?.trim();
    const deviceLabel = body.device_label?.trim() || 'Child device';

    if (!familyCode || !childId || !pin || !deviceKey || !isValidPin(pin)) {
      return jsonResponse(
        { error: 'family_code, child_id, device_key, and a 4–6 digit PIN are required' },
        400,
      );
    }

    const service = createServiceClient();

    const { data: parent, error: parentError } = await service
      .from('profiles')
      .select('id, role, family_code')
      .eq('family_code', familyCode)
      .eq('role', 'parent')
      .maybeSingle();

    if (parentError || !parent) {
      return jsonResponse({ error: 'Family code not found' }, 404);
    }

    const { data: child, error: childError } = await service
      .from('profiles')
      .select(
        'id, role, parent_id, pin_hash, pin_locked_until, display_name, age, avatar_key, country_code, preferred_language',
      )
      .eq('id', childId)
      .single();

    if (
      childError ||
      !child ||
      child.role !== 'child' ||
      child.parent_id !== parent.id
    ) {
      return jsonResponse({ error: 'Child not found in this family' }, 404);
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
      return jsonResponse({ error: 'Child PIN is not set. Ask a parent to set it.' }, 400);
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

    // Approve this device for the family so future parent-session unlocks also work.
    await service.from('approved_devices').upsert(
      {
        parent_id: parent.id,
        device_key: deviceKey,
        label: deviceLabel,
      },
      { onConflict: 'parent_id,device_key' },
    );

    return jsonResponse({
      ok: true,
      family_code: parent.family_code,
      parent_id: parent.id,
      child: {
        id: child.id,
        role: child.role,
        display_name: child.display_name,
        age: child.age,
        avatar_key: child.avatar_key,
        country_code: child.country_code,
        preferred_language: child.preferred_language,
        parent_id: child.parent_id,
      },
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      500,
    );
  }
});
