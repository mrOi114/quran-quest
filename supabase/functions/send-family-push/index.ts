import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { createServiceClient, createUserClient } from '../_shared/supabase.ts';

type Body = {
  kind?: 'message' | 'call';
  family_id?: string;
  recipient_ids?: string[];
  title?: string;
  body?: string;
  call_id?: string;
};

type PushMessage = {
  to: string;
  title: string;
  body: string;
  sound: 'default';
  channelId?: string;
  categoryId?: string;
  data: Record<string, string>;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
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

    const payload = (await request.json()) as Body;
    const familyId = payload.family_id?.trim();
    const kind = payload.kind === 'call' ? 'call' : 'message';
    const recipients = (payload.recipient_ids ?? []).map((id) => id.trim()).filter(Boolean);

    if (!familyId || !isUuid(familyId) || recipients.length === 0) {
      return jsonResponse({ error: 'family_id and recipient_ids are required' }, 400);
    }

    const service = createServiceClient();
    const { data: actor, error: actorError } = await service
      .from('profiles')
      .select('id, role, parent_id, display_name')
      .eq('id', user.id)
      .single();

    if (actorError || !actor) {
      return jsonResponse({ error: 'Access denied' }, 403);
    }

    const actorFamilyId = actor.role === 'parent' ? actor.id : actor.parent_id;
    if (!actorFamilyId || actorFamilyId !== familyId) {
      return jsonResponse({ error: 'Access denied' }, 403);
    }

    const uniqueRecipients = [...new Set(recipients)].filter((id) => id !== user.id);
    if (uniqueRecipients.length === 0) {
      return jsonResponse({ ok: true, sent: 0 });
    }

    const { data: memberRows, error: memberError } = await service
      .from('profiles')
      .select('id, role, parent_id')
      .in('id', uniqueRecipients);

    if (memberError) {
      return jsonResponse({ error: 'Access denied' }, 403);
    }

    const allowedIds = (memberRows ?? [])
      .filter((row) => {
        const rowFamily = row.role === 'parent' ? row.id : row.parent_id;
        return rowFamily === familyId;
      })
      .map((row) => row.id);

    if (allowedIds.length === 0) {
      return jsonResponse({ error: 'Access denied' }, 403);
    }

    const { data: tokens } = await service
      .from('family_push_tokens')
      .select('expo_push_token, profile_id')
      .in('profile_id', allowedIds);

    const messages: PushMessage[] = (tokens ?? [])
      .filter((row) => typeof row.expo_push_token === 'string' && row.expo_push_token.startsWith('ExponentPushToken['))
      .map((row) => ({
        to: row.expo_push_token,
        title:
          payload.title?.trim() ||
          (kind === 'call' ? 'Incoming Family Call' : 'Family Chat'),
        body:
          payload.body?.trim() ||
          (kind === 'call' ? `${actor.display_name} is calling` : 'New family message'),
        sound: 'default',
        channelId: kind === 'call' ? 'family-calls' : 'family-chat',
        categoryId: kind === 'call' ? 'family_call' : undefined,
        data: {
          kind,
          family_id: familyId,
          call_id: payload.call_id ?? '',
        },
      }));

    if (messages.length === 0) {
      return jsonResponse({ ok: true, sent: 0 });
    }

    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    if (!expoResponse.ok) {
      return jsonResponse({ ok: true, sent: 0, warning: 'Push gateway unavailable' });
    }

    return jsonResponse({ ok: true, sent: messages.length });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      500,
    );
  }
});
