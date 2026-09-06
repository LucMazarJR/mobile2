// The URL polyfill has to come before supabase-js: the client uses the global
// URL API, which Hermes (React Native's JS engine) does not ship by default.
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

/** Host only — shown in the About screen. The key is never displayed. */
export const cloudHost = url ? url.replace(/^https?:\/\//, '') : null;

if (!isSupabaseConfigured) {
  // Aimed at whoever is running the project, not at the person using the app.
  console.warn(
    '[config] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY are missing. ' +
      'Copy .env.example to .env and restart with "npx expo start -c". ' +
      'The cloud copy stays off; the app works normally offline.'
  );
}

export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          // There is no login, so the client never needs to keep a session —
          // that is what makes AsyncStorage unnecessary here.
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })
    : null;
