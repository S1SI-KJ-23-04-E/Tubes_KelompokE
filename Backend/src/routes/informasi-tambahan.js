import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

async function getUserRole(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data.role;
}

// POST /api/informasi-tambahan/laporan/:id — tambahkan informasi tambahan
router.post('/laporan/:id', authenticate, async (req, res) => {
  try {
    const laporanId = req.params.id;
    const userId = req.user.id;
    const { catatan } = req.body;

    if (!catatan || catatan.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Informasi tambahan wajib diisi'
      });
    }

    const role = await getUserRole(userId);
    if (!['kecamatan', 'super_admin'].includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Hanya admin kecamatan atau super admin yang dapat mengirim informasi tambahan.'
      });
    }

    const { error } = await supabaseAdmin
      .from('informasi_laporan')
      .insert({
        laporan_id: laporanId,
        catatan,
        created_by: userId,
      });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Informasi tambahan berhasil ditambahkan'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// GET /api/informasi-tambahan/laporan/:id — ambil informasi tambahan
router.get('/laporan/:id', authenticate, async (req, res) => {
  try {
    const laporanId = req.params.id;
    const { data, error } = await supabaseAdmin
      .from('informasi_laporan')
      .select('*')
      .eq('laporan_id', laporanId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
 