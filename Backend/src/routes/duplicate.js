import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/admin/duplicate/:kecamatanId
 * Mencari laporan duplikat (berdekatan 1-50 meter) dalam satu kecamatan
 * Hanya untuk admin kecamatan / super_admin
 */
router.get('/:kecamatanId', authenticate, async (req, res) => {
  try {
    const userRole = req.user?.profile?.role;
    const userKecamatan = req.user?.profile?.kecamatan_id;

    // Validasi role
    if (!['kecamatan', 'super_admin'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Hanya admin kecamatan yang dapat mengakses fitur ini'
      });
    }

    // Validasi kecamatan (kecuali super admin)
    if (userRole === 'kecamatan' && String(userKecamatan) !== String(req.params.kecamatanId)) {
      return res.status(403).json({
        success: false,
        error: 'Anda hanya dapat melihat duplikat di kecamatan Anda'
      });
    }

    const radius = parseFloat(req.query.radius) || 50; // default 50 meter
    const safeRadius = Math.min(Math.max(radius, 1), 50); // clamp 1-50

    // Call RPC function
    const { data, error } = await supabaseAdmin.rpc('find_nearby_reports', {
      p_kecamatan_id: req.params.kecamatanId,
      p_radius_meters: safeRadius
    });

    if (error) {
      console.error('RPC find_nearby_reports error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    // Kelompokkan pasangan duplikat menjadi grup menggunakan Union-Find
    const groups = buildDuplicateGroups(data || []);

    res.json({
      success: true,
      data: groups,
      radius: safeRadius,
      total_pairs: (data || []).length,
      total_groups: groups.length
    });
  } catch (err) {
    console.error('Duplicate detection error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/admin/duplicate/merge
 * Menggabungkan laporan duplikat
 * Body: { primary_id: UUID, secondary_ids: UUID[] }
 */
router.post('/merge', authenticate, async (req, res) => {
  try {
    const userRole = req.user?.profile?.role;
    const userId = req.user.id;

    // Validasi role
    if (!['kecamatan', 'super_admin'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Hanya admin kecamatan yang dapat menggabungkan laporan'
      });
    }

    const { primary_id, secondary_ids } = req.body;

    if (!primary_id || !Array.isArray(secondary_ids) || secondary_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'primary_id dan secondary_ids (array) wajib diisi'
      });
    }

    // Call RPC function
    const { data, error } = await supabaseAdmin.rpc('merge_laporan', {
      p_primary_id: primary_id,
      p_secondary_ids: secondary_ids,
      p_admin_id: userId
    });

    if (error) {
      console.error('RPC merge_laporan error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    // RPC mengembalikan JSON object
    if (data && data.success === false) {
      return res.status(400).json(data);
    }

    res.json({
      success: true,
      ...data
    });
  } catch (err) {
    console.error('Merge error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Mengelompokkan pasangan duplikat menjadi grup menggunakan Union-Find
 * Input: array of pairs dari RPC find_nearby_reports
 * Output: array of groups, masing-masing berisi reports + distances
 */
function buildDuplicateGroups(pairs) {
  if (!pairs || pairs.length === 0) return [];

  // Union-Find data structure
  const parent = {};
  const find = (x) => {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  };
  const union = (a, b) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootA] = rootB;
  };

  // Kumpulkan semua report data
  const reportMap = {};
  const distanceMap = {};

  for (const pair of pairs) {
    const idA = pair.report_id;
    const idB = pair.nearby_id;

    // Inisialisasi parent
    if (!(idA in parent)) parent[idA] = idA;
    if (!(idB in parent)) parent[idB] = idB;

    // Union
    union(idA, idB);

    // Simpan data report
    if (!reportMap[idA]) {
      reportMap[idA] = {
        id: idA,
        judul: pair.judul,
        deskripsi: pair.deskripsi,
        alamat: pair.alamat,
        status: pair.status,
        latitude: pair.latitude,
        longitude: pair.longitude,
        created_at: pair.created_at,
        pelapor_nama: pair.pelapor_nama,
        foto_url: pair.foto_url,
        upvote_count: pair.upvote_count
      };
    }
    if (!reportMap[idB]) {
      reportMap[idB] = {
        id: idB,
        judul: pair.nearby_judul,
        deskripsi: pair.nearby_deskripsi,
        alamat: pair.nearby_alamat,
        status: pair.nearby_status,
        latitude: pair.nearby_latitude,
        longitude: pair.nearby_longitude,
        created_at: pair.nearby_created_at,
        pelapor_nama: pair.nearby_pelapor_nama,
        foto_url: pair.nearby_foto_url,
        upvote_count: pair.nearby_upvote_count
      };
    }

    // Simpan distance antar pasangan
    const pairKey = [idA, idB].sort().join(':');
    distanceMap[pairKey] = Math.round(pair.distance_meters * 100) / 100;
  }

  // Bangun grup berdasarkan Union-Find root
  const groupMap = {};
  for (const id of Object.keys(parent)) {
    const root = find(id);
    if (!groupMap[root]) groupMap[root] = [];
    groupMap[root].push(reportMap[id]);
  }

  // Format output
  const groups = Object.values(groupMap).map(reports => {
    // Urutkan: yang paling lama (pertama dibuat) di atas
    reports.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Cari jarak antar semua pasangan dalam grup
    const distances = [];
    for (let i = 0; i < reports.length; i++) {
      for (let j = i + 1; j < reports.length; j++) {
        const pairKey = [reports[i].id, reports[j].id].sort().join(':');
        if (distanceMap[pairKey] !== undefined) {
          distances.push({
            from: reports[i].id,
            to: reports[j].id,
            meters: distanceMap[pairKey]
          });
        }
      }
    }

    return {
      group_id: reports[0].id, // gunakan ID laporan tertua sebagai group_id
      reports,
      distances,
      min_distance: distances.length > 0 ? Math.min(...distances.map(d => d.meters)) : 0,
      max_distance: distances.length > 0 ? Math.max(...distances.map(d => d.meters)) : 0,
      count: reports.length
    };
  });

  // Urutkan: grup dengan jarak terkecil (paling mungkin duplikat) di atas
  groups.sort((a, b) => a.min_distance - b.min_distance);

  return groups;
}

export default router;
