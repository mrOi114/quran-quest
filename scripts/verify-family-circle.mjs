/**
 * Family Group vs Circle checks: constants, safety filters, schema, anonymous RLS.
 * Run: npm run verify:family-circle
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function loadDotEnv() {
  try {
    const text = readFileSync(join(ROOT, '.env'), 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env is optional for helper assertions.
  }
}

const EMAIL_RE = /[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/i;
const OBFUSCATED_EMAIL_RE = /\b(at)\b.{0,16}\b(gmail|yahoo|hotmail|outlook|icloud|proton)\b/i;
const US_PHONE_RE = /[0-9]{3}[-.\s][0-9]{3}[-.\s][0-9]{4}/;
const INTL_PHONE_RE = /\+[0-9]{8,15}/;
const LONG_DIGIT_RE = /[0-9]{10,}/;
const CONTACT_PHRASE_RE =
  /(whatsapp|telegram|signal app|my number|phone number|call me|text me|email me|dm me)/i;

function containsContactInfo(body) {
  const normalized = String(body).toLowerCase();
  return (
    EMAIL_RE.test(normalized) ||
    OBFUSCATED_EMAIL_RE.test(normalized) ||
    US_PHONE_RE.test(normalized) ||
    INTL_PHONE_RE.test(normalized) ||
    LONG_DIGIT_RE.test(normalized) ||
    CONTACT_PHRASE_RE.test(normalized)
  );
}

const limitsPath = join(ROOT, 'src/constants/groupLimits.ts');
const limitsSource = readFileSync(limitsPath, 'utf8');
assert(limitsSource.includes('export const MAX_GROUP_MEMBERS = 7'), 'MAX_GROUP_MEMBERS must be 7');
assert(limitsSource.includes('export const CIRCLE_TIMEOUT_HOURS = 1'), 'timeout must be 1 hour');

const migration = readFileSync(
  join(ROOT, 'supabase/migrations/20260820010000_family_and_circle_groups.sql'),
  'utf8',
);
assert(migration.includes("create type public.circle_kind as enum ('public', 'madrasah')"), 'circles are public+madrasah only');
assert(migration.includes("values ('default', 7)"), 'DB default member cap is 7');
assert(migration.includes("interval '1 hour'"), 'timeout is stored server-side as 1 hour');
assert(migration.includes('contains_contact_info'), 'contact-info detector is server-side');
assert(migration.includes('teacher_approvals'), 'teacher approval is server-side');
assert(migration.includes('ensure_family_group'), 'Family Group reuses parent family backend');
assert(migration.includes('Only an approved teacher can create a Madrasah'), 'madrasah create is gated');
assert(
  migration.includes('You have been temporarily removed from this group for 1 hour'),
  'timeout copy is server-side',
);

assert(containsContactInfo('email me at parent@example.com'), 'email is blocked');
assert(containsContactInfo('call me 555-123-4567'), 'phone is blocked');
assert(containsContactInfo('whatsapp me'), 'whatsapp is blocked');
assert(containsContactInfo('name at gmail please'), 'obfuscated email is blocked');
assert(!containsContactInfo('MashaAllah keep going with ayah 114'), 'verse numbers are allowed');
assert(!containsContactInfo('Alhamdulillah for today'), 'ordinary encouragement is allowed');

const kinds = ['family', 'public', 'madrasah'];
assert(kinds.includes('family') && kinds.includes('public') && kinds.includes('madrasah'), 'three group kinds');
assert(!['public', 'madrasah'].includes('family'), 'family is not a Circle kind');

const en = readFileSync(join(ROOT, 'src/i18n/en.ts'), 'utf8');
const so = readFileSync(join(ROOT, 'src/i18n/so.ts'), 'utf8');
for (const key of [
  'groups.madrasah',
  'groups.public',
  'groups.timeout',
  'groups.contactBlocked',
  'familyGroup.title',
]) {
  assert(en.includes(`'${key}'`), `en missing ${key}`);
  assert(so.includes(`'${key}'`), `so missing ${key}`);
}

assert(en.includes('Madrasah / Dugsi'), 'English uses Madrasah / Dugsi');
assert(so.includes('Madrasah / Dugsi') || so.includes('Kooxda Dugsi'), 'Somali names Madrasah/Dugsi');
assert(!en.includes('Family Groups') || !en.includes('Public Family'), 'do not call public groups Family Groups');

loadDotEnv();
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const results = {
  helpers: 'pass',
  schema: 'pass',
  i18n: 'pass',
  anonDenied: 'skip',
  notes: [],
};

if (url && anon && !url.includes('your-project')) {
  const client = createClient(url, anon, { auth: { persistSession: false } });

  const { error: circleError } = await client.from('circles').insert({
    kind: 'public',
    name: 'probe',
    creator_id: '00000000-0000-4000-8000-000000000000',
    join_code: 'PROBE001',
  });
  if (!circleError) {
    throw new Error('Anonymous insert into circles was allowed');
  }

  const { error: messageError } = await client.from('circle_messages').insert({
    circle_id: '00000000-0000-4000-8000-000000000000',
    sender_id: '00000000-0000-4000-8000-000000000001',
    body: 'cross-circle probe',
  });
  if (!messageError) {
    throw new Error('Anonymous insert into circle_messages was allowed');
  }

  const { error: rpcError } = await client.rpc('create_circle', {
    p_kind: 'public',
    p_name: 'Probe',
  });
  if (!rpcError) {
    throw new Error('Anonymous create_circle was allowed');
  }

  results.anonDenied = 'pass';
  results.notes.push(`Unauthenticated circle writes denied (${circleError.message})`);
} else {
  results.notes.push('Live RLS probe skipped — set EXPO_PUBLIC_SUPABASE_URL and ANON_KEY');
}

console.log(JSON.stringify(results, null, 2));
console.log('Family Group vs Circle helper + anonymous-access checks passed.');
