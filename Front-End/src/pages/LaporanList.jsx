import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  getLaporanByUser, 
  deleteLaporan,
  updateLaporanStatus 
} from '../services/laporanService';
import { useAuth } from '../contexts/AuthContext';
import LaporanCard from '../components/LaporanCard';
import { Plus, List, Clock, ChevronRight, Trash2, Inbox, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';

export default function LaporanList() {
  const [laporanSaya, setLaporanSaya] = useState([]);   
  const [laporanMasuk, setLaporanMasuk] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [searchParams] = useSearchParams();
  const { user, profile, loading: authLoading } = useAuth();
  
  const isAdmin = profile?.role === 'kecamatan' || profile?.role === 'petugas' || profile?.role === 'super_admin';
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || (isAdmin ? 'masuk' : 'history'));

  useEffect(() => {
    if (!authLoading) loadData();
  }, [authLoading, searchQuery, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      // ADMIN
      if (isAdmin && profile?.kecamatan_id) {
        const { data: { session } } = await supabase.auth.getSession();

        const res = await fetch(
          `${API_URL}/admin/laporan/kecamatan/${profile.kecamatan_id}?search=${searchQuery}`,
          {
            headers: { Authorization: `Bearer ${session?.access_token}` }
          }
        );

        const json = await res.json();
        if (json.success) setLaporanMasuk(json.data || []);
      }

      // USER
      if (user) {
        const myRes = await getLaporanByUser();
        if (myRes.success) setLaporanSaya(myRes.data || []);
      }

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const handleUpdateStatus = async (id, status) => {
    const ket = window.prompt(`Update status ke ${status}?`);
    if (ket === null) return;

    const { success } = await updateLaporanStatus(id, status, null, ket);
    if (success) loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus laporan?')) return;

    const { success } = await deleteLaporan(id);
    if (success) loadData();
  };

  if (authLoading) {
    return <div className="p-20 text-center">Loading...</div>;
  }

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        {isAdmin ? 'Laporan Masuk' : 'Laporan Saya'}
      </h1>

      {/* SEARCH ADMIN */}
      {isAdmin && (
        <input
          type="text"
          placeholder="Cari laporan..."
          className="border p-2 mb-4 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      )}

      {/* LOADING */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* ADMIN VIEW */}
          {isAdmin ? (
            laporanMasuk.length === 0 ? (
              <p>Tidak ada laporan</p>
            ) : (
              laporanMasuk.map(item => (
                <div key={item.id} className="border p-4 mb-3 rounded">
                  <h3 className="font-bold">{item.deskripsi}</h3>
                  <p>{item.alamat}</p>

                  <button onClick={() => handleUpdateStatus(item.id, 'verified')}>
                    Verifikasi
                  </button>

                  <button onClick={() => handleUpdateStatus(item.id, 'rejected')}>
                    Tolak
                  </button>
                </div>
              ))
            )
          ) : (
            <>
              <Link to="/laporan/baru">
                <button className="bg-indigo-500 text-white px-4 py-2 mb-4 rounded">
                  + Buat Laporan
                </button>
              </Link>

              {laporanSaya.length === 0 ? (
                <p>Belum ada laporan</p>
              ) : (
                laporanSaya.map(item => (
                  <div key={item.id} className="border p-4 mb-3 rounded flex justify-between">
                    <div>
                      <h3>{item.deskripsi}</h3>
                      <p>{item.alamat}</p>
                    </div>

                    <div className="flex gap-2">
                      {item.status === 'pending' && (
                        <button onClick={() => handleDelete(item.id)}>
                          <Trash2 size={18} />
                        </button>
                      )}

                      <Link to={`/laporan/${item.id}`}>
                        <ChevronRight />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}