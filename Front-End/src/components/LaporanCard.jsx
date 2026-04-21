import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { selesaiLaporan, tolakLaporan } from '../services/laporanService';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  done: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

export default function LaporanCard({ laporan, onDelete, minimal = false, isAdmin = false, onUpdate }) {
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

  const [showModal, setShowModal] = useState(false);
  const [alasan, setAlasan] = useState("");

  const date = new Date(created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // ✅ HANDLE SELESAI
  const handleSelesai = async () => {
    const res = await selesaiLaporan(id);
    if (res.success) {
      alert("Laporan diselesaikan");
      onUpdate && onUpdate();
    } else {
      alert(res.error);
    }
  };

  // ✅ HANDLE TOLAK
  const handleTolak = async () => {
    if (!alasan) {
      alert("Alasan wajib diisi");
      return;
    }

    const res = await tolakLaporan(id, alasan);
    if (res.success) {
      alert("Laporan ditolak");
      setShowModal(false);
      setAlasan("");
      onUpdate && onUpdate();
    } else {
      alert(res.error);
    }
  };

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
        <span className="line-clamp-1">
          {alamat}, {kelurahan?.nama_kelurahan}, {kecamatan?.nama_kecamatan}
        </span>
      </p>

      <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
        
        {!minimal ? (
          <div className="flex items-center text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
            👍 {upvote_count || 0} Upvotes
          </div>
        ) : (
          <span className="text-[10px] text-gray-400 italic">Dibuat pada {date}</span>
        )}

        <div className="flex space-x-2 items-center">
          
          {/* 🔴 DELETE (EXISTING) */}
          {status === 'pending' && onDelete && (
            <button 
              onClick={(e) => { e.preventDefault(); onDelete(id); }}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Hapus Laporan"
            >
              <Trash2 size={16} />
            </button>
          )}

          {/* 🟢 ADMIN ACTION (DEV-61) */}
          {isAdmin && status === 'verified' && (
            <>
              <button
                onClick={handleSelesai}
                className="text-xs font-bold text-green-600 px-3 py-2 bg-green-50 hover:bg-green-600 hover:text-white rounded-lg transition"
              >
                Selesai
              </button>

              <button
                onClick={() => setShowModal(true)}
                className="text-xs font-bold text-red-600 px-3 py-2 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition"
              >
                Tolak
              </button>
            </>
          )}

          <Link 
            to={`/laporan/${id}`}
            className="text-xs font-bold text-indigo-600 hover:text-white px-4 py-2 bg-indigo-50 hover:bg-indigo-600 rounded-lg transition-colors"
          >
            Detail
          </Link>
        </div>
      </div>

      {/* 🔴 MODAL TOLAK */}
      {showModal && (
        <div className="mt-3 border p-3 rounded-lg bg-gray-50">
          <textarea
            placeholder="Masukkan alasan penolakan"
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <button
            onClick={handleTolak}
            className="bg-red-600 text-white px-3 py-1 mt-2 rounded"
          >
            Submit Penolakan
          </button>
        </div>
      )}
    </div>
  );
}