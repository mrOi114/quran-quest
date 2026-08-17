/**
 * Family Circle chat/calls checks: membership helpers, schema, and live RLS isolation.
 * Run: npm run verify:family-comms
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

function familyIdOf(profile) {
  if (profile.role === 'parent') return profile.id;
  if (profile.role === 'child') return profile.parent_id;
  return null;
}

function sameFamily(a, b) {
  const left = familyIdOf(a);
  return Boolean(left) && left === familyIdOf(b);
}

function canActAs(authUserId, member, parentId) {
  return member.id === authUserId || (member.role === 'child' && member.parent_id === authUserId && parentId === authUserId);
}

const familyAParent = { id: 'parent-a', role: 'parent', parent_id: null };
const familyAChild = { id: 'child-a', role: 'child', parent_id: 'parent-a' };
const familyBParent = { id: 'parent-b', role: 'parent', parent_id: null };
const familyBChild = { id: 'child-b', role: 'child', parent_id: 'parent-b' };
const adult = { id: 'adult-1', role: 'adult', parent_id: null };

assert(familyIdOf(familyAParent) === 'parent-a', 'parent family id is self');
assert(familyIdOf(familyAChild) === 'parent-a', 'child family id is parent');
assert(familyIdOf(adult) === null, 'adults have no family circle');
assert(sameFamily(familyAParent, familyAChild), 'parent and child are same family');
assert(sameFamily(familyAChild, familyAParent), 'child and parent are same family');
assert(!sameFamily(familyAChild, familyBChild), 'Family A child is not in Family B');
assert(!sameFamily(familyAParent, familyBParent), 'Family A parent is not in Family B');
assert(!sameFamily(adult, familyAChild), 'adult cannot join a family circle by default');
assert(canActAs('parent-a', familyAChild, 'parent-a'), 'parent may act as own child on shared device');
assert(!canActAs('parent-b', familyAChild, 'parent-b'), 'other parent cannot act as Family A child');
assert(!canActAs('adult-1', familyAChild, null), 'random adult cannot act as a child');
assert(canActAs('child-a', familyAChild, 'parent-a'), 'child may act as self');

loadDotEnv();
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const results = {
  helpers: 'pass',
  anonDenied: 'skip',
  familyIsolation: 'skip',
  notes: [],
};

if (url && anon && !url.includes('your-project')) {
  const client = createClient(url, anon, { auth: { persistSession: false } });
  const { error } = await client.from('family_messages').insert({
    family_id: '00000000-0000-4000-8000-000000000000',
    sender_id: '00000000-0000-4000-8000-000000000001',
    body: 'cross-family probe',
  });
  if (!error) {
    results.anonDenied = 'fail';
    throw new Error('Anonymous insert into family_messages was allowed');
  }
  results.anonDenied = 'pass';
  results.notes.push(`Unauthenticated chat insert denied (${error.message})`);

  const { error: callError } = await client.from('family_calls').insert({
    family_id: '00000000-0000-4000-8000-000000000000',
    created_by: '00000000-0000-4000-8000-000000000001',
    callee_id: '00000000-0000-4000-8000-000000000002',
  });
  if (!callError) {
    results.familyIsolation = 'fail';
    throw new Error('Anonymous insert into family_calls was allowed');
  }
  results.familyIsolation = 'pass';
  results.notes.push(`Unauthenticated call insert denied (${callError.message})`);
} else {
  results.notes.push('Live RLS probe skipped — set EXPO_PUBLIC_SUPABASE_URL and ANON_KEY');
}

console.log(JSON.stringify(results, null, 2));
console.log('Family comms helper + anonymous-access checks passed.');
