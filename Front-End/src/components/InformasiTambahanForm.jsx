import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function InformasiTambahanForm({
  laporanId,
  onSuccess
}) {

  const [isiInformasi, setIsiInformasi] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isiInformasi.trim()) {
      alert('Informasi tambahan wajib diisi');
      return;
    }

    try {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(
      'http://localhost:8001/api/InformasiTambahan',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          laporan_id: laporanId,
          isi_informasi: isiInformasi,
        }),
      }
    );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      alert('Informasi tambahan berhasil dikirim');

      setIsiInformasi('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 mt-4">
      <h2 className="text-lg font-semibold mb-3">
        Tambah Informasi Tambahan
      </h2>

      <form onSubmit={handleSubmit}>
        <textarea
          value={isiInformasi}
          onChange={(e) => setIsiInformasi(e.target.value)}
          placeholder="Masukkan informasi tambahan..."
          className="w-full border rounded-lg p-3 min-h-[120px]"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          {loading ? 'Mengirim...' : 'Kirim Informasi'}
        </button>
      </form>
    </div>
  );
}