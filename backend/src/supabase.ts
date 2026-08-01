import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL === 'https://your-project.supabase.co') {
  console.warn(
    '⚠️  [Supabase Warning]: SUPABASE_URL is not configured in backend/.env file.\n' +
    '   Please update backend/.env with your actual Supabase URL and API keys.'
  );
}

/**
 * Supabase client instance for server-side database operations.
 * Uses the SERVICE_ROLE_KEY if available for full server access, or ANON_KEY.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: false, // Disables session persistence in Node server environment
    },
  }
);
