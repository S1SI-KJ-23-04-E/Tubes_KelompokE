-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM types
CREATE TYPE user_role AS ENUM ('warga', 'kecamatan', 'petugas', 'super_admin');
CREATE TYPE laporan_status AS ENUM ('pending', 'verified', 'in_progress', 'done', 'rejected');
CREATE TYPE laporan_prioritas AS ENUM ('low', 'medium', 'high', 'urgent');

-- Tabel Kecamatan
CREATE TABLE kecamatan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_kecamatan TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Kelurahan
CREATE TABLE kelurahan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_kelurahan TEXT NOT NULL,
  kecamatan_id UUID REFERENCES kecamatan(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Users (extend auth.users dari Supabase)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'warga',
  kecamatan_id UUID REFERENCES kecamatan(id),
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Laporan
CREATE TABLE laporan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pelapor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  kecamatan_id UUID REFERENCES kecamatan(id),
  kelurahan_id UUID REFERENCES kelurahan(id),
  deskripsi TEXT NOT NULL,
  alamat TEXT NOT NULL,
  foto_url TEXT,
  prioritas laporan_prioritas DEFAULT 'medium',
  status laporan_status DEFAULT 'pending',
  catatan TEXT,
  upvote_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  selesai_at TIMESTAMPTZ
);

-- Tabel Upvote
CREATE TABLE upvote (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  laporan_id UUID REFERENCES laporan(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(laporan_id, user_id)
);

-- Tabel Bukti Selesai
CREATE TABLE bukti_selesai (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  laporan_id UUID UNIQUE REFERENCES laporan(id) ON DELETE CASCADE,
  url_foto TEXT NOT NULL,
  keterangan TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Feedback
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  laporan_id UUID UNIQUE REFERENCES laporan(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  ulasan TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Kendala
CREATE TABLE kendala (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  laporan_id UUID REFERENCES laporan(id) ON DELETE CASCADE,
  petugas_id UUID REFERENCES profiles(id),
  alasan TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel History Status Laporan
CREATE TABLE history_laporan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  laporan_id UUID REFERENCES laporan(id) ON DELETE CASCADE,
  status laporan_status NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Notifikasi
CREATE TABLE notifikasi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  laporan_id UUID REFERENCES laporan(id) ON DELETE CASCADE,
  isi_pesan TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Berita
CREATE TABLE berita (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id),
  kecamatan_id UUID REFERENCES kecamatan(id),
  judul TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Penugasan
CREATE TABLE penugasan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  laporan_id UUID REFERENCES laporan(id) ON DELETE CASCADE,
  petugas_id UUID REFERENCES profiles(id),
  kecamatan_id UUID REFERENCES kecamatan(id),
  waktu_ditugaskan TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS di semua tabel
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE laporan ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvote ENABLE ROW LEVEL SECURITY;
ALTER TABLE bukti_selesai ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE kendala ENABLE ROW LEVEL SECURITY;
ALTER TABLE history_laporan ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifikasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE penugasan ENABLE ROW LEVEL SECURITY;

-- Profiles: user bisa baca & update profil sendiri
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Laporan: semua authenticated user bisa baca
CREATE POLICY "laporan_select_all" ON laporan FOR SELECT USING (auth.role() = 'authenticated');
-- Warga bisa insert laporan sendiri
CREATE POLICY "laporan_insert_warga" ON laporan FOR INSERT WITH CHECK (auth.uid() = pelapor_id);
-- Warga bisa delete laporan sendiri yang masih pending
CREATE POLICY "laporan_delete_own_pending" ON laporan FOR DELETE
  USING (auth.uid() = pelapor_id AND status = 'pending');
-- Kecamatan/admin bisa update laporan
CREATE POLICY "laporan_update_admin" ON laporan FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('kecamatan', 'super_admin', 'petugas')
    )
  );

-- Notifikasi: user hanya bisa baca notifikasi sendiri
CREATE POLICY "notifikasi_select_own" ON notifikasi FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- DATA KECAMATAN & KELURAHAN DKI JAKARTA
-- ==========================================

DO $$
DECLARE
  kec_id UUID;
BEGIN

  -- Kota/Kabupaten: KABUPATEN KEPULAUAN SERIBU
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Kepulauan Seribu Selatan') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Pulau Tidung', kec_id),
    ('Pulau Pari', kec_id),
    ('Pulau Untung Jawa', kec_id);

  -- Kota/Kabupaten: KABUPATEN KEPULAUAN SERIBU
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Kepulauan Seribu Utara') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Pulau Panggang', kec_id),
    ('Pulau Kelapa', kec_id),
    ('Pulau Harapan', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA SELATAN
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Jagakarsa') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Cipedak', kec_id),
    ('Srengseng Sawah', kec_id),
    ('Ciganjur', kec_id),
    ('Jagakarsa', kec_id),
    ('Lenteng Agung', kec_id),
    ('Tanjung Barat', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA SELATAN
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Pasar Minggu') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Cilandak Timur', kec_id),
    ('Ragunan', kec_id),
    ('Kebagusan', kec_id),
    ('Pasar Minggu', kec_id),
    ('Jati Padang', kec_id),
    ('Pejaten Barat', kec_id),
    ('Pejaten Timur', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA SELATAN
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Cilandak') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Lebak Bulus', kec_id),
    ('Pondok Labu', kec_id),
    ('Cilandak Barat', kec_id),
    ('Gandaria Selatan', kec_id),
    ('Cipete Selatan', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA SELATAN
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Pesanggrahan') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Bintaro', kec_id),
    ('Pesanggrahan', kec_id),
    ('Ulujami', kec_id),
    ('Petukangan Selatan', kec_id),
    ('Petukangan Utara', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA SELATAN
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Kebayoran Lama') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Pondok Pinang', kec_id),
    ('Kebayoran Lama Selatan', kec_id),
    ('Kebayoran Lama Utara', kec_id),
    ('Cipulir', kec_id),
    ('Grogol Selatan', kec_id),
    ('Grogol Utara', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA SELATAN
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Kebayoran Baru') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Gandaria Utara', kec_id),
    ('Cipete Utara', kec_id),
    ('Pulo', kec_id),
    ('Petogogan', kec_id),
    ('Melawai', kec_id),
    ('Kramat Pela', kec_id),
    ('Selong', kec_id),
    ('Rawa Barat', kec_id),
    ('Senayan', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA SELATAN
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Mampang Prapatan') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Bangka', kec_id),
    ('Pela Mampang', kec_id),
    ('Tegal Parang', kec_id),
    ('Mampang Prapatan', kec_id),
    ('Kuningan Barat', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA SELATAN
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Pancoran') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Kalibata', kec_id),
    ('Rawajati', kec_id),
    ('Duren Tiga', kec_id),
    ('Pancoran', kec_id),
    ('Pengadegan', kec_id),
    ('Cikoko', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA SELATAN
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Tebet') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Menteng Dalam', kec_id),
    ('Tebet Barat', kec_id),
    ('Tebet Timur', kec_id),
    ('Kebon Baru', kec_id),
    ('Bukit Duri', kec_id),
    ('Manggarai Selatan', kec_id),
    ('Manggarai', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA SELATAN
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Setia Budi') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Karet Semanggi', kec_id),
    ('Kuningan Timur', kec_id),
    ('Karet Kuningan', kec_id),
    ('Karet', kec_id),
    ('Menteng Atas', kec_id),
    ('Pasar Manggis', kec_id),
    ('Setia Budi', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA TIMUR
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Pasar Rebo') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Pekayon', kec_id),
    ('Kalisari', kec_id),
    ('Baru', kec_id),
    ('Cijantung', kec_id),
    ('Gedong', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA TIMUR
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Ciracas') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Cibubur', kec_id),
    ('Kelapa Dua Wetan', kec_id),
    ('Ciracas', kec_id),
    ('Susukan', kec_id),
    ('Rambutan', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA TIMUR
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Cipayung') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Pondok Ranggon', kec_id),
    ('Cilangkap', kec_id),
    ('Cipayung', kec_id),
    ('Bambu Apus', kec_id),
    ('Lubang Buaya', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA TIMUR
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Makasar') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Pinang Ranti', kec_id),
    ('Makasar', kec_id),
    ('Kebon Pala', kec_id),
    ('Halim Perdana Kusumah', kec_id),
    ('Cipinang Melayu', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA TIMUR
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Kramat Jati') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Bale Kambang', kec_id),
    ('Batu Ampar', kec_id),
    ('Kampung Tengah', kec_id),
    ('Kramat Jati', kec_id),
    ('Cililitan', kec_id),
    ('Cawang', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA TIMUR
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Jatinegara') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Bidara Cina', kec_id),
    ('Cipinang Cempedak', kec_id),
    ('Cipinang Besar Selatan', kec_id),
    ('Cipinang Muara', kec_id),
    ('Cipinang Besar Utara', kec_id),
    ('Rawa Bunga', kec_id),
    ('Bali Mester', kec_id),
    ('Kampung Melayu', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA TIMUR
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Duren Sawit') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Pondok Bambu', kec_id),
    ('Duren Sawit', kec_id),
    ('Pondok Kelapa', kec_id),
    ('Pondok Kopi', kec_id),
    ('Malaka Jaya', kec_id),
    ('Malaka Sari', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA TIMUR
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Cakung') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Jatinegara', kec_id),
    ('Penggilingan', kec_id),
    ('Pulo Gebang', kec_id),
    ('Cakung Timur', kec_id),
    ('Cakung Barat', kec_id),
    ('Rawa Terate', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA TIMUR
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Pulo Gadung') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Pisangan Timur', kec_id),
    ('Cipinang', kec_id),
    ('Jatinegara Kaum', kec_id),
    ('Jati', kec_id),
    ('Rawamangun', kec_id),
    ('Kayu Putih', kec_id),
    ('Pulo Gadung', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA TIMUR
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Matraman') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Kebon Manggis', kec_id),
    ('Pal Meriem', kec_id),
    ('Pisangan Baru', kec_id),
    ('Kayu Manis', kec_id),
    ('Utan Kayu Selatan', kec_id),
    ('Utan Kayu Utara', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA PUSAT
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Tanah Abang') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Gelora', kec_id),
    ('Bendungan Hilir', kec_id),
    ('Karet Tengsin', kec_id),
    ('Kebon Melati', kec_id),
    ('Petamburan', kec_id),
    ('Kebon Kacang', kec_id),
    ('Kampung Bali', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA PUSAT
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Menteng') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Pegangsaan', kec_id),
    ('Cikini', kec_id),
    ('Gondangdia', kec_id),
    ('Kebon Sirih', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA PUSAT
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Senen') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Kenari', kec_id),
    ('Paseban', kec_id),
    ('Kramat', kec_id),
    ('Kwitang', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA PUSAT
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Johar Baru') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Johar Baru', kec_id),
    ('Kampung Rawa', kec_id),
    ('Tanah Tinggi', kec_id),
    ('Galur', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA PUSAT
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Cempaka Putih') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Rawa Sari', kec_id),
    ('Cempaka Putih Timur', kec_id),
    ('Cempaka Putih Barat', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA PUSAT
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Kemayoran') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Harapan Mulya', kec_id),
    ('Cempaka Baru', kec_id),
    ('Sumur Batu', kec_id),
    ('Serdang', kec_id),
    ('Utan Panjang', kec_id),
    ('Kebon Kosong', kec_id),
    ('Kemayoran', kec_id),
    ('Gunung Sahari Selatan', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA PUSAT
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Sawah Besar') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Pasar Baru', kec_id),
    ('Gunung Sahari Utara', kec_id),
    ('Kartini', kec_id),
    ('Karang Anyar', kec_id),
    ('Mangga Dua Selatan', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA PUSAT
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Gambir') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Cideng', kec_id),
    ('Petojo Selatan', kec_id),
    ('Gambir', kec_id),
    ('Kebon Kelapa', kec_id),
    ('Petojo Utara', kec_id),
    ('Duri Pulo', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA BARAT
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Kembangan') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Joglo', kec_id),
    ('Meruya Selatan', kec_id),
    ('Meruya Utara', kec_id),
    ('Kembangan Selatan', kec_id),
    ('Kembangan Utara', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA BARAT
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Kebon Jeruk') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Sukabumi Selatan', kec_id),
    ('Sukabumi Utara', kec_id),
    ('Kelapa Dua', kec_id),
    ('Kebon Jeruk', kec_id),
    ('Duri Kepa', kec_id),
    ('Kedoya Selatan', kec_id),
    ('Kedoya Utara', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA BARAT
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Palmerah') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Palmerah', kec_id),
    ('Slipi', kec_id),
    ('Kemanggisan', kec_id),
    ('Kota Bambu Utara', kec_id),
    ('Kota Bambu Selatan', kec_id),
    ('Jati Pulo', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA BARAT
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Grogol Petamburan') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Tanjung Duren Utara', kec_id),
    ('Tanjung Duren Selatan', kec_id),
    ('Tomang', kec_id),
    ('Grogol', kec_id),
    ('Jelambar', kec_id),
    ('Wijaya Kesuma', kec_id),
    ('Jelambar Baru', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA BARAT
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Tambora') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Kalianyar', kec_id),
    ('Duri Selatan', kec_id),
    ('Tanah Sereal', kec_id),
    ('Duri Utara', kec_id),
    ('Krendang', kec_id),
    ('Jembatan Besi', kec_id),
    ('Angke', kec_id),
    ('Jembatan Lima', kec_id),
    ('Tambora', kec_id),
    ('Roa Malaka', kec_id),
    ('Pekojan', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA BARAT
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Taman Sari') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Maphar', kec_id),
    ('Taman Sari', kec_id),
    ('Tangki', kec_id),
    ('Mangga Besar', kec_id),
    ('Keagungan', kec_id),
    ('Glodok', kec_id),
    ('Pinangsia', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA BARAT
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Cengkareng') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Duri Kosambi', kec_id),
    ('Rawa Buaya', kec_id),
    ('Kedaung Kali Angke', kec_id),
    ('Kapuk', kec_id),
    ('Cengkareng Timur', kec_id),
    ('Cengkareng Barat', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA BARAT
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Kali Deres') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Semanan', kec_id),
    ('Kalideres', kec_id),
    ('Pegadungan', kec_id),
    ('Tegal Alur', kec_id),
    ('Kamal', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA UTARA
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Penjaringan') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Kamal Muara', kec_id),
    ('Kapuk Muara', kec_id),
    ('Pejagalan', kec_id),
    ('Penjaringan', kec_id),
    ('Pluit', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA UTARA
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Pademangan') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Pademangan Barat', kec_id),
    ('Pademangan Timur', kec_id),
    ('Ancol', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA UTARA
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Tanjung Priok') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Sunter Agung', kec_id),
    ('Sunter Jaya', kec_id),
    ('Papango', kec_id),
    ('Warakas', kec_id),
    ('Sungai Bambu', kec_id),
    ('Kebon Bawang', kec_id),
    ('Tanjung Priuk', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA UTARA
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Koja') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Rawabadak Selatan', kec_id),
    ('Tugu Selatan', kec_id),
    ('Tugu Utara', kec_id),
    ('Lagoa', kec_id),
    ('Rawabadak Utara', kec_id),
    ('Koja', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA UTARA
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Kelapa Gading') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Kelapa Gading Barat', kec_id),
    ('Kelapa Gading Timur', kec_id),
    ('Pegangsaan Dua', kec_id);

  -- Kota/Kabupaten: KOTA JAKARTA UTARA
  INSERT INTO kecamatan (nama_kecamatan) VALUES ('Cilincing') RETURNING id INTO kec_id;
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Suka Pura', kec_id),
    ('Rorotan', kec_id),
    ('Marunda', kec_id),
    ('Cilincing', kec_id),
    ('Semper Timur', kec_id),
    ('Semper Barat', kec_id),
    ('Kali Baru', kec_id);

END $$;
