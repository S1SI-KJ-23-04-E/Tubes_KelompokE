import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createBerita, getAllBerita } from '../services/beritaService';
import { FileText, Plus, PanelLeftClose, PanelLeftOpen, PenSquare, Clock, Globe, Inbox, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';

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

  const isAdmin = profile?.role === 'kecamatan' || profile?.role === 'super_admin';

  const wargaTabs = [
    { id: 'buat', label: 'Buat Laporan', icon: PenSquare, path: '/laporan?tab=buat' },
    { id: 'history', label: 'History Saya', icon: Clock, path: '/laporan?tab=history' },
    { id: 'publik', label: 'Laporan Publik', icon: Globe, path: '/laporan?tab=publik' },
  ];
  const adminTabsList = [
    { id: 'masuk', label: 'Laporan Masuk', icon: Inbox, path: '/laporan?tab=masuk' },
    { id: 'progress', label: 'Laporan Progress', icon: Activity, path: '/laporan?tab=progress' },
    { id: 'selesai', label: 'Laporan Selesai', icon: CheckCircle2, path: '/laporan?tab=selesai' },
  ];
  if (isAdmin) {
    adminTabsList.push({ id: 'kendala', label: 'Kendala Lapangan', icon: AlertTriangle });
  }

  const sidebarTabs = [
    { id: 'berita', label: 'Berita Informasi', icon: FileText },
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
      <aside className={`shrink-0 bg-white border-r border-slate-100 pt-6 flex flex-col shadow-sm transition-all duration-300 ease-in-out ${sidebarExpanded ? 'w-64 px-4' : 'w-[68px] px-2'}`}>
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="flex items-center justify-center w-full mb-4 p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 active:scale-95"
          title={sidebarExpanded ? 'Tutup Sidebar' : 'Buka Sidebar'}
        >
          {sidebarExpanded ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>

        {sidebarExpanded && (
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-3">Admin Panel</p>
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
              className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-0'} w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeMenu === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1'}`}
              title={!sidebarExpanded ? tab.label : undefined}
              style={{ animationDelay: `${idx * 40}ms` }}
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
                <div className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
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

          <section id="daftar-berita" className="space-y-4">
            {loading ? (
              <div className="rounded-3xl bg-white p-6 shadow-sm">Memuat berita...</div>
            ) : error ? (
              <div className="rounded-3xl bg-red-50 p-6 text-red-700 shadow-sm">{error}</div>
            ) : berita.length === 0 ? (
              <div className="rounded-3xl bg-white p-6 shadow-sm">Belum ada berita.</div>
            ) : (
              berita.map((item) => (
                <article key={item.id} className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div>
                      <h2 className="text-xl font-bold mb-2">{item.judul}</h2>
                      <p className="text-sm text-slate-500 mb-2">{item.kecamatan?.nama_kecamatan || 'Umum'} · {new Date(item.created_at).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.judul}
                      className="rounded-3xl mt-4 max-h-72 w-full object-cover border border-slate-200"
                    />
                  )}
                  <p className="text-slate-700 whitespace-pre-line mt-4">{item.deskripsi}</p>
                </article>
              ))
            )}
          </section>
        </main>
      </div>
  );
}

export default BeritaPage;
