import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getInformasi, tambahInformasi } from '../services/laporanService';

export default function InformasiAdmin({ laporanId }) {
  const { profile } = useAuth();
  const [data, setData] = useState([]);
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = profile?.role === 'kecamatan' || profile?.role === 'super_admin';

  useEffect(() => {
    loadData();
  }, [laporanId]);

  const loadData = async () => {
    const res = await getInformasi(laporanId);
    if (res.success) {
      setData(res.data);
    }
  };

  const handleSubmit = async () => {
    if (!catatan) return;

    setLoading(true);

    const res = await tambahInformasi(laporanId, catatan);

    if (res.success) {
      setCatatan('');
      loadData();
    } else {
      alert(res.error || 'Gagal mengirim informasi admin');
    }

    setLoading(false);
  };

  return (
    <div className="mt-6">
      <h2 className="font-bold mb-2">Informasi Admin</h2>

      {/* LIST */}
      <div className="space-y-2 mb-4">
        {data.length === 0 && (
          <p className="text-sm text-gray-400">Belum ada informasi</p>
        )}

        {data.map((item) => (
          <div key={item.id} className="bg-gray-100 p-2 rounded">
            <p className="text-sm">{item.catatan}</p>
            <p className="text-xs text-gray-400">
              {new Date(item.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* INPUT */}
      {isAdmin ? (
        <div className="flex gap-2">
          <input
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Tambah catatan..."
            className="border px-2 py-1 rounded w-full"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-indigo-500 text-white px-3 rounded"
          >
            Kirim
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Hanya admin kecamatan yang dapat menambahkan informasi tambahan.</p>
      )}
    </div>
  );
}