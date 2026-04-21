import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const profileCache = useRef(null);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return null;
    // Return cached profile if already fetched for this user
    if (profileCache.current && profileCache.current.id === userId) {
      return profileCache.current;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, kecamatan(nama_kecamatan)')
        .eq('id', userId)
        .single();
      if (error) {
        console.warn('Profile fetch error:', error.message);
        return null;
      }
      profileCache.current = data;
      return data;
    } catch (err) {
      console.warn('Profile fetch exception:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    // Initialize from LOCAL cached session — no network call
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;
        if (session?.user) {
          setUser(session.user);
          const prof = await fetchProfile(session.user.id);
          if (active) setProfile(prof);
        }
      } catch (err) {
        console.warn('Session init error:', err);
      }
      if (active) setLoading(false);
    };

    init();

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      console.log('[Auth]', event);

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        profileCache.current = null;
        return;
      }

      // For TOKEN_REFRESHED — just update the user object silently
      // Do NOT re-fetch profile, do NOT trigger loading
      if (session?.user) {
        setUser(session.user);
      }

      // Only fetch profile on actual sign-in
      if (event === 'SIGNED_IN' && session?.user) {
        fetchProfile(session.user.id).then((prof) => {
          if (active) setProfile(prof);
        });
      }
    });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    setUser(data.user);
    const prof = await fetchProfile(data.user.id);
    setProfile(prof);
    return { success: true, user: data.user, profile: prof };
  };

  const register = async (email, password, nama, kecamatan_id) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) return { success: false, error: authError.message };
    const authUser = authData.user;
    if (!authUser) return { success: false, error: 'Pendaftaran gagal.' };

    const profileData = { id: authUser.id, nama, role: 'warga', kecamatan_id: kecamatan_id || null };
    const { error: profileError } = await supabase.from('profiles').insert([profileData]);
    if (profileError) return { success: false, error: profileError.message };

    setUser(authUser);
    setProfile(profileData);
    profileCache.current = profileData;
    return { success: true, user: authUser, profile: profileData };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error: error.message };
    setUser(null);
    setProfile(null);
    profileCache.current = null;
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
