import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createBerita, getAllBerita, updateBerita, deleteBerita } from '../services/beritaService';
import { DeleteConfirmModal } from '../components/Modals';
import { FileText, Plus, PanelLeftClose, PanelLeftOpen, PenSquare, Clock, Globe, Inbox, Activity, CheckCircle2, AlertTriangle, Search, Trash2, Eye, XCircle, ArrowRight, Copy, BarChart3 } from 'lucide-react';

function EditBeritaModal({ isOpen, berita, onClose, onSubmit }) {
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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
    if (!judul.trim() || !deskripsi.trim()) {
      setError('Judul dan deskripsi wajib diisi.');
      return;
    }
    setSaving(true);
    setError(null);
    const res = await onSubmit({ judul, deskripsi, remove_image: removeImage }, imageFile);
    setSaving(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Gagal memperbarui berita.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-in-up">
        <div className="bg-indigo-50 border-b border-indigo-100 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PenSquare className="text-indigo-600" size={20} />
            <h3 className="font-black text-slate-800 text-lg">Edit Berita</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XCircle size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Judul</label>
            <input
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Judul berita"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Deskripsi</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-700 text-sm h-40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Isi berita informasi"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Gambar Berita</label>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <label htmlFor="image-edit-upload" className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800">
                  Ganti Gambar
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      setRemoveImage(true);
                    }}
                    className="inline-flex items-center justify-center rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    Hapus Gambar
                  </button>
                )}
                <span className="text-xs text-slate-500 truncate max-w-xs">
                  {imageFile ? imageFile.name : (imagePreview ? 'Gambar saat ini' : 'Tidak ada gambar')}
                </span>
              </div>
              <input
                id="image-edit-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (!file) return;
                  const isValidType = file.type.startsWith('image/');
                  const maxSize = 5 * 1024 * 1024;
                  if (!isValidType) {
                    setError('Hanya file gambar yang diperbolehkan.');
                    return;
                  }
                  if (file.size > maxSize) {
                    setError('Ukuran gambar maksimal 5MB.');
                    return;
                  }
                  setError(null);
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                  setRemoveImage(false);
                }}
                className="hidden"
              />
              {imagePreview && (
                <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 mt-1 flex flex-col items-center">
                  <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-2 self-start">✓ Preview Gambar</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-60 rounded-lg object-contain border border-blue-200"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
              Batal
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-200 flex justify-center items-center gap-2">
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailBeritaModal({ isOpen, berita, onClose }) {
  if (!isOpen || !berita) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-in-up">
        <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="text-indigo-600" size={20} />
            <h3 className="font-black text-slate-800 text-lg">Detail Berita</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XCircle size={24} />
          </button>
        </div>
        <div className="p-8 space-y-6 overflow-y-auto flex-1">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-100">
                Kecamatan {berita.kecamatan?.nama_kecamatan || 'Umum'}
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Clock size={12} />
                {new Date(berita.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight">{berita.judul}</h2>
            <p className="text-slate-400 text-xs mt-1">Ditulis oleh: {berita.profiles?.nama || 'Admin'}</p>
          </div>

          {berita.image_url && (
            <div className="rounded-2xl overflow-hidden border border-slate-100 max-h-96 flex justify-center bg-slate-50">
              <img
                src={berita.image_url}
                alt={berita.judul}
                className="max-h-96 object-contain"
              />
            </div>
          )}

          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{berita.deskripsi}</p>
        </div>
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-200">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

function BeritaPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [berita, setBerita] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeMenu, setActiveMenu] = useState('berita');

  // New state variables for search, filter, and modals
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedEditNews, setSelectedEditNews] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeleteNews, setSelectedDeleteNews] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDetailNews, setSelectedDetailNews] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const isAdmin    = profile?.role === 'kecamatan' || profile?.role === 'petugas' || profile?.role === 'super_admin';
  const canModerate = profile?.role === 'kecamatan' || profile?.role === 'super_admin';

  const wargaTabs = [
    { id: 'buat', label: 'Buat Laporan', icon: PenSquare, path: '/laporan?tab=buat' },
    { id: 'history', label: 'History Saya', icon: Clock, path: '/laporan?tab=history' },
    { id: 'publik', label: 'Laporan Publik', icon: Globe, path: '/laporan?tab=publik' },
  ];

  const adminTabsList = [];
  if (profile?.role === 'super_admin') {
    adminTabsList.push({ id: 'dashboard', label: 'Dashboard Analytics', icon: BarChart3, path: '/laporan?tab=dashboard' });
  }
  if (profile?.role === 'kecamatan') {
    adminTabsList.push({ id: '__dashboard_kecamatan__', label: 'Dashboard Penugasan', icon: BarChart3, path: '/laporan?tab=__dashboard_kecamatan__' });
  }
  adminTabsList.push(
    { id: 'masuk', label: 'Laporan Masuk', icon: Inbox, path: '/laporan?tab=masuk' },
    { id: 'progress', label: 'Laporan Progress', icon: Activity, path: '/laporan?tab=progress' },
    { id: 'selesai', label: 'Laporan Selesai', icon: CheckCircle2, path: '/laporan?tab=selesai' },
  );
  if (canModerate) {
    adminTabsList.push({ id: 'kendala', label: 'Kendala Lapangan', icon: AlertTriangle, path: '/laporan?tab=kendala' });
    adminTabsList.push({ id: 'duplikat', label: 'Deteksi Duplikat', icon: Copy, path: '/laporan?tab=duplikat' });
  }

  const beritaTab = { id: 'berita', label: 'Berita', icon: FileText, path: '/berita' };
  const sidebarTabs = [
    beritaTab,
    ...(isAdmin ? adminTabsList : wargaTabs),
  ];

  const getMenuTitle = () => {
    const menu = sidebarTabs.find((item) => item.id === activeMenu);
    return menu ? menu.label : 'Berita Informasi';
  };

  useEffect(() => {
    const fetchBerita = async () => {
      setLoading(true);
      const res = await getAllBerita();
      setLoading(false);
      if (res.success) {
        setBerita(res.data || []);
      } else {
        setError(res.error || 'Gagal memuat berita');
      }
    };
    fetchBerita();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleOpenEdit = (item) => {
    setSelectedEditNews(item);
    setIsEditModalOpen(true);
  };

  const handleUpdateBeritaSubmit = async (payload, imageFile) => {
    const res = await updateBerita(selectedEditNews.id, payload, imageFile);
    if (res.success) {
      const refresh = await getAllBerita();
      if (refresh.success) setBerita(refresh.data || []);
    }
    return res;
  };

  const handleOpenDelete = (item) => {
    setSelectedDeleteNews(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteBeritaConfirm = async () => {
    if (!selectedDeleteNews) return;
    const res = await deleteBerita(selectedDeleteNews.id);
    setIsDeleteModalOpen(false);
    if (res.success) {
      setSelectedDeleteNews(null);
      setMessage({ type: 'success', text: 'Berita berhasil dihapus.' });
      const refresh = await getAllBerita();
      if (refresh.success) setBerita(refresh.data || []);
    } else {
      setMessage({ type: 'error', text: res.error || 'Gagal menghapus berita.' });
    }
  };

  const handleOpenDetail = (item) => {
    setSelectedDetailNews(item);
    setIsDetailModalOpen(true);
  };

  const canModify = (item) => {
    if (profile?.role === 'super_admin') return true;
    if (profile?.role === 'kecamatan' && profile?.kecamatan_id === item.kecamatan_id) return true;
    return false;
  };

  const filteredBerita = berita.filter((item) => {
    const matchesSearch = 
      item.judul?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'kecamatan') {
      return matchesSearch && item.kecamatan_id === profile?.kecamatan_id;
    }
    return matchesSearch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!judul.trim() || !deskripsi.trim()) {
      setMessage({ type: 'error', text: 'Judul dan deskripsi wajib diisi.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    const res = await createBerita({ judul, deskripsi }, imageFile);
    setSaving(false);
    if (res.success) {
      setMessage({ type: 'success', text: 'Berita berhasil dibuat.' });
      setJudul('');
      setDeskripsi('');
      setImageFile(null);
      setImagePreview(null);
      const refresh = await getAllBerita();
      if (refresh.success) setBerita(refresh.data || []);
    } else {
      setMessage({ type: 'error', text: res.error || 'Gagal membuat berita.' });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
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
          {sidebarTabs.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'berita') {
                  setActiveMenu(tab.id);
                } else {
                  navigate(tab.path);
                }
              }}
              className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-0'} w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 animate-fade-in-up ${activeMenu === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1'}`}
              title={!sidebarExpanded ? tab.label : undefined}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <tab.icon size={17} />
              {sidebarExpanded && <span className="whitespace-nowrap">{tab.label}</span>}
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-6 md:p-10">
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-slate-900">{getMenuTitle()}</h1>
          <p className="text-slate-500">Semua berita terbaru untuk masyarakat kecamatan.</p>
        </div>

        {/* Search Bar & Category Filter */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari berita..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-sm pl-11 pr-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/60 self-start md:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${filterType === 'all' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Semua Berita
            </button>
            {profile?.kecamatan_id && (
              <button
                onClick={() => setFilterType('kecamatan')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${filterType === 'kecamatan' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Kecamatan Saya
              </button>
            )}
          </div>
        </div>

        {isAdmin && (
          <section id="tambah-berita" className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Tambah Berita</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul</label>
                <input
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Judul berita"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Isi berita informasi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gambar (opsional)</label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label htmlFor="image-upload" className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                    Pilih Gambar
                  </label>
                  <span className="text-sm text-slate-500">
                    {imageFile ? imageFile.name : 'Belum ada file dipilih'}
                  </span>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (!file) {
                      setImageFile(null);
                      setImagePreview(null);
                      return;
                    }

                    const isValidType = file.type.startsWith('image/');
                    const maxSize = 5 * 1024 * 1024;
                    if (!isValidType) {
                      setMessage({ type: 'error', text: 'Hanya file gambar yang diperbolehkan.' });
                      e.target.value = '';
                      setImageFile(null);
                      setImagePreview(null);
                      return;
                    }
                    if (file.size > maxSize) {
                      setMessage({ type: 'error', text: 'Ukuran gambar maksimal 5MB.' });
                      e.target.value = '';
                      setImageFile(null);
                      setImagePreview(null);
                      return;
                    }

                    setMessage(null);
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }}
                  className="mt-2 hidden"
                />
              </div>

              {/* Preview Section */}
              <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
                {imagePreview ? (
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-3">✓ Preview Gambar</p>
                    <img
                      src={imagePreview}
                      alt="Preview gambar berita"
                      className="w-full max-h-80 object-contain rounded-lg border border-blue-300"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-blue-600">📸 Preview gambar akan muncul di sini setelah memilih file</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Berita'}
                </button>
                {message && (
                  <p className={message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}>
                    {message.text}
                  </p>
                )}
              </div>
            </form>
          </section>
        )}

        <section id="daftar-berita">
          {loading ? (
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 text-center text-slate-500">
              <div className="w-8 h-8 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2" />
              Memuat berita...
            </div>
          ) : error ? (
            <div className="rounded-3xl bg-red-50 p-6 text-red-700 shadow-sm border border-red-100 text-center font-medium">{error}</div>
          ) : filteredBerita.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200 text-center text-slate-500">
              <FileText size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="font-semibold text-slate-700">Belum ada berita</p>
              <p className="text-xs text-slate-400 mt-1">Tidak ada berita yang cocok dengan kriteria pencarian atau filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBerita.map((item) => {
                const hasPermission = canModify(item);
                return (
                  <article key={item.id} className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative">
                    {/* Action Buttons for Authorized Admins */}
                    {hasPermission && (
                      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(item);
                          }}
                          className="p-2.5 rounded-xl bg-white/90 backdrop-blur-sm text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-md transition-all hover:scale-105"
                          title="Edit Berita"
                        >
                          <PenSquare size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDelete(item);
                          }}
                          className="p-2.5 rounded-xl bg-white/90 backdrop-blur-sm text-red-600 hover:bg-red-600 hover:text-white shadow-md transition-all hover:scale-105"
                          title="Hapus Berita"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}

                    {/* Thumbnail Image */}
                    {item.image_url ? (
                      <div className="h-48 overflow-hidden border-b border-slate-100 relative cursor-pointer" onClick={() => handleOpenDetail(item)}>
                        <img
                          src={item.image_url}
                          alt={item.judul}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <span className="text-white text-xs font-semibold flex items-center gap-1">
                            <Eye size={14} /> Lihat Detail
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 bg-slate-50 border-b border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50/30 transition-colors duration-300 cursor-pointer" onClick={() => handleOpenDetail(item)}>
                        <FileText size={48} className="stroke-[1.5] group-hover:text-indigo-400/40 transition-colors" />
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        {/* Meta Tag & Date */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                            item.kecamatan?.nama_kecamatan 
                              ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/50' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            Kec. {item.kecamatan?.nama_kecamatan || 'Umum'}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                            <Clock size={12} />
                            {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 
                          className="text-lg font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer" 
                          title={item.judul}
                          onClick={() => handleOpenDetail(item)}
                        >
                          {item.judul}
                        </h3>

                        {/* Description Truncated */}
                        <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed whitespace-pre-line">
                          {item.deskripsi}
                        </p>
                      </div>

                      {/* Action Button at the Bottom */}
                      <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          Oleh: <span className="font-semibold text-slate-600">{item.profiles?.nama || 'Admin'}</span>
                        </span>
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 group/btn"
                        >
                          Baca Selengkapnya
                          <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Modals */}
        <EditBeritaModal
          isOpen={isEditModalOpen}
          berita={selectedEditNews}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEditNews(null);
          }}
          onSubmit={handleUpdateBeritaSubmit}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedDeleteNews(null);
          }}
          onConfirm={handleDeleteBeritaConfirm}
          title="Hapus Berita?"
          message="Tindakan ini tidak dapat dibatalkan. Berita akan dihapus permanen."
        />

        <DetailBeritaModal
          isOpen={isDetailModalOpen}
          berita={selectedDetailNews}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedDetailNews(null);
          }}
        />
      </main>
    </div>
  );
}

export default BeritaPage;
