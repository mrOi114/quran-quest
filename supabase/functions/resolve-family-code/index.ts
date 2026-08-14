import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase.ts';

type Body = {
  family_code?: string;
};

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

    if (familyCode.length < 4 || familyCode.length > 12) {
      return jsonResponse({ error: 'Enter a valid family code' }, 400);
    }

    const service = createServiceClient();

    const { data: parent, error: parentError } = await service
      .from('profiles')
      .select('id, display_name, role, family_code')
      .eq('family_code', familyCode)
      .eq('role', 'parent')
      .maybeSingle();

    if (parentError || !parent) {
      return jsonResponse({ error: 'Family code not found. Ask your parent for the code.' }, 404);
    }

    const { data: children, error: childrenError } = await service
      .from('profiles')
      .select('id, display_name, age, avatar_key, preferred_language, country_code, parent_id, role')
      .eq('parent_id', parent.id)
      .eq('role', 'child')
      .order('display_name', { ascending: true });

    if (childrenError) {
      return jsonResponse({ error: childrenError.message }, 500);
    }

    return jsonResponse({
      ok: true,
      family_code: parent.family_code,
      family_name: parent.display_name,
      parent_id: parent.id,
      children: (children ?? []).map((child) => ({
        id: child.id,
        display_name: child.display_name,
        age: child.age,
        avatar_key: child.avatar_key,
        preferred_language: child.preferred_language,
        country_code: child.country_code,
        parent_id: child.parent_id,
        role: child.role,
      })),
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      500,
    );
  }
});
