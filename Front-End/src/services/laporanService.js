import { supabase } from '../lib/supabase';

// Get current user ID from LOCAL session (no network call — instant)
async function getCurrentUserId() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Anda belum login.');
  return session.user.id;
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

    // Fetch history — graceful, won't block on failure
    let history = [];
    const { data: hData, error: hError } = await supabase
      .from('history_laporan')
      .select('*')
      .eq('laporan_id', id)
      .order('created_at', { ascending: true });
    if (!hError) history = hData || [];

    // Fetch bukti_selesai — graceful
    let bukti = null;
    const { data: bData, error: bError } = await supabase
      .from('bukti_selesai')
      .select('*')
      .eq('laporan_id', id)
      .maybeSingle();
    if (!bError) bukti = bData || null;

    return {
      success: true,
      data: { ...data, history, bukti }
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
    
    const { error: updateError } = await supabase
      .from('laporan')
      .update({ status: newStatus })
      .eq('id', id);

    if (updateError) throw updateError;

    const { error: historyErr } = await supabase.from('history_laporan').insert([
      {
        laporan_id: id,
        status: newStatus,
        changed_by: userId,
        catatan: keterangan
      }
    ]);

    if (newStatus === 'selesai' && fileBukti) {
      const fileExt = fileBukti.name.split('.').pop();
      const fileName = `bukti_${id}_${Math.random()}.${fileExt}`;
      const filePath = `bukti/${fileName}`;

      await supabase.storage.from('laporan-photos').upload(filePath, fileBukti);

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

export const createKendala = async (laporan_id, deskripsi) => {
  try {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('kendala_laporan')
      .insert([{ 
        laporan_id, 
        deskripsi: deskripsi,
        petugas_id: userId
      }]);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating kendala:', error);
    return { success: false, error: error.message };
  }
};

export async function checkUserUpvoted(laporanId) {
  try {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('upvote')
      .select('id')
      .eq('laporan_id', laporanId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return { success: true, upvoted: !!data };
  } catch (error) {
    console.error('Error checking upvote:', error);
    return { success: false, upvoted: false };
  }
}

export async function upvoteLaporan(laporanId) {
  try {
    const userId = await getCurrentUserId();

    const { data: existing } = await supabase
      .from('upvote')
      .select('*')
      .eq('laporan_id', laporanId)
      .eq('user_id', userId)
      .maybeSingle();

    const { data: laporan } = await supabase
      .from('laporan')
      .select('upvote_count')
      .eq('id', laporanId)
      .single();

    let newCount = laporan?.upvote_count || 0;

    if (existing) {
      await supabase.from('upvote').delete().eq('id', existing.id);
      newCount = Math.max(0, newCount - 1);
    } else {
      await supabase.from('upvote').insert([{ laporan_id: laporanId, user_id: userId }]);
      newCount = newCount + 1;
    }

    await supabase.from('laporan').update({ upvote_count: newCount }).eq('id', laporanId);

    return { success: true, upvoted: !existing, upvote_count: newCount };
  } catch (error) {
    console.error('Error upvote:', error);
    return { success: false, error: error.message };
  }
}