import { supabaseAdmin } from '../lib/supabase.js';

export async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized. Token not provided.' });
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ message: 'Unauthorized. Invalid token.', error: error?.message });
  }

  req.user = user;
  next();
}
