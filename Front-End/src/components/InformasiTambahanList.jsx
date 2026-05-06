import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function InformasiTambahanList({
  laporanId,
}) {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInformasi = async () => {
    try {
      setLoading(true);

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        throw new Error('Session tidak ditemukan');
    }

    console.log('laporanId GET:', laporanId);  
    const response = await fetch(
        `http://localhost:8001/api/InformasiTambahan/${laporanId}`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      const result = await response.json();

      console.log(result);
      if (!response.ok) {
        throw new Error(result.message);
      }

      setData(result.data || []);

      if (!response.ok) {
        throw new Error(result.message);
      }

      setData(result.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
  console.log('USE EFFECT JALAN');
  console.log('laporanId:', laporanId);

  fetchInformasi();
}, []);

  if (loading) {
    return <p>Loading informasi tambahan...</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 mt-4">
      <h2 className="text-lg font-semibold mb-4">
        Informasi Tambahan
      </h2>

      {data.length === 0 ? (
        <p className="text-gray-500">
          Belum ada informasi tambahan.
        </p>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-3 bg-gray-50"
            >
              <p className="text-gray-700 mb-2">
                {item.isi_informasi}
              </p>

              <div className="text-xs text-gray-500">
                <p className="text-xs text-gray-500">
                Admin Kecamatan
              </p>

                <p>
                  {new Date(item.created_at).toLocaleString(
                    'id-ID'
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}