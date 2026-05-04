import { supabaseAdmin } from '../lib/supabase.js';

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Token tidak ditemukan' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.error('Supabase Auth Error:', error);
      return res.status(401).json({ 
        success: false, 
        error: 'Token tidak valid', 
        details: error?.message || 'User tidak ditemukan' 
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ success: false, error: 'Profile tidak ditemukan' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      profile: profile
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, error: 'Error autentikasi' });
  }
};