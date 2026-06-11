import { useEffect, useState } from 'react';
import {
  getNotifikasiByPetugas,
  markAsRead,
  markAllAsRead,
} from '../services/notifikasiService';

import {
  Bell,
  CheckCheck,
  Inbox,
  Clock3,
} from 'lucide-react';

export default function NotifikasiPetugas() {
  const [notif, setNotif] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotif();
  }, []);

  const loadNotif = async () => {
    setLoading(true);

    try {
      const data = await getNotifikasiByPetugas();
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
        prev.map((item) =>
          item.id === id
            ? { ...item, is_read: true }
            : item
        )
      );
    } catch (err) {
      console.error('Gagal menandai notifikasi:', err);
    }
  };

  const handleBacaSemua = async () => {
    try {
      await markAllAsRead();

      setNotif((prev) =>
        prev.map((item) => ({
          ...item,
          is_read: true,
        }))
      );
    } catch (err) {
      console.error('Gagal menandai semua:', err);
    }
  };

  const unreadCount = notif.filter(
    (item) => !item.is_read
  ).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 rounded-[32px] p-7 shadow-xl text-white mb-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-52 h-52 bg-white/10 rounded-full blur-3xl" />

        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80 font-medium">
              Pusat Informasi
            </p>

            <h1 className="text-3xl font-black mt-1">
              Notifikasi Petugas
            </h1>

            <p className="mt-2 text-sm text-white/80 max-w-md">
              Pantau seluruh pemberitahuan dan informasi
              terbaru dari admin secara real-time.
            </p>
          </div>

          <div className="hidden md:flex w-20 h-20 rounded-3xl bg-white/20 backdrop-blur items-center justify-center">
            <Bell size={36} />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-3xl p-5 text-white shadow-lg">
          <p className="text-xs uppercase tracking-widest text-white/80">
            Total Notifikasi
          </p>

          <h2 className="text-4xl font-black mt-2">
            {notif.length}
          </h2>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Belum Dibaca
          </p>

          <h2 className="text-4xl font-black mt-2 text-indigo-600">
            {unreadCount}
          </h2>
        </div>
      </div>

      {/* Action */}
      {unreadCount > 0 && (
        <div className="flex justify-end mb-5">
          <button
            onClick={handleBacaSemua}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-md hover:shadow-lg"
          >
            <CheckCheck size={16} />
            Tandai Semua Dibaca
          </button>
        </div>
      )}

      {/* Empty State */}
      {notif.length === 0 && (
        <div className="bg-white rounded-[32px] border border-dashed border-slate-300 p-16 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-indigo-50 mx-auto flex items-center justify-center mb-4">
            <Inbox size={40} className="text-indigo-500" />
          </div>

          <h3 className="font-black text-slate-700 text-lg">
            Tidak Ada Notifikasi
          </h3>

          <p className="text-slate-400 mt-2">
            Semua informasi dan pemberitahuan dari admin
            akan muncul di sini.
          </p>
        </div>
      )}

      {/* List Notifikasi */}
      <div className="space-y-4">
        {notif.map((item) => (
          <div
            key={item.id}
            className={`rounded-[28px] border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
              item.is_read
                ? 'bg-white border-slate-200 shadow-sm'
                : 'bg-gradient-to-r from-indigo-50 via-white to-white border-indigo-200 shadow-md shadow-indigo-100'
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex gap-4 flex-1">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    item.is_read
                      ? 'bg-slate-100'
                      : 'bg-indigo-100'
                  }`}
                >
                  <Bell
                    size={20}
                    className={
                      item.is_read
                        ? 'text-slate-500'
                        : 'text-indigo-600'
                    }
                  />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-black text-slate-800 text-base">
                      {item.judul}
                    </h3>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                        item.is_read
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {item.is_read
                        ? 'Sudah Dibaca'
                        : 'Baru'}
                    </span>
                  </div>

                  {item.laporan?.judul && (
                    <div className="inline-flex items-center bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold mb-2">
                      📄 {item.laporan.judul}
                    </div>
                  )}

                  <p className="text-slate-600 leading-relaxed">
                    {item.pesan}
                  </p>

                  {item.pengirim?.nama && (
                    <p className="text-xs text-slate-400 mt-3">
                      Dari :{' '}
                      <span className="font-semibold">
                        {item.pengirim.nama}
                      </span>
                    </p>
                  )}

                  <div className="mt-3 inline-flex items-center gap-2 bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full text-xs font-semibold">
                    <Clock3 size={12} />

                    {new Date(
                      item.created_at
                    ).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>

              {!item.is_read && (
                <button
                  onClick={() => handleBaca(item.id)}
                  className="shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md"
                >
                  <CheckCheck size={14} />
                  Dibaca
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}