import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { login as loginService, register as registerService, logout as logoutService, getCurrentUser } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const fetchSession = async () => {
      const { user: currentUser, profile: currentProfile } = await getCurrentUser();
      setUser(currentUser);
      setProfile(currentProfile);
      setLoading(false);
    };

    fetchSession();

    // Listen for auth changes (e.g. login from another tab, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        // If login event, fetch profile again
        if (event === 'SIGNED_IN') {
          const { profile: updatedProfile } = await getCurrentUser();
          setProfile(updatedProfile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const result = await loginService(email, password);
    if (result.success) {
      setUser(result.user);
      setProfile(result.profile);
    }
    return result;
  };

  const register = async (email, password, nama, kecamatan_id) => {
    const result = await registerService(email, password, nama, kecamatan_id);
    if (result.success) {
      setUser(result.user);
      setProfile(result.profile);
    }
    return result;
  };

  const logout = async () => {
    const result = await logoutService();
    if (result.success) {
      setUser(null);
      setProfile(null);
    }
    return result;
  };

  const value = {
    user,
    profile,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
