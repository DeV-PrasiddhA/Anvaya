import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY?.trim();

// Exported so main.tsx can render a configuration error instead of a blank screen
export const supabaseConfigError: string | null =
  !supabaseUrl || !supabaseAnonKey
    ? 'Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in your deployment environment variables.'
    : null;

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

/**
 * Trigger Google OAuth Sign-In / Sign-Up
 * Redirects user to Google Consent screen and back to the current app origin.
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        full_name: fullName || '',
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
