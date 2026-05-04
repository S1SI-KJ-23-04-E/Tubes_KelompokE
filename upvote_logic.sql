-- =============================================
-- FIX: Logic Upvote & Unvote
-- =============================================

-- 1. Tambah RLS policies untuk tabel upvote
ALTER TABLE upvote ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "upvote_select_all" ON upvote;
CREATE POLICY "upvote_select_all" ON upvote 
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "upvote_insert_own" ON upvote;
CREATE POLICY "upvote_insert_own" ON upvote 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "upvote_delete_own" ON upvote;
CREATE POLICY "upvote_delete_own" ON upvote 
  FOR DELETE USING (auth.uid() = user_id);

-- 2. Fungsi untuk update upvote_count secara otomatis
CREATE OR REPLACE FUNCTION handle_upvote_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE laporan 
    SET upvote_count = upvote_count + 1 
    WHERE id = NEW.laporan_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE laporan 
    SET upvote_count = GREATEST(0, upvote_count - 1) 
    WHERE id = OLD.laporan_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger untuk tabel upvote
DROP TRIGGER IF EXISTS on_upvote_change ON upvote;
CREATE TRIGGER on_upvote_change
  AFTER INSERT OR DELETE ON upvote
  FOR EACH ROW EXECUTE FUNCTION handle_upvote_change();
