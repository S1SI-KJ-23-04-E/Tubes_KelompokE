-- Fix: Set default value untuk created_at di kendala_laporan
ALTER TABLE kendala_laporan 
ALTER COLUMN created_at SET DEFAULT now();

-- Jika ada row yang created_at-nya NULL, update ke waktu sekarang
UPDATE kendala_laporan 
SET created_at = now() 
WHERE created_at IS NULL;
