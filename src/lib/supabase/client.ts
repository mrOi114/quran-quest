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
/**
 * True only when both Supabase keys are present. When false the app still runs
 * in guest mode (progress kept in AsyncStorage) and account features are gated.
 */
export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

/**
 * `createClient` throws synchronously on an empty url/key. This module is
 * imported by AuthContext, and therefore by the root layout, so that throw
 * would happen during the first render and blank the entire app. Falling back
 * to a syntactically valid placeholder keeps module evaluation safe; network
 * calls then fail as ordinary promise rejections the services already handle.
 */
const SUPABASE_URL = isSupabaseConfigured ? env.supabaseUrl : 'http://localhost:54321';
const SUPABASE_ANON_KEY = isSupabaseConfigured ? env.supabaseAnonKey : 'public-anon-key';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: isSupabaseConfigured,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
