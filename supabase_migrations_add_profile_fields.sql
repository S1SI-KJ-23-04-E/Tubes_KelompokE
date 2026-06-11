-- ✅ Tambahkan kolom no_telepon ke tabel profiles (jika belum ada)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS no_telepon VARCHAR(15),
ADD COLUMN IF NOT EXISTS alamat TEXT;

-- ✅ Tambahkan constraint untuk no_telepon
ALTER TABLE profiles
ADD CONSTRAINT check_no_telepon 
CHECK (no_telepon IS NULL OR no_telepon ~ '^(\+62|0)[0-9]{9,12}$');

-- ✅ Tambahkan index untuk performa
CREATE INDEX IF NOT EXISTS idx_profiles_no_telepon ON profiles(no_telepon);
