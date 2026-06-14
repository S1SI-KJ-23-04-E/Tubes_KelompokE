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
    if (!session) return null;

    // Check if token is expired or close to expiration (expires within 60 seconds)
    const isExpired = session.expires_at && (session.expires_at * 1000 < Date.now() + 60000);
    if (isExpired && typeof supabase.auth.refreshSession === 'function') {
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return refreshedSession?.access_token ?? null;
    }

    return session.access_token ?? null;
  } catch (err) {
    console.warn('getValidToken error:', err?.message || err);
    return null;
  }
}
