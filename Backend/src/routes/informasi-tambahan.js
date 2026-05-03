import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

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

    const { error } = await supabaseAdmin
      .from('history_laporan')
      .insert({
        laporan_id: laporanId,
        status: 'informasi_admin',
        catatan,
        changed_by: userId,
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
      .from('history_laporan')
      .select('*')
      .eq('laporan_id', laporanId)
      .eq('status', 'informasi_admin')
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
