import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase.ts';

type Body = {
  action?: string;
  category?: string;
  message?: string;
  display_name?: string;
  is_guest?: boolean;
  language?: string;
  participant_key?: string;
};

const RESERVED_FOUNDER_NICKNAME = 'founder';
const CATEGORIES = new Set(['idea', 'problem', 'praise']);
const MIN_MESSAGE = 8;
const MAX_MESSAGE = 1000;
const MAX_PER_HOUR = 8;

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function isFounderDevice(
  service: ReturnType<typeof createServiceClient>,
  keyHash: string,
): Promise<boolean> {
  const { data } = await service
    .from('guest_display_names')
    .select('normalized_name')
    .eq('normalized_name', RESERVED_FOUNDER_NICKNAME)
    .eq('participant_key_hash', keyHash)
    .maybeSingle();
  return Boolean(data);
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = (await request.json()) as Body;
    const action = typeof body.action === 'string' ? body.action : 'submit';
    const participantKey = typeof body.participant_key === 'string' ? body.participant_key.trim() : '';
    if (participantKey.length < 16) {
      return jsonResponse({ error: 'invalid' }, 400);
    }

    const service = createServiceClient();
    const keyHash = await sha256Hex(participantKey);

    if (action === 'list') {
      if (!(await isFounderDevice(service, keyHash))) {
        return jsonResponse({ error: 'forbidden' }, 403);
      }
      const { data, error } = await service
        .from('student_feedback')
        .select('id, created_at, category, message, display_name, is_guest, language')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }
      return jsonResponse({ ok: true, items: data ?? [] });
    }

    if (action !== 'submit') {
      return jsonResponse({ error: 'invalid' }, 400);
    }

    const category = typeof body.category === 'string' ? body.category.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!CATEGORIES.has(category) || message.length < MIN_MESSAGE || message.length > MAX_MESSAGE) {
      return jsonResponse({ error: 'invalid' }, 400);
    }

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await service
      .from('student_feedback')
      .select('id', { count: 'exact', head: true })
      .eq('participant_key_hash', keyHash)
      .gte('created_at', hourAgo);
    if ((count ?? 0) >= MAX_PER_HOUR) {
      return jsonResponse({ error: 'too_many' }, 429);
    }

    const displayName =
      typeof body.display_name === 'string' ? body.display_name.trim().slice(0, 80) : '';
    const language = typeof body.language === 'string' ? body.language.trim().slice(0, 12) : '';
    const { error } = await service.from('student_feedback').insert({
      category,
      message,
      display_name: displayName || null,
      is_guest: body.is_guest === true,
      language: language || null,
      participant_key_hash: keyHash,
    });
    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      500,
    );
  }
});
