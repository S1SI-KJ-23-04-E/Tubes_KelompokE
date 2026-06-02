-- ============================================================
-- SMART DUPLICATE DETECTION - DATABASE SETUP
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================================

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Tambah kolom latitude & longitude di tabel laporan
ALTER TABLE laporan ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE laporan ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- 3. Tambah kolom judul jika belum ada (sudah digunakan di frontend)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'laporan' AND column_name = 'judul'
  ) THEN
    ALTER TABLE laporan ADD COLUMN judul TEXT;
  END IF;
END $$;

-- 4. Tambah kolom merged_into untuk tracking laporan yang sudah di-merge
ALTER TABLE laporan ADD COLUMN IF NOT EXISTS merged_into UUID REFERENCES laporan(id);

-- 5. Buat index spasial untuk optimasi query jarak
CREATE INDEX IF NOT EXISTS idx_laporan_coordinates 
  ON laporan (latitude, longitude) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 6. Index untuk merged_into
CREATE INDEX IF NOT EXISTS idx_laporan_merged_into 
  ON laporan (merged_into) 
  WHERE merged_into IS NOT NULL;

-- ============================================================
-- FUNCTION: find_nearby_reports
-- Mencari laporan yang berdekatan (1-50 meter) dalam satu kecamatan
-- Menggunakan PostGIS ST_DWithin dan ST_Distance
-- ============================================================
CREATE OR REPLACE FUNCTION find_nearby_reports(
  p_kecamatan_id UUID,
  p_radius_meters DOUBLE PRECISION DEFAULT 50
)
RETURNS TABLE (
  report_id UUID,
  judul TEXT,
  deskripsi TEXT,
  alamat TEXT,
  status laporan_status,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ,
  pelapor_nama TEXT,
  foto_url TEXT,
  upvote_count INT,
  nearby_id UUID,
  nearby_judul TEXT,
  nearby_deskripsi TEXT,
  nearby_alamat TEXT,
  nearby_status laporan_status,
  nearby_latitude DOUBLE PRECISION,
  nearby_longitude DOUBLE PRECISION,
  nearby_created_at TIMESTAMPTZ,
  nearby_pelapor_nama TEXT,
  nearby_foto_url TEXT,
  nearby_upvote_count INT,
  distance_meters DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id AS report_id,
    a.judul,
    a.deskripsi,
    a.alamat,
    a.status,
    a.latitude,
    a.longitude,
    a.created_at,
    pa.nama AS pelapor_nama,
    a.foto_url,
    a.upvote_count,
    b.id AS nearby_id,
    b.judul AS nearby_judul,
    b.deskripsi AS nearby_deskripsi,
    b.alamat AS nearby_alamat,
    b.status AS nearby_status,
    b.latitude AS nearby_latitude,
    b.longitude AS nearby_longitude,
    b.created_at AS nearby_created_at,
    pb.nama AS nearby_pelapor_nama,
    b.foto_url AS nearby_foto_url,
    b.upvote_count AS nearby_upvote_count,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(a.longitude, a.latitude), 4326)::geography,
      ST_SetSRID(ST_MakePoint(b.longitude, b.latitude), 4326)::geography
    ) AS distance_meters
  FROM laporan a
  JOIN laporan b ON a.id < b.id  -- Hindari duplikasi pasangan (A,B) dan (B,A)
  LEFT JOIN profiles pa ON pa.id = a.pelapor_id
  LEFT JOIN profiles pb ON pb.id = b.pelapor_id
  WHERE 
    -- Hanya dalam kecamatan dan kelurahan yang sama
    a.kecamatan_id = p_kecamatan_id
    AND b.kecamatan_id = p_kecamatan_id
    AND a.kelurahan_id = b.kelurahan_id
    -- Hanya laporan yang belum di-merge
    AND a.merged_into IS NULL
    AND b.merged_into IS NULL
    -- Hanya laporan yang belum selesai/ditolak
    AND a.status NOT IN ('done', 'rejected')
    AND b.status NOT IN ('done', 'rejected')
    -- Harus punya koordinat
    AND a.latitude IS NOT NULL AND a.longitude IS NOT NULL
    AND b.latitude IS NOT NULL AND b.longitude IS NOT NULL
    -- Jarak dalam radius (menggunakan PostGIS geography untuk akurasi meter)
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(a.longitude, a.latitude), 4326)::geography,
      ST_SetSRID(ST_MakePoint(b.longitude, b.latitude), 4326)::geography,
      p_radius_meters
    )
  ORDER BY distance_meters ASC;
END;
$$;

-- ============================================================
-- FUNCTION: merge_laporan
-- Menggabungkan laporan duplikat:
-- - Laporan primer tetap aktif, upvote digabungkan
-- - Laporan sekunder ditandai merged_into = primer.id
-- - History merge dicatat
-- ============================================================
CREATE OR REPLACE FUNCTION merge_laporan(
  p_primary_id UUID,
  p_secondary_ids UUID[],
  p_admin_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_secondary_id UUID;
  v_total_upvotes INT := 0;
  v_primary_upvotes INT := 0;
  v_merged_count INT := 0;
  v_admin_role TEXT;
  v_admin_kecamatan UUID;
  v_primary_kecamatan UUID;
  v_primary_kelurahan UUID;
  v_appended_text TEXT := '';
  v_secondary_judul TEXT;
  v_secondary_deskripsi TEXT;
  v_secondary_pelapor_nama TEXT;
BEGIN
  -- Validasi role admin
  SELECT role, kecamatan_id INTO v_admin_role, v_admin_kecamatan
  FROM profiles WHERE id = p_admin_id;

  IF v_admin_role NOT IN ('kecamatan', 'super_admin') THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Hanya admin kecamatan yang dapat menggabungkan laporan'
    );
  END IF;

  -- Validasi laporan primer
  SELECT kecamatan_id, kelurahan_id, upvote_count INTO v_primary_kecamatan, v_primary_kelurahan, v_primary_upvotes
  FROM laporan WHERE id = p_primary_id AND merged_into IS NULL;

  IF v_primary_kecamatan IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Laporan primer tidak ditemukan atau sudah di-merge'
    );
  END IF;

  -- Validasi kecamatan admin (kecuali super_admin)
  IF v_admin_role = 'kecamatan' AND v_admin_kecamatan != v_primary_kecamatan THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Anda hanya dapat menggabungkan laporan di kecamatan Anda'
    );
  END IF;

  -- Hitung total upvote dari semua laporan sekunder
  v_total_upvotes := v_primary_upvotes;

  FOREACH v_secondary_id IN ARRAY p_secondary_ids LOOP
    -- Validasi setiap laporan sekunder
    IF NOT EXISTS (
      SELECT 1 FROM laporan 
      WHERE id = v_secondary_id 
        AND merged_into IS NULL 
        AND kecamatan_id = v_primary_kecamatan
        AND kelurahan_id = v_primary_kelurahan
    ) THEN
      RETURN json_build_object(
        'success', false, 
        'error', format('Laporan sekunder %s tidak valid atau sudah di-merge', v_secondary_id)
      );
    END IF;

    -- Ambil data laporan sekunder (termasuk upvote, judul, deskripsi, dan nama pelapor)
    SELECT l.upvote_count, l.judul, l.deskripsi, p.nama
    INTO v_primary_upvotes, v_secondary_judul, v_secondary_deskripsi, v_secondary_pelapor_nama
    FROM laporan l
    LEFT JOIN profiles p ON p.id = l.pelapor_id
    WHERE l.id = v_secondary_id;
    
    v_total_upvotes := v_total_upvotes + COALESCE(v_primary_upvotes, 0);

    -- Format teks yang akan ditambahkan ke laporan primer
    v_appended_text := v_appended_text || format(
      E'\n%s. %s (%s):\n"%s"\n',
      v_merged_count + 1,
      COALESCE(v_secondary_pelapor_nama, 'Warga'),
      v_secondary_judul,
      v_secondary_deskripsi
    );

    -- Tandai laporan sekunder sebagai merged
    UPDATE laporan 
    SET 
      merged_into = p_primary_id,
      status = 'done',
      updated_at = NOW(),
      catatan = COALESCE(catatan, '') || E'\n[MERGED] Laporan ini telah digabungkan ke laporan utama.'
    WHERE id = v_secondary_id;

    -- Pindahkan upvote dari sekunder ke primer
    UPDATE upvote SET laporan_id = p_primary_id
    WHERE laporan_id = v_secondary_id
      AND user_id NOT IN (
        SELECT user_id FROM upvote WHERE laporan_id = p_primary_id
      );

    -- Hapus upvote duplikat (user yang sudah upvote di primer)
    DELETE FROM upvote WHERE laporan_id = v_secondary_id;

    -- Catat history merge untuk laporan sekunder
    INSERT INTO history_laporan (laporan_id, status, changed_by, catatan)
    VALUES (
      v_secondary_id, 
      'done', 
      p_admin_id, 
      format('Digabungkan ke laporan utama (ID: %s)', p_primary_id)
    );

    v_merged_count := v_merged_count + 1;
  END LOOP;

  -- Update upvote_count dan deskripsi di laporan primer
  IF v_merged_count > 0 THEN
    UPDATE laporan 
    SET 
      upvote_count = v_total_upvotes,
      updated_at = NOW(),
      deskripsi = deskripsi || E'\n\n--- Laporan Tambahan dari Warga (Digabung) ---' || v_appended_text,
      catatan = COALESCE(catatan, '') || E'\n[MERGED] ' || v_merged_count || ' laporan duplikat telah digabungkan.'
    WHERE id = p_primary_id;
  END IF;

  -- Catat history merge untuk laporan primer
  INSERT INTO history_laporan (laporan_id, status, changed_by, catatan)
  VALUES (
    p_primary_id, 
    (SELECT status FROM laporan WHERE id = p_primary_id), 
    p_admin_id, 
    format('%s laporan duplikat telah digabungkan ke laporan ini', v_merged_count)
  );

  RETURN json_build_object(
    'success', true,
    'merged_count', v_merged_count,
    'total_upvotes', v_total_upvotes,
    'primary_id', p_primary_id
  );
END;
$$;

-- ============================================================
-- GRANT akses RPC functions
-- ============================================================
GRANT EXECUTE ON FUNCTION find_nearby_reports(UUID, DOUBLE PRECISION) TO authenticated;
GRANT EXECUTE ON FUNCTION find_nearby_reports(UUID, DOUBLE PRECISION) TO service_role;
GRANT EXECUTE ON FUNCTION merge_laporan(UUID, UUID[], UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION merge_laporan(UUID, UUID[], UUID) TO service_role;
