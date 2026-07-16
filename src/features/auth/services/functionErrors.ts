import type { FunctionsHttpError } from '@supabase/supabase-js';

export type FunctionErrorPayload = {
  error?: string;
  locked_until?: string | null;
  failed_attempts?: number | null;
};

export class AuthFunctionError extends Error {
  readonly lockedUntil: string | null;
  readonly failedAttempts: number | null;
  readonly status: number | null;

  constructor(
    message: string,
    options?: {
      lockedUntil?: string | null;
      failedAttempts?: number | null;
      status?: number | null;
    },
  ) {
    super(message);
    this.name = 'AuthFunctionError';
    this.lockedUntil = options?.lockedUntil ?? null;
    this.failedAttempts = options?.failedAttempts ?? null;
    this.status = options?.status ?? null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function payloadFromUnknown(value: unknown): FunctionErrorPayload | null {
  if (!isRecord(value)) {
    return null;
  }
  return {
    error: typeof value.error === 'string' ? value.error : undefined,
    locked_until:
      typeof value.locked_until === 'string' || value.locked_until === null
        ? (value.locked_until as string | null)
        : undefined,
    failed_attempts:
      typeof value.failed_attempts === 'number' ? value.failed_attempts : undefined,
  };
}

async function readHttpErrorBody(
  error: FunctionsHttpError,
): Promise<FunctionErrorPayload | null> {
  try {
    const context = error.context as Response | undefined;
    if (!context || typeof context.json !== 'function') {
      return null;
    }
    const cloned = typeof context.clone === 'function' ? context.clone() : context;
    return payloadFromUnknown(await cloned.json());
  } catch {
    return null;
  }
}

/**
 * Normalize Supabase Edge Function invoke results into typed errors.
 * Non-2xx responses often put the JSON body on the HTTP error context.
 */
export async function assertFunctionOk<T extends object>(result: {
  data: T | null;
  error: Error | null;
}): Promise<T> {
  const dataPayload = payloadFromUnknown(result.data);
  if (result.error) {
    const httpError = result.error as FunctionsHttpError;
    const body = (await readHttpErrorBody(httpError)) ?? dataPayload;
    const status =
      typeof httpError.context === 'object' &&
      httpError.context !== null &&
      'status' in httpError.context &&
      typeof (httpError.context as { status?: unknown }).status === 'number'
        ? ((httpError.context as { status: number }).status ?? null)
        : null;

    throw new AuthFunctionError(body?.error || result.error.message || 'Request failed', {
      lockedUntil: body?.locked_until ?? null,
      failedAttempts: body?.failed_attempts ?? null,
      status,
    });
  }

  if (!result.data) {
    throw new AuthFunctionError('Empty response from server');
  }

  if (dataPayload?.error) {
    throw new AuthFunctionError(dataPayload.error, {
      lockedUntil: dataPayload.locked_until ?? null,
      failedAttempts: dataPayload.failed_attempts ?? null,
    });
  }

  return result.data;
}
