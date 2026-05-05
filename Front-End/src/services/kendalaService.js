import { supabase } from '../lib/supabase';

export const createKendala = async (laporanId, deskripsi) => {
  if (!laporanId) {
    throw new Error('laporan_id kosong');
  }

  const { data, error } = await supabase
    .from('kendala_laporan')
    .insert([
      {
        laporan_id: laporanId,
        deskripsi: deskripsi
      }
    ])
    .select();

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data;
};