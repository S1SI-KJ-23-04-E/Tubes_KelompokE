import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  getLaporanByUser, 
  getAllLaporan, 
  deleteLaporan,
  updateLaporanStatus 
} from '../services/laporanService';
import { useAuth } from '../contexts/AuthContext';
import LaporanCard from '../components/LaporanCard';
import { Plus, List, Clock, ChevronRight, FileText, Trash2, Inbox, ShieldCheck, CheckCircle2, Search, ArrowUpCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',          dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  verified:    { label: 'Terverifikasi',    dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-600 border-blue-200' },
  in_progress: { label: 'Sedang Diproses', dot: 'bg-purple-400', badge: 'bg-purple-50 text-purple-600 border-purple-200' },
  done:        { label: 'Selesai',          dot: 'bg-green-500',  badge: 'bg-green-100 text-green-800 border-green-200' },
  selesai:     { label: 'Selesai',          dot: 'bg-green-500',  badge: 'bg-green-100 text-green-800 border-green-200' },
  rejected:    { label: 'Ditolak',          dot: 'bg-red-400',    badge: 'bg-red-100 text-red-800 border-red-200' },
};

const PRIORITY_CONFIG = {
  high: { label: 'Tinggi', color: 'text-red-600 bg-red-50 border-red-200' },
  low:  { label: 'Rendah', color: 'text-blue-500 bg-blue-50 border-blue-200' },
};

export default function LaporanList() {
  const [laporanPublik, setLaporanPublik] = useState([]); 
  const [laporanSaya, setLaporanSaya] = useState([]);   
  const [laporanMasuk, setLaporanMasuk] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [searchParams] = useSearchParams();
  const { user, profile, loading: authLoading } = useAuth();
  
  const isAdmin = profile?.role === 'kecamatan' || profile?.role === 'petugas' || profile?.role === 'super_admin';
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || (isAdmin ? 'masuk' : 'daftar'));

  const initialLoadDoneRef = React.useRef(false);

  useEffect(() => {
    if (profile && isAdmin && activeTab === 'daftar') setActiveTab('masuk');
  }, [profile, isAdmin]);

  // Initial data load — only once when auth is ready
  useEffect(() => {
    if (authLoading || initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;
    loadData();
  }, [authLoading]);

  // Re-fetch when search query changes (debounced) or tab changes
  useEffect(() => {
    if (authLoading || !initialLoadDoneRef.current) return;
    const delayDebounceFn = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeTab]);

  const loadData = async () => {
    if (laporanMasuk.length === 0) setLoading(true);
    try {
      if (isAdmin && profile?.kecamatan_id) {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${API_URL}/admin/laporan/kecamatan/${profile.kecamatan_id}?search=${searchQuery}`, {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        });
        const json = await res.json();
        if (json.success) setLaporanMasuk(json.data || []);
      } 
      const feedRes = await getAllLaporan();
      if (feedRes.success) setLaporanPublik(feedRes.data?.filter(i => i.pelapor_id !== user?.id) || []);
      if (user) {
        const myRes = await getLaporanByUser();
        if (myRes.success) setLaporanSaya(myRes.data || []);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleUpdatePriority = async (id, priority) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${API_URL}/admin/laporan/${id}/prioritas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ prioritas: priority.toLowerCase() })
      });
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleUpdateStatus = async (id, status) => {
    const ket = window.prompt(`Update status ke ${status}? Catatan (opsional):`);
    if (ket === null) return;
    const { success } = await updateLaporanStatus(id, status, null, ket);
    if (success) loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus laporan?')) return;
    const { success } = await deleteLaporan(id);
    if (success) loadData();
  };

  if (authLoading) return <div className="p-20 text-center text-slate-400 font-bold">Memuat...</div>;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 shrink-0 bg-white border-r border-slate-100 pt-10 px-4 flex flex-col gap-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-3">{isAdmin ? 'Admin Panel' : 'Navigasi'}</p>
        {[
          ...(isAdmin ? [{id: 'masuk', label: 'Laporan Masuk', icon: Inbox}, {id: 'semua', label: 'Semua Laporan', icon: List}] : [{id: 'daftar', label: 'Laporan Publik', icon: List}, {id: 'history', label: 'History Saya', icon: Clock}])
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-slate-100'}`}>
            <t.icon size={17} /> {t.label}
          </button>
        ))}
      </aside>

      <main className="flex-1 min-w-0 p-6 md:p-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{isAdmin ? (activeTab === 'masuk' ? 'Laporan Masuk' : 'Daftar Laporan') : 'Laporan Publik'}</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">{isAdmin ? `Kecamatan ${profile?.kecamatan?.nama_kecamatan || ''}` : 'Pantau infrastruktur kota Anda'}</p>
          </div>

          <div className="flex gap-3 w-full lg:w-auto">
            {isAdmin && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Ketik deskripsi atau alamat..." className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs w-full lg:w-80 focus:ring-2 focus:ring-indigo-500/20 outline-none shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            )}
            {!isAdmin && activeTab === 'daftar' && <Link to="/laporan/baru" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">+ Laporan</Link>}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
        ) : (
          isAdmin ? (
            <AdminView laporan={activeTab === 'masuk' ? (laporanMasuk || []).filter(l => l.status !== 'selesai' && l.status !== 'rejected') : (laporanMasuk || [])} onStatus={handleUpdateStatus} onPriority={handleUpdatePriority} />
          ) : (
            activeTab === 'daftar' ? <DaftarWargaView laporan={laporanPublik} /> : <HistoryWargaView laporan={laporanSaya} onDelete={handleDelete} />
          )
        )}
      </main>
    </div>
  );
}

function AdminView({ laporan, onStatus, onPriority }) {
  if (!laporan || laporan.length === 0) return <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400"><Inbox size={40} className="mx-auto text-slate-300 mb-2" /><p className="font-medium">Tidak ada laporan.</p></div>;
  
  return (
    <div className="space-y-5">
      {laporan.map(item => {
        // PERBAIKAN: Default ke 'low' jika kosong, dan hapus 'normal'
        const priorityVal = (item.prioritas || 'low').toLowerCase();
        const finalPriority = (priorityVal === 'high' || priorityVal === 'low') ? priorityVal : 'low';
        
        const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
        const pCfg = PRIORITY_CONFIG[finalPriority];

        return (
          <div key={item.id} className={`bg-white rounded-2xl border ${finalPriority === 'high' ? 'border-red-200 shadow-red-50' : 'border-slate-200'} p-6 flex flex-col md:flex-row justify-between gap-6 shadow-sm hover:shadow-md transition-all relative`}>
            {finalPriority === 'high' && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 rounded-l-2xl" />}
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border ${pCfg.color}`}>{pCfg.label}</span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.badge}`}>{cfg.label}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(item.created_at).toLocaleString('id-ID')}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-1 leading-tight">{item.deskripsi}</h3>
              <p className="text-sm text-slate-500 mb-5 flex items-center gap-1.5">📍 <span className="font-medium">{item.alamat}, {item.kelurahan?.nama_kelurahan}</span></p>
              
              <div className="flex items-center gap-4 border-t border-slate-50 pt-4">
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">👤 {item.profiles?.nama || 'Warga'}</span>
                <Link to={`/laporan/${item.id}`} className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1">DETAIL LENGKAP <ChevronRight size={14} /></Link>
              </div>
            </div>
            
            <div className="md:w-72 space-y-5 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-8 flex flex-col justify-center">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><ArrowUpCircle size={12}/> Set Prioritas</p>
                  <select 
                    value={finalPriority} 
                    onChange={(e) => onPriority(item.id, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all cursor-pointer"
                  >
                    <option value="high">TINGGI</option>
                    <option value="low">RENDAH</option>
                  </select>
               </div>

               <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Clock size={12}/> Update Status</p>
                  {item.status === 'pending' && <button onClick={() => onStatus(item.id, 'verified')} className="border-2 border-slate-200 text-slate-400 bg-white hover:border-blue-500 hover:text-blue-600 hover:font-black py-2.5 rounded-xl text-xs font-bold transition-all">Verifikasi Laporan</button>}
                  {(item.status === 'verified' || item.status === 'pending') && <button onClick={() => onStatus(item.id, 'in_progress')} className="border-2 border-slate-200 text-slate-400 bg-white hover:border-purple-500 hover:text-purple-600 hover:font-black py-2.5 rounded-xl text-xs font-bold transition-all">Mulai Perbaikan</button>}
                  {item.status === 'in_progress' && <button onClick={() => onStatus(item.id, 'done')} className="bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-xs font-black shadow-lg shadow-green-100 transition-all">Tandai Selesai</button>}
                  <button onClick={() => onStatus(item.id, 'rejected')} className="text-red-500 hover:bg-red-50 text-[11px] font-bold py-2 rounded-xl transition-all">Tolak Laporan</button>
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DaftarWargaView({ laporan }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {laporan.map(item => <LaporanCard key={item.id} laporan={item} minimal={true} />)}
    </div>
  );
}

function HistoryWargaView({ laporan, onDelete }) {
  return (
    <div className="space-y-4">
      {laporan.map(item => (
        <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm hover:border-indigo-100 transition-all">
          <div><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[item.status]?.badge}`}>{STATUS_CONFIG[item.status]?.label}</span><h4 className="font-bold text-slate-800 text-lg mt-2">{item.deskripsi}</h4><p className="text-[12px] text-slate-500 mt-1">📍 {item.alamat}</p></div>
          <div className="flex gap-2">{item.status === 'pending' && <button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={20} /></button>}<Link to={`/laporan/${item.id}`} className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-xl transition-colors"><ChevronRight size={24} /></Link></div>
        </div>
      ))}
    </div>
  );
}