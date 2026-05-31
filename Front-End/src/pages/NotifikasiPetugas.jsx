import { useEffect, useState } from 'react';
import {
  getNotifikasiPetugas,
  markAsRead
} from '../services/notifikasiService';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotifikasiPetugas() {
  const navigate = useNavigate();
  const [notif, setNotif] = useState([]);
  useEffect(() => {
    loadNotif();
  }, []);

 const loadNotif = async () => {
  const data = await getNotifikasiPetugas();
  setNotif(data);

  const unread = data.filter(item => !item.is_read);

  for (const item of unread) {
    await markAsRead(item.id);
  }
};

  
  const handleBaca = async (id) => {
    await markAsRead(id);
    loadNotif();
  };

  return (
  <div className="p-6">

    <button
  onClick={() => navigate('/laporan')}
  className="mb-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold"
    >
      ← Kembali ke Dashboard
    </button>

    <h1 className="text-2xl font-bold mb-4">
      Notifikasi Petugas
    </h1>

      {notif.length === 0 && (
        <p className="text-slate-500 font-semibold">
          Belum ada notifikasi.
        </p>
      )}

      {notif.map((item) => (
        <div
          key={item.id}
          className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm"
        >
          <h3 className="font-black text-slate-800">
            {item.judul}
          </h3>

          <p className="text-sm text-slate-600 mt-2">
            {item.pesan}
          </p>

          {!item.is_read && (
            <button
              onClick={() => handleBaca(item.id)}
              className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-black"
            >
              Tandai Dibaca
            </button>
          )}
        </div>
      ))}
    </div>
  );
}