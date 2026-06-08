import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';

// ─────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────

/** Ambil user ID dari session lokal — tanpa network call */
async function getCurrentUserId() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Anda belum login.');
  return session.user.id;
}

async function getCurrentUserProfile() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, kecamatan_id, kecamatan: kecamatan(id)')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function getLaporanKecamatanId(id) {
  const { data, error } = await supabase
    .from('laporan')
    .select('id, kecamatan_id')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Laporan tidak ditemukan.');
  return data.kecamatan_id;
}

// ─────────────────────────────────────────
// WARGA — LAPORAN CRUD
// ─────────────────────────────────────────

export async function createLaporan(data) {
  try {
    const userId = await getCurrentUserId();

    const { data: result, error } = await supabase
      .from('laporan')
      .insert([{
        pelapor_id:   userId,
        judul:        data.judul,
        kecamatan_id: data.kecamatan_id,
        kelurahan_id: data.kelurahan_id,
        deskripsi:    data.deskripsi,
        alamat:       data.alamat,
        foto_url:     data.foto_url,
        latitude:     data.latitude  || null,
        longitude:    data.longitude || null,
        status:       'pending',
      }])
      .select();

    if (error) throw error;

    // Catat ke history_laporan
    if (result?.length > 0) {
      const { error: hErr } = await supabase.from('history_laporan').insert([{
        laporan_id: result[0].id,
        status:     'pending',
        changed_by: userId,
      }]);
      if (hErr) console.warn('History insert warning:', hErr.message);
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('Error creating laporan:', error);
    return { success: false, error: error.message };
  }
}

export async function getLaporanByUser() {
  try {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('laporan')
      .select(`
        *,
        kecamatan ( id, nama_kecamatan ),
        kelurahan ( id, nama_kelurahan )
      `)
      .eq('pelapor_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error getting laporan by user:', error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function getLaporanById(id) {
  try {
    const { data, error } = await supabase
      .from('laporan')
      .select(`
        *,
        kecamatan:kecamatan_id ( id, nama_kecamatan ),
        kelurahan:kelurahan_id ( id, nama_kelurahan ),
        profiles:pelapor_id    ( id, nama ),
        kendala_laporan(*),
        feedback(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Normalisasi feedback
    data.feedback = Array.isArray(data.feedback)
      ? data.feedback
      : data.feedback ? [data.feedback] : [];

    // History
    let history = [];
    const { data: hData, error: hErr } = await supabase
      .from('history_laporan')
      .select('*')
      .eq('laporan_id', id)
      .order('created_at', { ascending: true });
    if (!hErr) history = hData || [];
    else console.warn('history_laporan fetch warning:', hErr.message);

    // Bukti selesai
    let bukti = null;
    const { data: bData, error: bErr } = await supabase
      .from('bukti_selesai')
      .select('*')
      .eq('laporan_id', id)
      .maybeSingle();
    if (!bErr) bukti = bData || null;
    else console.warn('bukti_selesai fetch warning:', bErr.message);

    // Feedback (fresh fetch — override dari select di atas)
    let feedback = [];
    const { data: fData, error: fErr } = await supabase
      .from('feedback')
      .select('*')
      .eq('laporan_id', id)
      .order('created_at', { ascending: false });
    if (!fErr) feedback = fData || [];
    else console.warn('feedback fetch warning:', fErr.message);

    return {
      success: true,
      data: { ...data, history, bukti, feedback },
    };
  } catch (error) {
    console.error('Error getting laporan detail:', error);
    return { success: false, error: error.message, data: null };
  }
}

export async function deleteLaporan(id) {
  try {
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from('laporan')
      .delete()
      .eq('id', id)
      .eq('pelapor_id', userId)
      .eq('status', 'pending');

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting laporan:', error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────
// REFERENSI DATA
// ─────────────────────────────────────────

export async function getKecamatan() {
  try {
    const { data, error } = await supabase
      .from('kecamatan')
      .select('*')
      .order('nama_kecamatan');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching kecamatan:', error);
    return [];
  }
}

export async function getKelurahan(kecamatanId) {
  if (!kecamatanId) return [];
  try {
    const { data, error } = await supabase
      .from('kelurahan')
      .select('*')
      .eq('kecamatan_id', kecamatanId)
      .order('nama_kelurahan');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching kelurahan:', error);
    return [];
  }
}

// ─────────────────────────────────────────
// UPLOAD FOTO
// ─────────────────────────────────────────

export async function uploadFoto(file) {
  if (!file) return null;
  try {
    const userId = await getCurrentUserId();
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('laporan-photos')
      .upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('laporan-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading photo:', error);
    return null;
  }
}

// ─────────────────────────────────────────
// ADMIN — LAPORAN
// ─────────────────────────────────────────

export async function getLaporanByKecamatan(kecamatanId) {
  try {
    const { data, error } = await supabase
      .from('laporan')
      .select(`
        *,
        kecamatan  ( id, nama_kecamatan ),
        kelurahan  ( id, nama_kelurahan ),
        profiles   ( id, nama ),
        bukti_selesai ( id )
      `)
      .eq('kecamatan_id', kecamatanId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error getting laporan by kecamatan:', error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function getAllLaporan(excludeUserId = null) {
  try {
    let query = supabase
      .from('laporan')
      .select(`
        *,
        kecamatan  ( id, nama_kecamatan ),
        kelurahan  ( id, nama_kelurahan ),
        profiles   ( id, nama ),
        bukti_selesai ( id )
      `)
      .order('created_at', { ascending: false });

    if (excludeUserId) {
      query = query.neq('pelapor_id', excludeUserId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error getting all laporan:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Update status laporan beserta opsional upload bukti selesai.
 *
 * BUGFIX: versi sebelumnya memiliki `if (fileBukti) {` tanpa penutup `}`
 * sehingga fungsi tidak dapat di-parse dengan benar.
 */
export async function updateLaporanStatus(id, newStatus, fileBukti = null, keterangan = '') {
  try {
    const userId           = await getCurrentUserId();
    const profile          = await getCurrentUserProfile();
    const laporanKecamatanId = await getLaporanKecamatanId(id);
    const normalizedStatus = newStatus === 'selesai' ? 'done' : newStatus;

    const isSuperAdmin  = profile?.role === 'super_admin';
    const sameKecamatan = String(profile?.kecamatan_id || profile?.kecamatan?.id || '')
                       === String(laporanKecamatanId || '');
    const canManage = isSuperAdmin
      || ((profile?.role === 'kecamatan' || profile?.role === 'petugas') && sameKecamatan);

    if (!canManage) {
      throw new Error('Anda hanya bisa memperbarui laporan di kecamatan Anda sendiri.');
    }

    // 1. Update status
    const { error: updateError } = await supabase
      .from('laporan')
      .update({ status: normalizedStatus })
      .eq('id', id);
    if (updateError) throw updateError;

    // 2. Catat ke history
    const { error: historyErr } = await supabase.from('history_laporan').insert([{
      laporan_id: id,
      status:     normalizedStatus,
      changed_by: userId,
      catatan:    keterangan,
    }]);
    if (historyErr) console.warn('History insert warning:', historyErr.message);

    // 3. Upload bukti selesai (hanya jika status done dan ada file)
    if (normalizedStatus === 'done' && fileBukti) {
      const fileExt  = fileBukti.name.split('.').pop();
      const filePath = `bukti/bukti_${id}_${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('laporan-photos')
        .upload(filePath, fileBukti);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('laporan-photos')
        .getPublicUrl(filePath);

      const { error: buktiErr } = await supabase.from('bukti_selesai').insert([{
        laporan_id:  id,
        url_foto:    publicUrlData.publicUrl,
        keterangan:  keterangan,
        uploaded_by: userId,
      }]);
      if (buktiErr) console.warn('Bukti selesai insert warning:', buktiErr.message);
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating status:', error);
    return { success: false, error: error.message };
  }
}

export async function updateCatatanLaporan(id, catatan) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Anda belum login.');

    const res = await fetch(`${API_URL}/admin/laporan/${id}/catatan`, {
      method:  'PUT',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ catatan }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menyimpan catatan');
    return data;
  } catch (error) {
    console.error('Error in updateCatatanLaporan:', error);
    return { success: false, error: error.message };
  }
}

/** Convenience wrapper */
export async function selesaiLaporan(id, fileBukti = null, keterangan = '') {
  return updateLaporanStatus(id, 'done', fileBukti, keterangan);
}

/** Convenience wrapper */
export async function tolakLaporan(id, keterangan = '') {
  return updateLaporanStatus(id, 'rejected', null, keterangan);
}

// ─────────────────────────────────────────
// KENDALA LAPANGAN
// ─────────────────────────────────────────

export const createKendala = async (laporan_id, deskripsi) => {
  try {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('kendala_laporan')
      .insert([{
        laporan_id,
        deskripsi,
        petugas_id: userId,
      }])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating kendala:', error);
    return { success: false, error: error.message };
  }
};

export async function getKendalaByKecamatan(kecamatanId) {
  try {
    const { data, error } = await supabase
      .from('kendala_laporan')
      .select(`
        *,
        laporan!inner (
          id,
          kecamatan_id,
          judul,
          deskripsi,
          alamat,
          status
        )
      `)
      .eq('laporan.kecamatan_id', kecamatanId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error get kendala kecamatan:', error);
    return { success: false, error: error.message, data: [] };
  }
}

// ─────────────────────────────────────────
// UPVOTE
// ─────────────────────────────────────────

export async function checkUserUpvoted(laporanId) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: true, upvoted: false };

    const res = await fetch(`${API_URL}/laporan/${laporanId}/upvote/check`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    });

    if (!res.ok) {
      console.warn('Upvote check API tidak tersedia');
      return { success: true, upvoted: false };
    }

    return await res.json();
  } catch (error) {
    console.error('Error checking upvote:', error);
    return { success: false, upvoted: false };
  }
}

export async function upvoteLaporan(laporanId) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Silakan login terlebih dahulu untuk memberikan dukungan.');

    const res = await fetch(`${API_URL}/laporan/${laporanId}/upvote`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.details || data.error || 'Terjadi kesalahan pada server');
    return data;
  } catch (error) {
    console.error('Error in upvoteLaporan:', error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────
// DETEKSI & MERGE DUPLIKAT
// ─────────────────────────────────────────

/**
 * Ambil grup laporan duplikat berdasarkan kecamatan & radius.
 * @param {string} kecamatanId
 * @param {number} radius - meter (1–50, default 50)
 */
export async function getDuplicateGroups(kecamatanId, radius = 50) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Anda belum login.');

    const res = await fetch(
      `${API_URL}/admin/duplicate/${kecamatanId}?radius=${radius}`,
      { headers: { 'Authorization': `Bearer ${session.access_token}` } }
    );

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal mengambil data duplikat');

    return {
      success:      true,
      data:         json.data        || [],
      total_groups: json.total_groups || 0,
      total_pairs:  json.total_pairs  || 0,
      radius:       json.radius,
    };
  } catch (error) {
    console.error('Error getting duplicate groups:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Gabungkan laporan duplikat ke laporan primer.
 * @param {string}   primaryId    - UUID laporan utama
 * @param {string[]} secondaryIds - UUID laporan yang digabung
 */
export async function mergeLaporan(primaryId, secondaryIds) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Anda belum login.');

    const res = await fetch(`${API_URL}/admin/duplicate/merge`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        primary_id:    primaryId,
        secondary_ids: secondaryIds,
      }),
    });

    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.error || 'Gagal menggabungkan laporan');
    }

    return {
      success:       true,
      merged_count:  json.merged_count,
      total_upvotes: json.total_upvotes,
    };
  } catch (error) {
    console.error('Error merging laporan:', error);
    return { success: false, error: error.message };
  }
}