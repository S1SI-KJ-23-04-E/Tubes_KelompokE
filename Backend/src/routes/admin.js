import { Router } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const upload = multer({ dest: 'uploads/berita' });

// GET /api/admin/laporan/all — Semua laporan (super admin)
router.get('/laporan/all', authenticate, async (req, res) => {
  const { search } = req.query;

  let query = supabaseAdmin
    .from('laporan')
    .select(`*, kecamatan:kecamatan_id(id, nama_kecamatan), kelurahan:kelurahan_id(id, nama_kelurahan), profiles:pelapor_id(id, nama)`);

  if (search) {
    query = query.or(`judul.ilike.%${search}%,alamat.ilike.%${search}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) return res.status(500).json({ success: false, error: error.message, data: [] });

  const priorityWeight = { high: 3, low: 1 };
  const sortedData = [...data].sort((a, b) => {
    const weightA = priorityWeight[a.prioritas?.toLowerCase()] || 1;
    const weightB = priorityWeight[b.prioritas?.toLowerCase()] || 1;
    if (weightB !== weightA) return weightB - weightA;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  res.json({ success: true, data: sortedData });
});

// POST /api/admin/berita  — Buat berita informasi oleh admin kecamatan / super_admin
router.post('/berita', authenticate, upload.single('image'), async (req, res) => {
  if (!['kecamatan', 'super_admin'].includes(req.user?.profile?.role)) {
    return res.status(403).json({ success: false, error: 'Hanya admin kecamatan atau super admin yang dapat membuat berita.' });
  }

  const { judul, deskripsi, kecamatan_id } = req.body;
  const imageUrl = req.file ? `/uploads/berita/${req.file.filename}` : null;
  if (!judul || !deskripsi) return res.status(400).json({ success: false, error: 'Judul dan deskripsi wajib diisi.' });

  // jika role kecamatan, pakai kecamatan_id dari profile
  let targetKecamatan = kecamatan_id;
  if (req.user?.profile?.role === 'kecamatan') {
    targetKecamatan = req.user.profile.kecamatan_id;
  }

  try {
    const { error } = await supabaseAdmin.from('berita').insert({
      author_id: req.user.id,
      kecamatan_id: targetKecamatan || null,
      judul,
      deskripsi,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
    });

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/berita/:id  — Edit berita informasi oleh admin kecamatan / super_admin
router.put('/berita/:id', authenticate, upload.single('image'), async (req, res) => {
  if (!['kecamatan', 'super_admin'].includes(req.user?.profile?.role)) {
    return res.status(403).json({ success: false, error: 'Hanya admin kecamatan atau super admin yang dapat mengubah berita.' });
  }

  const { id } = req.params;
  const { judul, deskripsi, remove_image } = req.body;

  if (!judul || !deskripsi) return res.status(400).json({ success: false, error: 'Judul dan deskripsi wajib diisi.' });

  try {
    // Ambil berita untuk cek kepemilikan kecamatan
    const { data: news, error: fetchError } = await supabaseAdmin
      .from('berita')
      .select('kecamatan_id, image_url')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) return res.status(500).json({ success: false, error: fetchError.message });
    if (!news) return res.status(404).json({ success: false, error: 'Berita tidak ditemukan.' });

    // Cek kepemilikan jika role kecamatan
    if (req.user?.profile?.role === 'kecamatan') {
      if (String(news.kecamatan_id) !== String(req.user.profile.kecamatan_id || '')) {
        return res.status(403).json({ success: false, error: 'Anda hanya dapat mengubah berita di kecamatan Anda.' });
      }
    }

    let imageUrl = news.image_url;
    if (req.file) {
      imageUrl = `/uploads/berita/${req.file.filename}`;
    } else if (remove_image === 'true') {
      imageUrl = null;
    }

    const { error: updateError } = await supabaseAdmin
      .from('berita')
      .update({
        judul,
        deskripsi,
        image_url: imageUrl,
      })
      .eq('id', id);

    if (updateError) return res.status(500).json({ success: false, error: updateError.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/berita/:id  — Hapus berita informasi oleh admin kecamatan / super_admin
router.delete('/berita/:id', authenticate, async (req, res) => {
  if (!['kecamatan', 'super_admin'].includes(req.user?.profile?.role)) {
    return res.status(403).json({ success: false, error: 'Hanya admin kecamatan atau super admin yang dapat menghapus berita.' });
  }

  const { id } = req.params;

  try {
    // Ambil berita untuk cek kepemilikan kecamatan
    const { data: news, error: fetchError } = await supabaseAdmin
      .from('berita')
      .select('kecamatan_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) return res.status(500).json({ success: false, error: fetchError.message });
    if (!news) return res.status(404).json({ success: false, error: 'Berita tidak ditemukan.' });

    // Cek kepemilikan jika role kecamatan
    if (req.user?.profile?.role === 'kecamatan') {
      if (String(news.kecamatan_id) !== String(req.user.profile.kecamatan_id || '')) {
        return res.status(403).json({ success: false, error: 'Anda hanya dapat menghapus berita di kecamatan Anda.' });
      }
    }

    const { error: deleteError } = await supabaseAdmin
      .from('berita')
      .delete()
      .eq('id', id);

    if (deleteError) return res.status(500).json({ success: false, error: deleteError.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/laporan/kecamatan/:kecamatanId
router.get('/laporan/kecamatan/:kecamatanId', authenticate, async (req, res) => {
  const { search } = req.query;
  
  let query = supabaseAdmin
    .from('laporan')
    .select(`*, kecamatan:kecamatan_id(id, nama_kecamatan), kelurahan:kelurahan_id(id, nama_kelurahan), profiles:pelapor_id(id, nama)`)
    .eq('kecamatan_id', req.params.kecamatanId);

  if (search) {
    query = query.or(`judul.ilike.%${search}%,alamat.ilike.%${search}%`);
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
  if (!['high', 'low'].includes(prioritas)) {
    return res.status(400).json({ success: false, error: 'Prioritas harus high atau low.' });
  }
  const { error } = await supabaseAdmin
    .from('laporan')
    .update({ prioritas })
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true });
});

// PUT /api/admin/laporan/:id/catatan
router.put('/laporan/:id/catatan', authenticate, async (req, res) => {
  if (!['kecamatan', 'super_admin'].includes(req.user?.profile?.role)) {
    return res.status(403).json({ success: false, error: 'Hanya admin yang boleh menambahkan catatan.' });
  }

  const { catatan } = req.body;
  const { error } = await supabaseAdmin
    .from('laporan')
    .update({ catatan })
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, catatan });
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

// POST /api/admin/laporan/:id/kendala
router.post('/laporan/:id/kendala', authenticate, async (req, res) => {
  const { deskripsi } = req.body;
  const userId = req.user.id;
  const laporanId = req.params.id;

  const { error } = await supabaseAdmin
    .from('kendala_laporan')
    .insert({
      laporan_id: laporanId,
      petugas_id: userId,
      deskripsi: deskripsi,
      created_at: new Date().toISOString()
    });

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true });
});

// GET /api/admin/laporan/semua
router.get('/laporan/semua', authenticate, async (req, res) => {
  const { search } = req.query;
  
  let query = supabaseAdmin
    .from('laporan')
    .select(`*, kecamatan:kecamatan_id(id, nama_kecamatan), kelurahan:kelurahan_id(id, nama_kelurahan), profiles:pelapor_id(id, nama)`);

  if (search) {
    query = query.or(`judul.ilike.%${search}%,alamat.ilike.%${search}%`);
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