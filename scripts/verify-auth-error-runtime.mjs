/**
 * Local runtime checks for parent-facing auth error mapping.
 * Does not call Supabase. Do not add signup / resend / reset API calls here.
 *
 * Run: node --experimental-strip-types ./scripts/verify-auth-error-runtime.mjs
 */
import { classifyAuthError } from '../src/features/auth/utils/authErrors.ts';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const cases = [
  [
    { message: 'User already registered', code: 'user_already_exists' },
    'already_registered',
    'This email already has an account.',
  ],
  [
    { message: 'Invalid login credentials', code: 'invalid_credentials' },
    'invalid_credentials',
    'Email or password is incorrect.',
  ],
  [
    { message: 'Email not confirmed', code: 'email_not_confirmed' },
    'email_not_confirmed',
    'Please verify your email before continuing.',
  ],
  [
    { message: 'Invalid OTP' },
    'otp_invalid',
    "That code isn't correct. Please try again.",
  ],
  [
    { message: 'Failed to fetch' },
    'network',
    "We couldn't connect right now. Please check your internet connection and try again.",
  ],
  [
    {
      message: 'For security purposes, you can only request this after 60 seconds.',
      code: 'over_email_send_rate_limit',
    },
    'rate_limited',
    'Please wait a minute before requesting another email.',
  ],
];

for (const [error, kind, message] of cases) {
  const mapped = classifyAuthError(error);
  assert(mapped.kind === kind, `kind mismatch for ${error.message}: ${mapped.kind}`);
  assert(mapped.message === message, `message mismatch for ${error.message}: ${mapped.message}`);
}

const verifyWrongCode = classifyAuthError(
  { message: 'Token has expired or is invalid', code: 'otp_expired' },
  'verify',
);
assert(verifyWrongCode.kind === 'otp_invalid', '6-digit wrong codes must stay on verification');
assert(
  verifyWrongCode.message === "That code isn't correct. Please try again.",
  '6-digit wrong codes must use the incorrect-code copy',
);

const recovery = classifyAuthError(
  { message: 'Email link is invalid or has expired' },
  'recovery',
);
assert(recovery.kind === 'recovery_expired', 'recovery expired kind');
assert(
  recovery.message === 'This reset link has expired. Request a new one.',
  'recovery expired message',
);

console.log('Auth error runtime checks passed.');
