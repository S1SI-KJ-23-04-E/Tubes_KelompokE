-- =============================================
-- FIX: Tambah kolom petugas_id ke kendala_laporan
-- =============================================

-- 1. Tambah kolom petugas_id jika belum ada
ALTER TABLE kendala_laporan 
ADD COLUMN IF NOT EXISTS petugas_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- 2. Pastikan kolom deskripsi ada (sebagai fallback jika sebelumnya memakai 'alasan')
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kendala_laporan' AND column_name='deskripsi') THEN
        ALTER TABLE kendala_laporan ADD COLUMN deskripsi TEXT;
    END IF;
END $$;

-- 3. Update RLS Policy untuk memperbolehkan petugas memasukkan id mereka sendiri
DROP POLICY IF EXISTS "kendala_laporan_insert_petugas" ON kendala_laporan;
CREATE POLICY "kendala_laporan_insert_petugas" ON kendala_laporan 
  FOR INSERT WITH CHECK (
    auth.uid() = petugas_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'petugas'
    )
  );

-- 4. Refresh schema cache (hanya ilustrasi, biasanya otomatis di Supabase)
-- NOTIFY pgrst, 'reload schema';
