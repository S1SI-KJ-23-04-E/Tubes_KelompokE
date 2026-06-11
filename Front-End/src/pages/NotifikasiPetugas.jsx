import { useEffect, useState } from 'react';
import { getNotifikasiByPetugas, markAsRead, markAllAsRead } from '../services/notifikasiService';
import { Bell, CheckCheck, Inbox } from 'lucide-react';

export default function NotifikasiPetugas() {
  const [notif, setNotif]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotif();
  }, []);

  const loadNotif = async () => {
    setLoading(true);
    try {
      const data = await getNotifikasiByPetugas(); // tidak perlu userId
      setNotif(data);
    } catch (err) {
      console.error('Gagal memuat notifikasi:', err);
    }
    setLoading(false);
  };

  const handleBaca = async (id) => {
    try {
      await markAsRead(id);
      setNotif((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
      );
    } catch (err) {
      console.error('Gagal menandai notifikasi:', err);
    }
  };

  const handleBacaSemua = async () => {
    try {
      await markAllAsRead();
      setNotif((prev) => prev.map((item) => ({ ...item, is_read: true })));
    } catch (err) {
      console.error('Gagal menandai semua:', err);
    }
  };

  const unreadCount = notif.filter((item) => !item.is_read).length;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center relative">
            <Bell size={20} className="text-indigo-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">Notifikasi</h2>
            <p className="text-xs text-slate-400">
              {unreadCount > 0
                ? `${unreadCount} notifikasi belum dibaca`
                : 'Semua notifikasi sudah dibaca'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleBacaSemua}
            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-2 rounded-xl text-xs font-black transition-all"
          >
            <CheckCheck size={13} />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {/* Empty state */}
      {notif.length === 0 && (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 shadow-sm">
          <Inbox size={40} className="mx-auto text-slate-300 mb-2" />
          <p className="font-medium">Belum ada peringatan dari admin.</p>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {notif.map((item) => (
          <div
            key={item.id}
            className={`bg-white border rounded-2xl p-5 shadow-sm transition-all duration-200 ${
              item.is_read
                ? 'border-slate-200 opacity-75'
                : 'border-indigo-200 shadow-indigo-50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                {!item.is_read && (
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="font-black text-slate-800 text-sm">{item.judul}</h3>

                  {item.laporan?.judul && (
                    <p className="text-[11px] text-indigo-500 font-bold mt-0.5">
                      Laporan: {item.laporan.judul}
                    </p>
                  )}

                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.pesan}</p>

                  {item.pengirim?.nama && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Dari: {item.pengirim.nama}
                    </p>
                  )}

                  <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-wider">
                    {new Date(item.created_at).toLocaleString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {!item.is_read && (
                <button
                  onClick={() => handleBaca(item.id)}
                  className="shrink-0 flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all"
                >
                  <CheckCheck size={12} />
                  Tandai Dibaca
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}