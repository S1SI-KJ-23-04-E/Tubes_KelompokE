import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLaporanByUser, deleteLaporan } from '../services/laporanService';
import LaporanCard from '../components/LaporanCard';
import { Plus } from 'lucide-react';

export default function LaporanList() {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { success, data } = await getLaporanByUser();
    if (success) {
      setLaporan(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus laporan ini?')) return;
    const { success } = await deleteLaporan(id);
    if (success) {
      loadData();
    } else {
      alert('Gagal menghapus laporan');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Laporan Anda</h1>
          <p className="text-slate-500 mt-2 text-lg">Pantau dan kelola laporan infrastruktur kota.</p>
        </div>
        <Link 
          to="/laporan/baru" 
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all hover:shadow-indigo-300 hover:-translate-y-0.5"
        >
          <Plus size={20} />
          <span>Buat Laporan Baru</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : laporan.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500">
            <Plus size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Belum ada laporan</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">Anda belum pernah membuat laporan kerusakan infrastruktur. Silakan buat laporan pertama Anda.</p>
          <Link to="/laporan/baru" className="text-indigo-600 font-bold hover:text-indigo-800">Buat Laporan Pertama &rarr;</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {laporan.map(item => (
            <LaporanCard key={item.id} laporan={item} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
