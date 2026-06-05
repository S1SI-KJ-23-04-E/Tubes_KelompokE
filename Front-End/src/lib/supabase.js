import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
)

// Helper to get a valid access token (refreshes if needed)
export async function getValidToken() {
  try {
    const { data: { session } = {} } = await supabase.auth.getSession();
    let token = session?.access_token;

    if (!token && typeof supabase.auth.refreshSession === 'function') {
      const refreshResult = await supabase.auth.refreshSession();
      token = refreshResult.data?.session?.access_token;
    }

    return token;
  } catch (err) {
    console.warn('getValidToken error:', err?.message || err);
    return null;
  }
}
