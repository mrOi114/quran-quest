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
// Expo inlines EXPO_PUBLIC_* at export time. An empty URL makes createClient throw
// during module init and leaves a blank green #root on static hosts like Vercel.
const supabaseUrl = env.supabaseUrl || 'https://invalid.supabase.co';
const supabaseAnonKey = env.supabaseAnonKey || 'public-anon-key';

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  console.error(
    '[supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in this build.',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
