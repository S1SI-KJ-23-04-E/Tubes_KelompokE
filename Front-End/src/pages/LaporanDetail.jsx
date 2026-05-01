import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLaporanById, updateLaporanStatus } from '../services/laporanService';
import { useAuth } from '../contexts/AuthContext';
import FeedbackForm from '../components/FeedbackForm';
import { ArrowLeft, Clock, MapPin, CheckCircle2, Upload, AlertCircle } from 'lucide-react';
import { createKendala } from '../services/kendalaService';
import { supabase } from '../lib/supabase';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  selesai: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

// Helper function untuk format waktu real-time
function formatTimeAgo(dateString) {
  if (!dateString) return '-';
  
  // Parse dengan ISO string format dari Supabase
  const date = new Date(dateString);
  
  // Check jika date invalid
  if (isNaN(date.getTime())) {
    return dateString; // return original jika invalid
  }
  
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  
  // Format: DD/MM/YYYY, HH:MM (using local timezone)
  return date.toLocaleString('id-ID', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
}

export default function LaporanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // untuk trigger re-render waktu

  const [newStatus, setNewStatus] = useState('');
  const [catatan, setCatatan] = useState('');
  const [buktiFile, setBuktiFile] = useState(null);
  const [buktiPreview, setBuktiPreview] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [kendala, setKendala] = useState('');
const [loadingKendala, setLoadingKendala] = useState(false);


const isAdmin = profile?.role === 'super_admin' || profile?.role === 'kecamatan';
const isPetugas = profile?.role === 'petugas';

  useEffect(() => {
    loadData();
  }, [id]);

  // Setup realtime subscription untuk kendala dan history
  useEffect(() => {
    if (!id) return;

    // Subscribe to kendala_laporan changes
    const kendalaSubscription = supabase
      .channel(`kendala:laporan_id=eq.${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kendala_laporan',
          filter: `laporan_id=eq.${id}`
        },
        () => {
          // Reload data ketika ada perubahan
          loadData();
        }
      )
      .subscribe();

    // Refresh setiap menit untuk update waktu relatif (e.g., "2 menit lalu" -> "3 menit lalu")
    const timer = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 60000); // 1 menit

    return () => {
      kendalaSubscription.unsubscribe();
      clearInterval(timer);
    };
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    const result = await getLaporanById(id);

    if (result.success) {
      setData(result.data);
      setNewStatus(result.data.status);
    } else {
      alert('Laporan tidak ditemukan');
      navigate('/laporan');
    }

    setLoading(false);
  };

  const handleBuktiChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBuktiFile(file);
      setBuktiPreview(URL.createObjectURL(file));
    }
  };

  const handleKirimKendala = async () => {
    if (!kendala.trim()) {
      alert('Kendala tidak boleh kosong');
      return;
    }

    setLoadingKendala(true);

    const { success, error } = await createKendala(data.id, kendala);

    setLoadingKendala(false);

    if (success) {
      setKendala('');
      alert('Kendala berhasil dikirim');
      loadData();
    } else {
      alert('Gagal kirim kendala: ' + error);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();

    if (newStatus === 'selesai' && !buktiFile && data.status !== 'selesai') {
      alert('Foto bukti selesai wajib diunggah!');
      return;
    }
    setActionLoading(true);

    const { success, error } = await updateLaporanStatus(
      id,
      newStatus,
      buktiFile,
      catatan
    );

    setActionLoading(false);

    if (success) {
      setCatatan('');
      setBuktiFile(null);
      setBuktiPreview('');
      loadData();
    } else {
      alert('Gagal update: ' + error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-24">
        <div className="animate-spin h-12 w-12 border-b-2 border-indigo-600 rounded-full"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center mb-6 text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft size={18} className="mr-2" />
        Kembali
      </button>

      {/* DETAIL */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">

        <span className={`text-xs px-3 py-1 rounded-full ${statusColors[data.status]}`}>
          {data.status}
        </span>

        <h1 className="text-2xl font-bold mt-3 mb-2">Detail Laporan</h1>

        <p className="text-sm text-gray-500 flex items-center">
          <Clock size={14} className="mr-1" />
          {new Date(data.created_at).toLocaleString()}
        </p>

        {isAdmin && data.profiles && (
          <p className="text-sm mt-2 text-indigo-600">
            Pelapor: {data.profiles.nama}
          </p>
        )}

        <div className="mt-4">
          <p className="font-semibold mb-2">Deskripsi</p>
          <p className="bg-gray-50 p-3 rounded">{data.deskripsi}</p>
        </div>

        <div className="mt-4">
          <p className="font-semibold flex items-center mb-2">
            <MapPin size={16} className="mr-1" /> Lokasi
          </p>
          <p>{data.alamat}</p>
        </div>

        {data.foto_url && (
          <img
            src={data.foto_url}
            alt="laporan"
            className="mt-4 rounded-lg"
          />
        )}
      </div>

      {/* ADMIN PANEL */}
      {isAdmin && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="font-bold mb-4">Aksi Admin</h2>

          <form onSubmit={handleUpdateStatus} className="space-y-4">

            <select
              className="w-full border p-2 rounded"
              value={newStatus || 'pending'}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="in_progress">Diproses</option>
              <option value="selesai">Selesai</option>
              <option value="rejected">Tolak</option>
            </select>

            <textarea
              className="w-full border p-2 rounded"
              rows={3}
              placeholder="Catatan..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            />

            {newStatus === 'selesai' && (
              <div>
                <input type="file" onChange={handleBuktiChange} />

                {buktiPreview && (
                  <img
                    src={buktiPreview}
                    className="mt-2 max-h-40 rounded"
                  />
                )}
              </div>
            )}

            <button
              disabled={actionLoading}
              className="bg-indigo-600 text-white px-4 py-2 rounded w-full"
            >
              {actionLoading ? 'Loading...' : 'Simpan'}
            </button>

          </form>
        </div>
      )}

{/* PETUGAS - KENDALA */}
{isPetugas && (
  <div className="bg-white rounded-2xl shadow p-6 mb-6">
    <h2 className="font-bold mb-4">Laporkan Kendala</h2>

    <textarea
      className="w-full border p-2 rounded mb-3"
      rows={3}
      placeholder="Tulis kendala atau alasan keterlambatan..."
      value={kendala}
      onChange={(e) => setKendala(e.target.value)}
    />

    <button
      disabled={loadingKendala}
      onClick={handleKirimKendala}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full"
    >
      {loadingKendala ? 'Mengirim...' : 'Kirim Kendala'}
    </button>
  </div>
)}

{/* KENDALA PETUGAS (ADMIN VIEW) */}
{isAdmin && data.kendala_laporan?.length > 0 && (
  <div className="bg-white rounded-2xl shadow p-6 mb-6">
    <h2 className="font-bold mb-4 text-red-600">Kendala dari Petugas</h2>

    {data.kendala_laporan.map((k) => (
      <div key={k.id} className="mb-3 border-b pb-2">
        <p className="text-sm">{k.deskripsi}</p>
        <p className="text-xs text-gray-500">
          {formatTimeAgo(k.created_at)}
        </p>
      </div>
    ))}
  </div>
)}
      {/* HISTORY */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="font-bold mb-4">Riwayat</h2>

        {data.history?.map((h) => (
          <div key={h.id} className="mb-3 border-b pb-2">
            <p className="font-semibold">{h.status}</p>
            <p className="text-sm text-gray-500">
              {formatTimeAgo(h.created_at)}
            </p>
            {h.catatan && <p className="text-sm">{h.catatan}</p>}
          </div>
        ))}
      </div>

      {/* FEEDBACK */}
      {data.status === 'selesai' && (
        <FeedbackForm laporanId={data.id} onSubmitted={loadData} />
      )}

    </div>
  );
}