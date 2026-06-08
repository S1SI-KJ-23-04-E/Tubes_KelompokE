<<<<<<< Updated upstream
=======
import 'dotenv/config';
>>>>>>> Stashed changes
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Admin client (service role) — bypass RLS untuk operasi backend
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
