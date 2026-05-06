import express from "express";
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * =====================================================
 * ADMIN MENAMBAHKAN INFORMASI TAMBAHAN
 * =====================================================
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { laporan_id, isi_informasi } = req.body;

    // validasi
    if (!laporan_id || !isi_informasi) {
      return res.status(400).json({
        success: false,
        message: 'informasi wajib diisi'
      });
    }

    // ambil user login
    const admin_id = req.user.id;

    // insert database
    const { data, error } = await supabaseAdmin
      .from('informasi_tambahan')
      .insert([
      {
        laporan_id,
        admin_id: req.user.id,
        isi_informasi
      }
    ])
      .select()
      .single();

    if (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Gagal menambahkan informasi tambahan'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Informasi tambahan berhasil dibuat',
      data
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * =====================================================
 * PETUGAS MELIHAT INFORMASI TAMBAHAN
 * =====================================================
 */
router.get('/:laporan_id', authenticate, async (req, res) => {
  try {
    const { laporan_id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('informasi_tambahan')
      .select('*')
      .eq('laporan_id', laporan_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil informasi tambahan'
      });
    }

    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
