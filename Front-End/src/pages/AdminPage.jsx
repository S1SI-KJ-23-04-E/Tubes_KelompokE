import { useEffect, useState } from "react";
import axios from "axios";
import ReportCard from "../components/ReportCard";

// ✅ TAMBAHAN
import { getKendalaByKecamatan } from "../services/laporanService";
import { useAuth } from "../contexts/AuthContext";

const AdminPage = () => {
  const [laporan, setLaporan] = useState([]);

  // ✅ TAMBAHAN
  const [kendalaList, setKendalaList] = useState([]);

  // ✅ TAMBAHAN
  const { user } = useAuth();

  const fetchLaporan = async () => {
    try {
      const res = await axios.get("http://localhost:3000/laporan");
      setLaporan(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  // ✅ TAMBAHAN - Fetch kendala berdasarkan kecamatan user
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

      {/* ✅ TERBARU */}
      {laporan.map((item) => (
        <ReportCard key={item.id_laporan} laporan={item} onUpdate={fetchLaporan} />
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
    </div>
  );
};

export default AdminPage;