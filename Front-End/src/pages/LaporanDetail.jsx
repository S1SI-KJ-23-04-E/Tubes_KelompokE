import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLaporanById, upvoteLaporan, updateLaporanStatus } from '../services/laporanService';
import { useAuth } from '../contexts/AuthContext';
import FeedbackForm from '../components/FeedbackForm';
import { 
  ArrowLeft, Clock, MapPin, CheckCircle2, User, 
  ThumbsUp, Building2, MapPinned, AlertTriangle, 
  FileText, ImageIcon, Camera, Star, ChevronRight, Inbox,
  ShieldCheck, ArrowUpCircle, XCircle, Share2, Info,
  Wrench, Flag, Ban
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';

const STATUS_MAP = {
  pending:     { label: 'Menunggu Verifikasi', color: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-400', icon: <Clock size={16} />, badge: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  verified:    { label: 'Terverifikasi',       color: 'bg-blue-100 text-blue-700 border-blue-300',    dot: 'bg-blue-500',  icon: <ShieldCheck size={16} />, badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_progress: { label: 'Sedang Diproses',     color: 'bg-purple-100 text-purple-700 border-purple-300', dot: 'bg-purple-500', icon: <Wrench size={16} />, badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  done:        { label: 'Selesai',             color: 'bg-emerald-100 text-emerald-700 border-emerald-300', dot: 'bg-emerald-500', icon: <Flag size={16} />, badge: 'bg-green-50 text-green-700 border-green-200' },
  selesai:     { label: 'Selesai',             color: 'bg-emerald-100 text-emerald-700 border-emerald-300', dot: 'bg-emerald-500', icon: <Flag size={16} />, badge: 'bg-green-50 text-green-700 border-green-200' },
  rejected:    { label: 'Ditolak',             color: 'bg-red-100 text-red-700 border-red-300',       dot: 'bg-red-500',   icon: <Ban size={16} />, badge: 'bg-red-50 text-red-700 border-red-200' },
};

const PRIORITY_MAP = {
  high:   { label: 'Tinggi', color: 'bg-red-50 text-red-700 border-red-200' },
  medium: { label: 'Sedang', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  low:    { label: 'Rendah', color: 'bg-slate-50 text-slate-600 border-slate-200' },
};

export default function LaporanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteLoading, setUpvoteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    const result = await getLaporanById(id);
    if (result.success) {
      setData(result.data);
     // if (user) {
        //const uvRes = await checkUserUpvoted(id);
        //if (uvRes.success) setUpvoted(uvRes.upvoted);
     // }
    } else {
      alert('Laporan tidak ditemukan');
      navigate('/laporan');
    }
    setLoading(false);
  };

  const handleUpvote = async () => {
    if (upvoteLoading || !user) return;
    setUpvoteLoading(true);
    const res = await upvoteLaporan(id);
    if (res.success) {
      setUpvoted(res.upvoted);
      setData(prev => ({ ...prev, upvote_count: res.upvote_count }));
    }
    setUpvoteLoading(false);
  };

  const handleUpdateStatus = async (status) => {
    const ket = window.prompt(`Update status ke ${status}? Catatan (opsional):`);
    if (ket === null) return;
    
    setActionLoading(true);
    const { success } = await updateLaporanStatus(id, status, null, ket);
    if (success) loadData();
    setActionLoading(false);
  };

  const handleUpdatePriority = async (priority) => {
    try {
      setActionLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${API_URL}/admin/laporan/${id}/prioritas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ prioritas: priority.toLowerCase() })
      });
      loadData();
    } catch (err) { console.error(err); }
    finally { setActionLoading(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <div className="text-center">
        <p className="text-slate-900 font-black text-xl mb-1 tracking-tight">Menyiapkan Detail</p>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Mohon tunggu sebentar...</p>
      </div>
    </div>
  );
  if (!data) return null;

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'kecamatan' || profile?.role === 'petugas';
  const statusCfg = STATUS_MAP[data.status] || STATUS_MAP.pending;
  const priorityVal = (data.prioritas || 'low').toLowerCase();
  const finalPriority = (priorityVal === 'high' || priorityVal === 'low') ? priorityVal : 'low';
  const priorityCfg = PRIORITY_MAP[finalPriority];

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* ===== HEADER NAVIGATION ===== */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-3 text-slate-500 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Kembali
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
              <Share2 size={18} />
            </button>
            <div className="h-6 w-[1px] bg-slate-100 mx-2"></div>
            <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border flex items-center gap-2 ${statusCfg.badge}`}>
              {statusCfg.icon} {statusCfg.label.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        
        {/* ===== HERO SECTION (MODERN SPLIT) ===== */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-12 flex flex-col lg:flex-row min-h-[500px]">
          
          {/* Left: Photo (60%) */}
          <div className="lg:w-[62%] relative bg-slate-100 overflow-hidden">
            {data.foto_url ? (
              <img 
                src={data.foto_url} 
                alt="Foto kerusakan" 
                className="w-full h-full object-cover absolute inset-0 transform hover:scale-105 transition-transform duration-1000"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                <Camera size={80} strokeWidth={1} className="mb-4 opacity-50" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">Foto bukti tidak tersedia</p>
              </div>
            )}
            {/* Status Floating Label */}
            <div className="absolute top-8 left-8">
              <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-2xl border border-white/50 flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${statusCfg.dot} animate-pulse`}></div>
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{statusCfg.label}</span>
              </div>
            </div>
          </div>

          {/* Right: Primary Info (38%) */}
          <div className="lg:w-[38%] p-10 lg:p-12 flex flex-col justify-between bg-white border-l border-slate-50">
            <div className="space-y-8">
              <div>
                <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest mb-6 inline-block ${priorityCfg.color}`}>
                  Prioritas {priorityCfg.label}
                </span>
                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 leading-[1.1] tracking-tight">
                  {data.alamat}
                </h1>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-50 transition-colors shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lokasi Detail</p>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                      Kel. {data.kelurahan?.nama_kelurahan}, Kec. {data.kecamatan?.nama_kecamatan}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-50 transition-colors shrink-0">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Identitas Pelapor</p>
                    <p className="text-sm font-bold text-slate-900">{data.profiles?.nama || 'Warga Anonim'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-50 transition-colors shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Waktu Pelaporan</p>
                    <p className="text-sm font-bold text-slate-500">
                      {new Date(data.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support / Interaction */}
            <div className="mt-12 pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dukungan Publik</p>
                  <p className="text-2xl font-black text-slate-900 leading-none">{data.upvote_count || 0} <span className="text-xs text-slate-400 ml-1 font-bold">Suara</span></p>
                </div>
                <button
                  onClick={handleUpvote}
                  disabled={upvoteLoading || !user}
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${
                    upvoted 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-[0.98]' 
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100 hover:shadow-xl hover:shadow-indigo-100'
                  } disabled:opacity-50`}
                >
                  <ThumbsUp size={16} className={upvoted ? 'fill-white' : ''} />
                  {upvoted ? 'Didukung' : 'Dukung'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== CONTENT GRID ===== */}
        <div className="space-y-12 mb-12">
          
          {/* Deskripsi (Full Width) */}
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/30 border border-slate-100 p-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <FileText size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <FileText size={22} />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Detail Kerusakan</h2>
              </div>
              <div className="bg-slate-50/80 rounded-[1.5rem] p-8 border border-slate-100 relative">
                <div className="absolute -top-3 left-8 bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-tighter">Kesaksian Warga</div>
                <p className="text-slate-700 leading-loose text-[16px] font-medium italic">
                  "{data.deskripsi}"
                </p>
              </div>
            </div>
          </div>

          {/* ADMIN CONSOLE */}
          {isAdmin && (
            <div className="bg-[#0F172A] rounded-[2.5rem] shadow-2xl p-10 text-white relative overflow-hidden group">
              <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[60%] bg-indigo-500/10 rounded-full blur-[100px] group-hover:bg-indigo-500/20 transition-all duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-indigo-400 border border-white/10 shadow-2xl">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Kontrol Administrasi</h2>
                    <p className="text-indigo-300/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Management Dashboard v2.0</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      <ArrowUpCircle size={14} className="text-indigo-400" />
                      Ubah Prioritas
                    </label>
                    <div className="flex gap-3">
                      {['HIGH', 'LOW'].map(p => (
                        <button 
                          key={p}
                          onClick={() => handleUpdatePriority(p)} 
                          className={`flex-1 py-4 rounded-2xl text-[11px] font-black transition-all border-2 ${
                            finalPriority === p.toLowerCase() 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-900/50 scale-[0.98]' 
                              : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-indigo-500/50 hover:text-slate-300'
                          }`}
                        >{p}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      <Inbox size={14} className="text-indigo-400" />
                      Tindakan Lanjutan
                    </label>
                    <div className="space-y-3">
                      {data.status === 'pending' && (
                        <div className="flex gap-3">
                          <button onClick={() => handleUpdateStatus('verified')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-[11px] font-black shadow-lg shadow-blue-900/40 transition-all active:scale-95 uppercase tracking-widest">Verifikasi</button>
                          <button onClick={() => handleUpdateStatus('rejected')} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl text-[11px] font-black shadow-lg shadow-red-900/40 transition-all active:scale-95 uppercase tracking-widest">Tolak</button>
                        </div>
                      )}
                      {data.status === 'verified' && (
                        <button onClick={() => handleUpdateStatus('in_progress')} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl text-[11px] font-black shadow-lg shadow-purple-900/40 transition-all uppercase tracking-widest">Mulai Perbaikan</button>
                      )}
                      {data.status === 'in_progress' && (
                        <button onClick={() => handleUpdateStatus('done')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl text-[11px] font-black shadow-lg shadow-emerald-900/40 transition-all uppercase tracking-widest">Selesaikan Proyek</button>
                      )}
                      {data.status !== 'pending' && (
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-3">
                          <XCircle size={20} className="text-red-500 shrink-0" />
                          <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">Penolakan tidak tersedia setelah tahap verifikasi.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== TIMELINE SECTION ===== */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-100 p-10 lg:p-14 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="flex items-center justify-between mb-16 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                <Clock size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Timeline Progress</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Audit Trail & History</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            {data.history && data.history.length > 0 ? (
              <div className="space-y-12">
                {data.history.map((h, i) => {
                  const hCfg = STATUS_MAP[h.status] || STATUS_MAP.pending;
                  const isLast = i === data.history.length - 1;
                  return (
                    <div key={h.id} className="flex items-center gap-8 md:gap-12 relative group">
                      {/* Vertical line connector - Top half */}
                      {i !== 0 && (
                        <div className="absolute top-0 left-[27px] h-1/2 w-0.5 bg-slate-100 z-0"></div>
                      )}
                      {/* Vertical line connector - Bottom half */}
                      {!isLast && (
                        <div className="absolute top-1/2 left-[27px] h-1/2 w-0.5 bg-slate-100 z-0 group-hover:bg-indigo-100 transition-colors"></div>
                      )}
                      
                      {/* Node Dot with Status-Specific Icon */}
                      <div className={`relative z-10 w-14 h-14 rounded-[1.25rem] ${hCfg.dot} flex items-center justify-center shrink-0 border-4 border-white shadow-2xl transition-all duration-300 group-hover:scale-110 text-white`}>
                        {hCfg.icon}
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 bg-slate-50/50 hover:bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl border uppercase tracking-widest w-fit ${hCfg.badge}`}>
                            {hCfg.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em] flex items-center gap-2">
                            <Clock size={12} />
                            {new Date(h.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                        {h.catatan && (
                          <div className="flex gap-4">
                             <div className="mt-1.5 text-indigo-300">
                                <Info size={16} />
                             </div>
                             <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                                "{h.catatan}"
                             </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                <Clock size={60} strokeWidth={1} className="mx-auto text-slate-200 mb-6" />
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Belum ada aktivitas tercatat</p>
              </div>
            )}
          </div>
        </div>

        {/* ===== PROJECT COMPLETION ===== */}
        {(data.status === 'selesai' || data.status === 'done') && data.bukti && (
          <div className="bg-[#064E3B] rounded-[3rem] shadow-2xl shadow-emerald-900/30 p-10 lg:p-16 mb-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[50%] h-full bg-emerald-500/10 blur-[120px] rounded-full"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-[45%] space-y-10">
                <div className="space-y-6">
                  <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-300 border border-white/20 shadow-2xl">
                    <CheckCircle2 size={40} />
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight italic">Misi Selesai.</h2>
                  <p className="text-emerald-100/70 text-lg font-medium leading-loose">
                    Infrastruktur telah berhasil dipulihkan. Terima kasih telah berperan aktif dalam membangun kota yang lebih baik.
                  </p>
                </div>

                {data.bukti.keterangan && (
                  <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-inner">
                     <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-3">Catatan Final Tim Lapangan</p>
                     <p className="italic font-bold text-xl text-white leading-relaxed">"{data.bukti.keterangan}"</p>
                  </div>
                )}
              </div>
              <div className="lg:w-[55%] relative group">
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-75 group-hover:scale-90 transition-transform duration-1000"></div>
                <div className="relative rounded-[2.5rem] overflow-hidden border-8 border-white/10 shadow-2xl transform group-hover:rotate-1 transition-all duration-700">
                  <img 
                    src={data.bukti.url_foto} 
                    alt="Bukti penyelesaian" 
                    className="w-full aspect-[4/3] object-cover group-hover:scale-110 transition-transform duration-1000" 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== FEEDBACK SECTION ===== */}
        {(data.status === 'selesai' || data.status === 'done') && (
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-100 p-10 lg:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 text-slate-50 opacity-10">
               <Star size={160} />
            </div>
            
            <div className="relative z-10 max-w-4xl mx-auto">
              <div className="flex items-center gap-5 mb-14">
                <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-100">
                  <Star size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Suara Masyarakat</h2>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Evaluasi & Kepuasan Layanan</p>
                </div>
              </div>

              {data.feedback && data.feedback.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                  {data.feedback.map(fb => (
                    <div key={fb.id} className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-500">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-1.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={16} className={s <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'} />
                          ))}
                        </div>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                          {new Date(fb.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      {fb.ulasan && <p className="text-[15px] text-slate-600 font-bold leading-relaxed italic">"{fb.ulasan}"</p>}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="bg-gradient-to-br from-indigo-50/50 to-white p-10 rounded-[2.5rem] border border-indigo-100/50 shadow-inner">
                <FeedbackForm laporanId={data.id} onSubmitted={loadData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

