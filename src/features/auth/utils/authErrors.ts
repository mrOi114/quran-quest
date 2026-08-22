export type AuthErrorKind =
  | 'already_registered'
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'network'
  | 'otp_invalid'
  | 'otp_expired'
  | 'generic';

export const NETWORK_MESSAGE =
  "We couldn't connect right now. Please check your internet connection and try again.";
export const ALREADY_REGISTERED_MESSAGE = 'This email already has an account.';
export const INVALID_CREDENTIALS_MESSAGE = 'Email or password is incorrect.';
export const EMAIL_NOT_CONFIRMED_MESSAGE = 'Please verify your email before continuing.';
export const OTP_INVALID_MESSAGE = "That code isn't correct. Please try again.";
export const OTP_EXPIRED_MESSAGE = 'This code has expired. Send a new one.';
export const GENERIC_AUTH_MESSAGE = 'Something went wrong. Please try again.';
export const RESEND_SUCCESS_MESSAGE = 'Verification email sent. Check your inbox and spam folder.';
export const RESEND_FAILURE_MESSAGE = "We couldn't resend the verification email. Please try again.";

export class EmailAuthError extends Error {
  readonly code?: string;
  readonly kind: AuthErrorKind;

  constructor(message: string, code?: string, kind: AuthErrorKind = 'generic') {
    super(message);
    this.name = 'EmailAuthError';
    this.code = code;
    this.kind = kind;
  }
}

function readErrorText(error: unknown): { message: string; code: string } {
  if (error instanceof EmailAuthError) {
    return { message: error.message, code: error.code ?? error.kind };
  }
  if (error instanceof Error) {
    const code =
      'code' in error && typeof error.code === 'string' ? error.code : '';
    return { message: error.message, code };
  }
  if (typeof error === 'object' && error !== null) {
    const record = error as { message?: unknown; code?: unknown; error_description?: unknown };
    return {
      message: String(record.message ?? record.error_description ?? ''),
      code: String(record.code ?? ''),
    };
  }
  return { message: String(error ?? ''), code: '' };
}

export function logAuthError(error: unknown): void {
  if (__DEV__) {
    console.error('[auth]', error);
  }
}

export function isNetworkError(error: unknown): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return true;
  }
  const { message, code } = readErrorText(error);
  const combined = `${code} ${message}`.toLowerCase();
  return (
    code === 'network' ||
    /failed to fetch|network request failed|networkerror|network error|internet|offline|timeout|timed out|load failed|fetch failed|connection/i.test(
      combined,
    )
  );
}

export function isEmailNotConfirmedError(error: unknown): boolean {
  if (error instanceof EmailAuthError && error.kind === 'email_not_confirmed') {
    return true;
  }
  const { message, code } = readErrorText(error);
  return code === 'email_not_confirmed' || /email not confirmed/i.test(message);
}

export function classifyAuthError(error: unknown): {
  kind: AuthErrorKind;
  message: string;
  code?: string;
} {
  if (error instanceof EmailAuthError) {
    return { kind: error.kind, message: error.message, code: error.code };
  }

  if (isNetworkError(error)) {
    return { kind: 'network', message: NETWORK_MESSAGE, code: 'network' };
  }

  const { message, code } = readErrorText(error);
  const combined = `${code} ${message}`.toLowerCase();

  if (
    code === 'email_not_confirmed' ||
    /email not confirmed/i.test(combined)
  ) {
    return {
      kind: 'email_not_confirmed',
      message: EMAIL_NOT_CONFIRMED_MESSAGE,
      code: 'email_not_confirmed',
    };
  }

  if (
    code === 'user_already_exists' ||
    code === 'email_exists' ||
    /already registered|already been registered|already exists|user already/i.test(
      combined,
    )
  ) {
    return {
      kind: 'already_registered',
      message: ALREADY_REGISTERED_MESSAGE,
      code: code || 'user_already_exists',
    };
  }

  if (
    code === 'otp_expired' ||
    (/expired/i.test(combined) && /otp|token|code|link|email/i.test(combined))
  ) {
    return { kind: 'otp_expired', message: OTP_EXPIRED_MESSAGE, code: code || 'otp_expired' };
  }

  if (
    code === 'otp_expired' ||
    code === 'invalid_token' ||
    /invalid otp|incorrect otp|otp is invalid|token has expired or is invalid|invalid token|token is invalid/i.test(
      combined,
    )
  ) {
    const expired = /expired/i.test(combined);
    return {
      kind: expired ? 'otp_expired' : 'otp_invalid',
      message: expired ? OTP_EXPIRED_MESSAGE : OTP_INVALID_MESSAGE,
      code: code || (expired ? 'otp_expired' : 'otp_invalid'),
    };
  }

  if (
    code === 'invalid_credentials' ||
    code === 'invalid_grant' ||
    /invalid login credentials|invalid credentials|wrong password|invalid password|email or password/i.test(
      combined,
    )
  ) {
    return {
      kind: 'invalid_credentials',
      message: INVALID_CREDENTIALS_MESSAGE,
      code: code || 'invalid_credentials',
    };
  }

  return { kind: 'generic', message: GENERIC_AUTH_MESSAGE, code: code || undefined };
}

export function toFriendlyAuthError(error: unknown): EmailAuthError {
  if (error instanceof EmailAuthError) {
    return error;
  }
  const mapped = classifyAuthError(error);
  return new EmailAuthError(mapped.message, mapped.code, mapped.kind);
}
