/**
 * Parent-facing auth error mapping contracts.
 * Run: node ./scripts/verify-auth-error-mapping.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(ROOT, 'src/features/auth/utils/authErrors.ts'), 'utf8');
const login = readFileSync(join(ROOT, 'app/(auth)/login.tsx'), 'utf8');
const register = readFileSync(join(ROOT, 'app/(auth)/register.tsx'), 'utf8');
const verifyEmail = readFileSync(join(ROOT, 'app/(auth)/verify-email.tsx'), 'utf8');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(
  source.includes("We couldn't connect right now. Please check your internet connection and try again."),
  'Network errors must use the connection copy',
);
assert(source.includes('This email already has an account.'), 'Existing email copy missing');
assert(source.includes('Email or password is incorrect.'), 'Wrong-password copy missing');
assert(source.includes("That code isn't correct. Please try again."), 'Wrong OTP copy missing');
assert(source.includes('This code has expired. Send a new one.'), 'Expired OTP copy missing');
assert(source.includes('__DEV__'), 'Technical errors must log in __DEV__ only');
assert(!source.includes('Invalid login credentials'), 'Must not show raw Supabase credential errors');
assert(login.includes('invalid_credentials') && login.includes('Try Again'), 'Wrong password must offer Try Again');
assert(register.includes('already_registered') && register.includes('Forgot Password'), 'Existing email must offer Forgot Password');
assert(verifyEmail.includes('OTP_EXPIRED_MESSAGE') && verifyEmail.includes('otp_invalid'), 'OTP screen must map expired and invalid codes');
assert(!login.includes('registerCurrentDevice'), 'Device registration must not block login');

console.log('Auth error mapping checks passed.');
