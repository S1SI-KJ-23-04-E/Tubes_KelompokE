import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/admin/laporan/kecamatan/:kecamatanId
router.get('/laporan/kecamatan/:kecamatanId', authenticate, async (req, res) => {
  const { search } = req.query;
  
  let query = supabaseAdmin
    .from('laporan')
    .select(`*, kecamatan:kecamatan_id(id, nama_kecamatan), kelurahan:kelurahan_id(id, nama_kelurahan), profiles:pelapor_id(id, nama)`)
    .eq('kecamatan_id', req.params.kecamatanId);

  if (search) {
    query = query.or(`deskripsi.ilike.%${search}%,alamat.ilike.%${search}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) return res.status(500).json({ success: false, error: error.message, data: [] });

  // LOGIKA SORTING PRIORITAS (High > Normal > Low)
  const priorityWeight = { high: 3, normal: 2, low: 1 };
  
  const sortedData = [...data].sort((a, b) => {
    const weightA = priorityWeight[a.prioritas?.toLowerCase()] || 2;
    const weightB = priorityWeight[b.prioritas?.toLowerCase()] || 2;
    
    if (weightB !== weightA) {
      return weightB - weightA; // Prioritas lebih tinggi di atas
    }
    // Jika prioritas sama, yang terbaru di atas
    return new Date(b.created_at) - new Date(a.created_at);
  });

  res.json({ success: true, data: sortedData });
});

// PUT /api/admin/laporan/:id/prioritas
router.put('/laporan/:id/prioritas', authenticate, async (req, res) => {
  const { prioritas } = req.body;
  const { error } = await supabaseAdmin
    .from('laporan')
    .update({ prioritas })
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true });
});

// PUT /api/admin/laporan/:id/status
router.put('/laporan/:id/status', authenticate, async (req, res) => {
  const { status, keterangan } = req.body;
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

  await supabaseAdmin.from('history_laporan').insert({
    laporan_id: req.params.id,
    status,
    changed_by: userId,
    catatan: keterangan,
  });

  res.json({ success: true });
});

export default router;