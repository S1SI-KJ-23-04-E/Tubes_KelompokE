import { supabase } from '../lib/supabase';

// Get current user ID from LOCAL session (no network call — instant)
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

export async function createLaporan(data) {
  try {
    const userId = await getCurrentUserId();
    
    const { data: result, error } = await supabase
      .from('laporan')
      .insert([
        {
          pelapor_id: userId, 
          kecamatan_id: data.kecamatan_id,
          kelurahan_id: data.kelurahan_id,
          deskripsi: data.deskripsi,
          alamat: data.alamat,
          foto_url: data.foto_url,
          status: 'pending'
        }
      ])
      .select();

    if (error) throw error;
    
    // Also insert to history_laporan
    if (result && result.length > 0) {
      const { error: hErr } = await supabase.from('history_laporan').insert([
        {
          laporan_id: result[0].id,
          status: 'pending',
          changed_by: userId
        }
      ]);
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
    console.error('Error getting laporan:', error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function getLaporanById(id) {
  try {
    const { data, error } = await supabase
      .from('laporan')
      .select(`
        *,
        kecamatan:kecamatan_id(id,nama_kecamatan),
        kelurahan:kelurahan_id(id,nama_kelurahan),
        profiles:pelapor_id(id,nama),
        kendala_laporan(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Query error full:', error);
      throw error;
    }

    console.log('Laporan data:', data);

    // Fetch history — graceful, won't block on failure
    let history = [];
    const { data: hData, error: hError } = await supabase
      .from('history_laporan')
      .select('*')
      .eq('laporan_id', id)
      .order('created_at', { ascending: true });
    if (!hError) history = hData || [];
    else console.warn('history_laporan fetch warning:', hError.message);

    // Fetch bukti_selesai — graceful
    let bukti = null;
    const { data: bData, error: bError } = await supabase
      .from('bukti_selesai')
      .select('*')
      .eq('laporan_id', id)
      .maybeSingle();
    if (!bError) bukti = bData || null;
    else console.warn('bukti_selesai fetch warning:', bError.message);

    // Fetch feedback — graceful
    let feedback = [];
    const { data: fData, error: fError } = await supabase
      .from('feedback')
      .select('*')
      .eq('laporan_id', id)
      .order('created_at', { ascending: false });
    if (!fError) feedback = fData || [];
    else console.warn('feedback fetch warning:', fError.message);

    // Fetch kendala — graceful
    let kendala = [];
    const { data: kData, error: kError } = await supabase
      .from('kendala_laporan')
      .select('*')
      .eq('laporan_id', id)
      .order('created_at', { ascending: false });
    if (!kError) kendala = kData || [];
    else console.warn('kendala_laporan fetch warning:', kError.message);

    return {
      success: true,
      data: { ...data, history, bukti, feedback, kendala }
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

export async function getKecamatan() {
  try {
    const { data, error } = await supabase.from('kecamatan').select('*').order('nama_kecamatan');
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

export async function uploadFoto(file) {
  if (!file) return null;
  try {
    const userId = await getCurrentUserId();
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

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

// --- ADMIN FUNCTIONS ---

export async function getLaporanByKecamatan(kecamatanId) {
  try {
    const { data, error } = await supabase
      .from('laporan')
      .select(`
        *,
        kecamatan ( id, nama_kecamatan ),
        kelurahan ( id, nama_kelurahan ),
        profiles ( id, nama )
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
        kecamatan ( id, nama_kecamatan ),
        kelurahan ( id, nama_kelurahan ),
        profiles ( id, nama )
      `)
      .order('created_at', { ascending: false });

    // If caller provides an excludeUserId, filter out reports from that user at the query level
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

export async function updateLaporanStatus(id, newStatus, fileBukti = null, keterangan = '') {
  try {
    const userId = await getCurrentUserId();
    const profile = await getCurrentUserProfile();
    const laporanKecamatanId = await getLaporanKecamatanId(id);
    const normalizedStatus = newStatus === 'selesai' ? 'done' : newStatus;

    const isSuperAdmin = profile?.role === 'super_admin';
    const sameKecamatan = String(profile?.kecamatan_id || profile?.kecamatan?.id || '') === String(laporanKecamatanId || '');
    const canManage = isSuperAdmin || ((profile?.role === 'kecamatan' || profile?.role === 'petugas') && sameKecamatan);

    if (!canManage) {
      throw new Error('Anda hanya bisa memperbarui laporan di kecamatan Anda sendiri.');
    }
    
    // 1. Update status in laporan table
    const { error: updateError } = await supabase
      .from('laporan')
      .update({ status: normalizedStatus })
      .eq('id', id);

    if (updateError) throw updateError;

    // 2. Insert into history_laporan
    const { error: historyErr } = await supabase.from('history_laporan').insert([
      {
        laporan_id: id,
        status: normalizedStatus,
        changed_by: userId,
        catatan: keterangan
      }
    ]);
    if (historyErr) console.warn('History insert warning:', historyErr.message);

    // 3. Handle bukti selesai if status is done and a file is provided
    if (normalizedStatus === 'done' && fileBukti) {
      const fileExt = fileBukti.name.split('.').pop();
      const fileName = `bukti_${id}_${Math.random()}.${fileExt}`;
      const filePath = `bukti/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('laporan-photos')
        .upload(filePath, fileBukti);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('laporan-photos')
        .getPublicUrl(filePath);

      await supabase.from('bukti_selesai').insert([
        {
          laporan_id: id,
          url_foto: publicUrlData.publicUrl,
          keterangan: keterangan,
          uploaded_by: userId
        }
      ]);
    }

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

export async function getKendalaByLaporan(laporanId) {
  try {
    const { data, error } = await supabase
      .from('kendala_laporan')
      .select('*')
      .eq('laporan_id', laporanId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching kendala:', error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function createKendala(laporanId, deskripsi) {
  try {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('kendala_laporan')
      .insert([{ 
        laporan_id: laporanId, 
        deskripsi,
        petugas_id: userId
      }])
      .select();

    if (error) throw error;
    return { success: true, data: data };
  } catch (error) {
    console.error('Error creating kendala:', error);
    return { success: false, error: error.message };
  }
}

export async function upvoteLaporan(laporanId) {
  try {
    const userId = await getCurrentUserId();

    const { data: existing } = await supabase
      .from('upvote_laporan')
      .select('*')
      .eq('laporan_id', laporanId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('upvote_laporan')
        .delete()
        .eq('id', existing.id);

      return { success: true, upvoted: false };
    } else {
      await supabase
        .from('upvote_laporan')
        .insert([{ laporan_id: laporanId, user_id: userId }]);

      return { success: true, upvoted: true };
    }
  } catch (error) {
    console.error('Error upvote:', error);
    return { success: false };
  }
}