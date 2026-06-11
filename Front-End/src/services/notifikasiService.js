import { supabase } from '../lib/supabase';

// ─── ADMIN KECAMATAN: Kirim peringatan ke petugas lapangan ────────────────
export async function createPeringatan({ laporanId, pesanPeringatan, adminId }) {
  const { error } = await supabase
    .from('notifikasi')
    .insert([{
      laporan_id:    laporanId,
      pengirim_id:   adminId,
      penerima_role: 'petugas',           // semua petugas dapat notif
      judul:         'Peringatan dari Admin Kecamatan',
      pesan:         pesanPeringatan,
      is_read:       false,
    }]);

  if (error) throw error;
}

// ─── PETUGAS: Ambil semua notifikasi untuk role petugas ───────────────────
export async function getNotifikasiByPetugas() {
  const { data, error } = await supabase
    .from('notifikasi')
    .select(`
      *,
      laporan:laporan_id (judul, alamat),
      pengirim:pengirim_id (nama)
    `)
    .eq('penerima_role', 'petugas')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ─── Badge bell: hitung notif belum dibaca untuk petugas ──────────────────
export async function countUnreadNotifikasi() {
  const { count, error } = await supabase
    .from('notifikasi')
    .select('*', { count: 'exact', head: true })
    .eq('penerima_role', 'petugas')
    .eq('is_read', false);

  if (error) throw error;
  return count ?? 0;
}

export async function markAsRead(id) {
  const { error } = await supabase
    .from('notifikasi')
    .update({ is_read: true })
    .eq('id', id);

  if (error) throw error;
}

export async function markAllAsRead() {
  const { error } = await supabase
    .from('notifikasi')
    .update({ is_read: true })
    .eq('penerima_role', 'petugas')
    .eq('is_read', false);

  if (error) throw error;
}