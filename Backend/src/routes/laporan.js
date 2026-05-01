import { Router } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

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

  await supabaseAdmin.from('history_laporan').insert({
    laporan_id: laporan.id,
    status: 'pending',
    changed_by: userId,
  });

  res.json({ success: true, data: [laporan] });
});

// GET /api/laporan/user — Laporan milik user yang login
router.get('/user', authenticate, async (req, res) => {
  const selectQuery = '*, kecamatan:kecamatan_id(id, nama_kecamatan), kelurahan:kelurahan_id(id, nama_kelurahan), history_laporan(id, status, catatan, created_at)';
  const { data, error } = await supabaseAdmin
    .from('laporan')
    .select(selectQuery)
    .eq('pelapor_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ success: false, error: error.message, data: [] });
  res.json({ success: true, data });
});

// GET /api/laporan/:id — Detail laporan
router.get('/:id', async (req, res) => {
  const selectQuery = [
    '*',
    'kecamatan:kecamatan_id(id, nama_kecamatan)',
    'kelurahan:kelurahan_id(id, nama_kelurahan)',
    'profiles:pelapor_id(id, nama)',
    'history_laporan(*)',
    'bukti_selesai(*)'
  ].join(',');

  const { data, error } = await supabaseAdmin
    .from('laporan')
    .select(selectQuery)
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

// POST /api/laporan/:id/selesai — Upload bukti & set selesai (ADMIN/PETUGAS)
router.post('/:id/selesai', authenticate, upload.single('foto'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    const { keterangan } = req.body;
    const userId = req.user.id;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Foto bukti wajib diupload'
      });
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = 'bukti_' + id + '_' + Date.now() + '.' + fileExt;
    const filePath = 'bukti/' + fileName;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('laporan-photos')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('laporan-photos')
      .getPublicUrl(filePath);

    const fotoUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabaseAdmin
      .from('laporan')
      .update({ status: 'done' })
      .eq('id', id);

    if (updateError) throw updateError;

    const { error: buktiError } = await supabaseAdmin.from('bukti_selesai').insert({
      laporan_id: id,
      url_foto: fotoUrl,
      keterangan,
      uploaded_by: userId
    });

    if (buktiError) throw buktiError;

    await supabaseAdmin.from('history_laporan').insert({
      laporan_id: id,
      status: 'done',
      changed_by: userId,
      catatan: keterangan
    });

    res.json({
      success: true,
      message: 'Laporan berhasil diselesaikan dengan bukti',
      fotoUrl
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Gagal upload bukti',
      error: err.message
    });
  }
});

export default router;
