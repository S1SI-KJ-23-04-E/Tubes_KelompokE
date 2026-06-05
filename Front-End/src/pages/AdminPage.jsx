import { useEffect, useState } from "react";
import LaporanCard from "../components/LaporanCard";

// ✅ TAMBAHAN
import { getKendalaByKecamatan, getLaporanByKecamatan } from "../services/laporanService";
import { createBerita } from "../services/beritaService";
import { useAuth } from "../contexts/AuthContext";

const AdminPage = () => {
  const [laporan, setLaporan] = useState([]);

  // ✅ TAMBAHAN
  const [kendalaList, setKendalaList] = useState([]);

  // ✅ TAMBAHAN
  const { profile } = useAuth();

  const fetchLaporan = async () => {
    if (!profile?.kecamatan_id) return;
    const res = await getLaporanByKecamatan(profile.kecamatan_id);
    if (res.success) {
      setLaporan(res.data);
    } else {
      console.error('Gagal memuat laporan:', res.error);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, [user]);

  // ✅ TAMBAHAN (TIDAK MENGGANGGU YANG LAMA)
  useEffect(() => {
    const fetchKendala = async () => {
    console.log("USER:", user);
    console.log("KECAMATAN ID:", user?.kecamatan_id);
      if (!user?.kecamatan_id) return;

      const res = await getKendalaByKecamatan(user.kecamatan_id);

       console.log("KENDALA DATA:", res.data);

      if (res.success) {
        console.log("KENDALA DATA:", res.data); // debug
        setKendalaList(res.data);
      } else {
        console.error(res.error);
      }
    };

    fetchKendala();
  }, [user]);

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">Dashboard Kecamatan</h1>

      {/* ✅ BAGIAN LAMA (TIDAK DIUBAH) */}
      {laporan.map((item) => (
        <LaporanCard key={item.id_laporan || item.id} laporan={item} onUpdate={fetchLaporan} />
      ))}

      {/* ✅ TAMBAHAN KENDALA */}
      <h2 className="text-lg font-semibold mt-6 mb-2">Kendala Masuk</h2>
      <pre>{JSON.stringify(kendalaList, null, 2)}</pre>

      {kendalaList.length === 0 ? (
        <p>Tidak ada kendala</p>
      ) : (
        kendalaList.map((item) => (
          <div key={item.id} className="border p-3 mb-2 rounded">
            <p><b>Isi Kendala:</b> {item.isi_kendala || item.deskripsi}</p>
            <p><b>ID Laporan:</b> {item.laporan?.id}</p>
            <p><b>Alamat:</b> {item.laporan?.alamat}</p>
          </div>
        ))
      )}

      {/* Form buat berita untuk admin kecamatan */}
      {profile?.role === 'kecamatan' || profile?.role === 'super_admin' ? (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-lg font-semibold mb-2">Buat Berita Informasi</h2>
          <BeritaForm />
        </div>
      ) : null}
    </div>
  );
};

export default AdminPage;

function BeritaForm() {
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const payload = { judul, deskripsi };
    const res = await createBerita(payload);
    setLoading(false);
    if (res.success) {
      setMsg({ type: 'success', text: 'Berita berhasil dibuat' });
      setJudul('');
      setDeskripsi('');
    } else {
      setMsg({ type: 'error', text: res.error || 'Gagal membuat berita' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">Judul</label>
        <input value={judul} onChange={(e) => setJudul(e.target.value)} className="w-full border p-2 rounded" />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">Deskripsi</label>
        <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} className="w-full border p-2 rounded h-28" />
      </div>
      <div className="flex items-center gap-2">
        <button disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Menyimpan...' : 'Simpan Berita'}</button>
        {msg ? <p className={msg.type === 'success' ? 'text-green-600' : 'text-red-600'}>{msg.text}</p> : null}
      </div>
    </form>
  );
}