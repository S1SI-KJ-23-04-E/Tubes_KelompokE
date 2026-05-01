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

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001/api';

export default function LaporanList() {
  const [laporanSaya, setLaporanSaya] = useState([]);   
  const [laporanMasuk, setLaporanMasuk] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadError, setLoadError] = useState('');
  
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
      setLoadError(err?.message || 'Gagal memuat data dari server.');
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold">{isAdmin ? 'Laporan Masuk' : 'Laporan Saya'}</h1>

        {isAdmin && (
          <div className="relative w-full sm:w-96">
            <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari laporan..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading...</div>
      ) : loadError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
          <p className="font-semibold mb-2">Tidak dapat terhubung ke server backend.</p>
          <p className="text-sm mb-4">Pastikan backend dijalankan di <code className="bg-white px-2 py-1 rounded">http://localhost:8001</code>.</p>
          <p className="text-xs text-slate-500">Error: {loadError}</p>
        </div>
      ) : (
        <>
          {isAdmin ? (
            laporanMasuk.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
                Tidak ada laporan
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {laporanMasuk.map(item => (
                  <LaporanCard
                    key={item.id}
                    laporan={item}
                    isAdmin
                    actionButtons={[
                      <button
                        key="verify"
                        onClick={() => handleUpdateStatus(item.id, 'verified')}
                        className="text-xs text-white bg-green-600 px-3 py-2 rounded-lg hover:bg-green-700 transition"
                      >
                        Verifikasi
                      </button>,
                      <button
                        key="reject"
                        onClick={() => handleUpdateStatus(item.id, 'rejected')}
                        className="text-xs text-white bg-red-600 px-3 py-2 rounded-lg hover:bg-red-700 transition"
                      >
                        Tolak
                      </button>
                    ]}
                  />
                ))}
              </div>
            )
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <Link to="/laporan/baru" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition">
                  <Plus className="mr-2" size={18} /> Buat Laporan
                </Link>
              </div>

              {laporanSaya.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
                  Belum ada laporan
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {laporanSaya.map(item => (
                    <LaporanCard
                      key={item.id}
                      laporan={item}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
