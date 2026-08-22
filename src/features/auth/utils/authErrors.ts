export type AuthErrorKind =
  | 'already_registered'
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'network'
  | 'otp_invalid'
  | 'otp_expired'
  | 'recovery_expired'
  | 'rate_limited'
  | 'weak_password'
  | 'generic';

export const NETWORK_MESSAGE =
  "We couldn't connect right now. Please check your internet connection and try again.";
export const ALREADY_REGISTERED_MESSAGE = 'This email already has an account.';
export const INVALID_CREDENTIALS_MESSAGE = 'Email or password is incorrect.';
export const EMAIL_NOT_CONFIRMED_MESSAGE = 'Please verify your email before continuing.';
export const OTP_INVALID_MESSAGE = "That code isn't correct. Please try again.";
export const OTP_EXPIRED_MESSAGE = 'This code has expired. Send a new one.';
export const RESET_EXPIRED_MESSAGE = 'This reset link has expired. Request a new one.';
export const GENERIC_AUTH_MESSAGE = 'Something went wrong. Please try again.';
export const RESEND_SUCCESS_MESSAGE = 'Verification email sent. Check your inbox and spam folder.';
export const RESEND_FAILURE_MESSAGE = "We couldn't resend the verification email. Please try again.";
export const RATE_LIMIT_MESSAGE = 'Please wait a minute before requesting another email.';
export const WEAK_PASSWORD_MESSAGE = 'Please choose a stronger password.';

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

export type AuthErrorFlow = 'recovery' | 'signup' | 'login' | 'verify' | 'unknown';

function readErrorText(error: unknown): { message: string; code: string; status: string } {
  if (error instanceof EmailAuthError) {
    return { message: error.message, code: error.code ?? error.kind, status: '' };
  }
  if (error instanceof Error) {
    const record = error as Error & { code?: unknown; status?: unknown };
    return {
      message: error.message,
      code: typeof record.code === 'string' ? record.code : '',
      status: typeof record.status === 'number' ? String(record.status) : '',
    };
  }
  if (typeof error === 'object' && error !== null) {
    const record = error as {
      message?: unknown;
      code?: unknown;
      error_description?: unknown;
      error?: unknown;
      status?: unknown;
    };
    return {
      message: String(record.message ?? record.error_description ?? record.error ?? ''),
      code: String(record.code ?? ''),
      status: typeof record.status === 'number' ? String(record.status) : String(record.status ?? ''),
    };
  }
  return { message: String(error ?? ''), code: '', status: '' };
}

export function logAuthError(error: unknown): void {
  console.error('[auth]', error);
}

export function isNetworkError(error: unknown): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return true;
  }
  const { message, code } = readErrorText(error);
  const combined = `${code} ${message}`.toLowerCase();
  return (
    code === 'network' ||
    /failed to fetch|network request failed|networkerror|network error|internet|offline|timeout|timed out|load failed|fetch failed|connection refused|err_network/i.test(
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

export function isRecoveryLinkError(error: unknown): boolean {
  if (error instanceof EmailAuthError && error.kind === 'recovery_expired') {
    return true;
  }
  const { message, code } = readErrorText(error);
  const combined = `${code} ${message}`.toLowerCase();
  return (
    /recovery|reset/i.test(combined) &&
    /expired|already been used|invalid|consumed/i.test(combined)
  );
}

export function classifyAuthError(
  error: unknown,
  flow: AuthErrorFlow = 'unknown',
): {
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

  const { message, code, status } = readErrorText(error);
  const combined = `${code} ${status} ${message}`.toLowerCase();
  const recoveryFlow = flow === 'recovery' || /recovery|reset password|password recovery/i.test(combined);

  if (code === 'email_not_confirmed' || /email not confirmed/i.test(combined)) {
    return {
      kind: 'email_not_confirmed',
      message: EMAIL_NOT_CONFIRMED_MESSAGE,
      code: 'email_not_confirmed',
    };
  }

  if (
    code === 'user_already_exists' ||
    code === 'email_exists' ||
    /already registered|already been registered|already exists|user already|email address is already/i.test(
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
    code === 'over_email_send_rate_limit' ||
    code === 'email_rate_limit_exceeded' ||
    /rate limit|only request this after|too many requests|429/i.test(combined)
  ) {
    return {
      kind: 'rate_limited',
      message: RATE_LIMIT_MESSAGE,
      code: code || 'over_email_send_rate_limit',
    };
  }

  if (code === 'weak_password' || /weak password|pwned|leaked password|not strong enough/i.test(combined)) {
    return {
      kind: 'weak_password',
      message: WEAK_PASSWORD_MESSAGE,
      code: code || 'weak_password',
    };
  }

  if (
    recoveryFlow &&
    (code === 'otp_expired' ||
      code === 'flow_state_expired' ||
      /expired|already been used|already used|invalid flow state|code verifier/i.test(combined))
  ) {
    return {
      kind: 'recovery_expired',
      message: RESET_EXPIRED_MESSAGE,
      code: code || 'recovery_expired',
    };
  }

  // 6-digit codes: Supabase often returns otp_expired for a wrong token.
  if (flow === 'verify' && /invalid/i.test(combined) && !/already been used/i.test(combined)) {
    return {
      kind: 'otp_invalid',
      message: OTP_INVALID_MESSAGE,
      code: code || 'otp_invalid',
    };
  }

  if (
    code === 'otp_expired' ||
    code === 'flow_state_expired' ||
    (/expired/i.test(combined) && /otp|token|code|link|email/i.test(combined))
  ) {
    return { kind: 'otp_expired', message: OTP_EXPIRED_MESSAGE, code: code || 'otp_expired' };
  }

  if (
    code === 'otp_expired' ||
    code === 'invalid_token' ||
    /invalid otp|incorrect otp|otp is invalid|token has expired or is invalid|invalid token|token is invalid|email link is invalid/i.test(
      combined,
    )
  ) {
    const expired = /expired/i.test(combined);
    if (recoveryFlow) {
      return {
        kind: 'recovery_expired',
        message: RESET_EXPIRED_MESSAGE,
        code: code || 'recovery_expired',
      };
    }
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

export function toFriendlyAuthError(
  error: unknown,
  flow: AuthErrorFlow = 'unknown',
): EmailAuthError {
  if (error instanceof EmailAuthError) {
    return error;
  }
  const mapped = classifyAuthError(error, flow);
  return new EmailAuthError(mapped.message, mapped.code, mapped.kind);
}
