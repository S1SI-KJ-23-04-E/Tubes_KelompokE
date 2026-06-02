import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNotifikasiPetugas } from '../services/notifikasiService';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { profile } = useAuth();
  const [jumlahNotif, setJumlahNotif] = useState(0);

  useEffect(() => {
    if (profile?.role === 'petugas') {
      loadNotif();
    }
  }, [profile]);

  const loadNotif = async () => {
    const data = await getNotifikasiPetugas();

    const unread = data.filter(item => !item.is_read);

    setJumlahNotif(unread.length);
  };

  return (
    <div className="w-full bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-700">
      <h1 className="font-bold text-sm">
        Sistem Pelaporan Warga
      </h1>

      {profile?.role === 'petugas' && (
        <Link to="/notifikasi" className="relative cursor-pointer">
          <Bell size={22} />

          {jumlahNotif > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {jumlahNotif}
            </span>
          )}
        </Link>
      )}
    </div>
  );
}