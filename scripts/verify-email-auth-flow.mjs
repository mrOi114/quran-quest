/**
 * Email signup / verification / login flow contracts.
 * Run: node ./scripts/verify-email-auth-flow.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(relPath) {
  return readFileSync(join(ROOT, relPath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const authService = read('src/features/auth/services/authService.ts');
const sessionLink = read('src/features/auth/services/sessionLinkService.ts');
const supabaseClient = read('src/lib/supabase/client.ts');
const authContext = read('src/features/auth/context/AuthContext.tsx');
const login = read('app/(auth)/login.tsx');
const register = read('app/(auth)/register.tsx');
const verifyEmail = read('app/(auth)/verify-email.tsx');
const callbackScreen = read('src/features/auth/components/AuthCallbackScreen.tsx');
const webCallback = read('app/(auth)/callback.tsx');
const nativeCallback = read('app/auth/callback.tsx');
const guestScript = read('scripts/verify-guest-session.mjs');

assert(
  supabaseClient.includes("flowType: 'implicit'"),
  'Supabase client must use implicit flow so email links do not require a PKCE verifier',
);
assert(
  supabaseClient.includes('detectSessionInUrl: false'),
  'Session exchange must stay manual via the callback handler',
);
assert(
  authService.includes("return 'quranfamily://auth/callback'"),
  'Native emailRedirectTo must stay quranfamily://auth/callback',
);
assert(
  authService.includes('${origin}/callback') || authService.includes('`${origin}/callback`'),
  'Web emailRedirectTo must be origin/callback',
);
assert(
  authService.includes("type: 'signup'"),
  'Resend must call supabase.auth.resend with type signup',
);
assert(
  authService.includes('EMAIL_NOT_CONFIRMED_MESSAGE'),
  'Unverified login must have a dedicated message',
);
assert(
  authService.includes('RESEND_SUCCESS_MESSAGE'),
  'Resend success copy must be centralized',
);
assert(
  login.includes('isEmailNotConfirmedError') && login.includes('Resend verification email'),
  'Login must stop unverified users and offer resend',
);
assert(
  login.includes('EMAIL_NOT_CONFIRMED_MESSAGE'),
  'Login must show Please verify your email before signing in',
);
assert(
  !login.includes('registerCurrentDevice'),
  'Login must not block navigation on device registration',
);
assert(
  register.includes("'/(auth)/verify-email'"),
  'Signup with email confirmation must open the verification screen',
);
assert(
  verifyEmail.includes('Check your email'),
  'Verification screen must tell the user to check email',
);
assert(
  verifyEmail.includes('RESEND_COOLDOWN_MS') && verifyEmail.includes('resendVerificationEmail'),
  'Verification screen must resend with a cooldown',
);
assert(
  verifyEmail.includes('Sign in') && verifyEmail.includes('Back'),
  'Verification screen must provide Sign in and Back',
);
assert(
  sessionLink.includes('token_hash') &&
    sessionLink.includes('exchangeCodeForSession') &&
    sessionLink.includes('setSession'),
  'Callback must handle token_hash, PKCE code, and implicit tokens',
);
assert(
  sessionLink.includes('handledSecrets') && sessionLink.includes('inFlight'),
  'Callback exchange must be idempotent to avoid double-using a PKCE code',
);
assert(
  callbackScreen.includes('handleAuthRedirectUrl') &&
    callbackScreen.includes('Verification could not be completed. Please try again.'),
  'Callback UI must exchange the session and show a recoverable error',
);
assert(
  webCallback.includes('AuthCallbackScreen') && nativeCallback.includes('AuthCallbackScreen'),
  'Web /callback and native auth/callback must share the same handler',
);
assert(
  authContext.includes('isAuthCallbackLocation(initialUrl)'),
  'Guest restore must not skip session restore on the auth callback',
);
assert(
  authContext.includes('hydrateGuestFromStorage()') &&
    authContext.indexOf('hydrateGuestFromStorage()') < authContext.indexOf('await getSession()'),
  'Guest Mode must still restore before email session lookup',
);
assert(
  guestScript.includes("const GUEST_SESSION_KEY = 'qq.guest.session_active'"),
  'Guest persistence verifier must remain in the repo',
);

function parseAuthUrl(urlString) {
  const url = new URL(urlString);
  const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
  const hashParams = new URLSearchParams(hash);
  return {
    code: url.searchParams.get('code') || hashParams.get('code'),
    accessToken: url.searchParams.get('access_token') || hashParams.get('access_token'),
    refreshToken: url.searchParams.get('refresh_token') || hashParams.get('refresh_token'),
    tokenHash: url.searchParams.get('token_hash') || hashParams.get('token_hash'),
    type: url.searchParams.get('type') || hashParams.get('type'),
  };
}

const webCallbackUrl = parseAuthUrl(
  'https://quran-quest-5640.vercel.app/callback#access_token=tok&refresh_token=ref&type=signup',
);
assert(webCallbackUrl.accessToken === 'tok', 'Web implicit callback must parse access_token');
assert(webCallbackUrl.type === 'signup', 'Web implicit callback must parse type=signup');

const pkceUrl = parseAuthUrl('https://quran-quest-5640.vercel.app/callback?code=abc123');
assert(pkceUrl.code === 'abc123', 'Web PKCE callback must parse code');

const nativeUrl = parseAuthUrl('quranfamily://auth/callback?token_hash=hash1&type=signup');
assert(nativeUrl.tokenHash === 'hash1', 'Native callback must parse token_hash');
assert(nativeUrl.type === 'signup', 'Native callback must parse type');

console.log('Email auth flow checks passed.');
