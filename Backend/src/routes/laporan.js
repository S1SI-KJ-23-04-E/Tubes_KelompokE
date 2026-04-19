import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/laporan — Buat laporan baru
router.post('/', authenticate, async (req, res) => {
  const { kecamatan_id, kelurahan_id, deskripsi, alamat, foto_url } = req.body;
  const userId = req.user.id;

  const { data: laporan, error } = await supabaseAdmin
    .from('laporan')
    .insert({ pelapor_id: userId, kecamatan_id, kelurahan_id, deskripsi, alamat, foto_url, status: 'pending' })
    .select()
    .single();

  if (error) return res.status(500).json({ success: false, error: error.message });

  // Catat history
  await supabaseAdmin.from('history_laporan').insert({
    laporan_id: laporan.id,
    status: 'pending',
    changed_by: userId,
  });

  res.json({ success: true, data: [laporan] });
});

// GET /api/laporan/user — Laporan milik user yang login
router.get('/user', authenticate, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('laporan')
    .select(`*, kecamatan:kecamatan_id(id, nama_kecamatan), kelurahan:kelurahan_id(id, nama_kelurahan), history_laporan(id, status, catatan, created_at)`)
    .eq('pelapor_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ success: false, error: error.message, data: [] });
  res.json({ success: true, data });
});

// GET /api/laporan/:id — Detail laporan
router.get('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('laporan')
    .select(`
      *,
      kecamatan:kecamatan_id(id, nama_kecamatan),
      kelurahan:kelurahan_id(id, nama_kelurahan),
      profiles:pelapor_id(id, nama),
      history_laporan(*),
      bukti_selesai(*)
    `)
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ success: false, error: error.message, data: null });
  res.json({ success: true, data });
});

// DELETE /api/laporan/:id — Hapus laporan (hanya pending milik sendiri)
router.delete('/:id', authenticate, async (req, res) => {
  const { error } = await supabaseAdmin
    .from('laporan')
    .delete()
    .eq('id', req.params.id)
    .eq('pelapor_id', req.user.id)
    .eq('status', 'pending');

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true });
});

export default router;
