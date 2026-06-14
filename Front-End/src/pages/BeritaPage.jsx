import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createBerita, getAllBerita, updateBerita, deleteBerita } from '../services/beritaService';
import { DeleteConfirmModal } from '../components/Modals';
import {
  FileText, Plus, PanelLeftClose, PanelLeftOpen, PenSquare, Clock,
  Globe, Inbox, Activity, CheckCircle2, AlertTriangle, Search, Trash2,
  Eye, XCircle, ArrowRight, Copy, BarChart3, ImageIcon, Newspaper,
  Upload, MapPin, User, Sparkles
} from 'lucide-react';

/* ─────────────────────────────────────────
   EDIT MODAL
───────────────────────────────────────── */
function EditBeritaModal({ isOpen, berita, onClose, onSubmit }) {
  const [judul,        setJudul]        = useState('');
  const [deskripsi,    setDeskripsi]    = useState('');
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage,  setRemoveImage]  = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    if (berita) {
      setJudul(berita.judul || '');
      setDeskripsi(berita.deskripsi || '');
      setImagePreview(berita.image_url || null);
      setImageFile(null);
      setRemoveImage(false);
      setError(null);
    }
  }, [berita]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!judul.trim() || !deskripsi.trim()) { setError('Judul dan deskripsi wajib diisi.'); return; }
    setSaving(true); setError(null);
    const res = await onSubmit({ judul, deskripsi, remove_image: removeImage }, imageFile);
    setSaving(false);
    if (res.success) onClose(); else setError(res.error || 'Gagal memperbarui berita.');
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* modal header */}
        <div className="bg-gradient-to-r from-[#1e3a8a] to-indigo-600 px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white">
              <PenSquare size={17} />
            </div>
            <div>
              <h3 className="font-black text-white text-base leading-none">Edit Berita</h3>
              <p className="text-indigo-200/60 text-[10px] font-semibold uppercase tracking-widest mt-0.5">Perbarui konten</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-1">
            <XCircle size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3.5 text-sm font-semibold text-red-700">
              <XCircle size={15} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}

          {/* judul */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Judul</label>
            <input
              value={judul}
              onChange={e => setJudul(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3.5 text-slate-800 text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:bg-indigo-50/30 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.08)] transition-all placeholder-slate-300"
              placeholder="Judul berita"
            />
          </div>

          {/* deskripsi */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Deskripsi</label>
            <textarea
              value={deskripsi}
              onChange={e => setDeskripsi(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3.5 text-slate-800 text-sm font-medium h-36 focus:outline-none focus:border-indigo-500 focus:bg-indigo-50/30 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.08)] transition-all resize-none placeholder-slate-300"
              placeholder="Isi berita informasi"
            />
          </div>

          {/* gambar */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Gambar Berita</label>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="image-edit-upload"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-white transition-all">
                  <Upload size={13} /> Ganti Gambar
                </label>
                {imagePreview && (
                  <button type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); setRemoveImage(true); }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 hover:bg-red-100 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-red-600 transition-all">
                    <Trash2 size={13} /> Hapus Gambar
                  </button>
                )}
                <span className="text-[11px] text-slate-400 font-medium">
                  {imageFile ? imageFile.name : imagePreview ? 'Gambar saat ini' : 'Tidak ada gambar'}
                </span>
              </div>
              <input id="image-edit-upload" type="file" accept="image/*" className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0] || null;
                  if (!file) return;
                  if (!file.type.startsWith('image/')) { setError('Hanya file gambar yang diperbolehkan.'); return; }
                  if (file.size > 5 * 1024 * 1024)    { setError('Ukuran gambar maksimal 5MB.'); return; }
                  setError(null); setImageFile(file); setImagePreview(URL.createObjectURL(file)); setRemoveImage(false);
                }}
              />
              {imagePreview && (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Preview</p>
                  <img src={imagePreview} alt="Preview" className="max-h-56 rounded-xl object-contain border border-indigo-200 mx-auto block" />
                </div>
              )}
            </div>
          </div>

          {/* actions */}
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={saving}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all">
              Batal
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-[#172554] text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 disabled:opacity-60">
              {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan…</> : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   DETAIL MODAL
───────────────────────────────────────── */
function DetailBeritaModal({ isOpen, berita, onClose }) {
  if (!isOpen || !berita) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* header */}
        <div className="bg-gradient-to-r from-[#1e3a8a] to-indigo-600 px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white">
              <FileText size={17} />
            </div>
            <h3 className="font-black text-white text-base">Detail Berita</h3>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-1">
            <XCircle size={22} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* image */}
          {berita.image_url && (
            <div className="max-h-72 overflow-hidden">
              <img src={berita.image_url} alt={berita.judul} className="w-full object-cover" />
            </div>
          )}

          <div className="p-8 space-y-5">
            {/* meta */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-black px-3 py-1.5 rounded-lg border border-indigo-100 uppercase tracking-widest">
                <MapPin size={10} /> Kec. {berita.kecamatan?.nama_kecamatan || 'Umum'}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold">
                <Clock size={11} />
                {new Date(berita.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 leading-tight">{berita.judul}</h2>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                <User size={13} className="text-indigo-600" />
              </div>
              <p className="text-xs text-slate-500 font-medium">{berita.profiles?.nama || 'Admin'}</p>
            </div>

            <div className="h-px bg-slate-100" />

            <p className="text-slate-700 text-sm leading-loose font-medium whitespace-pre-line">{berita.deskripsi}</p>
          </div>
        </div>

        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-end shrink-0">
          <button onClick={onClose}
            className="bg-indigo-600 hover:bg-[#172554] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-200">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
function BeritaPage() {
  const navigate  = useNavigate();
  const { profile } = useAuth();

  const [berita,        setBerita]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [judul,         setJudul]         = useState('');
  const [deskripsi,     setDeskripsi]     = useState('');
  const [imageFile,     setImageFile]     = useState(null);
  const [imagePreview,  setImagePreview]  = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [message,       setMessage]       = useState(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeMenu,    setActiveMenu]    = useState('berita');
  const [searchTerm,    setSearchTerm]    = useState('');
  const [filterType,    setFilterType]    = useState('all');
  const [selectedEditNews,   setSelectedEditNews]   = useState(null);
  const [isEditModalOpen,    setIsEditModalOpen]    = useState(false);
  const [selectedDeleteNews, setSelectedDeleteNews] = useState(null);
  const [isDeleteModalOpen,  setIsDeleteModalOpen]  = useState(false);
  const [selectedDetailNews, setSelectedDetailNews] = useState(null);
  const [isDetailModalOpen,  setIsDetailModalOpen]  = useState(false);

  const isAdmin     = profile?.role === 'kecamatan' || profile?.role === 'petugas' || profile?.role === 'super_admin';
  const canModerate = profile?.role === 'kecamatan' || profile?.role === 'super_admin';

  const wargaTabs = [
    { id: 'buat',    label: 'Buat Laporan',   icon: PenSquare,    path: '/laporan?tab=buat' },
    { id: 'history', label: 'History Saya',   icon: Clock,        path: '/laporan?tab=history' },
    { id: 'publik',  label: 'Laporan Publik', icon: Globe,        path: '/laporan?tab=publik' },
  ];

  const adminTabsList = [];
  if (profile?.role === 'super_admin')  adminTabsList.push({ id: 'dashboard', label: 'Dashboard Analytics', icon: BarChart3, path: '/laporan?tab=dashboard' });
  if (profile?.role === 'kecamatan')    adminTabsList.push({ id: '__dashboard_kecamatan__', label: 'Dashboard Penugasan', icon: BarChart3, path: '/laporan?tab=__dashboard_kecamatan__' });
  adminTabsList.push(
    { id: 'masuk',    label: 'Laporan Masuk',    icon: Inbox,        path: '/laporan?tab=masuk' },
    { id: 'progress', label: 'Laporan Progress', icon: Activity,     path: '/laporan?tab=progress' },
    { id: 'selesai',  label: 'Laporan Selesai',  icon: CheckCircle2, path: '/laporan?tab=selesai' },
  );
  if (canModerate) {
    adminTabsList.push({ id: 'kendala',  label: 'Kendala Lapangan', icon: AlertTriangle, path: '/laporan?tab=kendala' });
    adminTabsList.push({ id: 'duplikat', label: 'Deteksi Duplikat', icon: Copy,          path: '/laporan?tab=duplikat' });
  }

  const sidebarTabs = [
    { id: 'berita', label: 'Berita', icon: Newspaper, path: '/berita' },
    ...(isAdmin ? adminTabsList : wargaTabs),
  ];

  useEffect(() => {
    const fetchBerita = async () => {
      setLoading(true);
      const res = await getAllBerita();
      setLoading(false);
      if (res.success) setBerita(res.data || []);
      else setError(res.error || 'Gagal memuat berita');
    };
    fetchBerita();
  }, []);

  useEffect(() => {
    return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
  }, [imagePreview]);

  const handleOpenEdit   = (item) => { setSelectedEditNews(item);   setIsEditModalOpen(true); };
  const handleOpenDelete = (item) => { setSelectedDeleteNews(item); setIsDeleteModalOpen(true); };
  const handleOpenDetail = (item) => { setSelectedDetailNews(item); setIsDetailModalOpen(true); };

  const handleUpdateBeritaSubmit = async (payload, imgFile) => {
    const res = await updateBerita(selectedEditNews.id, payload, imgFile);
    if (res.success) { const r = await getAllBerita(); if (r.success) setBerita(r.data || []); }
    return res;
  };

  const handleDeleteBeritaConfirm = async () => {
    if (!selectedDeleteNews) return;
    const res = await deleteBerita(selectedDeleteNews.id);
    setIsDeleteModalOpen(false);
    if (res.success) {
      setSelectedDeleteNews(null);
      setMessage({ type: 'success', text: 'Berita berhasil dihapus.' });
      const r = await getAllBerita(); if (r.success) setBerita(r.data || []);
    } else {
      setMessage({ type: 'error', text: res.error || 'Gagal menghapus berita.' });
    }
  };

  const canModify = (item) => {
    if (profile?.role === 'super_admin') return true;
    if (profile?.role === 'kecamatan' && profile?.kecamatan_id === item.kecamatan_id) return true;
    return false;
  };

  const filteredBerita = berita.filter(item => {
    const q = searchTerm.toLowerCase();
    const matchSearch = item.judul?.toLowerCase().includes(q) || item.deskripsi?.toLowerCase().includes(q);
    if (filterType === 'kecamatan') return matchSearch && item.kecamatan_id === profile?.kecamatan_id;
    return matchSearch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!judul.trim() || !deskripsi.trim()) { setMessage({ type: 'error', text: 'Judul dan deskripsi wajib diisi.' }); return; }
    setSaving(true); setMessage(null);
    const res = await createBerita({ judul, deskripsi }, imageFile);
    setSaving(false);
    if (res.success) {
      setMessage({ type: 'success', text: 'Berita berhasil dibuat.' });
      setJudul(''); setDeskripsi(''); setImageFile(null); setImagePreview(null);
      const r = await getAllBerita(); if (r.success) setBerita(r.data || []);
    } else {
      setMessage({ type: 'error', text: res.error || 'Gagal membuat berita.' });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F6FB]">

      {/* ── SIDEBAR ── */}
      <aside className={`shrink-0 bg-white border-r border-slate-100 pt-6 flex flex-col shadow-sm transition-all duration-300 ease-in-out ${
        sidebarExpanded ? 'w-64 px-4' : 'w-[68px] px-2'
      }`}>
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="flex items-center justify-center w-full mb-4 p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95"
          title={sidebarExpanded ? 'Tutup Sidebar' : 'Buka Sidebar'}
        >
          {sidebarExpanded ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>

        {sidebarExpanded && (
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 mb-3">
            {isAdmin ? 'Admin Panel' : 'Navigasi'}
          </p>
        )}

        <div className="flex flex-col gap-1">
          {sidebarTabs.map((tab, idx) => {
            const Icon = tab.icon;
            const active = activeMenu === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => tab.id === 'berita' ? setActiveMenu(tab.id) : navigate(tab.path)}
                className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-0'} w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title={!sidebarExpanded ? tab.label : undefined}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <Icon size={17} />
                {sidebarExpanded && <span className="whitespace-nowrap">{tab.label}</span>}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 min-w-0 p-6 md:p-10 space-y-6">

        {/* PAGE HEADER */}
        <div className="bg-gradient-to-r from-[#1e3a8a] via-indigo-600 to-blue-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200/40">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-12 -mb-12 pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-lg">
                <Newspaper size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight leading-none">Berita Informasi</h1>
                <p className="text-indigo-200/70 text-sm font-medium mt-1">
                  Informasi terkini untuk masyarakat kecamatan
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 text-center">
                <p className="text-xl font-black leading-none">{berita.length}</p>
                <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest mt-0.5">Total Berita</p>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 text-center">
                <p className="text-xl font-black leading-none">{filteredBerita.length}</p>
                <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest mt-0.5">Ditampilkan</p>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari judul atau isi berita..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50/80 text-slate-800 text-sm pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-200 outline-none focus:border-indigo-500 focus:bg-indigo-50/30 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.08)] transition-all placeholder-slate-300 font-medium"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shrink-0">
            {[
              { id: 'all',       label: 'Semua' },
              ...(profile?.kecamatan_id ? [{ id: 'kecamatan', label: 'Kecamatan Saya' }] : []),
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  filterType === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAMBAH BERITA (admin only) */}
        {isAdmin && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-50 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Plus size={20} />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 tracking-tight">Tambah Berita Baru</h2>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Buat artikel informasi</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {message && (
                <div className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold border ${
                  message.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* judul */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Judul Berita *</label>
                  <input
                    value={judul}
                    onChange={e => setJudul(e.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3.5 text-slate-800 text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:bg-indigo-50/30 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.08)] transition-all placeholder-slate-300"
                    placeholder="Judul berita yang informatif"
                  />
                </div>

                {/* deskripsi */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Deskripsi / Isi Berita *</label>
                  <textarea
                    value={deskripsi}
                    onChange={e => setDeskripsi(e.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3.5 text-slate-800 text-sm font-medium h-36 focus:outline-none focus:border-indigo-500 focus:bg-indigo-50/30 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.08)] transition-all resize-none placeholder-slate-300 leading-relaxed"
                    placeholder="Tulis isi berita secara lengkap dan informatif..."
                  />
                </div>
              </div>

              {/* gambar upload */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Gambar Berita (opsional)</label>
                <div
                  className={`rounded-2xl border-2 border-dashed transition-all duration-200 ${
                    imagePreview
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/20'
                  }`}
                >
                  {imagePreview ? (
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[10px] font-black text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg">
                          <CheckCircle2 size={12} /> Gambar Dipilih
                        </span>
                        <button type="button"
                          onClick={() => { setImageFile(null); setImagePreview(null); }}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors">
                          <Trash2 size={12} /> Hapus
                        </button>
                      </div>
                      <img src={imagePreview} alt="Preview" className="max-h-56 rounded-xl object-contain border border-emerald-200 mx-auto block" />
                      <label htmlFor="image-upload"
                        className="flex items-center justify-center gap-2 cursor-pointer text-[11px] font-black text-slate-500 hover:text-indigo-600 transition-colors py-2">
                        <Upload size={13} /> Ganti Gambar
                        <input id="image-upload" type="file" accept="image/*" className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0] || null;
                            if (!file) { setImageFile(null); setImagePreview(null); return; }
                            if (!file.type.startsWith('image/')) { setMessage({ type: 'error', text: 'Hanya file gambar yang diperbolehkan.' }); e.target.value = ''; return; }
                            if (file.size > 5 * 1024 * 1024)    { setMessage({ type: 'error', text: 'Ukuran gambar maksimal 5MB.' }); e.target.value = ''; return; }
                            setMessage(null); setImageFile(file); setImagePreview(URL.createObjectURL(file));
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <label htmlFor="image-upload" className="flex flex-col items-center justify-center gap-3 cursor-pointer py-10 px-6">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <ImageIcon size={26} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-600">Klik atau drag gambar ke sini</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-1">Format: JPG, PNG · Maks. 5MB</p>
                      </div>
                      <input id="image-upload" type="file" accept="image/*" className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0] || null;
                          if (!file) { setImageFile(null); setImagePreview(null); return; }
                          if (!file.type.startsWith('image/')) { setMessage({ type: 'error', text: 'Hanya file gambar yang diperbolehkan.' }); e.target.value = ''; return; }
                          if (file.size > 5 * 1024 * 1024)    { setMessage({ type: 'error', text: 'Ukuran gambar maksimal 5MB.' }); e.target.value = ''; return; }
                          setMessage(null); setImageFile(file); setImagePreview(URL.createObjectURL(file));
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2.5 bg-indigo-600 hover:bg-[#172554] text-white px-7 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-200/60 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed">
                  {saving
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan…</>
                    : <><Plus size={15} /> Publikasikan Berita</>
                  }
                </button>
              </div>
            </form>
          </div>
        )}

        {/* DAFTAR BERITA */}
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 border-[3px] border-slate-200 rounded-full" />
                <div className="absolute inset-0 border-[3px] border-indigo-600 rounded-full border-t-transparent animate-spin" />
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Memuat berita…</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
              <XCircle size={40} className="mx-auto text-red-300 mb-3" />
              <p className="font-black text-red-700">{error}</p>
            </div>
          ) : filteredBerita.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm p-16 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Newspaper size={28} className="text-slate-400" />
              </div>
              <p className="font-black text-slate-700 text-base">Belum ada berita</p>
              <p className="text-slate-400 text-sm font-medium mt-1">
                {searchTerm ? 'Tidak ada berita yang cocok dengan pencarian.' : 'Berita informasi akan muncul di sini.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredBerita.map((item, idx) => {
                const hasPermission = canModify(item);
                return (
                  <article
                    key={item.id}
                    className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    {/* admin action buttons */}
                    {hasPermission && (
                      <div className="absolute right-4 top-4 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={e => { e.stopPropagation(); handleOpenEdit(item); }}
                          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-sm text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-lg transition-all hover:scale-110 flex items-center justify-center"
                          title="Edit"
                        >
                          <PenSquare size={15} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleOpenDelete(item); }}
                          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-sm text-red-500 hover:bg-red-500 hover:text-white shadow-lg transition-all hover:scale-110 flex items-center justify-center"
                          title="Hapus"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}

                    {/* thumbnail */}
                    <div
                      className="h-48 overflow-hidden cursor-pointer relative shrink-0"
                      onClick={() => handleOpenDetail(item)}
                    >
                      {item.image_url ? (
                        <>
                          <img
                            src={item.image_url}
                            alt={item.judul}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <span className="text-white text-[11px] font-black flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                              <Eye size={13} /> Baca Selengkapnya
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center group-hover:from-indigo-100 transition-all duration-300">
                          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-300 group-hover:text-indigo-400 transition-colors">
                            <Newspaper size={32} strokeWidth={1.5} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* content */}
                    <div className="p-5 flex-1 flex flex-col gap-3">
                      {/* meta */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1 text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                          <MapPin size={9} />
                          {item.kecamatan?.nama_kecamatan || 'Umum'}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <Clock size={10} />
                          {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      {/* title */}
                      <h3
                        className="text-base font-black text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer"
                        onClick={() => handleOpenDetail(item)}
                      >
                        {item.judul}
                      </h3>

                      {/* excerpt */}
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium flex-1">
                        {item.deskripsi}
                      </p>

                      {/* footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User size={11} className="text-indigo-600" />
                          </div>
                          <span className="text-[11px] text-slate-500 font-semibold">
                            {item.profiles?.nama || 'Admin'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="flex items-center gap-1 text-[11px] font-black text-indigo-600 hover:text-indigo-800 transition-colors group/btn"
                        >
                          Selengkapnya
                          <ArrowRight size={12} className="transition-transform group-hover/btn:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {filteredBerita.length > 0 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Sparkles size={12} className="text-slate-300" />
              <p className="text-[11px] text-slate-400 font-medium">
                Menampilkan {filteredBerita.length} dari {berita.length} berita
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ── MODALS ── */}
      <EditBeritaModal
        isOpen={isEditModalOpen} berita={selectedEditNews}
        onClose={() => { setIsEditModalOpen(false); setSelectedEditNews(null); }}
        onSubmit={handleUpdateBeritaSubmit}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedDeleteNews(null); }}
        onConfirm={handleDeleteBeritaConfirm}
        title="Hapus Berita?"
        message="Tindakan ini tidak dapat dibatalkan. Berita akan dihapus permanen."
      />
      <DetailBeritaModal
        isOpen={isDetailModalOpen} berita={selectedDetailNews}
        onClose={() => { setIsDetailModalOpen(false); setSelectedDetailNews(null); }}
      />
    </div>
  );
}

export default BeritaPage;