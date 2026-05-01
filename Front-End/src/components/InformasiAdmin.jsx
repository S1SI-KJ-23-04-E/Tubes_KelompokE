import { useEffect, useState } from "react";
import { getInformasi } from "../services/laporanService";

export default function InformasiAdmin({ laporanId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await getInformasi(laporanId);
    if (res.success) {
      setData(res.data);
    }
  };

  if (!data.length) return null;

  return (
    <div className="bg-blue-50 p-4 rounded mt-6">
      <h3 className="font-bold mb-2">Informasi dari Admin</h3>

      {data.map((item) => (
        <div key={item.id} className="mb-2 text-sm">
          • {item.catatan}
        </div>
      ))}
    </div>
  );
}