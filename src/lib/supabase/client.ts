import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { env } from '@/lib/env';
import type { Database } from '@/types/database';

/**
 * Shared Supabase client for the app.
 *
 * Session tokens use AsyncStorage (Supabase + Expo standard). SecureStore is
 * reserved for small secrets (device key, active learner id) because some iOS
 * SecureStore limits historically reject values near JWT size.
 *
 * Deep-link sessions are exchanged manually (`detectSessionInUrl: false`) via
 * `sessionLinkService` + `/(auth)/callback`.
 */
// Keep feature modules importable for local guest mode when backend credentials are absent.
// AuthProvider bypasses all Supabase calls in that mode.
export const supabase = createClient<Database>(
  env.supabaseUrl || 'https://guest-mode.invalid',
  env.supabaseAnonKey || 'guest-mode-anon-key',
  {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  },
);
