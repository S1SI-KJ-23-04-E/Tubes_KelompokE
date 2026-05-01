-- =============================================
-- FIX: Tambah RLS policies untuk kendala_laporan
-- =============================================

-- Enable RLS jika belum
ALTER TABLE kendala_laporan ENABLE ROW LEVEL SECURITY;

-- Policy 1: Semua authenticated user bisa SELECT kendala_laporan
DROP POLICY IF EXISTS "kendala_laporan_select_all" ON kendala_laporan;
CREATE POLICY "kendala_laporan_select_all" ON kendala_laporan 
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy 2: Petugas bisa INSERT kendala (untuk laporannya yang sedang diproses)
DROP POLICY IF EXISTS "kendala_laporan_insert_petugas" ON kendala_laporan;
CREATE POLICY "kendala_laporan_insert_petugas" ON kendala_laporan 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'petugas'
    )
  );

-- Policy 3: Admin bisa UPDATE/DELETE kendala_laporan
DROP POLICY IF EXISTS "kendala_laporan_update_admin" ON kendala_laporan;
CREATE POLICY "kendala_laporan_update_admin" ON kendala_laporan 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'kecamatan')
    )
  );

DROP POLICY IF EXISTS "kendala_laporan_delete_admin" ON kendala_laporan;
CREATE POLICY "kendala_laporan_delete_admin" ON kendala_laporan 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'kecamatan')
    )
  );
