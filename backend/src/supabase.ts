import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseConfigurationError = !supabaseUrl
  ? 'SUPABASE_URL is not configured.'
  : !supabaseServiceRoleKey
    ? 'SUPABASE_SERVICE_ROLE_KEY is not configured.'
    : null;

if (supabaseConfigurationError) {
  console.warn(
    `⚠️  [Supabase Warning]: ${supabaseConfigurationError}\n` +
    '   Configure backend/.env before using authentication.'
  );
}

/**
 * Supabase client instance for server-side database operations.
 * Uses only the SERVICE_ROLE_KEY. The backend creates Auth users and writes
 * profiles, so falling back to a publishable key would be unsafe and would
 * make signup fail in confusing ways.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceRoleKey || 'placeholder-key',
  {
    auth: {
      persistSession: false, // Disables session persistence in Node server environment
    },
  }
);
