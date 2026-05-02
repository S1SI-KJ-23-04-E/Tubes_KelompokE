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

  // LOGIKA SORTING PRIORITAS (High > Low)
  const priorityWeight = { high: 3, low: 1 };
  
  const sortedData = [...data].sort((a, b) => {
    const weightA = priorityWeight[(a.prioritas || 'low').toLowerCase()] || 1;
    const weightB = priorityWeight[(b.prioritas || 'low').toLowerCase()] || 1;
    
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
  if (!['kecamatan', 'super_admin'].includes(req.user?.profile?.role)) {
    return res.status(403).json({ success: false, error: 'Hanya admin kecamatan dan super admin yang boleh mengubah prioritas laporan.' });
  }

  if (req.user?.profile?.role === 'kecamatan') {
    const { data: report, error: reportError } = await supabaseAdmin
      .from('laporan')
      .select('kecamatan_id')
      .eq('id', req.params.id)
      .maybeSingle();

    if (reportError) return res.status(500).json({ success: false, error: reportError.message });
    if (!report) return res.status(404).json({ success: false, error: 'Laporan tidak ditemukan.' });
    if (String(report.kecamatan_id) !== String(req.user.profile.kecamatan_id || '')) {
      return res.status(403).json({ success: false, error: 'Anda hanya dapat mengubah prioritas laporan di kecamatan Anda.' });
    }
  }

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
  if (!['kecamatan', 'super_admin'].includes(req.user?.profile?.role)) {
    return res.status(403).json({ success: false, error: 'Hanya admin kecamatan dan super admin yang boleh mengubah status laporan.' });
  }

  const { status, keterangan } = req.body;
  const userId = req.user.id;

  const allowedStatuses = new Set(['verified', 'rejected', 'in_progress', 'done', 'selesai']);
  if (!allowedStatuses.has(status)) {
    return res.status(400).json({ success: false, error: 'Status tidak valid.' });
  }

  if (req.user?.profile?.role === 'kecamatan') {
    const { data: report, error: reportError } = await supabaseAdmin
      .from('laporan')
      .select('kecamatan_id')
      .eq('id', req.params.id)
      .maybeSingle();

    if (reportError) return res.status(500).json({ success: false, error: reportError.message });
    if (!report) return res.status(404).json({ success: false, error: 'Laporan tidak ditemukan.' });
    if (String(report.kecamatan_id) !== String(req.user.profile.kecamatan_id || '')) {
      return res.status(403).json({ success: false, error: 'Anda hanya dapat mengubah status laporan di kecamatan Anda.' });
    }
  }

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

// GET /api/admin/laporan/semua
router.get('/laporan/semua', authenticate, async (req, res) => {
  const { search } = req.query;
  
  let query = supabaseAdmin
    .from('laporan')
    .select(`*, kecamatan:kecamatan_id(id, nama_kecamatan), kelurahan:kelurahan_id(id, nama_kelurahan), profiles:pelapor_id(id, nama)`);

  if (search) {
    query = query.or(`deskripsi.ilike.%${search}%,alamat.ilike.%${search}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) return res.status(500).json({ success: false, error: error.message, data: [] });

  // LOGIKA SORTING PRIORITAS (High > Low)
  const priorityWeight = { high: 3, low: 1 };
  
  const sortedData = [...data].sort((a, b) => {
    const weightA = priorityWeight[(a.prioritas || 'low').toLowerCase()] || 1;
    const weightB = priorityWeight[(b.prioritas || 'low').toLowerCase()] || 1;
    
    if (weightB !== weightA) {
      return weightB - weightA;
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  res.json({ success: true, data: sortedData });
});

export default router;