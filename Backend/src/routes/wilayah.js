import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// GET /api/kecamatan
router.get('/kecamatan', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('kecamatan')
    .select('id, nama_kecamatan')
    .order('nama_kecamatan');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/kelurahan/:kecamatanId
router.get('/kelurahan/:kecamatanId', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('kelurahan')
    .select('id, nama_kelurahan')
    .eq('kecamatan_id', req.params.kecamatanId)
    .order('nama_kelurahan');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;