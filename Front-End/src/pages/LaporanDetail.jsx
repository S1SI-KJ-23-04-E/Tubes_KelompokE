import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getLaporanById, updateLaporanStatus, upvoteLaporan, checkUserUpvoted } from '../services/laporanService';
import { useAuth } from '../contexts/AuthContext';
import FeedbackForm from '../components/FeedbackForm';
import { ArrowLeft, Clock, MapPin, CheckCircle2, Upload, AlertCircle, ThumbsUp } from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  done: 'bg-green-100 text-green-800',
  selesai: 'bg-green-100 text-green-800',
  diproses: 'bg-orange-100 text-orange-800',
  rejected: 'bg-red-100 text-red-800'
};

export default function LaporanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isUpvoteLoading, setIsUpvoteLoading] = useState(false);
  
  // Admin Action State
  const [newStatus, setNewStatus] = useState('');
  const [catatan, setCatatan] = useState('');
  const [buktiFile, setBuktiFile] = useState(null);
  const [buktiPreview, setBuktiPreview] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  // Check if user has upvoted after data is loaded
  useEffect(() => {
    if (data && profile?.id) {
      checkUserUpvoted(id).then((result) => {
        if (result.success) {
          setIsUpvoted(result.upvoted);
        }
      });
    }
  }, [data, profile?.id, id]);

  const loadData = async () => {
    setLoading(true);
    const result = await getLaporanById(id);
    if (result.success) {
      setData(result.data);
      setUpvoteCount(result.data.upvote_count || 0);
      setNewStatus(result.data.status);
    } else {
      alert('Laporan tidak ditemukan');
      navigate('/laporan');
    }
    setLoading(false);
  };

  const handleUpvote = async () => {
    if (!profile?.id) {
      alert('Silahkan login terlebih dahulu untuk upvote');
      return;
    }

    setIsUpvoteLoading(true);
    const result = await upvoteLaporan(id);
    setIsUpvoteLoading(false);

    if (result.success) {
      setIsUpvoted(result.upvoted);
      setUpvoteCount(result.upvote_count);
    } else {
      alert('Gagal upvote: ' + result.error);
    }
  };

  const handleBuktiChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBuktiFile(file);
      setBuktiPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (newStatus === 'selesai' && !buktiFile && data.status !== 'selesai') {
      alert('Foto bukti selesai wajib diunggah!');
      return;
    }
    
    setActionLoading(true);
    const { success, error } = await updateLaporanStatus(id, newStatus, buktiFile, catatan);
    setActionLoading(false);
    
    if (success) {
      setCatatan('');
      setBuktiFile(null);
      setBuktiPreview('');
      loadData();
    } else {
      alert('Gagal memperbarui status: ' + error);
    }
  };

  if (loading) return (
    <div className="flex justify-center p-24">
      <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-indigo-600"></div>
    </div>
  );
  if (!data) return null;

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'kecamatan' || profile?.role === 'petugas';

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors">
        <ArrowLeft size={20} className="mr-2" />
        Kembali ke Daftar
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="p-8 md:p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <span className={`text-xs font-black px-4 py-1.5 rounded-full inline-block mb-4 tracking-wider ${statusColors[data.status] || 'bg-gray-100'}`}>
              {data.status.replace('_', ' ').toUpperCase()}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-3 leading-tight">Detail Laporan</h1>
            <p className="text-slate-500 flex items-center font-medium mb-1">
              <Clock size={18} className="mr-2" />
              Dilaporkan: {new Date(data.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
            {isAdmin && data.profiles && (
              <p className="text-slate-500 flex items-center font-medium mt-2 bg-indigo-50 px-3 py-1 rounded-lg w-max text-indigo-700">
                Pelapor: {data.profiles.nama}
              </p>
            )}
          </div>
          <div className="bg-slate-50 px-6 py-4 rounded-2xl text-center border border-slate-200 shadow-sm min-w-[120px]">
            <button
              onClick={handleUpvote}
              disabled={isUpvoteLoading}
              className={`w-full transition-all ${
                isUpvoted
                  ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                  : 'hover:bg-slate-100'
              } px-4 py-2 rounded-lg mb-2 ${isUpvoteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={profile?.id ? 'Upvote laporan ini' : 'Login untuk upvote'}
            >
              <ThumbsUp size={20} className="mx-auto mb-1" fill={isUpvoted ? 'currentColor' : 'none'} />
              <span className="block text-xs font-bold uppercase">
                {isUpvoted ? 'Sudah Upvote' : 'Upvote'}
              </span>
            </button>
            <span className="font-extrabold text-slate-800 text-2xl block">{upvoteCount}</span>
            <span className="block text-xs text-slate-500 font-bold uppercase mt-1">Upvotes</span>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <h3 className="font-bold text-slate-900 mb-4 text-xl">Deskripsi Kejadian</h3>
          <p className="text-slate-700 bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 whitespace-pre-wrap leading-relaxed text-lg">
            {data.deskripsi}
          </p>

          <h3 className="font-bold text-slate-900 mb-4 text-xl flex items-center">
            <MapPin size={24} className="mr-2 text-indigo-500" /> Lokasi Laporan
          </h3>
          <div className="text-slate-700 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <p className="text-lg font-medium mb-1">{data.alamat}</p>
            <span className="text-slate-500">
              Kelurahan {data.kelurahan?.nama_kelurahan}, Kecamatan {data.kecamatan?.nama_kecamatan}
            </span>
          </div>

          {data.foto_url && (
            <div className="mb-4">
              <h3 className="font-bold text-slate-900 mb-4 text-xl">Bukti Foto Kerusakan</h3>
              <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
                <img src={data.foto_url} alt="Foto laporan" className="w-full max-h-[500px] object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- ADMIN ACTION PANEL --- */}
{isAdmin && (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-10 mb-8">
    <h3 className="text-2xl font-extrabold text-slate-900 mb-6">Aksi Admin</h3>

    <div className="flex flex-wrap gap-4">
      
      {/* TERIMA */}
      <button
        onClick={async () => {
          setNewStatus('verified');
          await updateLaporanStatus(id, 'verified', null, 'Laporan telah diverifikasi');
          loadData();
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition"
      >
        ✅ Verifikasi
      </button>

      {/* PROSES */}
      <button
        onClick={async () => {
          setNewStatus('in_progress');
          await updateLaporanStatus(id, 'in_progress', null, 'Sedang diproses');
          loadData();
        }}
        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition"
      >
        🔄 Proses
      </button>

      {/* TOLAK */}
      <button
        onClick={async () => {
          setNewStatus('rejected');
          await updateLaporanStatus(id, 'rejected', null, 'Laporan ditolak');
          loadData();
        }}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition"
      >
        ❌ Tolak
      </button>

    </div>
  </div>
)}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-10 mb-8">
        <h3 className="text-2xl font-extrabold text-slate-900 mb-8">Riwayat Penanganan</h3>
        <div className="space-y-8">
          {data.history?.map((h, i) => (
            <div key={h.id} className="flex relative">
              {i !== data.history.length - 1 && (
                <div className="absolute top-10 left-5 bottom-[-2rem] w-0.5 bg-indigo-100 -ml-[1px] z-0"></div>
              )}
              <div className="relative z-10 w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                <CheckCircle2 size={20} />
              </div>
              <div className="ml-5 pb-2">
                <p className="font-bold text-slate-800 text-lg">{h.status.replace('_', ' ').toUpperCase()}</p>
                <p className="text-sm font-medium text-slate-400 mt-1">{new Date(h.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
                {h.catatan && (
                  <p className="text-md mt-3 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    "{h.catatan}"
                  </p>
                )}
              </div>
            </div>
          ))}
          {(!data.history || data.history.length === 0) && (
            <p className="text-slate-500 italic">Belum ada riwayat penanganan.</p>
          )}
        </div>
      </div>

      {(data.status === 'selesai' || data.status === 'done') && data.bukti && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-sm border border-green-100 p-8 md:p-10 mb-8">
          <h3 className="text-2xl font-extrabold text-green-800 mb-4 flex items-center">
            <CheckCircle2 size={28} className="mr-3" /> Laporan Telah Diselesaikan
          </h3>
          <p className="text-green-700 text-lg mb-6">{data.bukti.keterangan || 'Infrastruktur telah selesai diperbaiki.'}</p>
          <div className="rounded-3xl overflow-hidden shadow-sm border border-green-200">
            <img src={data.bukti.url_foto} alt="Bukti penyelesaian" className="w-full max-h-[400px] object-cover" />
          </div>
        </div>
      )}

      {(data.status === 'selesai' || data.status === 'done') && (
        <FeedbackForm laporanId={data.id} onSubmitted={loadData} />
      )}
    </div>
  );
}