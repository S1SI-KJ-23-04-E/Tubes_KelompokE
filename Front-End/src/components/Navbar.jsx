import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getNotifikasiPetugas } from '../services/notifikasiService';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [jumlahNotif, setJumlahNotif] = useState(0);

  useEffect(() => {
    if (profile?.role !== 'petugas') return;
    loadNotif();

    // Polling setiap 30 detik supaya badge selalu update
    const interval = setInterval(loadNotif, 30000);
    return () => clearInterval(interval);
  }, [profile]);

  const loadNotif = async () => {
    try {
      const data = await getNotifikasiPetugas();
      const unread = data.filter((item) => !item.is_read);
      setJumlahNotif(unread.length);
    } catch (err) {
      console.error('Gagal memuat notifikasi:', err);
    }
  };

  return (
    <div className="w-full bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-700">
      <h1 className="font-bold text-sm">Sistem Pelaporan Warga</h1>

      <div className="flex items-center gap-4">
        {/* Bell icon — hanya untuk petugas */}
        {profile?.role === 'petugas' && (
          <Link
            to="/notifikasi"
            className="relative p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
            title="Notifikasi"
          >
            <Bell size={20} />
            {jumlahNotif > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] font-black flex items-center justify-center">
                {jumlahNotif > 9 ? '9+' : jumlahNotif}
              </span>
            )}
          </Link>
        )}
      </div>
    </div>
  );
}