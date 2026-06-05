import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// GET /api/berita/kecamatan/:id
router.get('/kecamatan/:id', async (req, res) => {
  const kecId = req.params.id;
  const { data, error } = await supabaseAdmin
    .from('berita')
    .select('*, profiles:author_id(id, nama), kecamatan:kecamatan_id(id, nama_kecamatan)')
    .eq('kecamatan_id', kecId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ success: false, error: error.message, data: [] });
  res.json({ success: true, data });
});

// GET /api/berita/all
router.get('/all', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('berita')
    .select('*, profiles:author_id(id, nama), kecamatan:kecamatan_id(id, nama_kecamatan)')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ success: false, error: error.message, data: [] });
  res.json({ success: true, data });
});

export default router;
