/**
 * Typed access to Expo public environment variables.
 * Only EXPO_PUBLIC_* keys are available in the client bundle.
 * Keys must be accessed statically for Expo's bundler and lint rules.
 */
function readEnv(value: string | undefined, key: string): string {
  if (!value) {
    if (__DEV__) {
      console.warn(
        `[env] Missing ${key}. Copy .env.example to .env and fill in your values.`,
      );
    }
    return '';
  }

  return value;
}

export const env = {
  supabaseUrl: readEnv(process.env.EXPO_PUBLIC_SUPABASE_URL, 'EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: readEnv(
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  ),
  easProjectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? '',
} as const;

export type Env = typeof env;
