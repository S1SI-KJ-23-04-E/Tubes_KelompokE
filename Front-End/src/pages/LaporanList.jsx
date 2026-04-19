import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  getLaporanByUser, 
  getLaporanByKecamatan, 
  getAllLaporan, 
  deleteLaporan,
  updateLaporanStatus 
} from '../services/laporanService';
import { useAuth } from '../contexts/AuthContext';
import LaporanCard from '../components/LaporanCard';
import { Plus, List, Clock, ChevronRight, FileText, Trash2, Inbox, ShieldCheck, CheckCircle2 } from 'lucide-react';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',          dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  verified:    { label: 'Terverifikasi',    dot: 'bg-blue-400',   badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  in_progress: { label: 'Sedang Diproses', dot: 'bg-purple-400', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
  done:        { label: 'Selesai',          dot: 'bg-green-500',  badge: 'bg-green-100 text-green-800 border-green-200' },
  selesai:     { label: 'Selesai',          dot: 'bg-green-500',  badge: 'bg-green-100 text-green-800 border-green-200' },
  rejected:    { label: 'Ditolak',          dot: 'bg-red-400',    badge: 'bg-red-100 text-red-800 border-red-200' },
};

export default function LaporanList() {
  const [laporanPublik, setLaporanPublik] = useState([]); 
  const [laporanSaya, setLaporanSaya] = useState([]);   
  const [laporanMasuk, setLaporanMasuk] = useState([]); // Khusus Admin
  const [loading, setLoading] = useState(true);
  
  const [searchParams] = useSearchParams();
  const { user, profile, loading: authLoading } = useAuth();
  
  const isAdmin = profile?.role === 'kecamatan' || profile?.role === 'petugas' || profile?.role === 'super_admin';
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || (isAdmin ? 'masuk' : 'daftar'));

  useEffect(() => {
    if (authLoading) return;
    loadData();
  }, [profile, authLoading]);

  const loadData = async () => {
    setLoading(true);
    
    if (isAdmin) {
      // ── LOGIKA ADMIN ──
      let result;
      if (profile?.role === 'super_admin') {
        result = await getAllLaporan();
      } else {
        result = await getLaporanByKecamatan(profile.kecamatan_id);
      }
      if (result.success) setLaporanMasuk(result.data);
      
    } else {
      // ── LOGIKA WARGA ──
      const feedResult = await getAllLaporan();
      if (feedResult.success) {
        const filteredFeed = feedResult.data.filter(item => item.pelapor_id !== user?.id);
        setLaporanPublik(filteredFeed);
      }
      if (user) {
        const myResult = await getLaporanByUser();
        if (myResult.success) setLaporanSaya(myResult.data);
      }
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus laporan ini?')) return;
    const { success } = await deleteLaporan(id);
    if (success) loadData();
    else alert('Gagal menghapus laporan');
  };

  const handleUpdateStatus = async (id, status) => {
    const ket = window.prompt(`Update status ke ${status}? Berikan catatan (opsional):`);
    if (ket === null) return;
    
    const { success } = await updateLaporanStatus(id, status, null, ket);
    if (success) loadData();
    else alert('Gagal update status');
  };

  // Menu Sidebar berdasarkan Role
  const tabs = isAdmin 
    ? [
        { id: 'masuk', label: 'Laporan Masuk', icon: Inbox },
        { id: 'semua', label: 'Semua Laporan', icon: List },
      ]
    : [
        { id: 'daftar',  label: 'Laporan Publik', icon: List },
        { id: 'history', label: 'History Saya',    icon: Clock },
      ];

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 bg-white border-r border-slate-100 pt-10 px-4 flex flex-col gap-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-3">
          {isAdmin ? 'Admin Panel' : 'Navigasi'}
        </p>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all
              ${activeTab === id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 p-6 md:p-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isAdmin 
                ? (activeTab === 'masuk' ? 'Laporan Masuk' : 'Daftar Laporan')
                : (activeTab === 'daftar' ? 'Laporan Publik' : 'History Laporan Saya')}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              {isAdmin 
                ? `Mengelola laporan di wilayah ${profile?.kecamatan?.nama_kecamatan || 'Anda'}.`
                : 'Pantau laporan kerusakan infrastruktur kota.'}
            </p>
          </div>

          {!isAdmin && activeTab === 'daftar' && (
            <Link to="/laporan/baru" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 text-sm">
              <Plus size={18} /> Buat Laporan Baru
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Tampilan Admin */}
            {isAdmin && (
              <AdminVerticalView 
                laporan={activeTab === 'masuk' ? laporanMasuk.filter(l => l.status === 'pending' || l.status === 'verified') : laporanMasuk} 
                onUpdateStatus={handleUpdateStatus} 
              />
            )}

            {/* Tampilan Warga */}
            {!isAdmin && activeTab === 'daftar' && <DaftarPublikView laporan={laporanPublik} />}
            {!isAdmin && activeTab === 'history' && <HistorySayaView laporan={laporanSaya} onDelete={handleDelete} />}
          </>
        )}
      </main>
    </div>
  );
}

/* ─── Tampilan Vertikal Admin (Mirip History) ─── */
function AdminVerticalView({ laporan, onUpdateStatus }) {
  if (laporan.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-3xl border border-slate-200">
        <Inbox size={40} className="mx-auto text-slate-300 mb-3" />
        <h3 className="text-xl font-bold text-slate-700">Tidak ada laporan</h3>
        <p className="text-slate-400 mt-1 text-sm">Wilayah Anda saat ini bersih dari laporan aktif.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {laporan.map(item => {
        const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
        return (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
            {/* Info Laporan */}
            <div className="flex-1 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.badge}`}>{cfg.label}</span>
                <span className="text-xs text-slate-400">{new Date(item.created_at).toLocaleString('id-ID')}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{item.deskripsi}</h3>
              <p className="text-sm text-slate-600 mb-4">📍 {item.alamat}, {item.kelurahan?.nama_kelurahan}</p>
              
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium bg-slate-100 px-2 py-1 rounded">👤 {item.profiles?.nama || 'Anonim'}</span>
                <Link to={`/laporan/${item.id}`} className="text-indigo-600 font-bold hover:underline">Lihat Detail & Foto →</Link>
              </div>
            </div>

            {/* Aksi Admin (Panel Kanan/Bawah) */}
            <div className="bg-slate-50 p-6 border-t md:border-t-0 md:border-l border-slate-100 w-full md:w-64 flex flex-col gap-2 justify-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Aksi Cepat</p>
              
              {item.status === 'pending' && (
                <button onClick={() => onUpdateStatus(item.id, 'verified')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
                  <ShieldCheck size={14} /> Verifikasi
                </button>
              )}
              
              {(item.status === 'verified' || item.status === 'pending') && (
                <button onClick={() => onUpdateStatus(item.id, 'in_progress')} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors">
                  <Clock size={14} /> Proses Perbaikan
                </button>
              )}

              {item.status === 'in_progress' && (
                <button onClick={() => onUpdateStatus(item.id, 'done')} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors">
                  <CheckCircle2 size={14} /> Tandai Selesai
                </button>
              )}

              <button onClick={() => onUpdateStatus(item.id, 'rejected')} className="text-xs font-bold text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100">
                Tolak Laporan
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Sub-views Warga ─── */
function DaftarPublikView({ laporan }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {laporan.map(item => <LaporanCard key={item.id} laporan={item} minimal={true} />)}
      {laporan.length === 0 && <div className="col-span-full text-center py-20 text-slate-400">Belum ada laporan publik.</div>}
    </div>
  );
}

function HistorySayaView({ laporan, onDelete }) {
  return (
    <div className="space-y-6">
      {laporan.map(item => {
        const histories = [...(item.history_laporan || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
        return (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.badge}`}>{cfg.label}</span>
                  <span className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{item.deskripsi}</h3>
                <p className="text-sm text-slate-500 mt-1">📍 {item.alamat}</p>
              </div>
              <div className="flex gap-2">
                {item.status === 'pending' && <button onClick={() => onDelete(item.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>}
                <Link to={`/laporan/${item.id}`} className="text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg"><ChevronRight size={18} /></Link>
              </div>
            </div>
            {/* Timeline singkat */}
            <div className="px-6 py-4 bg-slate-50/50 text-xs">
               <div className="flex gap-4 overflow-x-auto pb-2">
                  {histories.map((h, i) => (
                    <div key={i} className="shrink-0 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-100">
                      <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[h.status]?.dot || 'bg-slate-300'}`} />
                      <span className="font-bold text-slate-700">{STATUS_CONFIG[h.status]?.label}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
