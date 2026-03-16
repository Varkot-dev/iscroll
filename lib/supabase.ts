/**
 * SUPABASE CLIENT
 *
 * Creates a connection to Supabase and manages anonymous auth.
 * Call getAnonymousUserId() to get a stable UUID for the current device.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase credentials missing!\n' +
    'Create a .env file in your project root with:\n' +
    'EXPO_PUBLIC_SUPABASE_URL=your_url\n' +
    'EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key\n\n' +
    'Get these from: Supabase Dashboard → Project Settings → API'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

/**
 * Returns a stable anonymous user ID for this device.
 * Signs in anonymously via Supabase on first call; subsequent calls
 * return the cached session user ID.
 *
 * Falls back to the legacy 'anonymous' constant if auth fails.
 */
export async function getAnonymousUserId(): Promise<string> {
  // Check for an existing session first
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user?.id) {
    return session.user.id;
  }

  // Sign in anonymously — Supabase persists this session automatically
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    console.warn('Anonymous sign-in failed, falling back to hardcoded ID:', error?.message);
    return 'anonymous';
  }

  return data.user.id;
}

