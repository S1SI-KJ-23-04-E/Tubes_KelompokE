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

-- Seed Data Kecamatan Jakarta Selatan
INSERT INTO kecamatan (nama_kecamatan) VALUES
  ('Tebet'), ('Setiabudi'), ('Mampang Prapatan'),
  ('Pasar Minggu'), ('Cilandak'), ('Pesanggrahan'),
  ('Kebayoran Lama'), ('Kebayoran Baru'), ('Pancoran'),
  ('Jagakarsa');

-- INSERT DUMMY KELURAHAN (Contoh untuk Tebet dan Setiabudi)
DO $$
DECLARE
  tebet_id UUID;
  setiabudi_id UUID;
BEGIN
  SELECT id INTO tebet_id FROM kecamatan WHERE nama_kecamatan = 'Tebet' LIMIT 1;
  SELECT id INTO setiabudi_id FROM kecamatan WHERE nama_kecamatan = 'Setiabudi' LIMIT 1;
  
  INSERT INTO kelurahan (nama_kelurahan, kecamatan_id) VALUES
    ('Tebet Barat', tebet_id), ('Tebet Timur', tebet_id), ('Kebon Baru', tebet_id), ('Bukit Duri', tebet_id),
    ('Setiabudi', setiabudi_id), ('Karet', setiabudi_id), ('Kuningan Timur', setiabudi_id);
END $$;
