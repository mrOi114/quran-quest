/**
 * App entry point.
 *
 * Polyfills must be imported before `expo-router/entry`, which registers the
 * root component and immediately begins evaluating the route tree in `app/`.
 *
 * Do NOT call `registerRootComponent` here: expo-router owns root registration.
 * Registering a screen directly bypasses the router and every provider in
 * `app/_layout.tsx` (AuthProvider, SafeAreaProvider, GestureHandlerRootView),
 * which makes `useRouter`/`useAuth` throw and blanks the screen.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'react-native-url-polyfill/auto';

import 'expo-router/entry';
