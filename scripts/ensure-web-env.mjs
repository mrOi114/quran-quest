/**
 * Fail Expo web builds when required EXPO_PUBLIC_* vars are missing.
 * Expo inlines these at export time; an empty URL crashes the SPA to a blank green page.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadDotEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

// Prefer project secrets first; .env.local from `vercel link` may only have OIDC.
loadDotEnvFile('.env');
loadDotEnvFile('.env.local');

const required = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
];

const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length === 0) {
  console.log(`[ensure-web-env] OK: ${required.join(', ')}`);
  process.exit(0);
}

const onVercel = process.env.VERCEL === '1';
const message = `[ensure-web-env] Missing required env for web export: ${missing.join(', ')}`;

if (onVercel) {
  console.error(message);
  console.error(
    'Set these on the Vercel project (Production + Preview). Expo inlines EXPO_PUBLIC_* at build time.',
  );
  process.exit(1);
}

console.warn(`${message} (non-Vercel — continuing; Expo may still load .env)`);
process.exit(0);
