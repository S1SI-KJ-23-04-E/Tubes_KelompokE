import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// ===============================
// GET LAPORAN KECAMATAN
// ===============================
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

  const priorityWeight = { high: 3, normal: 2, low: 1 };
  
  const sortedData = [...data].sort((a, b) => {
    const weightA = priorityWeight[a.prioritas?.toLowerCase()] || 2;
    const weightB = priorityWeight[b.prioritas?.toLowerCase()] || 2;
    
    if (weightB !== weightA) return weightB - weightA;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  res.json({ success: true, data: sortedData });
});

// ===============================
// UPDATE PRIORITAS
// ===============================
router.put('/laporan/:id/prioritas', authenticate, async (req, res) => {
  const { prioritas } = req.body;

  const { error } = await supabaseAdmin
    .from('laporan')
    .update({ prioritas })
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ success: false, error: error.message });

  res.json({ success: true });
});

// ===============================
// UPDATE STATUS + BUKTI FOTO (DEV-58)
// ===============================
router.put('/laporan/:id/status', authenticate, async (req, res) => {
  try {
    const { status, keterangan, foto_url } = req.body;
    const userId = req.user.id;
    const laporanId = req.params.id;

    const updateData = {
      status,
      catatan: keterangan,
      updated_at: new Date().toISOString(),
    };

    // ✅ JIKA DONE → SIMPAN BUKTI
    if (status === 'done') {

      if (!foto_url) {
        return res.status(400).json({
          success: false,
          message: "Foto bukti wajib diisi (URL)"
        });
      }

      // 🔹 insert bukti_selesai
      const { error: buktiError } = await supabaseAdmin
        .from('bukti_selesai')
        .insert({
          laporan_id: laporanId,
          url_foto: foto_url,
          keterangan,
          uploaded_by: userId,
        });

      if (buktiError) throw buktiError;

      updateData.selesai_at = new Date().toISOString();
    }

    // 🔹 update laporan
    const { error: updateError } = await supabaseAdmin
      .from('laporan')
      .update(updateData)
      .eq('id', laporanId);

    if (updateError) throw updateError;

    // 🔹 history
    await supabaseAdmin.from('history_laporan').insert({
      laporan_id: laporanId,
      status,
      changed_by: userId,
      catatan: keterangan,
    });

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ===============================
router.post('/laporan/:id/informasi', authenticate, async (req, res) => {
  try {
    const { catatan } = req.body;
    const userId = req.user.id;
    const laporanId = req.params.id;

    // validasi input
    if (!catatan || catatan.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Informasi tambahan wajib diisi"
      });
    }

    // simpan sebagai instruksi admin ke history_laporan
    const { error } = await supabaseAdmin
      .from('history_laporan')
      .insert({
        laporan_id: laporanId,
        status: "informasi_admin", // status khusus
        catatan: catatan,
        changed_by: userId,
      });

    if (error) throw error;

    res.json({
      success: true,
      message: "Informasi tambahan berhasil ditambahkan"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ===============================
router.get('/laporan/:id/informasi', authenticate, async (req, res) => {
  try {
    const laporanId = req.params.id;

    const { data, error } = await supabaseAdmin
      .from('history_laporan')
      .select('*')
      .eq('laporan_id', laporanId)
      .eq('status', 'informasi_admin')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;

