import { supabase } from '../lib/supabase.js';

// Helper to handle errors
const handleResponse = (data, error, customMessage = '') => {
  if (error) {
    console.error(`Auth Error ${customMessage}:`, error.message);
    return { success: false, error: error.message };
  }
  return { success: true, data };
};

// Register for Warga
export async function register(email, password, nama, kecamatan_id) {
  try {
    // 1. Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    const user = authData.user;
    if (!user) throw new Error('Pendaftaran gagal, tidak ada data user.');

    // 2. Insert into public.profiles table
    const profileData = {
      id: user.id,
      nama: nama,
      role: 'warga',
      kecamatan_id: kecamatan_id || null, // Optional, could be useful for auto-filling forms
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([profileData]);

    if (profileError) {
      console.error('Failed to create profile:', profileError);
      throw new Error(`Gagal membuat profil: ${profileError.message}`);
    }

    return { success: true, user, profile: profileData };
  } catch (error) {
    return handleResponse(null, error, 'Register');
  }
}

// Login
export async function login(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Fetch user profile to get role and name
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (profileError) {
      console.warn("Could not fetch user profile:", profileError);
    }
    
    return { success: true, user: data.user, profile };
  } catch (error) {
    return handleResponse(null, error, 'Login');
  }
}

// Logout
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return handleResponse(null, error, 'Logout');
  }
}

// Get current user and profile
export async function getCurrentUser() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) return { success: false, user: null, profile: null };
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, kecamatan(nama_kecamatan)')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      console.warn('Profile fetch error:', profileError);
    }
    
    return { success: true, user, profile };
  } catch (error) {
    return { success: false, user: null, profile: null };
  }
}