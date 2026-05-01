<<<<<<< HEAD
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
=======
import 'dotenv/config';
>>>>>>> Panji_Branch
import { createClient } from '@supabase/supabase-js';

// Admin client (service role) — bypass RLS untuk operasi backend
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
