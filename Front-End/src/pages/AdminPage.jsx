import { useEffect, useState } from "react";
import axios from "axios";
import ReportCard from "../components/ReportCard";

const AdminPage = () => {
  const [laporan, setLaporan] = useState([]);

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

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">Dashboard Kecamatan</h1>

      {laporan.map((item) => (
        <ReportCard key={item.id_laporan} laporan={item} onUpdate={fetchLaporan} />
      ))}
    </div>
  );
};

export default AdminPage;