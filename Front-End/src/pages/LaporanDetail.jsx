import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLaporanById, updateLaporanStatus } from '../services/laporanService';
import { useAuth } from '../contexts/AuthContext';
import FeedbackForm from '../components/FeedbackForm';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import InformasiAdmin from "../components/InformasiAdmin";

export default function LaporanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'kecamatan';
  const isOwner = profile?.id === data?.pelapor_id;

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);

    const result = await getLaporanById(id);

    if (result.success) {
      setData(result.data);
     // if (user) {
        //const uvRes = await checkUserUpvoted(id);
        //if (uvRes.success) setUpvoted(uvRes.upvoted);
     // }
    } else {
      alert('Laporan tidak ditemukan');
      navigate('/laporan');
    }

    setLoading(false);
  };

  const handleUpdateStatus = async (status) => {
    const ket = window.prompt(`Update status ke ${status}? Catatan (opsional):`);
    if (ket === null) return;

    setActionLoading(true);

    const { success } = await updateLaporanStatus(id, status, null, ket);

    if (success) loadData();

    setActionLoading(false);
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
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

        <h1 className="text-2xl font-bold mb-2">Detail Laporan</h1>

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

        <InformasiAdmin laporanId={data.id} />

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

      {/* ADMIN ACTION */}
      {isAdmin && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="font-bold mb-4">Aksi Admin</h2>

          <button
            onClick={() => handleUpdateStatus('verified')}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            disabled={actionLoading}
          >
            Verifikasi
          </button>

          <button
            onClick={() => handleUpdateStatus('rejected')}
            className="bg-red-500 text-white px-4 py-2 rounded"
            disabled={actionLoading}
          >
            Tolak
          </button>
        </div>
      )}

      {/* FEEDBACK */}
      {(data.status === 'selesai' || data.status === 'done') && (
        profile?.role === 'warga' && isOwner ? (
          <FeedbackForm laporanId={data.id} onSubmitted={loadData} />
        ) : (
          <p className="text-gray-500">
            Hanya warga pelapor yang bisa memberi feedback
          </p>
        )
      )}

    </div>
  );
}