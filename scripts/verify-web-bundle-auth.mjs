/**
 * Fail the web export if the bundle was inlined with placeholder Supabase values.
 * Run after `expo export -p web`.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WEB_JS = join(ROOT, 'dist', '_expo', 'static', 'js', 'web');
const PROJECT_REF = 'wgyxhcdvqqdcthoeulzn';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const files = readdirSync(WEB_JS).filter((name) => name.endsWith('.js'));
assert(files.length > 0, 'No web JS bundles found in dist/_expo/static/js/web');

const combined = files
  .map((name) => readFileSync(join(WEB_JS, name), 'utf8'))
  .join('\n');

assert(
  combined.includes(PROJECT_REF),
  `Web bundle is missing the QuranFamily Supabase project (${PROJECT_REF}). Clear Metro/Babel cache and rebuild with EXPO_PUBLIC_SUPABASE_URL.`,
);
assert(
  combined.includes('/callback'),
  'Web bundle is missing the web auth callback /callback',
);
assert(
  !combined.includes('your-project.supabase.co') && !combined.includes('your-anon-key'),
  'Web bundle was inlined with placeholder Supabase credentials. Clear cache and rebuild with the real EXPO_PUBLIC_* values.',
);

console.log('Web bundle auth config checks passed.');
