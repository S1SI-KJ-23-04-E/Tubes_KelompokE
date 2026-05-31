import { supabase } from '../lib/supabase';

export async function createNotifikasi(data) {
  const { error } = await supabase
    .from('notifikasi')
    .insert([data]);

  if (error) throw error;
}

export async function getNotifikasiPetugas() {
  const { data, error } = await supabase
    .from('notifikasi')
    .select('*')
    .eq('penerima_role', 'petugas')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data;
}

export async function markAsRead(id) {
  const { error } = await supabase
    .from('notifikasi')
    .update({ is_read: true })
    .eq('id', id);

  if (error) throw error;
}