import { supabase } from '../lib/supabase';

export const createKendala = async (laporanId, deskripsi) => {
  const { error } = await supabase
    .from('kendala_laporan')
    .insert([
      {
        laporan_id: laporanId,
        deskripsi: deskripsi
      }
    ]);

  if (error) return { success: false, error: error.message };

  return { success: true };
};