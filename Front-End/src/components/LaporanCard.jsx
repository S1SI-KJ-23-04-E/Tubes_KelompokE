import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ThumbsUp } from 'lucide-react';
import { upvoteLaporan, checkUserUpvoted } from '../services/laporanService';
import { useAuth } from '../contexts/AuthContext';

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
      alert(`Gagal: ${res.error}`);
    }
    setLoading(false);
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
          <span className="text-xs text-gray-400 transition-all group-hover:text-indigo-400">{dateLabel}</span>
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
          !isInternalRole ? (
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
    </div>
  );
}