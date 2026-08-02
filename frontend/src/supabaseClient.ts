import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mfrwpyiemccjovjdeakk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mcndweWllbWNjam92amRlYWtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NDY0OTgsImV4cCI6MjEwMTEyMjQ5OH0.wjZ5WqWz4uk3Kcqm8c5uuApQuatrgPjDlMA0VD2bDzU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Trigger Google OAuth Sign-In / Sign-Up
 * Redirects user to Google Consent screen and back to your app domain
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

/**
 * Sign in with Email / Gmail & Password
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * Sign up with Email / Gmail & Password
 */
export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
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

/**
 * Sign Out current user
 */
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
