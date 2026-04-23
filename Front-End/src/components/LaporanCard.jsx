import { useEffect, useState } from 'react';
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

export default function LaporanCard({ laporan, onDelete, minimal = false }) {
  const { profile } = useAuth();
  const [upvoteCount, setUpvoteCount] = useState(laporan.upvote_count || 0);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    id,
    deskripsi,
    alamat,
    kecamatan,
    kelurahan,
    status,
    created_at
  } = laporan;

  // Check if user has upvoted this laporan
  useEffect(() => {
    if (profile?.id) {
      checkUserUpvoted(id).then((result) => {
        if (result.success) {
          setIsUpvoted(result.upvoted);
        }
      });
    }
  }, [id, profile?.id]);

  const handleUpvote = async (e) => {
    e.preventDefault();
    
    if (!profile?.id) {
      alert('Silahkan login terlebih dahulu untuk upvote');
      return;
    }

    setIsLoading(true);
    const result = await upvoteLaporan(id);
    setIsLoading(false);

    if (result.success) {
      setIsUpvoted(result.upvoted);
      setUpvoteCount(result.upvote_count);
    } else {
      alert('Gagal upvote: ' + result.error);
    }
  };

  const date = new Date(created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative group h-full flex flex-col">
      {!minimal && (
        <div className="flex justify-between items-start mb-3">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[status] || 'bg-gray-100'}`}>
            {status.replace('_', ' ').toUpperCase()}
          </span>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
      )}
      
      <h3 className={`font-semibold text-gray-800 line-clamp-2 mb-2 ${minimal ? 'text-base' : 'text-sm'}`}>
        {deskripsi}
      </h3>
      
      <p className="text-xs text-gray-500 mb-4 flex items-start">
        <span className="mr-1">📍</span> 
        <span className="line-clamp-1">{alamat}, {kelurahan?.nama_kelurahan}, {kecamatan?.nama_kecamatan}</span>
      </p>

      <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
        {!minimal ? (
          <button
            onClick={handleUpvote}
            disabled={isLoading}
            className={`flex items-center text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
              isUpvoted
                ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title={profile?.id ? 'Upvote laporan ini' : 'Login untuk upvote'}
          >
            <ThumbsUp size={14} className="mr-1" />
            <span>{upvoteCount}</span>
          </button>
        ) : (
          <span className="text-[10px] text-gray-400 italic">Dibuat pada {new Date(created_at).toLocaleDateString('id-ID')}</span>
        )}
        
        <div className="flex space-x-2">
          {status === 'pending' && onDelete && (
            <button 
              onClick={(e) => { e.preventDefault(); onDelete(id); }}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Hapus Laporan"
            >
              <Trash2 size={16} />
            </button>
          )}
          <Link 
            to={`/laporan/${id}`}
            className="text-xs font-bold text-indigo-600 hover:text-white px-4 py-2 bg-indigo-50 hover:bg-indigo-600 rounded-lg transition-colors"
          >
            Detail
          </Link>
        </div>
      </div>
    </div>
  );
}