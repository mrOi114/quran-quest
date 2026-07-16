import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { createServiceClient, createUserClient } from '../_shared/supabase.ts';

type Body = {
  device_key?: string;
  label?: string;
};

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
    const deviceKey = body.device_key?.trim();
    const label = body.label?.trim() || 'Device';

    if (!deviceKey || deviceKey.length < 8) {
      return jsonResponse({ error: 'Invalid device_key' }, 400);
    }

    const service = createServiceClient();
    const { data: profile, error: profileError } = await service
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return jsonResponse({ error: 'Profile not found' }, 404);
    }

    // Child unlock is parent-only; adults do not need an approved-device row.
    if (profile.role !== 'parent') {
      return jsonResponse({ error: 'Only parent accounts can register devices' }, 403);
    }

    const { data, error } = await service
      .from('approved_devices')
      .upsert(
        {
          parent_id: user.id,
          device_key: deviceKey,
          label,
        },
        { onConflict: 'parent_id,device_key' },
      )
      .select('id, parent_id, device_key, label, created_at')
      .single();

    if (error) {
      return jsonResponse({ error: error.message }, 400);
    }

    return jsonResponse({ device: data });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      500,
    );
  }
});
