import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ThumbsUp, MessageSquare } from 'lucide-react';
import { upvoteLaporan, checkUserUpvoted, updateCatatanLaporan } from '../services/laporanService';
import { useAuth } from '../contexts/AuthContext';
import { CatatanModal, AlertModal } from './Modals';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  done: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

export default function LaporanCard({ laporan: initialLaporan, onDelete, minimal = false }) {
  const { user, profile } = useAuth();
  const [laporan, setLaporan] = useState(initialLaporan);
  const [upvoted, setUpvoted] = useState(false);
  const [loading, setLoading] = useState(false);

  const isInternalRole = ['petugas', 'kecamatan', 'super_admin'].includes(profile?.role);

  const {
    id,
    deskripsi,
    alamat,
    kecamatan,
    kelurahan,
    status,
    created_at,
    upvote_count
  } = laporan;

  useEffect(() => {
    if (user && id) {
      checkInitialUpvote();
    }
  }, [user, id]);

  const checkInitialUpvote = async () => {
    const res = await checkUserUpvoted(id);
    if (res.success) setUpvoted(res.upvoted);
  };

  const [catatanModal, setCatatanModal] = useState({ open: false, isViewOnly: false });
  const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '', type: 'error' });

  const handleUpvote = async (e) => {
    e.preventDefault();
    if (loading || !user) return;
    
    setLoading(true);
    const res = await upvoteLaporan(id);
    if (res.success) {
      setUpvoted(res.upvoted);
      setLaporan(prev => ({ ...prev, upvote_count: res.upvote_count }));
      if (res.warning) console.warn(res.warning);
    } else {
      setAlertModal({ open: true, title: 'Gagal', message: res.error, type: 'error' });
    }
    setLoading(false);
  };

  const handleCatatanClick = async (e) => {
    e.preventDefault();
    if (profile?.role === 'kecamatan' || profile?.role === 'super_admin') {
      setCatatanModal({ open: true, isViewOnly: false });
    } else if (profile?.role === 'petugas') {
      if (laporan.catatan) {
        setCatatanModal({ open: true, isViewOnly: true });
      } else {
        setAlertModal({ open: true, title: 'Informasi', message: 'Belum ada catatan dari admin.', type: 'info' });
      }
    }
  };

  const submitCatatan = async (newCatatan) => {
    const res = await updateCatatanLaporan(id, newCatatan);
    if (res.success) {
      setLaporan(prev => ({ ...prev, catatan: newCatatan }));
      setCatatanModal({ ...catatanModal, open: false });
    } else {
      setAlertModal({ open: true, title: 'Gagal', message: res.error || 'Gagal menyimpan catatan', type: 'error' });
    }
  };

  const safeStatus = typeof status === 'string' && status.trim() ? status : 'pending';
  const safeDate = created_at ? new Date(created_at) : null;
  const dateLabel = safeDate && !Number.isNaN(safeDate.getTime())
    ? safeDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : '-';

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 relative group h-full flex flex-col card-hover animate-fade-in-up hover:border-indigo-200">
      {!minimal && (
        <div className="flex justify-between items-start mb-3">
          <span className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${statusColors[safeStatus] || 'bg-gray-100'} status-breathing`}>
            {safeStatus.replace('_', ' ').toUpperCase()}
          </span>
<<<<<<< Updated upstream
          <div className="flex items-center gap-2">
            {isInternalRole && ['pending', 'verified', 'in_progress'].includes(safeStatus) && (
              <button
                onClick={handleCatatanClick}
                className={`p-1 rounded-md transition-all ${laporan.catatan ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                title="Catatan Tambahan"
              >
                <MessageSquare size={14} />
              </button>
            )}
            <span className="text-xs text-gray-400 transition-all group-hover:text-indigo-400">{dateLabel}</span>
          </div>
=======
          <span className="text-xs text-gray-400">{dateLabel}</span>
>>>>>>> Stashed changes
        </div>
      )}
      
      <h3 className={`font-semibold text-gray-800 line-clamp-2 mb-2 transition-colors duration-300 group-hover:text-indigo-600 ${minimal ? 'text-base' : 'text-sm'}`}>
        {laporan.judul || deskripsi}
      </h3>
      
      <p className="text-xs text-gray-500 mb-4 flex items-start transition-colors group-hover:text-gray-600">
        <span className="mr-1">📍</span> 
        <span className="line-clamp-1">{alamat}, {kelurahan?.nama_kelurahan}, {kecamatan?.nama_kecamatan}</span>
      </p>

      <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50 transition-all">
        {!minimal ? (
          profile?.role === 'warga' ? (
            <button 
              onClick={handleUpvote}
              disabled={loading || !user}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-300 ${
                upvoted 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-gray-50 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
              } disabled:opacity-50`}
            >
              <ThumbsUp size={14} className={upvoted ? 'fill-white' : ''} />
              {upvote_count || 0}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
              <ThumbsUp size={14} />
              {upvote_count || 0}
            </div>
          )
        ) : (
          <span className="text-[10px] text-gray-400 italic">Dibuat pada {dateLabel}</span>
        )}
        
        <div className="flex space-x-2">
          {safeStatus === 'pending' && onDelete && (
            <button 
              onClick={(e) => { e.preventDefault(); onDelete(id); }}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
              title="Hapus Laporan"
            >
              <Trash2 size={16} />
            </button>
          )}
          <Link 
            to={`/laporan/${id}`}
            className="text-xs font-bold text-indigo-600 hover:text-white px-4 py-2 bg-indigo-50 hover:bg-indigo-600 rounded-lg transition-all duration-300 btn-hover-lift active:scale-95"
          >
            Detail
          </Link>
        </div>
      </div>

      {/* Custom Modals */}
      {catatanModal.open && (
        <CatatanModal 
          isOpen={catatanModal.open}
          isViewOnly={catatanModal.isViewOnly}
          initialCatatan={laporan.catatan}
          onClose={() => setCatatanModal({ ...catatanModal, open: false })}
          onSubmit={submitCatatan}
        />
      )}

      {alertModal.open && (
        <AlertModal 
          isOpen={alertModal.open}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
          onClose={() => setAlertModal({ ...alertModal, open: false })}
        />
      )}
    </div>
  );
}