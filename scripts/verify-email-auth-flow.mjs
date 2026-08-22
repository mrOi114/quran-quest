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
const authErrors = read('src/features/auth/utils/authErrors.ts');
const sessionLink = read('src/features/auth/services/sessionLinkService.ts');
const supabaseClient = read('src/lib/supabase/client.ts');
const authContext = read('src/features/auth/context/AuthContext.tsx');
const login = read('app/(auth)/login.tsx');
const register = read('app/(auth)/register.tsx');
const welcome = read('app/(auth)/welcome.tsx');
const verifyEmail = read('app/(auth)/verify-email.tsx');
const forgotPassword = read('app/(auth)/forgot-password.tsx');
const resetPassword = read('app/(auth)/reset-password.tsx');
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
  authService.includes('verifyOtp') && authService.includes("type: 'signup'"),
  'OTP verify must call supabase.auth.verifyOtp with type signup',
);
assert(
  authErrors.includes('EMAIL_NOT_CONFIRMED_MESSAGE'),
  'Unverified login must have a dedicated message',
);
assert(
  authErrors.includes('RESEND_SUCCESS_MESSAGE'),
  'Resend success copy must be centralized',
);
assert(
  authErrors.includes("We couldn't connect right now. Please check your internet connection and try again."),
  'Network failures must use the parent-friendly connection message',
);
assert(
  login.includes('isEmailNotConfirmedError') && login.includes("reason: 'unverified'"),
  'Login must send unverified users to the verification screen, not keep them on login',
);
assert(
  !login.includes('Resend verification email'),
  'Login must not keep unverified users on a login resend loop',
);
assert(
  login.includes('Welcome back'),
  'Login success must greet the parent before entering the app',
);
assert(
  !login.includes('registerCurrentDevice'),
  'Login must not block navigation on device registration',
);
assert(
  welcome.includes('Continue as Guest') &&
    welcome.includes('Create Account') &&
    welcome.includes('Log In') &&
    welcome.includes('child-entry'),
  'Welcome must lead with Guest, Create Account, and Log In, with child family-code still reachable',
);
assert(
  register.includes("'/(auth)/verify-email'"),
  'Signup with email confirmation must open the verification screen',
);
assert(
  register.includes('ALREADY_REGISTERED_MESSAGE') && register.includes('already_registered'),
  'Existing email signup must show a friendly already-has-an-account path',
);
assert(
  verifyEmail.includes('Check your email') && verifyEmail.includes('verifySignupOtp'),
  'Verification screen must accept the 6-digit email code',
);
assert(
  verifyEmail.includes('useResendCooldown') && verifyEmail.includes('resendVerificationEmail'),
  'Verification screen must resend with a cooldown',
);
assert(
  verifyEmail.includes('Open Email') && verifyEmail.includes('Change Email'),
  'Verification screen must offer Open Email and Change Email',
);
assert(
  !verifyEmail.includes("router.replace('/(auth)/login')"),
  'Verification screen must not bounce the parent back to login',
);
assert(
  forgotPassword.includes('Reset your password') && resetPassword.includes('Password updated'),
  'Password reset must finish with an updated-password confirmation, not email verification',
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
  sessionLink.includes('isAuthCallbackProcessing') && authContext.includes('isProcessingAuthCallback'),
  'Callback processing must be shared so layouts do not treat a pending link as signed out',
);
assert(
  !read('app/index.tsx').includes('isAccountHydrating'),
  'App entry must not wait on profile/device hydration after authentication',
);
assert(
  resetPassword.includes('Save New Password') && resetPassword.includes('Request a new reset email'),
  'Reset password must save a new password and recover from a consumed link',
);
assert(
  callbackScreen.includes('handleAuthRedirectUrl') &&
    callbackScreen.includes('Verification could not be completed. Please try again.') &&
    callbackScreen.includes('Email verified!'),
  'Callback UI must exchange the session, show a recoverable error, and confirm verification',
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

const recoveryUrl = parseAuthUrl(
  'https://quran-quest-5640.vercel.app/callback#access_token=tok&refresh_token=ref&type=recovery',
);
assert(recoveryUrl.type === 'recovery', 'Recovery callback must parse type=recovery');

const nativeRecovery = parseAuthUrl('quranfamily://auth/callback?type=recovery&access_token=tok');
assert(nativeRecovery.type === 'recovery', 'Native recovery callback must parse type=recovery');

console.log('Email auth flow checks passed.');
