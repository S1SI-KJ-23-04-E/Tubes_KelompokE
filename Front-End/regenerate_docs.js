import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log("Memulihkan file daftar akun...");
  
  const { data: kecamatans, error } = await supabase.from('kecamatan').select('*').order('nama_kecamatan');
  
  if (error) {
    console.error("Gagal mengambil data kecamatan:", error);
    return;
  }

  // 1. Pulihkan daftar_akun_kecamatan.txt
  let adminKecamatanList = "DAFTAR AKUN KECAMATAN\n=====================\n\n";
  for (const kec of kecamatans) {
    const cleanName = kec.nama_kecamatan.toLowerCase().replace(/\s+/g, '');
    const email = `admin.${cleanName}@simikot.com`;
    const password = `Kecamatan${cleanName}123!`;
    adminKecamatanList += `Kecamatan: ${kec.nama_kecamatan}\nEmail: ${email}\nPassword: ${password}\n\n`;
  }
  fs.writeFileSync('daftar_akun_kecamatan.txt', adminKecamatanList);
  console.log("✅ Berhasil memulihkan daftar_akun_kecamatan.txt");

  // 2. Pulihkan daftar_akun_petugas_admin.txt
  let petugasAdminList = "DAFTAR AKUN SUPER ADMIN & PETUGAS\n=================================\n\n";
  petugasAdminList += `[SUPER ADMIN PUSAT]\nEmail: admin@simikot.com\nPassword: SuperAdmin123!\n\n`;

  for (const kec of kecamatans) {
    const cleanName = kec.nama_kecamatan.toLowerCase().replace(/\s+/g, '');
    const email = `petugas.${cleanName}@simikot.com`;
    const password = `Petugas${cleanName}123!`;
    petugasAdminList += `[PETUGAS] Kecamatan ${kec.nama_kecamatan}\nEmail: ${email}\nPassword: ${password}\n\n`;
  }
  fs.writeFileSync('daftar_akun_petugas_admin.txt', petugasAdminList);
  console.log("✅ Berhasil memulihkan daftar_akun_petugas_admin.txt");
}

main();
