-- =============================================
-- FIX: Ubah Foreign Key kendala_laporan.laporan_id
-- =============================================

-- Drop foreign key yang salah
ALTER TABLE kendala_laporan 
DROP CONSTRAINT IF EXISTS kendala_laporan_laporan_id_fkey;

-- Tambah foreign key yang benar (ref ke laporan.id)
ALTER TABLE kendala_laporan 
ADD CONSTRAINT kendala_laporan_laporan_id_fkey 
FOREIGN KEY (laporan_id) REFERENCES laporan(id) ON DELETE CASCADE;
