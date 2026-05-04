import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  getLaporanByUser, 
  getAllLaporan, 
  deleteLaporan,
  updateLaporanStatus 
} from '../services/laporanService';
import { useAuth } from '../contexts/AuthContext';
import LaporanCard from '../components/LaporanCard';
import { Plus, List, Clock, ChevronRight, FileText, Trash2, Inbox, ShieldCheck, CheckCircle2, Search, ArrowUpCircle, PanelLeftClose, PanelLeftOpen, PenSquare, Globe, Activity } from 'lucide-react';

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
  const [publicSearchQuery, setPublicSearchQuery] = useState('');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  
  const [searchParams] = useSearchParams();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const isAdmin = profile?.role === 'kecamatan' || profile?.role === 'petugas' || profile?.role === 'super_admin';
  const canModerate = profile?.role === 'kecamatan' || profile?.role === 'super_admin';
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || (isAdmin ? 'masuk' : 'buat'));
  const adminTabs = new Set(['masuk', 'progress', 'selesai']);

  const resolvedAdminTab = adminTabs.has(activeTab) ? activeTab : 'masuk';

  useEffect(() => {
    if (!isAdmin) return;
    if (!adminTabs.has(activeTab)) {
      setActiveTab('masuk');
    }
  }, [profile, isAdmin]);

  useEffect(() => {
    if (authLoading || !user || !profile) return;
    loadData();

    if (!isAdmin) {
      const subscription = supabase
        .channel('laporan_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'laporan'
        }, () => {
          loadData();
        })
        .subscribe();

      const pollInterval = setInterval(() => {
        loadData();
      }, 30000);

      return () => {
        subscription.unsubscribe();
        clearInterval(pollInterval);
      };
    }
  }, [authLoading, user, profile, isAdmin, activeTab, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const kecamatanId = profile?.kecamatan_id || profile?.kecamatan?.id;
      if (isAdmin) {
        console.log('Admin loading - role:', profile?.role, 'kecamatanId:', kecamatanId, 'activeTab:', activeTab);
        const { data: { session } } = await supabase.auth.getSession();
        
        let endpoint;
        if (!kecamatanId) {
          endpoint = `${API_URL}/admin/laporan/semua?search=${searchQuery}`;
        } else {
          endpoint = `${API_URL}/admin/laporan/kecamatan/${kecamatanId}?search=${searchQuery}`;
        }
        
        try {
          const res = await fetch(endpoint, {
            headers: { 'Authorization': `Bearer ${session?.access_token}` }
          });

          if (!res.ok) throw new Error(`Admin API gagal (${res.status})`);

          const json = await res.json();
          console.log('Admin laporan response:', json);
          if (!json?.success) throw new Error(json?.error || 'Admin API tidak mengembalikan success=true');

          setLaporanMasuk(json.data || []);
        } catch (apiErr) {
          console.warn('Admin API failed, fallback to client query:', apiErr?.message || apiErr);
          const fallbackRes = await getAllLaporan();
          if (fallbackRes.success) {
            const fallbackData = fallbackRes.data || [];
            if (!kecamatanId) {
              setLaporanMasuk(fallbackData);
            } else {
              const scoped = fallbackData.filter((item) => String(item.kecamatan_id) === String(kecamatanId));
              setLaporanMasuk(scoped);
            }
          } else {
            setLaporanMasuk([]);
          }
        }
      } else {
        // Load laporan publik (exclude current user) and laporan saya
        const feedRes = await getAllLaporan(user?.id);
        console.debug('DEBUG feedRes count:', (feedRes.data || []).length, 'success:', feedRes.success);

        if (feedRes.success && Array.isArray(feedRes.data)) {
          console.debug('DEBUG sample pelapor_ids:', feedRes.data.slice(0,8).map(i => ({ id: i.id, pelapor_id: i.pelapor_id, profiles_id: i.profiles?.id, t: typeof i.pelapor_id })));
        }

        // Only show reports from OTHER warga in publik
        setLaporanPublik(feedRes.data || []);

        // Still load user's history separately
        if (user) {
          const myRes = await getLaporanByUser();
          console.debug('DEBUG myRes count:', (myRes.data || []).length, 'success:', myRes.success);
          if (myRes.success) setLaporanSaya(myRes.data || []);
        }
      }
    } catch (err) { console.error('loadData error:', err); }
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

  const wargaTabs = [
    { id: 'buat', label: 'Buat Laporan', icon: PenSquare },
    { id: 'history', label: 'History Saya', icon: Clock },
    { id: 'publik', label: 'Laporan Publik', icon: Globe },
  ];
  const adminTabsList = [
    { id: 'masuk', label: 'Laporan Masuk', icon: Inbox },
    { id: 'progress', label: 'Laporan Progress', icon: Activity },
    { id: 'selesai', label: 'Laporan Selesai', icon: CheckCircle2 },
  ];

  const tabs = isAdmin ? adminTabsList : wargaTabs;

  const getPageTitle = () => {
    if (isAdmin) {
       if (resolvedAdminTab === 'masuk') return 'Laporan Masuk';
       if (resolvedAdminTab === 'progress') return 'Laporan Progress';
       if (resolvedAdminTab === 'selesai') return 'Laporan Selesai';
    }
    if (activeTab === 'buat') return 'Buat Laporan Baru';
    if (activeTab === 'history') return 'History Laporan Saya';
    return 'Laporan Publik';
  };
  const getPageSubtitle = () => {
    if (isAdmin) return `Kecamatan ${profile?.kecamatan?.nama_kecamatan || ''}`;
    if (activeTab === 'buat') return 'Laporkan kerusakan infrastruktur di kota Anda';
    if (activeTab === 'history') return 'Lihat riwayat laporan yang pernah Anda buat';
    return 'Laporan dari warga lain di seluruh kota';
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 animate-fade-in">
      {/* Sidebar */}
      <aside className={`shrink-0 bg-white border-r border-slate-100 pt-6 flex flex-col shadow-sm animate-slide-in-left transition-all duration-300 ease-in-out ${sidebarExpanded ? 'w-64 px-4' : 'w-[68px] px-2'}`}>
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="flex items-center justify-center w-full mb-4 p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 active:scale-95"
          title={sidebarExpanded ? 'Tutup Sidebar' : 'Buka Sidebar'}
        >
          {sidebarExpanded ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>

        {sidebarExpanded && (
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-3 animate-fade-in">
            {isAdmin ? 'Admin Panel' : 'Navigasi'}
          </p>
        )}

        <div className="flex flex-col gap-1">
          {tabs.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-0'} w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 animate-fade-in-up ${
                activeTab === t.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                  : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1'
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
              title={!sidebarExpanded ? t.label : undefined}
            >
              <t.icon size={17} />
              {sidebarExpanded && <span className="whitespace-nowrap">{t.label}</span>}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-6 md:p-10 animate-fade-in-up">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight transition-colors">{getPageTitle()}</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium transition-colors">{getPageSubtitle()}</p>
          </div>

          <div className="flex gap-3 w-full lg:w-auto">
            {isAdmin && (
              <div className="relative flex-1 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" size={16} />
                <input type="text" placeholder="Cari berdasarkan judul atau alamat..." className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs w-full lg:w-80 focus:ring-2 focus:ring-indigo-500/30 outline-none shadow-sm transition-all focus:shadow-md focus:border-indigo-400 input-focus-animate" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            )}
            {!isAdmin && activeTab === 'publik' && (
              <div className="relative flex-1 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" size={16} />
                <input type="text" placeholder="Cari laporan berdasarkan judul atau alamat..." className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs w-full lg:w-96 focus:ring-2 focus:ring-indigo-500/30 outline-none shadow-sm transition-all focus:shadow-md focus:border-indigo-400 input-focus-animate" value={publicSearchQuery} onChange={(e) => setPublicSearchQuery(e.target.value)} />
              </div>
            )}
          </div>
        </div>

        {activeTab === 'buat' && !isAdmin ? (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <InlineLaporanRedirect />
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
        ) : (
          isAdmin ? (
            <AdminView laporan={laporanMasuk || []} activeTab={resolvedAdminTab} onStatus={handleUpdateStatus} onPriority={handleUpdatePriority} profile={profile} />
          ) : (
            activeTab === 'publik' ? <DaftarWargaView laporan={laporanPublik} searchQuery={publicSearchQuery} /> : <HistoryWargaView laporan={laporanSaya} onDelete={handleDelete} />
          )
        )}
      </main>
    </div>
  );
}

function InlineLaporanRedirect() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-10 max-w-lg w-full text-center hover:shadow-xl transition-all duration-300">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200 animate-float">
          <PenSquare size={36} className="text-white" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Laporkan Kerusakan</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          Bantu kami menjaga infrastruktur kota dengan melaporkan kerusakan yang Anda temukan. Laporan Anda akan langsung diteruskan ke petugas terkait.
        </p>
        <button
          onClick={() => navigate('/laporan/baru')}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all duration-300 btn-hover-lift active:scale-95"
        >
          <Plus size={18} />
          Buat Laporan Baru
        </button>
      </div>
    </div>
  );
}

function AdminView({ laporan, activeTab, onStatus, onPriority, profile }) {
  const filteredLaporan = laporan.filter(item => {
    if (activeTab === 'masuk') return item.status === 'pending';
    if (activeTab === 'progress') return ['verified', 'in_progress'].includes(item.status);
    if (activeTab === 'selesai') return ['done', 'selesai', 'rejected'].includes(item.status);
    return false;
  });

  if (!filteredLaporan || filteredLaporan.length === 0) return <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 animate-fade-in shadow-sm"><Inbox size={40} className="mx-auto text-slate-300 mb-2 animate-float" /><p className="font-medium">Tidak ada laporan di kategori ini.</p></div>;
  
  return (
    <div className="space-y-5">
      {filteredLaporan.map((item, idx) => {
        const priorityVal = (item.prioritas || 'low').toLowerCase();
        const finalPriority = (priorityVal === 'high' || priorityVal === 'low') ? priorityVal : 'low';
        const userKecamatanId = profile?.kecamatan_id || profile?.kecamatan?.id;
        const itemKecamatanId = item.kecamatan_id || item.kecamatan?.id;
        const sameKecamatan = String(userKecamatanId || '') === String(itemKecamatanId || '');
        const canModerate = profile?.role === 'super_admin' || (profile?.role === 'kecamatan' && sameKecamatan);
        const canWorkAction = profile?.role === 'super_admin' || (sameKecamatan && ['kecamatan', 'petugas'].includes(profile?.role));
        
        const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
        const isDone = item.status === "done" || item.status === "selesai";
        const isRejected = item.status === "rejected";
        const pCfg = PRIORITY_CONFIG[finalPriority];

        return (
          <div key={item.id} className={`bg-white rounded-2xl border ${finalPriority === 'high' ? 'border-red-200 shadow-red-50' : 'border-slate-200'} p-6 flex flex-col md:flex-row justify-between gap-6 shadow-sm hover:shadow-lg transition-all duration-300 relative animate-stagger card-hover`} style={{ animationDelay: `${idx * 50}ms` }}>
            {finalPriority === 'high' && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 rounded-l-2xl transition-all" />}
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border ${pCfg.color} transition-all`}>{pCfg.label}</span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.badge} transition-all status-breathing`}>{cfg.label}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider transition-colors">{new Date(item.created_at).toLocaleString('id-ID')}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-1 leading-tight transition-colors hover:text-indigo-600">{item.judul || item.deskripsi}</h3>
              <p className="text-sm text-slate-500 mb-5 flex items-center gap-1.5 transition-colors">📍 <span className="font-medium">{item.alamat}, {item.kelurahan?.nama_kelurahan}</span></p>
              
              <div className="flex items-center gap-4 border-t border-slate-50 pt-4">
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all">👤 {item.profiles?.nama || 'Warga'}</span>
                <Link to={`/laporan/${item.id}`} className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-all btn-hover-lift">DETAIL LENGKAP <ChevronRight size={14} /></Link>
              </div>
            </div>
            
            <div className="md:w-72 space-y-5 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-8 flex flex-col justify-center">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1 transition-colors"><ArrowUpCircle size={12}/> Set Prioritas</p>
                  <select 
                    value={finalPriority} 
                    onChange={(e) => onPriority(item.id, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer hover:border-slate-300 active:scale-95"
                  >
                    <option value="high">TINGGI</option>
                    <option value="low">RENDAH</option>
                  </select>
               </div>

               <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-2">
  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
    <Clock size={12}/> Update Status
  </p>

  {/* VERIFIKASI */}
  {canModerate && item.status === 'pending' && (
    <button 
      onClick={() => onStatus(item.id, 'verified')}
      className="border-2 border-slate-200 text-slate-400 bg-white hover:border-blue-500 hover:text-blue-600 py-2.5 rounded-xl text-xs font-bold"
    >
      Verifikasi Laporan
    </button>
  )}

  {/* PROGRESS */}
  {canWorkAction && (item.status === 'verified' || item.status === 'pending') && (
    <button 
      onClick={() => onStatus(item.id, 'in_progress')}
      className="border-2 border-slate-200 text-slate-400 bg-white hover:border-purple-500 hover:text-purple-600 py-2.5 rounded-xl text-xs font-bold"
    >
      Mulai Perbaikan
    </button>
  )}

  {/* SELESAI */}
  {canWorkAction && item.status === 'in_progress' && !isRejected && (
    <button 
      onClick={() => onStatus(item.id, 'done')}
      className="bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-xs font-black"
    >
      Tandai Selesai
    </button>
  )}

  {/* TOLAK */}
  {canModerate && !isDone && !isRejected && (
  <button 
    onClick={() => onStatus(item.id, 'rejected')}
    className="text-red-500 hover:bg-red-50 text-[11px] font-bold py-2 rounded-xl"
  >
    Tolak Laporan
  </button>
)}
</div>
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DaftarWargaView({ laporan, searchQuery = '' }) {
  const q = searchQuery.toLowerCase().trim();
  const filtered = q
    ? laporan.filter((item) => {
        const judul = (item.judul || '').toLowerCase();
        const alamat = (item.alamat || '').toLowerCase();
        return judul.includes(q) || alamat.includes(q);
      })
    : laporan;

  if (!filtered || filtered.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 animate-fade-in shadow-sm">
        <Globe size={40} className="mx-auto text-slate-300 mb-2 animate-float" />
        <p className="font-medium">{q ? 'Tidak ada laporan yang cocok dengan pencarian.' : 'Belum ada laporan dari warga lain.'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((item, idx) => (
        <div key={item.id} style={{ animationDelay: `${idx * 50}ms` }}>
          <LaporanCard laporan={item} minimal={true} />
        </div>
      ))}
    </div>
  );
}

function HistoryWargaView({ laporan, onDelete }) {
  if (!laporan || laporan.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 animate-fade-in shadow-sm">
        <Clock size={40} className="mx-auto text-slate-300 mb-2 animate-float" />
        <p className="font-medium">Belum ada laporan. Yuk buat laporan pertamamu!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {laporan.map((item, idx) => (
        <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 animate-stagger card-hover" style={{ animationDelay: `${idx * 50}ms` }}>
          <div className="flex-1"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${STATUS_CONFIG[item.status]?.badge}`}>{STATUS_CONFIG[item.status]?.label}</span><h4 className="font-bold text-slate-800 text-lg mt-2 transition-colors hover:text-indigo-600">{item.judul || item.deskripsi}</h4><p className="text-[12px] text-slate-500 mt-1 transition-colors">📍 {item.alamat}</p></div>
          <div className="flex gap-2">{item.status === 'pending' && <button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"><Trash2 size={20} /></button>}<Link to={`/laporan/${item.id}`} className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-xl transition-all duration-200 btn-hover-lift"><ChevronRight size={24} /></Link></div>
        </div>
      ))}
    </div>
  );
}
