import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';

// Get current user ID from LOCAL session (no network call — instant)
async function getCurrentUserId() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Anda belum login.');
  return session.user.id;
}

// Get auth token for backend API calls
async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Anda belum login.');
  return session.access_token;
}

export async function createLaporan(data) {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_URL}/laporan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        kecamatan_id: data.kecamatan_id,
        kelurahan_id: data.kelurahan_id,
        deskripsi: data.deskripsi,
        alamat: data.alamat,
        foto_url: data.foto_url
      })
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Gagal membuat laporan');
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error creating laporan:', error);
    return { success: false, error: error.message };
  }
}

export async function getLaporanByUser() {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_URL}/laporan/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Gagal mengambil laporan');
    }

    return { success: true, data: result.data || [] };
  } catch (error) {
    console.error('Error getting laporan:', error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function getLaporanById(id) {
  try {
    const response = await fetch(`${API_URL}/laporan/${id}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Gagal mengambil detail laporan');
    }

    // Backend endpoint returns data with history_laporan as 'history_laporan' 
    // and bukti_selesai as 'bukti_selesai'.
    // We map them to 'history' and 'bukti' for frontend compatibility.
    const data = result.data;
    return {
      success: true,
      data: { 
        ...data, 
        history: data.history_laporan || [], 
        bukti: data.bukti_selesai?.[0] || null,
        feedback: data.feedback || []
      }
    };
  } catch (error) {
    console.error('Error getting laporan detail:', error);
    return { success: false, error: error.message, data: null };
  }
}

export async function upvoteLaporan(id) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/laporan/${id}/upvote`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || 'Gagal upvote');
    return result;
  } catch (error) {
    console.error('Upvote failed:', error);
    return { success: false, error: error.message };
  }
}

export async function checkUserUpvoted(id) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/laporan/${id}/user-upvoted`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || 'Gagal cek upvote');
    return result;
  } catch (error) {
    console.error('Check upvote failed:', error);
    return { success: false, upvoted: false };
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

export async function getAllLaporan() {
  try {
    const response = await fetch(`${API_URL}/laporan`);

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Gagal mengambil semua laporan');
    }

    return { success: true, data: result.data || [] };
  } catch (error) {
    console.error('Error getting all laporan:', error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function updateLaporanStatus(id, newStatus, fileBukti = null, keterangan = '') {
  try {
    const userId = await getCurrentUserId();
    
    // 1. Update status in laporan table
    const { error: updateError } = await supabase
      .from('laporan')
      .update({ status: newStatus })
      .eq('id', id);

    if (updateError) throw updateError;

    // 2. Insert into history_laporan
    const { error: historyErr } = await supabase.from('history_laporan').insert([
      {
        laporan_id: id,
        status: newStatus,
        changed_by: userId,
        catatan: keterangan
      }
    ]);
    if (historyErr) console.warn('History insert warning:', historyErr.message);

    // 3. Handle bukti selesai if status is 'selesai' and a file is provided
    if (newStatus === 'selesai' && fileBukti) {
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

// ===============================
// UPLOAD BUKTI (PAKAI URL)
// ===============================
export async function uploadBuktiURL(id, foto_url, keterangan = '') {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      throw new Error('Token otentikasi tidak tersedia. Silakan login ulang.');
    }

    const res = await fetch(`${API_BASE_URL}/admin/laporan/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: 'done',
        keterangan,
        foto_url,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || 'Gagal mengunggah bukti.');
    }
    return data;

  } catch (error) {
    console.error('Error upload bukti:', error);
    return { success: false, error: error.message || 'Error upload bukti' };
  }
}
