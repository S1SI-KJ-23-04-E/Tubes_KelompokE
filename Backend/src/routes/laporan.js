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

// POST /api/laporan/:id/upvote — Upvote laporan
router.post('/:id/upvote', authenticate, async (req, res) => {
  const laporanId = req.params.id;
  const userId = req.user.id;

  try {
    // Cek apakah user sudah vote
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('upvote')
      .select('id')
      .eq('laporan_id', laporanId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      return res.status(500).json({ success: false, error: checkError.message });
    }

    // Get current upvote count
    const { data: laporan, error: fetchError } = await supabaseAdmin
      .from('laporan')
      .select('upvote_count')
      .eq('id', laporanId)
      .single();

    if (fetchError) return res.status(500).json({ success: false, error: fetchError.message });

    if (existing) {
      // User sudah vote, hapus vote (unlike)
      const { error: deleteError } = await supabaseAdmin
        .from('upvote')
        .delete()
        .eq('id', existing.id);

      if (deleteError) return res.status(500).json({ success: false, error: deleteError.message });

      // Update upvote_count di laporan (kurangi 1)
      const newCount = Math.max(0, (laporan.upvote_count || 0) - 1);
      const { error: updateError } = await supabaseAdmin
        .from('laporan')
        .update({ upvote_count: newCount })
        .eq('id', laporanId);

      if (updateError) return res.status(500).json({ success: false, error: updateError.message });

      return res.json({ success: true, upvoted: false, upvote_count: newCount });
    } else {
      // User belum vote, tambahkan vote
      const { error: insertError } = await supabaseAdmin
        .from('upvote')
        .insert({ laporan_id: laporanId, user_id: userId });

      if (insertError) return res.status(500).json({ success: false, error: insertError.message });

      // Update upvote_count di laporan (tambah 1)
      const newCount = (laporan.upvote_count || 0) + 1;
      const { error: updateError } = await supabaseAdmin
        .from('laporan')
        .update({ upvote_count: newCount })
        .eq('id', laporanId);

      if (updateError) return res.status(500).json({ success: false, error: updateError.message });

      return res.json({ success: true, upvoted: true, upvote_count: newCount });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/laporan/:id/user-upvoted — Check apakah user sudah upvote laporan ini
router.get('/:id/user-upvoted', authenticate, async (req, res) => {
  const laporanId = req.params.id;
  const userId = req.user.id;

  try {
    const { data, error } = await supabaseAdmin
      .from('upvote')
      .select('id')
      .eq('laporan_id', laporanId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, upvoted: !!data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;