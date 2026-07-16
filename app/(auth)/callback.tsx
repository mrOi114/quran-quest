import { Redirect } from 'expo-router';

/**
 * Deep-link landing route for email verification / password reset redirects.
 * Supabase session is restored by the auth client; index routing takes over.
 */
export default function AuthCallbackScreen() {
  return <Redirect href="/" />;
}
