import { createClient } from '@supabase/supabase-js';

// Admin client (service role) — bypass RLS untuk operasi backend
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
