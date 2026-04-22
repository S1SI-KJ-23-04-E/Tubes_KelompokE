import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getLaporanById, updateLaporanStatus } from '../services/laporanService';
import { useAuth } from '../contexts/AuthContext';
import FeedbackForm from '../components/FeedbackForm';
import { ArrowLeft, Clock, MapPin, CheckCircle2, Upload, AlertCircle } from 'lucide-react';

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
  
  // Admin Action State
  const [newStatus, setNewStatus] = useState('');
  const [catatan, setCatatan] = useState('');
  const [buktiFile, setBuktiFile] = useState(null);
  const [buktiPreview, setBuktiPreview] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-[#1e3a8a] hover:text-blue-700 font-bold mb-8 transition-all duration-300 group text-sm md:text-base">
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Daftar
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mb-8">
        <div className="p-8 md:p-10 border-b-2 border-blue-200 flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1">
            <span className={`text-xs font-black px-4 py-2 rounded-full inline-block mb-4 tracking-wider shadow-sm ${statusColors[data.status] || 'bg-gray-100'}`}>
              {data.status.replace('_', ' ').toUpperCase()}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#1e3a8a] to-blue-600 bg-clip-text text-transparent mb-4 leading-tight">Detail Laporan</h1>
            <p className="text-slate-600 flex items-center font-medium mb-3 text-base">
              <Clock size={20} className="mr-2 text-[#1e3a8a]" />
              Dilaporkan: {new Date(data.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
            {isAdmin && data.profiles && (
              <p className="text-[#1e3a8a] flex items-center font-bold mt-3 bg-blue-50 px-4 py-2.5 rounded-lg w-max border border-blue-200">
                👤 Pelapor: {data.profiles.nama}
              </p>
            )}
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-slate-50 px-6 py-6 rounded-xl text-center border-2 border-blue-200 shadow-lg min-w-[140px]">
            <span className="block text-4xl mb-3">👍</span>
            <span className="font-bold text-[#1e3a8a] text-3xl">{data.upvote_count || 0}</span>
            <span className="block text-xs text-slate-600 font-bold uppercase mt-2 tracking-wide">Upvotes</span>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <h3 className="font-bold text-slate-900 mb-4 text-2xl flex items-center">
            <span className="w-1 h-1 bg-[#1e3a8a] rounded-full mr-3"></span>
            Deskripsi Kejadian
          </h3>
          <p className="text-slate-700 bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl border-2 border-slate-200 mb-8 whitespace-pre-wrap leading-relaxed text-base font-medium">
            {data.deskripsi}
          </p>

          <h3 className="font-bold text-slate-900 mb-4 text-2xl flex items-center">
            <span className="w-1 h-1 bg-[#1e3a8a] rounded-full mr-3"></span>
            <MapPin size={24} className="mr-2 text-[#1e3a8a]" /> Lokasi Laporan
          </h3>
          <div className="text-slate-700 mb-8 bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl border-2 border-slate-200">
            <p className="text-lg font-bold text-slate-800 mb-2">{data.alamat}</p>
            <span className="text-slate-600 font-medium">
              📍 Kelurahan {data.kelurahan?.nama_kelurahan}, Kecamatan {data.kecamatan?.nama_kecamatan}
            </span>
          </div>

          {data.foto_url && (
            <div className="mb-8">
              <h3 className="font-bold text-slate-900 mb-4 text-2xl flex items-center">
                <span className="w-1 h-1 bg-[#1e3a8a] rounded-full mr-3"></span>
                Bukti Foto Kerusakan
              </h3>
              <div className="rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg">
                <img src={data.foto_url} alt="Foto laporan" className="w-full max-h-[500px] object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- ADMIN ACTION PANEL REMOVED: Status updates are now handled in the dashboard --- */}

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-10 mb-8">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-[#1e3a8a] to-blue-600 bg-clip-text text-transparent mb-8 flex items-center">
          <span className="w-1 h-1 bg-[#1e3a8a] rounded-full mr-3"></span>
          Riwayat Penanganan
        </h3>
        <div className="space-y-6">
          {data.history?.map((h, i) => (
            <div key={h.id} className="flex relative">
              {i !== data.history.length - 1 && (
                <div className="absolute top-12 left-6 bottom-[-1.8rem] w-1 bg-blue-200 -ml-[2px] z-0"></div>
              )}
              <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-[#1e3a8a] text-white flex items-center justify-center shrink-0 border-4 border-white shadow-lg">
                <CheckCircle2 size={24} />
              </div>
              <div className="ml-6 pb-2 flex-1">
                <p className="font-bold text-slate-800 text-lg">{h.status.replace('_', ' ').toUpperCase()}</p>
                <p className="text-sm font-medium text-slate-500 mt-1.5">🕐 {new Date(h.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
                {h.catatan && (
                  <p className="text-base mt-3.5 text-slate-700 bg-gradient-to-br from-slate-50 to-blue-50 p-4 rounded-lg border-2 border-slate-200 italic font-medium">
                    "{h.catatan}"
                  </p>
                )}
              </div>
            </div>
          ))}
          {(!data.history || data.history.length === 0) && (
            <p className="text-slate-500 italic text-center py-8">Belum ada riwayat penanganan.</p>
          )}
        </div>
      </div>

      {(data.status === 'selesai' || data.status === 'done') && data.bukti && (
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl shadow-xl border-2 border-green-200 p-8 md:p-10 mb-8">
          <h3 className="text-3xl font-bold text-green-800 mb-5 flex items-center">
            <CheckCircle2 size={32} className="mr-3 text-green-600" /> Laporan Telah Diselesaikan ✓
          </h3>
          <p className="text-green-800 text-lg mb-7 font-medium leading-relaxed">{data.bukti.keterangan || 'Infrastruktur telah selesai diperbaiki.'}</p>
          <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-green-200">
            <img src={data.bukti.url_foto} alt="Bukti penyelesaian" className="w-full max-h-[400px] object-cover" />
          </div>
        </div>
      )}

      {(data.status === 'selesai' || data.status === 'done') && (
        <FeedbackForm laporanId={data.id} onSubmitted={loadData} />
      )}
      </div>
    </div>
  );
}
