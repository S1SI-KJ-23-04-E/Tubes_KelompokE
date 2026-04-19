import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/admin/laporan/kecamatan/:kecamatanId
router.get('/laporan/kecamatan/:kecamatanId', authenticate, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('laporan')
    .select(`*, kecamatan:kecamatan_id(id, nama_kecamatan), kelurahan:kelurahan_id(id, nama_kelurahan), profiles:pelapor_id(id, nama)`)
    .eq('kecamatan_id', req.params.kecamatanId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ success: false, error: error.message, data: [] });
  res.json({ success: true, data });
});

// GET /api/admin/laporan — Semua laporan (super_admin)
router.get('/laporan', authenticate, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('laporan')
    .select(`*, kecamatan:kecamatan_id(id, nama_kecamatan), kelurahan:kelurahan_id(id, nama_kelurahan), profiles:pelapor_id(id, nama)`)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ success: false, error: error.message, data: [] });
  res.json({ success: true, data });
});

// PUT /api/admin/laporan/:id/status
router.put('/laporan/:id/status', authenticate, async (req, res) => {
  const { status, keterangan, url_foto } = req.body;
  const userId = req.user.id;

  const updateData = {
    status,
    catatan: keterangan,
    updated_at: new Date().toISOString(),
  };

  if (status === 'selesai' || status === 'done') {
    updateData.selesai_at = new Date().toISOString();
  }

  const { error: updateError } = await supabaseAdmin
    .from('laporan')
    .update(updateData)
    .eq('id', req.params.id);

  if (updateError) return res.status(500).json({ success: false, error: updateError.message });

  // Catat history
  await supabaseAdmin.from('history_laporan').insert({
    laporan_id: req.params.id,
    status,
    changed_by: userId,
    catatan: keterangan,
  });

  // Simpan bukti selesai jika ada foto
  if ((status === 'selesai' || status === 'done') && url_foto) {
    await supabaseAdmin.from('bukti_selesai').upsert({
      laporan_id: req.params.id,
      url_foto,
      keterangan,
      uploaded_by: userId,
    });
  }

  res.json({ success: true });
});

export default router;
