-- =============================================
-- FIX: Tambah RLS policies yang kurang
-- Drop dulu jika sudah ada, baru create
-- =============================================

-- 1. PROFILES
DROP POLICY IF EXISTS "profiles_select_all_authenticated" ON profiles;
CREATE POLICY "profiles_select_all_authenticated" ON profiles 
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. HISTORY_LAPORAN
DROP POLICY IF EXISTS "history_laporan_select_all" ON history_laporan;
CREATE POLICY "history_laporan_select_all" ON history_laporan 
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "history_laporan_insert_authenticated" ON history_laporan;
CREATE POLICY "history_laporan_insert_authenticated" ON history_laporan 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. BUKTI_SELESAI
DROP POLICY IF EXISTS "bukti_selesai_select_all" ON bukti_selesai;
CREATE POLICY "bukti_selesai_select_all" ON bukti_selesai 
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "bukti_selesai_insert_admin" ON bukti_selesai;
CREATE POLICY "bukti_selesai_insert_admin" ON bukti_selesai 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('kecamatan', 'super_admin', 'petugas')
    )
  );

-- 4. FEEDBACK
DROP POLICY IF EXISTS "feedback_insert_authenticated" ON feedback;
CREATE POLICY "feedback_insert_authenticated" ON feedback 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "feedback_select_all" ON feedback;
CREATE POLICY "feedback_select_all" ON feedback 
  FOR SELECT USING (auth.role() = 'authenticated');

-- 5. KECAMATAN & KELURAHAN (public read)
ALTER TABLE kecamatan ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kecamatan_select_all" ON kecamatan;
CREATE POLICY "kecamatan_select_all" ON kecamatan 
  FOR SELECT USING (true);

ALTER TABLE kelurahan ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kelurahan_select_all" ON kelurahan;
CREATE POLICY "kelurahan_select_all" ON kelurahan 
  FOR SELECT USING (true);
