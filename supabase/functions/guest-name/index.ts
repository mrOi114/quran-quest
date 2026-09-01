import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase.ts';

type Body = {
  display_name?: string;
  participant_key?: string;
};

function normalizeGuestDisplayName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = (await request.json()) as Body;
    const displayName = typeof body.display_name === 'string' ? body.display_name.trim() : '';
    const participantKey = typeof body.participant_key === 'string' ? body.participant_key.trim() : '';
    const normalized = normalizeGuestDisplayName(displayName);

    if (normalized.length < 2 || participantKey.length < 16) {
      return jsonResponse({ error: 'name_invalid' }, 400);
    }

    const service = createServiceClient();
    const keyHash = await sha256Hex(participantKey);
    const { data, error } = await service.rpc('claim_guest_display_name', {
      p_normalized: normalized,
      p_display: displayName,
      p_hash: keyHash,
    });

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    const payload = data as { ok?: boolean; error?: string } | null;
    if (!payload?.ok) {
      const code = payload?.error === 'name_taken' ? 'name_taken' : 'name_invalid';
      return jsonResponse({ error: code }, code === 'name_taken' ? 409 : 400);
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      500,
    );
  }
});
