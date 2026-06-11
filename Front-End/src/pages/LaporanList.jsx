import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  getLaporanByUser,
  getAllLaporan,
  deleteLaporan,
  updateLaporanStatus,
  getKendalaByKecamatan,
  updateCatatanLaporan,
  getDuplicateGroups,
  mergeLaporan,
} from '../services/laporanService';
import { createPeringatan } from '../services/notifikasiService';
import { useAuth } from '../contexts/AuthContext';
import LaporanCard from '../components/LaporanCard';
import SuperAdminDashboard from './SuperAdminDashboard';
import AdminKecamatanDashboard from './AdminKecamatanDashboard';
import NotifikasiPetugas from './NotifikasiPetugas';
import { CatatanModal, StatusUpdateModal, DeleteConfirmModal, AlertModal } from '../components/Modals';
import {
  Plus,
  Clock,
  Bell,
  ChevronRight,
  ChevronLeft,
  FileText,
  Trash2,
  Inbox,
  CheckCircle2,
  Search,
  ArrowUpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  PenSquare,
  Globe,
  Activity,
  AlertTriangle,
  MessageSquare,
  Copy,
  GitMerge,
  MapPin,
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

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

const ROW_OPTIONS = [9, 12, 16];

async function getValidToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

/* ═══════════════════════════════════════════════════════
   PAGINATION COMPONENT
═══════════════════════════════════════════════════════ */
function Pagination({ currentPage, totalPages, totalItems, rowsPerPage, onPageChange, onRowsChange }) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const end   = Math.min(currentPage * rowsPerPage, totalItems);

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    pages.push(1);
    if (currentPage > 3) pages.push('ellipsis-start');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('ellipsis-end');
    pages.push(totalPages);
    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
          Baris / halaman:
        </span>
        <div className="flex gap-1">
          {ROW_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => { onRowsChange(n); onPageChange(1); }}
              className={`w-9 h-8 rounded-lg text-xs font-black transition-all duration-150 ${
                rowsPerPage === n
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                  : 'bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <span className="text-xs font-medium text-slate-400 order-last sm:order-none">
        Menampilkan{' '}
        <span className="font-black text-slate-700">{start}–{end}</span>
        {' '}dari{' '}
        <span className="font-black text-slate-700">{totalItems}</span>{' '}laporan
      </span>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronsLeft size={14} />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 px-3 h-8 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={13} />
          Prev
        </button>
        <div className="flex gap-1">
          {getPages().map((page) =>
            typeof page === 'string' ? (
              <span key={page} className="w-8 h-8 flex items-center justify-center text-xs text-slate-400 select-none">…</span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 rounded-lg text-xs font-black transition-all duration-150 ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                    : 'bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1 px-3 h-8 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Next
          <ChevronRight size={13} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN: LaporanList
═══════════════════════════════════════════════════════ */
export default function LaporanList() {
  const [laporanPublik, setLaporanPublik]   = useState([]);
  const [laporanSaya, setLaporanSaya]       = useState([]);
  const [laporanMasuk, setLaporanMasuk]     = useState([]);
  const [kendalaList, setKendalaList]       = useState([]);
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [duplicateRadius, setDuplicateRadius] = useState(50);
  const [duplicateLoading, setDuplicateLoading] = useState(false);
  const [loading, setLoading]               = useState(true);
  const [searchQuery, setSearchQuery]       = useState('');
  const [publicSearchQuery, setPublicSearchQuery] = useState('');
  const [publicFilterStatus, setPublicFilterStatus] = useState('all');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const [searchParams] = useSearchParams();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const isAdmin    = profile?.role === 'kecamatan' || profile?.role === 'petugas' || profile?.role === 'super_admin';
  const canModerate = profile?.role === 'kecamatan' || profile?.role === 'super_admin';

  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') || (isAdmin ? 'masuk' : 'buat')
  );

  const adminTabs = new Set(['masuk', 'progress', 'selesai', 'dashboard', '__dashboard_kecamatan__']);
  if (canModerate) {
    adminTabs.add('kendala');
    adminTabs.add('duplikat');
  }
  // Tab notifikasi hanya untuk petugas, diakses via URL bukan sidebar
  if (profile?.role === 'petugas') {
    adminTabs.add('notifikasi');
  }

  const resolvedAdminTab = adminTabs.has(activeTab) ? activeTab : 'masuk';

  useEffect(() => {
    if (!isAdmin) return;
    if (!adminTabs.has(activeTab)) setActiveTab('masuk');
  }, [profile, isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync tab dari URL param (untuk bell icon → ?tab=notifikasi)
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) setActiveTab(tabFromUrl);
  }, [searchParams]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const kecamatanId = profile?.kecamatan_id ?? profile?.kecamatan?.id;

      if (isAdmin) {
        const endpoint = kecamatanId
          ? `${API_URL}/admin/laporan/kecamatan/${kecamatanId}`
          : `${API_URL}/admin/laporan/semua`;

        try {
          const token = await getValidToken();
          const res = await fetch(endpoint, {
            headers: { 'Authorization': `Bearer ${token ?? ''}` },
          });
          if (!res.ok) throw new Error(`Admin API gagal (${res.status})`);
          const json = await res.json();
          if (!json?.success) throw new Error(json?.error ?? 'Admin API tidak mengembalikan success=true');
          setLaporanMasuk(json.data ?? []);

          if (kecamatanId) {
            const kendalaRes = await getKendalaByKecamatan(kecamatanId);
            if (kendalaRes.success) {
              const activeKendala = kendalaRes.data.filter(
                (k) => k.laporan?.status !== 'done' && k.laporan?.status !== 'selesai'
              );
              setKendalaList(activeKendala);
            }
          }
        } catch {
          const fallbackRes = await getAllLaporan();
          if (fallbackRes.success) {
            const fallbackData = fallbackRes.data ?? [];
            const scoped = kecamatanId
              ? fallbackData.filter((item) => String(item.kecamatan_id) === String(kecamatanId))
              : fallbackData;
            setLaporanMasuk(scoped);

            if (kecamatanId) {
              const kendalaRes = await getKendalaByKecamatan(kecamatanId);
              if (kendalaRes.success) {
                const activeKendala = kendalaRes.data.filter(
                  (k) => k.laporan?.status !== 'done' && k.laporan?.status !== 'selesai'
                );
                setKendalaList(activeKendala);
              }
            }
          } else {
            setLaporanMasuk([]);
          }
        }
      } else {
        const feedRes = await getAllLaporan(user?.id);
        setLaporanPublik(feedRes.data ?? []);
        if (user) {
          const myRes = await getLaporanByUser();
          if (myRes.success) setLaporanSaya(myRes.data ?? []);
        }
      }
    } catch (err) {
      console.error('loadData error:', err);
    }
    setLoading(false);
  }, [isAdmin, profile, user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (authLoading || !user || !profile) return;
    loadData();
    if (isAdmin) return;
    const subscription = supabase
      .channel('laporan_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'laporan' }, () => { loadData(); })
      .subscribe();
    const pollInterval = setInterval(loadData, 30000);
    return () => { subscription.unsubscribe(); clearInterval(pollInterval); };
  }, [authLoading, user, profile, isAdmin, activeTab, loadData]);

  useEffect(() => {
    if (activeTab !== 'duplikat' || !canModerate) return;
    const kecamatanId = profile?.kecamatan_id ?? profile?.kecamatan?.id;
    if (!kecamatanId) return;
    loadDuplicates(kecamatanId);
  }, [activeTab, duplicateRadius]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDuplicates = async (kecamatanId) => {
    setDuplicateLoading(true);
    const res = await getDuplicateGroups(kecamatanId, duplicateRadius);
    if (res.success) {
      setDuplicateGroups(res.data ?? []);
    } else {
      setAlertModal({ open: true, title: 'Error', message: res.error ?? 'Gagal memuat data duplikat', type: 'error' });
    }
    setDuplicateLoading(false);
  };

  const handleMerge = async (primaryId, secondaryIds) => {
    const res = await mergeLaporan(primaryId, secondaryIds);
    if (res.success) {
      setAlertModal({
        open: true,
        title: 'Berhasil!',
        message: `${res.merged_count} laporan berhasil digabungkan. Total upvote: ${res.total_upvotes}`,
        type: 'success',
      });
      const kecamatanId = profile?.kecamatan_id ?? profile?.kecamatan?.id;
      if (kecamatanId) loadDuplicates(kecamatanId);
      loadData();
    } else {
      setAlertModal({ open: true, title: 'Gagal', message: res.error ?? 'Gagal menggabungkan laporan', type: 'error' });
    }
  };

  const [catatanModal, setCatatanModal] = useState({ open: false, id: null, currentCatatan: '', isViewOnly: false });
  const [statusModal, setStatusModal]   = useState({ open: false, id: null, nextStatus: '', statusLabel: '' });
  const [deleteModal, setDeleteModal]   = useState({ open: false, id: null });
  const [alertModal, setAlertModal]     = useState({ open: false, title: '', message: '', type: 'error' });

  const handleUpdatePriority = async (id, priority) => {
    try {
      const token = await getValidToken();
      const res = await fetch(`${API_URL}/admin/laporan/${id}/prioritas`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token ?? ''}` },
        body: JSON.stringify({ prioritas: priority.toLowerCase() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setAlertModal({ open: true, title: 'Gagal', message: json.error ?? 'Terjadi kesalahan', type: 'error' });
        return;
      }
      loadData();
    } catch (err) {
      setAlertModal({ open: true, title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleUpdateStatus = (id, status) => {
    const label = STATUS_CONFIG[status]?.label ?? status;
    setStatusModal({ open: true, id, nextStatus: status, statusLabel: label });
  };

  const submitStatusUpdate = async (id, status, keterangan) => {
    const { success, error } = await updateLaporanStatus(id, status, null, keterangan);
    if (success) {
      loadData();
      setStatusModal({ open: false, id: null, nextStatus: '', statusLabel: '' });
    } else {
      setAlertModal({ open: true, title: 'Gagal', message: error ?? 'Gagal update status', type: 'error' });
    }
  };

  const openCatatanModal = (id, currentCatatan, isViewOnly) => {
    setCatatanModal({ open: true, id, currentCatatan: currentCatatan ?? '', isViewOnly });
  };

  const closeCatatanModal = () => {
    setCatatanModal({ open: false, id: null, currentCatatan: '', isViewOnly: false });
  };

  const submitCatatanModal = async (newCatatan) => {
    if (!catatanModal.id || catatanModal.isViewOnly) return;
    const res = await updateCatatanLaporan(catatanModal.id, newCatatan);
    if (res.success) { loadData(); closeCatatanModal(); }
    else setAlertModal({ open: true, title: 'Gagal', message: res.error ?? 'Gagal simpan catatan', type: 'error' });
  };

  const handleDelete = (id) => setDeleteModal({ open: true, id });

  const confirmDelete = async (id) => {
    const { success, error } = await deleteLaporan(id);
    if (success) { loadData(); setDeleteModal({ open: false, id: null }); }
    else setAlertModal({ open: true, title: 'Gagal', message: error ?? 'Gagal menghapus laporan', type: 'error' });
  };

  if (authLoading) {
    return <div className="p-20 text-center text-slate-400 font-bold">Memuat...</div>;
  }

  // ─── Tab definitions ─────────────────────────────────
  const wargaTabs = [
    { id: 'buat',    label: 'Buat Laporan',   icon: PenSquare },
    { id: 'history', label: 'History Saya',   icon: Clock     },
    { id: 'publik',  label: 'Laporan Publik', icon: Globe     },
  ];

  const adminTabsList = [];
  if (profile?.role === 'super_admin') {
    adminTabsList.push({ id: 'dashboard',               label: 'Dashboard Analytics',  icon: BarChart3   });
  }
  if (profile?.role === 'kecamatan') {
    adminTabsList.push({ id: '__dashboard_kecamatan__', label: 'Dashboard Penugasan',  icon: BarChart3   });
  }
  adminTabsList.push(
    { id: 'masuk',    label: 'Laporan Masuk',    icon: Inbox        },
    { id: 'progress', label: 'Laporan Progress', icon: Activity     },
    { id: 'selesai',  label: 'Laporan Selesai',  icon: CheckCircle2 },
  );
  if (canModerate) {
    adminTabsList.push({ id: 'kendala',  label: 'Kendala Lapangan', icon: AlertTriangle });
    adminTabsList.push({ id: 'duplikat', label: 'Deteksi Duplikat', icon: Copy          });
  }
  // ─── NOTIFIKASI TIDAK DITAMBAHKAN KE SIDEBAR ───
  // Petugas mengakses notifikasi via bell icon di navbar → ?tab=notifikasi

  const tabs = isAdmin ? adminTabsList : wargaTabs;

  const getPageTitle = () => {
    if (profile?.role === 'super_admin' && activeTab === 'dashboard')   return 'Dashboard Super Admin';
    if (isAdmin) {
      if (activeTab === '__dashboard_kecamatan__') return 'Dashboard Penugasan';
      if (resolvedAdminTab === 'masuk')            return 'Laporan Masuk';
      if (resolvedAdminTab === 'progress')         return 'Laporan Progress';
      if (resolvedAdminTab === 'selesai')          return 'Laporan Selesai';
      if (resolvedAdminTab === 'kendala')          return 'Kendala Lapangan';
      if (resolvedAdminTab === 'duplikat')         return 'Deteksi Laporan Duplikat';
      if (activeTab === 'notifikasi')              return 'Notifikasi Peringatan';
    }
    if (activeTab === 'buat')    return 'Buat Laporan Baru';
    if (activeTab === 'history') return 'History Laporan Saya';
    return 'Laporan Publik';
  };

  const getPageSubtitle = () => {
    if (profile?.role === 'super_admin' && activeTab === 'dashboard')
      return 'Monitoring performa penyelesaian laporan seluruh kecamatan';
    if (activeTab === 'notifikasi') return 'Peringatan dari admin kecamatan';
    if (isAdmin) return `Kecamatan ${profile?.kecamatan?.nama_kecamatan ?? ''}`;
    if (activeTab === 'buat')    return 'Laporkan kerusakan infrastruktur di kota Anda';
    if (activeTab === 'history') return 'Lihat riwayat laporan yang pernah Anda buat';
    return 'Laporan dari warga lain di seluruh kota';
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 animate-fade-in">

      {/* Sidebar */}
      <aside
        className={`shrink-0 bg-white border-r border-slate-100 pt-6 flex flex-col shadow-sm animate-slide-in-left transition-all duration-300 ease-in-out ${
          sidebarExpanded ? 'w-64 px-4' : 'w-[68px] px-2'
        }`}
      >
        <button
          onClick={() => setSidebarExpanded((prev) => !prev)}
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

        <div
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        >
          {activeTab !== 'dashboard' && (
            <div className="flex-1 animate-fade-in-up">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{getPageTitle()}</h1>
              <p className="text-slate-500 text-sm mt-1 font-medium">{getPageSubtitle()}</p>
            </div>
          )}

          <div className="flex gap-3 w-full lg:w-auto">
            {isAdmin && activeTab !== 'dashboard' && activeTab !== 'notifikasi' && (
              <div className="relative flex-1 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Cari berdasarkan judul atau alamat..."
                  className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs w-full lg:w-80 focus:ring-2 focus:ring-indigo-500/30 outline-none shadow-sm transition-all focus:shadow-md focus:border-indigo-400 input-focus-animate"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            {!isAdmin && activeTab === 'publik' && (
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                <div className="relative flex-1 lg:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" size={16} />
                  <input
                    type="text"
                    placeholder="Cari laporan berdasarkan judul atau alamat..."
                    className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs w-full focus:ring-2 focus:ring-indigo-500/30 outline-none shadow-sm transition-all focus:shadow-md focus:border-indigo-400 input-focus-animate"
                    value={publicSearchQuery}
                    onChange={(e) => setPublicSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  value={publicFilterStatus}
                  onChange={(e) => setPublicFilterStatus(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none shadow-sm hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500/30 transition-all cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Belum Diverifikasi</option>
                  <option value="verified">Terverifikasi &amp; Proses</option>
                  <option value="done">Selesai / Ditolak</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content area */}
        {activeTab === 'buat' && !isAdmin ? (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <InlineLaporanRedirect />
          </div>
        ) : activeTab === 'history' && !isAdmin ? (
          <HistoryWargaView laporan={laporanSaya} onDelete={handleDelete} />
        ) : !isAdmin && activeTab === 'publik' ? (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <DaftarWargaView laporan={laporanPublik} searchQuery={publicSearchQuery} filterStatus={publicFilterStatus} />
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : isAdmin ? (
          activeTab === 'dashboard' ? (
            <SuperAdminDashboard />
          ) : activeTab === '__dashboard_kecamatan__' ? (
            <AdminKecamatanDashboard />
          ) : activeTab === 'notifikasi' ? (
            // ─── Tab notifikasi: hanya untuk petugas via bell icon navbar ───
            <NotifikasiPetugas />
          ) : activeTab === 'kendala' ? (
            <KendalaAdminView kendala={kendalaList} searchQuery={searchQuery} />
          ) : activeTab === 'duplikat' ? (
            <DuplikatAdminView
              groups={duplicateGroups}
              loading={duplicateLoading}
              radius={duplicateRadius}
              onRadiusChange={setDuplicateRadius}
              onMerge={handleMerge}
              searchQuery={searchQuery}
            />
          ) : (
            <AdminView
              laporan={laporanMasuk ?? []}
              activeTab={resolvedAdminTab}
              onStatus={handleUpdateStatus}
              onPriority={handleUpdatePriority}
              onCatatan={openCatatanModal}
              profile={profile}
              user={user}
              searchQuery={searchQuery}
            />
          )
        ) : activeTab === 'publik' ? (
          <DaftarWargaView laporan={laporanPublik} searchQuery={publicSearchQuery} />
        ) : (
          <HistoryWargaView laporan={laporanSaya} onDelete={handleDelete} />
        )}
      </main>

      {/* Modals */}
      {catatanModal.open && (
        <CatatanModal
          isOpen={catatanModal.open}
          isViewOnly={catatanModal.isViewOnly}
          initialCatatan={catatanModal.currentCatatan}
          onClose={closeCatatanModal}
          onSubmit={submitCatatanModal}
        />
      )}
      {statusModal.open && (
        <StatusUpdateModal
          isOpen={statusModal.open}
          statusLabel={statusModal.statusLabel}
          onClose={() => setStatusModal({ ...statusModal, open: false })}
          onSubmit={(ket) => submitStatusUpdate(statusModal.id, statusModal.nextStatus, ket)}
        />
      )}
      {deleteModal.open && (
        <DeleteConfirmModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ ...deleteModal, open: false })}
          onConfirm={() => confirmDelete(deleteModal.id)}
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

/* ─── InlineLaporanRedirect ─── */
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
          Bantu kami menjaga infrastruktur kota dengan melaporkan kerusakan yang Anda temukan.
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

/* ═══════════════════════════════════════════════════════
   ADMIN VIEW — dengan tombol Kirim Peringatan
═══════════════════════════════════════════════════════ */
function AdminView({ laporan, activeTab, onStatus, onPriority, onCatatan, profile, user, searchQuery }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [peringatanLoading, setPeringatanLoading] = useState(null); // id laporan yang sedang diproses

  useEffect(() => { setCurrentPage(1); }, [activeTab, searchQuery]);

  const isPetugas = profile?.role === 'petugas';

  // ─── Handler kirim peringatan dari list card ────────────────────────────
  const handleKirimPeringatan = async (item) => {
    const pesan = prompt(
      `Tulis peringatan untuk laporan "${item.judul || item.deskripsi}":`,
      `Harap segera tindaklanjuti laporan ini agar dapat diselesaikan tepat waktu.`
    );
    if (!pesan) return;

    setPeringatanLoading(item.id);
    try {
      await createPeringatan({
        laporanId:       item.id,
        pesanPeringatan: pesan,
        adminId:         user.id,
      });
      alert('Peringatan berhasil dikirim ke petugas lapangan.');
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim peringatan.');
    }
    setPeringatanLoading(null);
  };

  let filteredLaporan = laporan.filter((item) => {
    if (activeTab === 'masuk')    return isPetugas ? item.status === 'verified'    : item.status === 'pending';
    if (activeTab === 'progress') return isPetugas ? item.status === 'in_progress' : ['verified', 'in_progress'].includes(item.status);
    if (activeTab === 'selesai')  return ['done', 'selesai', 'rejected'].includes(item.status);
    return false;
  });

  if (searchQuery?.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filteredLaporan = filteredLaporan.filter((item) =>
      (item.judul     || '').toLowerCase().includes(q) ||
      (item.alamat    || '').toLowerCase().includes(q) ||
      (item.deskripsi || '').toLowerCase().includes(q)
    );
  }

  const totalItems = filteredLaporan.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = filteredLaporan.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  if (totalItems === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 animate-fade-in shadow-sm">
        <Inbox size={40} className="mx-auto text-slate-300 mb-2 animate-float" />
        <p className="font-medium">Tidak ada laporan di kategori ini.</p>
      </div>
    );
  }

  const showPriority = activeTab === 'masuk' || activeTab === 'progress';

  return (
    <div>
      <div className="space-y-5">
        {paginated.map((item, idx) => {
          const priorityVal   = (item.prioritas || 'low').toLowerCase();
          const finalPriority = priorityVal === 'high' ? 'high' : 'low';

          const userKecamatanId = profile?.kecamatan_id ?? profile?.kecamatan?.id;
          const itemKecamatanId = item.kecamatan_id     ?? item.kecamatan?.id;
          const sameKecamatan   = String(userKecamatanId ?? '') === String(itemKecamatanId ?? '');

          const canModerateItem   = profile?.role === 'super_admin' || (profile?.role === 'kecamatan' && sameKecamatan);
          const canWorkAction     = profile?.role === 'super_admin' || (sameKecamatan && profile?.role === 'petugas');
          const canChangePriority = showPriority && profile?.role === 'kecamatan' && sameKecamatan;

          const cfg        = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
          const isDone     = item.status === 'done'     || item.status === 'selesai';
          const isRejected = item.status === 'rejected';
          const pCfg       = PRIORITY_CONFIG[finalPriority];
          const canAddCatatan = ['pending', 'verified', 'in_progress'].includes(item.status);

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border ${finalPriority === 'high' ? 'border-red-200 shadow-red-50' : 'border-slate-200'} p-6 flex flex-col md:flex-row justify-between gap-6 shadow-sm hover:shadow-lg transition-all duration-300 relative animate-stagger card-hover`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {finalPriority === 'high' && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 rounded-l-2xl transition-all" />
              )}

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border ${pCfg.color} transition-all`}>{pCfg.label}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.badge} transition-all status-breathing`}>{cfg.label}</span>
                  {canAddCatatan && (
                    <button
                      onClick={(e) => { e.preventDefault(); onCatatan(item.id, item.catatan, isPetugas); }}
                      className={`p-1 rounded-md transition-all ${item.catatan ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                      title="Catatan Tambahan"
                    >
                      <MessageSquare size={14} />
                    </button>
                  )}
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider transition-colors">
                    {new Date(item.created_at).toLocaleString('id-ID')}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-xl mb-1 leading-tight transition-colors hover:text-indigo-600">
                  {item.judul || item.deskripsi}
                </h3>
                <p className="text-sm text-slate-500 mb-5 flex items-center gap-1.5 transition-colors">
                  📍 <span className="font-medium">{item.alamat}, {item.kelurahan?.nama_kelurahan}</span>
                </p>
                <div className="flex items-center gap-4 border-t border-slate-50 pt-4">
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all">
                    👤 {item.profiles?.nama ?? 'Warga'}
                  </span>
                  <Link
                    to={`/laporan/${item.id}`}
                    className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-all btn-hover-lift"
                  >
                    DETAIL LENGKAP <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="md:w-72 space-y-5 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-8 flex flex-col justify-center">
                {/* SET PRIORITAS */}
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1 transition-colors">
                    <ArrowUpCircle size={12} /> Set Prioritas
                  </p>
                  <select
                    value={finalPriority}
                    onChange={(e) => onPriority(item.id, e.target.value)}
                    disabled={!canChangePriority}
                    className={`w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                      canChangePriority ? 'cursor-pointer hover:border-slate-300 active:scale-95' : 'cursor-not-allowed opacity-60'
                    }`}
                  >
                    <option value="high">TINGGI</option>
                    <option value="low">RENDAH</option>
                  </select>
                  {!canChangePriority && (
                    <p className="mt-2 text-[11px] text-slate-400">Hanya petugas atau kecamatan yang dapat mengubah prioritas.</p>
                  )}
                </div>

                {/* UPDATE STATUS */}
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Clock size={12} /> Update Status
                  </p>
                  <div className="flex flex-col gap-2">
                    {canModerateItem && item.status === 'pending' && (
                      <button
                        onClick={() => onStatus(item.id, 'verified')}
                        className="border-2 border-slate-200 text-slate-400 bg-white hover:border-blue-500 hover:text-blue-600 py-2.5 rounded-xl text-xs font-bold transition-all"
                      >
                        Verifikasi Laporan
                      </button>
                    )}
                    {canWorkAction && (
                      <>
                        {item.status === 'verified' && (
                          <button
                            onClick={() => onStatus(item.id, 'in_progress')}
                            className="border-2 border-slate-200 text-slate-400 bg-white hover:border-purple-500 hover:text-purple-600 py-2.5 rounded-xl text-xs font-bold transition-all"
                          >
                            Mulai Perbaikan
                          </button>
                        )}
                        {item.status === 'pending' && (
                          <p className="text-xs text-gray-400 italic">Menunggu verifikasi admin</p>
                        )}
                      </>
                    )}
                    {canWorkAction && item.status === 'in_progress' && !(item.bukti_selesai?.length > 0) && !isRejected && (
                      <Link
                        to={`/laporan/${item.id}`}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-black text-center transition-all shadow-md shadow-emerald-100"
                      >
                        Upload Bukti Selesai
                      </Link>
                    )}
                    {canModerateItem && item.status === 'in_progress' && (item.bukti_selesai?.length > 0) && !isRejected && (
                      <button
                        onClick={() => onStatus(item.id, 'done')}
                        className="bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-xs font-black text-center transition-all shadow-md shadow-green-100"
                      >
                        Selesai
                      </button>
                    )}
                    {canModerateItem && item.status === 'pending' && !isDone && !isRejected && (
                      <button
                        onClick={() => onStatus(item.id, 'rejected')}
                        className="text-red-500 hover:bg-red-50 text-[11px] font-bold py-2 rounded-xl transition-all"
                      >
                        Tolak Laporan
                      </button>
                    )}

                    {/* ── KIRIM PERINGATAN — khusus admin kecamatan, saat in_progress ── */}
                    {canModerateItem && item.status === 'in_progress' && (
                      <button
                        onClick={() => handleKirimPeringatan(item)}
                        disabled={peringatanLoading === item.id}
                        className="flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-2.5 rounded-xl text-xs font-black transition-all shadow-md shadow-orange-100"
                      >
                        <Bell size={13} />
                        {peringatanLoading === item.id ? 'Mengirim...' : 'Kirim Peringatan'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={totalItems}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsChange={setRowsPerPage}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DAFTAR WARGA VIEW
═══════════════════════════════════════════════════════ */
function DaftarWargaView({ laporan, searchQuery = '', filterStatus = 'all' }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(9);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterStatus]);

  const q = searchQuery.toLowerCase().trim();

  const filtered = laporan.filter((item) => {
    let statusMatch = true;
    if (filterStatus === 'pending')  statusMatch = item.status === 'pending';
    if (filterStatus === 'verified') statusMatch = ['verified', 'in_progress'].includes(item.status);
    if (filterStatus === 'done')     statusMatch = ['done', 'selesai', 'rejected'].includes(item.status);
    const searchMatch = !q ||
      (item.judul  || '').toLowerCase().includes(q) ||
      (item.alamat || '').toLowerCase().includes(q);
    return statusMatch && searchMatch;
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  if (totalItems === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 animate-fade-in shadow-sm">
        <Globe size={40} className="mx-auto text-slate-300 mb-2 animate-float" />
        <p className="font-medium">
          {q ? 'Tidak ada laporan yang cocok dengan pencarian.' : 'Belum ada laporan dari warga lain.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginated.map((item, idx) => (
          <div key={item.id} style={{ animationDelay: `${idx * 50}ms` }}>
            <LaporanCard laporan={item} minimal={true} />
          </div>
        ))}
      </div>
      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={totalItems}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsChange={setRowsPerPage}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   HISTORY WARGA VIEW
═══════════════════════════════════════════════════════ */
function HistoryWargaView({ laporan, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(9);

  if (!laporan || laporan.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 animate-fade-in shadow-sm">
        <Clock size={40} className="mx-auto text-slate-300 mb-2 animate-float" />
        <p className="font-medium">Belum ada laporan. Yuk buat laporan pertamamu!</p>
      </div>
    );
  }

  const totalItems = laporan.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = laporan.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  return (
    <div>
      <div className="space-y-4">
        {paginated.map((item, idx) => (
          <div
            key={item.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 animate-stagger card-hover"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${STATUS_CONFIG[item.status]?.badge}`}>
                {STATUS_CONFIG[item.status]?.label}
              </span>
              <h4 className="font-bold text-slate-800 text-lg mt-2 transition-colors hover:text-indigo-600">
                {item.judul || item.deskripsi}
              </h4>
              <p className="text-[12px] text-slate-500 mt-1 transition-colors">📍 {item.alamat}</p>
            </div>
            <div className="flex gap-2">
              {item.status === 'pending' && (
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <Trash2 size={20} />
                </button>
              )}
              <Link
                to={`/laporan/${item.id}`}
                className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-xl transition-all duration-200 btn-hover-lift"
              >
                <ChevronRight size={24} />
              </Link>
            </div>
          </div>
        ))}
      </div>
      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={totalItems}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsChange={setRowsPerPage}
      />
    </div>
  );
}

/* ─── KendalaAdminView ─── */
function KendalaAdminView({ kendala, searchQuery }) {
  let filteredKendala = kendala;
  if (searchQuery?.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filteredKendala = filteredKendala.filter((item) => {
      const judul  = (item.laporan?.judul  || '').toLowerCase();
      const alamat = (item.laporan?.alamat || '').toLowerCase();
      return judul.includes(q) || alamat.includes(q);
    });
  }

  if (!filteredKendala || filteredKendala.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 animate-fade-in shadow-sm">
        <AlertTriangle size={40} className="mx-auto text-slate-300 mb-2 animate-float" />
        <p className="font-medium">Tidak ada laporan kendala.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {filteredKendala.map((item, idx) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl border border-red-100 shadow-sm hover:shadow-xl hover:border-red-300 transition-all duration-300 relative animate-stagger flex flex-col overflow-hidden group"
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-400" />
          <div className="p-6 flex flex-col flex-1">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                  <AlertTriangle size={15} className="text-red-500" />
                </div>
                <span className="text-[10px] font-black tracking-widest uppercase text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                  Kendala Lapangan
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
                <Clock size={12} />
                {new Date(item.created_at).toLocaleString('id-ID', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <div className="mb-6">
              <h4 className="font-extrabold text-slate-800 text-lg leading-snug group-hover:text-red-600 transition-colors">
                {item.deskripsi || item.isi_kendala}
              </h4>
            </div>
            {item.laporan && (
              <div className="mt-auto bg-slate-50/80 rounded-xl border border-slate-100 p-4 transition-all hover:bg-slate-50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <FileText size={12} />
                  Informasi Laporan Terkait
                </p>
                <p className="text-sm font-bold text-slate-700 leading-snug mb-4 line-clamp-1">
                  {item.laporan.judul || item.laporan.deskripsi}
                </p>
                <Link
                  to={`/laporan/${item.laporan.id}`}
                  className="flex items-center justify-between w-full bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm px-4 py-2.5 rounded-lg text-[11px] font-black tracking-wide text-indigo-600 hover:text-indigo-700 transition-all btn-hover-lift group/btn"
                >
                  LIHAT DETAIL LAPORAN
                  <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── DuplikatAdminView ─── */
function DuplikatAdminView({ groups, loading, radius, onRadiusChange, onMerge, searchQuery }) {
  const [mergeModal, setMergeModal]           = useState({ open: false, group: null });
  const [selectedPrimary, setSelectedPrimary] = useState(null);
  const [merging, setMerging]                 = useState(false);

  let filteredGroups = groups;
  if (searchQuery?.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filteredGroups = groups.filter((group) =>
      group.reports.some((r) =>
        (r.judul     || '').toLowerCase().includes(q) ||
        (r.alamat    || '').toLowerCase().includes(q) ||
        (r.deskripsi || '').toLowerCase().includes(q)
      )
    );
  }

  const openMergeModal = (group) => {
    setSelectedPrimary(group.reports[0]?.id ?? null);
    setMergeModal({ open: true, group });
  };

  const handleConfirmMerge = async () => {
    if (!selectedPrimary || !mergeModal.group) return;
    setMerging(true);
    const secondaryIds = mergeModal.group.reports
      .filter((r) => r.id !== selectedPrimary)
      .map((r) => r.id);
    await onMerge(selectedPrimary, secondaryIds);
    setMerging(false);
    setMergeModal({ open: false, group: null });
    setSelectedPrimary(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-sm">Menganalisis laporan duplikat...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-100">
              <MapPin size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-800">Radius Deteksi</p>
              <p className="text-[11px] text-slate-400">Laporan dalam radius ini kemungkinan duplikat</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-1 sm:justify-end">
            <input
              type="range" min="1" max="50" value={radius}
              onChange={(e) => onRadiusChange(Number(e.target.value))}
              className="w-40 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-orange-500"
            />
            <span className="text-sm font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200 min-w-[80px] text-center">
              {radius} meter
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-black text-orange-600">{filteredGroups.length}</p>
          <p className="text-xs font-bold text-slate-400 mt-1">Grup Duplikat</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-black text-slate-700">{filteredGroups.reduce((sum, g) => sum + g.count, 0)}</p>
          <p className="text-xs font-bold text-slate-400 mt-1">Total Laporan Terdeteksi</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-black text-emerald-600">
            {filteredGroups.length > 0 ? `${filteredGroups[0].min_distance}m` : '—'}
          </p>
          <p className="text-xs font-bold text-slate-400 mt-1">Jarak Terdekat</p>
        </div>
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 animate-fade-in shadow-sm">
          <Copy size={40} className="mx-auto text-slate-300 mb-3 animate-float" />
          <p className="font-bold text-lg mb-1">Tidak ada duplikat terdeteksi</p>
          <p className="text-sm">Semua laporan dalam radius {radius}m terlihat unik. 🎉</p>
        </div>
      )}

      {filteredGroups.map((group, gIdx) => (
        <div
          key={group.group_id}
          className="bg-white rounded-2xl border border-orange-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden animate-stagger"
          style={{ animationDelay: `${gIdx * 80}ms` }}
        >
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md shadow-orange-200">
                {group.count}
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-800">Grup Duplikat #{gIdx + 1}</p>
                <p className="text-[11px] text-slate-500">
                  Jarak: <span className="font-bold text-orange-600">{group.min_distance}m</span>
                  {group.max_distance !== group.min_distance && <span> — {group.max_distance}m</span>}
                </p>
              </div>
            </div>
            <button
              onClick={() => openMergeModal(group)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all shadow-md shadow-orange-200 btn-hover-lift active:scale-95"
            >
              <GitMerge size={14} /> Gabungkan
            </button>
          </div>

          <div className="p-4 space-y-3">
            {group.reports.map((report, rIdx) => {
              const cfg = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.pending;
              return (
                <div
                  key={report.id}
                  className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-200"
                >
                  {report.foto_url && (
                    <div className="w-full md:w-24 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <img src={report.foto_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>{cfg.label}</span>
                      {rIdx === 0 && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                          LAPORAN PERTAMA
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-bold">
                        {new Date(report.created_at).toLocaleString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm leading-snug truncate">
                      {report.judul || report.deskripsi}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">📍 {report.alamat}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">👤 {report.pelapor_nama ?? 'Warga'}</span>
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded">👍 {report.upvote_count ?? 0} dukungan</span>
                      <Link to={`/laporan/${report.id}`} className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 ml-auto">
                        DETAIL <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {group.distances.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                <MapPin size={14} className="text-orange-500" />
                <span className="text-[11px] text-slate-500 font-medium">
                  Jarak antar laporan:{' '}
                  {group.distances.map((d, i) => (
                    <span key={i} className="font-bold text-orange-600">
                      {d.meters}m{i < group.distances.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Merge modal */}
      {mergeModal.open && mergeModal.group && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setMergeModal({ open: false, group: null })}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-slide-in-up max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 px-8 py-5 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-200">
                <GitMerge size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-800">Gabungkan Laporan Duplikat</h3>
                <p className="text-[11px] text-slate-500">Pilih laporan utama yang akan dipertahankan</p>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <p className="text-sm text-slate-600 bg-amber-50 border border-amber-200 rounded-xl p-3">
                ⚠️ <strong>Perhatian:</strong> Laporan yang digabungkan akan ditandai sebagai{' '}
                <em>selesai</em> dan upvote-nya dipindahkan ke laporan utama. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="space-y-3">
                {mergeModal.group.reports.map((report) => {
                  const isSelected = selectedPrimary === report.id;
                  return (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => setSelectedPrimary(report.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-100'
                          : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-slate-300'}`}>
                          {isSelected && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {isSelected
                              ? <span className="text-[10px] font-black text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">UTAMA</span>
                              : <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">AKAN DIGABUNGKAN</span>
                            }
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm truncate">{report.judul || report.deskripsi}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">📍 {report.alamat}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] text-slate-400">👤 {report.pelapor_nama}</span>
                            <span className="text-[10px] text-slate-400">👍 {report.upvote_count ?? 0}</span>
                            <span className="text-[10px] text-slate-400">{new Date(report.created_at).toLocaleDateString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100 p-6 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setMergeModal({ open: false, group: null })}
                disabled={merging}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmMerge}
                disabled={merging || !selectedPrimary}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {merging ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menggabungkan...
                  </>
                ) : (
                  <>
                    <GitMerge size={14} />
                    Gabungkan {mergeModal.group.reports.length - 1} Laporan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}