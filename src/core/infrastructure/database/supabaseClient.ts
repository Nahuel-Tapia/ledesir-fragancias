import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Get environment variables from both Astro import.meta.env and Node process.env (for Vercel serverless)
const rawUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PUBLIC_SUPABASE_URL) ||
  process.env.PUBLIC_SUPABASE_URL ||
  '';

const rawKey =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.SUPABASE_SERVICE_ROLE_KEY) ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PUBLIC_SUPABASE_ANON_KEY) ||
  process.env.PUBLIC_SUPABASE_ANON_KEY ||
  '';

const supabaseUrl = rawUrl.trim();
const supabaseKey = rawKey.trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project')
  );
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return clientInstance;
};
