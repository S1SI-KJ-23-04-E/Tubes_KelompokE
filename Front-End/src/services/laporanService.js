import { supabase } from '../lib/supabase';

// ===============================
// GET USER ID (SAFE)
// ===============================
async function getCurrentUserId() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Anda belum login.');
  return session.user.id;
}

// ===============================
// CREATE LAPORAN
// ===============================
export async function createLaporan(data) {
  try {
    const userId = await getCurrentUserId();

    const { data: result, error } = await supabase
      .from('laporan')
      .insert([{
        pelapor_id: userId,
        kecamatan_id: data.kecamatan_id,
        kelurahan_id: data.kelurahan_id,
        deskripsi: data.deskripsi,
        alamat: data.alamat,
        foto_url: data.foto_url,
        status: 'pending'
      }])
      .select();

    if (error) throw error;

    // insert history
    if (result?.length) {
      await supabase.from('history_laporan').insert([{
        laporan_id: result[0].id,
        status: 'pending',
        changed_by: userId
      }]);
    }

    return { success: true, data: result };

  } catch (error) {
    console.error('createLaporan error:', error);
    return { success: false, error: error.message };
  }
}

// ===============================
// GET LAPORAN USER
// ===============================
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
    console.error('getLaporanByUser error:', error);
    return { success: false, data: [] };
  }
}

// ===============================
// GET DETAIL LAPORAN
// ===============================
export async function getLaporanById(id) {
  try {
    const { data, error } = await supabase
      .from('laporan')
      .select(`
        *,
        kecamatan ( id, nama_kecamatan ),
        kelurahan ( id, nama_kelurahan ),
        profiles ( id, nama )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // history
    const { data: history } = await supabase
      .from('history_laporan')
      .select('*')
      .eq('laporan_id', id)
      .order('created_at', { ascending: true });

    // bukti selesai
    const { data: bukti } = await supabase
      .from('bukti_selesai')
      .select('*')
      .eq('laporan_id', id)
      .maybeSingle();

    return {
      success: true,
      data: {
        ...data,
        history: history || [],
        bukti: bukti || null
      }
    };

  } catch (error) {
    console.error('getLaporanById error:', error);
    return { success: false, data: null };
  }
}

// ===============================
// DELETE LAPORAN
// ===============================
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
    console.error('deleteLaporan error:', error);
    return { success: false };
  }
}

// ===============================
// UPDATE STATUS (ADMIN)
// ===============================
export async function updateLaporanStatus(id, status, fileBukti = null, catatan = '') {
  try {
    const userId = await getCurrentUserId();

    // update status
    const { error } = await supabase
      .from('laporan')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    // insert history
    await supabase.from('history_laporan').insert([{
      laporan_id: id,
      status,
      changed_by: userId,
      catatan
    }]);

    // upload bukti jika selesai
    if (status === 'selesai' && fileBukti) {
      const ext = fileBukti.name.split('.').pop();
      const filePath = `bukti_${id}_${Date.now()}.${ext}`;

      await supabase.storage
        .from('laporan-photos')
        .upload(filePath, fileBukti);

      const { data: url } = supabase.storage
        .from('laporan-photos')
        .getPublicUrl(filePath);

      await supabase.from('bukti_selesai').insert([{
        laporan_id: id,
        url_foto: url.publicUrl,
        keterangan: catatan,
        uploaded_by: userId
      }]);
    }

    return { success: true };

  } catch (error) {
    console.error('updateStatus error:', error);
    return { success: false };
  }
}

// ===============================
// GET KECAMATAN & KELURAHAN
// ===============================
export async function getKecamatan() {
  const { data } = await supabase
    .from('kecamatan')
    .select('*')
    .order('nama_kecamatan');

  return data || [];
}

export async function getKelurahan(kecamatanId) {
  if (!kecamatanId) return [];

  const { data } = await supabase
    .from('kelurahan')
    .select('*')
    .eq('kecamatan_id', kecamatanId)
    .order('nama_kelurahan');

  return data || [];
}

// ===============================
// UPLOAD FOTO
// ===============================
export async function uploadFoto(file) {
  if (!file) return null;

  try {
    const userId = await getCurrentUserId();

    const ext = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${ext}`;

    await supabase.storage
      .from('laporan-photos')
      .upload(filePath, file);

    const { data } = supabase.storage
      .from('laporan-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;

  } catch (error) {
    console.error('uploadFoto error:', error);
    return null;
  }
}

// ===============================
// GET INFORMASI ADMIN
// ===============================
export async function getInformasi(laporanId) {
  try {
    const { data, error } = await supabase
      .from('informasi_laporan') // pastikan nama tabel ini sesuai di DB kamu
      .select(`
        id,
        catatan,
        created_at,
        profiles ( nama )
      `)
      .eq('laporan_id', laporanId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };

  } catch (error) {
    console.error('getInformasi error:', error);
    return { success: false, data: [] };
  }
}

// ===============================
// TAMBAH INFORMASI ADMIN
// ===============================
export async function tambahInformasi(laporanId, catatan) {
  try {
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from('informasi_laporan') // pastikan nama tabel ini sama
      .insert([{
        laporan_id: laporanId,
        catatan: catatan,
        created_by: userId
      }]);

    if (error) throw error;

    return { success: true };

  } catch (error) {
    console.error('Error updating status:', error);
    return { success: false, error: error.message };
  }
}

export async function selesaiLaporan(id, fileBukti = null, keterangan = '') {
  return updateLaporanStatus(id, 'done', fileBukti, keterangan);
}

export async function tolakLaporan(id, keterangan = '') {
  return updateLaporanStatus(id, 'rejected', null, keterangan);
}

export const createKendala = async (laporan_id, deskripsi) => {
  const { data, error } = await supabase
    .from('kendala_laporan')
    .insert([{ laporan_id, deskripsi }]);

  return { data, error };
};