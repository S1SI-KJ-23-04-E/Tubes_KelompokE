import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLaporanById, upvoteLaporan, updateLaporanStatus, createKendala } from '../services/laporanService';
import { useAuth } from '../contexts/AuthContext';
import FeedbackForm from '../components/FeedbackForm';
import UploadBuktiModal from '../components/UploadBuktiModal';
import KendalaForm from '../components/KendalaForm';
import { createNotifikasi } from '../services/notifikasiService';
import {
  ArrowLeft, Clock, MapPin, CheckCircle2, User,
  ThumbsUp, AlertTriangle, FileText, Camera, Star,
  ShieldCheck, ArrowUpCircle, XCircle, Share2, Info,
  Wrench, Flag, Ban, AlertCircle, ChevronRight, Inbox,
  MessageSquare
} from 'lucide-react';
import { StatusUpdateModal, AlertModal } from '../components/Modals';
import { supabase } from '../lib/supabase';

/* ─────────────── CONFIGS ─────────────── */
const STATUS_MAP = {
  pending:     { label: 'Menunggu Verifikasi', color: 'bg-amber-100 text-amber-800 border-amber-300',        dot: 'bg-amber-400',   icon: <Clock size={14} />,       badge: 'bg-amber-50 text-amber-700 border-amber-200',     step: 0 },
  verified:    { label: 'Terverifikasi',       color: 'bg-blue-100 text-blue-700 border-blue-300',           dot: 'bg-blue-500',    icon: <ShieldCheck size={14} />, badge: 'bg-blue-50 text-blue-700 border-blue-200',        step: 1 },
  in_progress: { label: 'Sedang Diproses',     color: 'bg-violet-100 text-violet-700 border-violet-300',     dot: 'bg-violet-500',  icon: <Wrench size={14} />,      badge: 'bg-violet-50 text-violet-700 border-violet-200',  step: 2 },
  done:        { label: 'Selesai',             color: 'bg-emerald-100 text-emerald-700 border-emerald-300',  dot: 'bg-emerald-500', icon: <Flag size={14} />,        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', step: 3 },
  selesai:     { label: 'Selesai',             color: 'bg-emerald-100 text-emerald-700 border-emerald-300',  dot: 'bg-emerald-500', icon: <Flag size={14} />,        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', step: 3 },
  rejected:    { label: 'Ditolak',             color: 'bg-red-100 text-red-700 border-red-300',              dot: 'bg-red-500',     icon: <Ban size={14} />,         badge: 'bg-red-50 text-red-700 border-red-200',           step: -1 },
};

const PRIORITY_MAP = {
  high:   { label: 'Prioritas Tinggi', short: 'TINGGI', color: 'bg-red-50 text-red-700 border-red-200',       bar: 'bg-red-500',    dot: 'bg-red-400' },
  medium: { label: 'Prioritas Sedang', short: 'SEDANG', color: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-500',  dot: 'bg-amber-400' },
  low:    { label: 'Prioritas Rendah', short: 'RENDAH', color: 'bg-slate-50 text-slate-600 border-slate-200', bar: 'bg-slate-400',  dot: 'bg-slate-400' },
};

const PROGRESS_STEPS = [
  { key: 'pending',     label: 'Dilaporkan',  icon: FileText },
  { key: 'verified',    label: 'Diverifikasi', icon: ShieldCheck },
  { key: 'in_progress', label: 'Diproses',    icon: Wrench },
  { key: 'done',        label: 'Selesai',      icon: CheckCircle2 },
];

/* ─────────────── PROGRESS BAR ─────────────── */
function ProgressStepper({ status }) {
  const normalizedStatus = status === "selesai" ? "done" : status;
  const currentStep = STATUS_MAP[normalizedStatus]?.step ?? 0;
  if (currentStep === -1) return (
    <div className="flex items-center gap-3 px-1">
      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
        <Ban size={16} className="text-red-500" />
      </div>
      <span className="text-sm font-semibold text-red-600">Laporan Ditolak</span>
    </div>
  );

  return (
    <div className="flex items-center gap-0 w-full">
      {PROGRESS_STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i <= currentStep;
        const active = i === currentStep;
        const upcoming = i > currentStep;
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                done    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' :
                active  ? 'bg-white border-indigo-600 text-indigo-600 shadow-lg shadow-indigo-100 ring-4 ring-indigo-50' :
                          'bg-slate-50 border-slate-200 text-slate-300'
              }`}>
                {done ? <CheckCircle2 size={16} /> : <Icon size={15} />}
              </div>
              <span className={`text-[9px] font-bold tracking-wider uppercase text-center leading-tight hidden sm:block ${
                active ? 'text-indigo-600' : done ? 'text-slate-600' : 'text-slate-300'
              }`}>{step.label}</span>
            </div>
            {i < PROGRESS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all duration-700 ${done ? 'bg-indigo-500' : 'bg-slate-100'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────── STAT CARD ─────────────── */
function StatCard({ icon: Icon, label, value, accent = 'indigo' }) {
  const accents = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  };
  return (
    <div className="flex items-center gap-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accents[accent]}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</p>
        <p className="text-sm font-bold text-slate-800 leading-tight mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}

/* ─────────────── SECTION HEADER ─────────────── */
function SectionHeader({ icon: Icon, title, subtitle, accent = 'indigo' }) {
  const accents = {
    indigo: 'bg-indigo-600 text-white shadow-indigo-200',
    amber:  'bg-amber-500 text-white shadow-amber-200',
    emerald: 'bg-emerald-600 text-white shadow-emerald-200',
    slate:  'bg-slate-700 text-white shadow-slate-200',
    red:    'bg-red-500 text-white shadow-red-200',
  };
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${accents[accent]}`}>
        <Icon size={22} />
      </div>
      <div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">{title}</h2>
        {subtitle && <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ─────────────── MAIN COMPONENT ─────────────── */
export default function LaporanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteLoading, setUpvoteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [kendalaModalOpen, setKendalaModalOpen] = useState(false);
  const [kendalaLoading, setKendalaLoading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const safeStatus = typeof data?.status === 'string' && data.status.trim() ? data.status : 'pending';
  const userKecamatanId = profile?.kecamatan_id || profile?.kecamatan?.id;
  const laporanKecamatanId = data?.kecamatan?.id || data?.kecamatan_id;
  const sameKecamatan = String(userKecamatanId || '') === String(laporanKecamatanId || '');
  const canModerate = profile?.role === 'super_admin' || (profile?.role === 'kecamatan' && sameKecamatan);
  const canWorkAction = profile?.role === 'super_admin' || (sameKecamatan && ['petugas'].includes(profile?.role));
  const isPelapor = String(user?.id || '') === String(data?.pelapor_id || '');
  const isInternalRole = ['petugas', 'kecamatan', 'super_admin'].includes(profile?.role);
  const canSubmitFeedback = Boolean(user) && !isInternalRole && isPelapor;
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'kecamatan' || profile?.role === 'petugas';
  const isDone = data?.status === 'done';

  const [statusModal, setStatusModal] = useState({ open: false, nextStatus: '', statusLabel: '' });
  const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '', type: 'error' });

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    const result = await getLaporanById(id);
    if (result.success) setData(result.data);
    else { 
      setAlertModal({ 
        open: true, 
        title: 'Error', 
        message: 'Laporan tidak ditemukan', 
        type: 'error' 
      });
      setTimeout(() => navigate('/laporan'), 2000);
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

  const handleUpdateStatus = (status) => {
    setStatusModal({ open: true, nextStatus: status, statusLabel: status });
  };

  const submitStatusUpdate = async (keterangan) => {
    setActionLoading(true);
    const { success, error } = await updateLaporanStatus(id, statusModal.nextStatus, null, keterangan);
    if (success) {
      loadData();
      setStatusModal({ open: false, nextStatus: '', statusLabel: '' });
    } else {
      setAlertModal({ open: true, title: 'Gagal', message: error || 'Gagal update status', type: 'error' });
    }
    setActionLoading(false);
  };

  const handleUpdatePriority = async (priority) => {
    try {
      setActionLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api'}/admin/laporan/${id}/prioritas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ prioritas: priority.toLowerCase() })
      });
      loadData();
    } catch (err) { console.error(err); }
    finally { setActionLoading(false); }
  };

  const handleUploadSubmit = async ({ file, catatan: catatanBukti }) => {
    setUploadError(''); setUploadSuccess(''); setActionLoading(true);
    const { success, error } = await updateLaporanStatus(id, 'done', file, catatanBukti);
    setActionLoading(false);
    if (success) { setUploadSuccess('Bukti berhasil dikirim.'); setUploadModalOpen(false); loadData(); }
    else setUploadError(error || 'Gagal mengirim bukti.');
  };

  const handleKendalaSubmit = async (deskripsi) => {
    setKendalaLoading(true);
    const { success, error } = await createKendala(id, deskripsi);
    setKendalaLoading(false);
    if (success) { setKendalaModalOpen(false); loadData(); }
    else alert('Gagal mengirim kendala: ' + (error || 'Error tidak diketahui'));
  };
 const handleKirimReminder = async () => {
  const pesanReminder = prompt(
    'Tulis pesan reminder untuk petugas:',
    `Laporan "${data.deskripsi}" diminta untuk segera ditindaklanjuti.`
  );

  if (!pesanReminder) return;

  try {
    await createNotifikasi({
      laporan_id: data.id,
      pengirim_id: user.id,
      penerima_role: 'petugas',
      judul: 'Peringatan',
      pesan: pesanReminder
    });

    alert('Notifikasi berhasil dikirim');
  } catch (err) {
    console.error(err);
    alert('Gagal mengirim notifikasi');
  }
};

  /* ── LOADING ── */
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-5">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-[3px] border-slate-200 rounded-full"></div>
        <div className="absolute inset-0 border-[3px] border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-slate-800 font-black text-base tracking-tight">Memuat Laporan</p>
        <p className="text-slate-400 text-xs font-medium">Mohon tunggu sebentar…</p>
      </div>
    </div>
  );
  if (!data) return null;

  const statusCfg = STATUS_MAP[data.status] || STATUS_MAP.pending;
  const priorityVal = (['high','medium','low'].includes((data.prioritas || '').toLowerCase())) ? data.prioritas.toLowerCase() : 'low';
  const priorityCfg = PRIORITY_MAP[priorityVal];

  return (
    <div className="min-h-screen bg-[#F4F6FB]">

      {/* ── TOPBAR ── */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-all group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Kembali</span>
          </button>

          <div className="flex-1 flex justify-center">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hidden md:block truncate max-w-xs">
              #{id?.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              onClick={() => navigator.share?.({ title: data.alamat, text: data.deskripsi })}
              title="Bagikan"
            >
              <Share2 size={16} />
            </button>
            <span className={`hidden sm:flex text-[10px] font-black px-3 py-1.5 rounded-lg border items-center gap-1.5 ${statusCfg.badge}`}>
              {statusCfg.icon} {statusCfg.label.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">

        {/* ── HERO CARD ── */}
        <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[420px]">

            {/* IMAGE */}
            <div className="lg:w-[58%] relative bg-slate-100 overflow-hidden min-h-[280px]">
              {data.foto_url ? (
                <>
                  <img
                    src={data.foto_url}
                    alt="Foto kerusakan"
                    onLoad={() => setImgLoaded(true)}
                    className={`w-full h-full object-cover absolute inset-0 transition-all duration-1000 hover:scale-105 ${imgLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}`}
                  />
                  {/* gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  {/* bottom-left meta */}
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
                    <div className="bg-black/50 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10">
                      <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-0.5">Lokasi</p>
                      <p className="text-xs font-bold text-white leading-snug">
                        {data.kecamatan?.nama_kecamatan}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-black ${priorityCfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot} animate-pulse`} />
                      {priorityCfg.short}
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
                  <Camera size={56} strokeWidth={1.2} className="mb-3 opacity-40" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tidak ada foto</p>
                </div>
              )}

              {/* status pill top */}
              <div className="absolute top-4 left-4">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/50 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${statusCfg.dot} ${!isDone ? 'animate-pulse' : ''}`} />
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{statusCfg.label}</span>
                </div>
              </div>
            </div>

            {/* INFO PANEL */}
            <div className="lg:w-[42%] flex flex-col p-7 lg:p-9 border-t lg:border-t-0 lg:border-l border-slate-100">
              {/* title */}
              <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                  {data.judul || data.alamat}
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-2 flex items-center gap-1.5">
                  <MapPin size={13} className="text-indigo-400 shrink-0" />
                  Kel. {data.kelurahan?.nama_kelurahan}, Kec. {data.kecamatan?.nama_kecamatan}
                </p>
              </div>

              {/* stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <StatCard icon={User}  label="Pelapor"         value={data.profiles?.nama || 'Anonim'}  accent="indigo" />
                <StatCard icon={Clock} label="Dilaporkan"      value={new Date(data.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })} accent="violet" />
                <StatCard icon={ThumbsUp} label="Dukungan"     value={`${data.upvote_count || 0} Suara`} accent="amber" />
                <StatCard icon={FileText} label="ID Laporan"   value={`#${id?.slice(0,8).toUpperCase()}`} accent="emerald" />
              </div>

              {/* progress stepper */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-100 p-5 mb-6">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Progress Penanganan</p>
                <ProgressStepper status={data.status} />
              </div>

              {/* upvote button */}
              <div className="mt-auto">
                {profile?.role === 'warga' ? (
                  <>
                    <button
                      onClick={handleUpvote}
                      disabled={upvoteLoading || !user || ['done', 'selesai', 'rejected'].includes(data.status)}
                      className={`w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 ${
                        upvoted
                          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200/60'
                          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/60'
                      }`}
                    >
                      <ThumbsUp size={15} className={upvoted ? 'fill-white' : ''} />
                      {upvoted ? 'Laporan Didukung ✓' : 'Dukung Laporan Ini'}
                    </button>
                    {!user ? (
                      <p className="text-[10px] text-slate-400 text-center mt-2">Login untuk memberikan dukungan</p>
                    ) : ['done', 'selesai', 'rejected'].includes(data.status) ? (
                      <p className="text-[10px] text-slate-400 text-center mt-2">Dukungan ditutup karena laporan telah selesai</p>
                    ) : null}
                  </>
                ) : (
                  <div className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest bg-slate-50 text-slate-400 border border-slate-100">
                    <ThumbsUp size={15} />
                    {data.upvote_count || 0} Dukungan
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── TWO-COL GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: deskripsi */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 p-8">
            <SectionHeader icon={FileText} title="Deskripsi Kerusakan" subtitle="Kesaksian pelapor" accent="indigo" />
            <blockquote className="relative">
              <span className="absolute -top-2 -left-1 text-6xl font-black text-indigo-100 leading-none select-none">"</span>
              <p className="text-base text-slate-700 leading-loose font-medium pl-6 pt-4 italic whitespace-pre-wrap">
                {data.deskripsi}
              </p>
              <span className="text-indigo-100 text-6xl font-black leading-none float-right -mt-4 select-none">"</span>
            </blockquote>

            {data.catatan && (
              <div className="mt-8 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={16} className="text-indigo-600" />
                  <span className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Catatan Admin</span>
                </div>
                <p className="text-sm text-indigo-900 leading-relaxed font-medium">
                  {data.catatan}
                </p>
              </div>
            )}

            {/* inline detail pills */}
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-50">
              <span className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg border ${statusCfg.badge}`}>
                {statusCfg.icon} {statusCfg.label}
              </span>
              <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border ${priorityCfg.color}`}>
                {priorityCfg.label}
              </span>
              <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg border bg-slate-50 text-slate-600 border-slate-200 flex items-center gap-1.5">
                <MapPin size={11} /> {data.kecamatan?.nama_kecamatan}
              </span>
            </div>
          </div>

          {/* RIGHT: meta sidebar */}
          <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 p-8 flex flex-col gap-6">
            <SectionHeader icon={Info} title="Informasi Laporan" subtitle="Detail teknis" accent="slate" />
            <div className="space-y-4 text-sm">
              {[
                { label: 'Kelurahan',   val: data.kelurahan?.nama_kelurahan },
                { label: 'Kecamatan',   val: data.kecamatan?.nama_kecamatan },
                { label: 'Pelapor',     val: data.profiles?.nama || 'Anonim' },
                { label: 'Tanggal',     val: new Date(data.created_at).toLocaleString('id-ID', { dateStyle:'long', timeStyle:'short' }) },
                { label: 'Status',      val: statusCfg.label },
                { label: 'Prioritas',   val: priorityCfg.label },
                { label: 'Dukungan',    val: `${data.upvote_count || 0} suara` },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-start justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">{label}</span>
                  <span className="text-xs font-bold text-slate-700 text-right leading-snug">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ADMIN PANEL ── */}
        {isAdmin && (
          <div className="bg-[#0F172A] rounded-3xl shadow-2xl p-8 lg:p-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-indigo-400 shadow-lg">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">Panel Administrasi</h2>
                  <p className="text-indigo-300/50 text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">Manajemen & Tindak Lanjut</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* priority */}
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ArrowUpCircle size={12} className="text-indigo-400" /> Ubah Prioritas
                  </p>
                  <div className="flex gap-2">
                    {['HIGH', 'LOW'].map(p => (
                      <button
                        key={p}
                        onClick={() => handleUpdatePriority(p)}
                        disabled={actionLoading}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all border ${
                          priorityVal === p.toLowerCase()
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                            : 'bg-slate-800/60 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                        }`}
                      >{p}</button>
                    ))}
                  </div>
                </div>

                {/* actions */}
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Inbox size={12} className="text-indigo-400" /> Tindak Lanjut
                  </p>
                  <div className="space-y-2">
                    {canModerate && data.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdateStatus('verified')} disabled={actionLoading}
                          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-wider">
                          ✓ Verifikasi
                        </button>
                        <button onClick={() => handleUpdateStatus('rejected')} disabled={actionLoading}
                          className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-wider">
                          ✕ Tolak
                        </button>
                      </div>
                    )}
                    {canWorkAction && data.status === 'verified' && (
                      <button onClick={() => handleUpdateStatus('in_progress')} disabled={actionLoading}
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all">
                        ▶ Mulai Perbaikan
                      </button>
                    )}
                    {canWorkAction && data.status === 'in_progress' && (
                      <div className="flex gap-2 pt-1">
                        {!data.bukti && (
                          <button onClick={() => setUploadModalOpen(true)}
                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-[10px] font-black transition-all">
                            <ArrowUpCircle size={14} /> Upload Bukti Selesai
                          </button>
                        )}

                        {canModerate && (
                          <button
                           onClick={handleKirimReminder}
                          className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl text-[10px] font-black transition-all"
  >
                          Kirim Reminder
                        </button>
                        )}
                        {profile?.role === 'petugas' && (
                          <button onClick={() => setKendalaModalOpen(true)}
                            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-amber-600 border border-white/10 hover:border-amber-600 text-white py-3 rounded-xl text-[10px] font-black transition-all">
                            <AlertCircle size={14} /> Lapor Kendala
                          </button>
                        )}
                      </div>
                    )}
                    {canModerate && data.status === 'in_progress' && data.bukti && (
                      <button onClick={() => handleUpdateStatus('done')} disabled={actionLoading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all">
                        ✓ Selesai
                      </button>
                    )}
                    {canModerate && data.status === 'in_progress' && !data.bukti && (
  <div className="space-y-2">
    <button
      onClick={handleKirimReminder}
      className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
    >
      Kirim Reminder ke Petugas
    </button>

    <div className="flex items-center gap-2 bg-slate-800/30 border border-slate-700/40 rounded-xl p-3">
      <XCircle size={14} className="text-slate-600 shrink-0" />
      <p className="text-[10px] text-slate-600 leading-snug">
        Menunggu petugas mengunggah bukti selesai.
      </p>
    </div>
  </div>
)}
                    {canModerate && !['pending', 'in_progress'].includes(data.status) && (
                      <div className="flex items-center gap-2 bg-slate-800/30 border border-slate-700/40 rounded-xl p-3">
                        <XCircle size={14} className="text-slate-600 shrink-0" />
                        <p className="text-[10px] text-slate-600 leading-snug">Laporan sudah diselesaikan.</p>
                      </div>
                    )}
                  </div>
        </div>
              </div>
            </div>
          </div>
        )}

        {/* ── KENDALA ── */}
        {data.kendala && data.kendala.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <SectionHeader icon={AlertCircle} title="Kendala Lapangan" subtitle="Hambatan selama pengerjaan" accent="red" />
              <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
                {data.kendala.length} Kendala
              </span>
            </div>
            <div className="grid gap-3">
              {data.kendala.map((kendala, idx) => (
                <div key={kendala.id} className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-red-100 hover:bg-red-50/30 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-500 flex items-center justify-center shrink-0 group-hover:bg-red-200 transition-colors text-xs font-black">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 leading-relaxed">{kendala.deskripsi}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-2 flex items-center gap-1.5">
                      <Clock size={10} />
                      {new Date(kendala.created_at).toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TIMELINE ── */}
        <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 p-8">
          <SectionHeader icon={Clock} title="Timeline Progress" subtitle="Audit trail & riwayat perubahan" accent="indigo" />

          {data.history && data.history.length > 0 ? (
            <div className="relative">
              {/* vertical line */}
              <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-100" />

              <div className="space-y-1">
                {data.history.map((h, i) => {
                  const hCfg = STATUS_MAP[h.status] || STATUS_MAP.pending;
                  const isLatest = i === 0;
                  return (
                    <div key={h.id} className="flex items-start gap-5 relative group pb-6 last:pb-0">
                      {/* dot */}
                      <div className={`relative z-10 w-10 h-10 rounded-full ${hCfg.dot} flex items-center justify-center shrink-0 border-3 border-white shadow-md text-white transition-transform group-hover:scale-110 ${isLatest ? 'ring-4 ring-offset-2 ring-slate-200' : ''}`}>
                        {hCfg.icon}
                      </div>
                      {/* card */}
                      <div className="flex-1 bg-slate-50/60 hover:bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300 mb-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-lg border w-fit ${hCfg.badge}`}>
                            {hCfg.label}
                          </span>
                          <time className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                            <Clock size={10} />
                            {new Date(h.created_at).toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short' })}
                          </time>
                        </div>
                        {h.catatan && (
                          <div className="flex gap-3 mt-2 pt-3 border-t border-slate-100">
                            <Info size={14} className="text-indigo-300 shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{h.catatan}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Clock size={40} strokeWidth={1} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Belum ada aktivitas tercatat</p>
            </div>
          )}
        </div>

        {/* ── BUKTI SELESAI ── */}
        {data.bukti && (
          <div className="bg-gradient-to-br from-[#064E3B] to-[#065F46] rounded-3xl shadow-2xl p-8 lg:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(52,211,153,0.15),transparent_60%)] pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center">
              <div className="lg:w-[45%] space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300 shadow-xl">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h2 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight">Perbaikan Selesai</h2>
                  <p className="text-emerald-100/60 text-sm font-medium mt-2 leading-relaxed">
                    Infrastruktur telah berhasil dipulihkan. Terima kasih telah berperan aktif.
                  </p>
                </div>
                {data.bukti.keterangan && (
                  <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black text-emerald-400/80 uppercase tracking-widest mb-2">Catatan Tim Lapangan</p>
                    <p className="text-sm font-semibold text-white/90 leading-relaxed italic">"{data.bukti.keterangan}"</p>
                  </div>
                )}
                <div className="flex items-center gap-3 text-emerald-300/60 text-xs font-medium">
                  <CheckCircle2 size={14} />
                  Diselesaikan pada {new Date(data.updated_at || data.created_at).toLocaleDateString('id-ID', { dateStyle:'long' })}
                </div>
              </div>
              <div className="lg:w-[55%] group">
                <div className="relative rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl group-hover:border-white/20 transition-all duration-500">
                  <img
                    src={data.bukti.url_foto}
                    alt="Bukti penyelesaian"
                    className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg">
                    <p className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Foto Bukti Penyelesaian</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FEEDBACK ── */}
        {isDone && profile?.role !== 'petugas' && (
          <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 p-8">
            <SectionHeader icon={Star} title="Penilaian Masyarakat" subtitle="Evaluasi & kepuasan layanan" accent="amber" />

            {data.feedback && data.feedback.length > 0 && (
              <>
                {/* average rating */}
                {(() => {
                  const avg = (data.feedback.reduce((s, f) => s + f.rating, 0) / data.feedback.length).toFixed(1);
                  return (
                    <div className="flex items-center gap-6 p-6 bg-amber-50/50 rounded-2xl border border-amber-100 mb-6">
                      <div className="text-center">
                        <p className="text-4xl font-black text-amber-600">{avg}</p>
                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider">/ 5.0</p>
                      </div>
                      <div>
                        <div className="flex gap-1 mb-1.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={18} className={s <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'} />
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">dari {data.feedback.length} penilaian</p>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {data.feedback.map(fb => (
                    <div key={fb.id} className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 hover:shadow-md hover:bg-white transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={14} className={s <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'} />
                          ))}
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          {new Date(fb.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      {fb.ulasan && (
                        <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{fb.ulasan}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {(!data.feedback || data.feedback.length === 0) && (profile?.role === 'kecamatan' || profile?.role === 'super_admin') && (
              <div className="text-center py-6 text-slate-500 text-sm italic">
                Belum ada penilaian dari pelapor.
              </div>
            )}

            {canSubmitFeedback && (!data.feedback || data.feedback.length === 0) && (
              <div className="bg-gradient-to-br from-indigo-50/40 to-slate-50 p-8 rounded-2xl border border-indigo-100/60 mt-6">
                <FeedbackForm
                  laporanId={data.id}
                  onSubmitted={loadData}
                  currentUserId={user?.id}
                  canSubmit={true}
                />
              </div>
            )}
          </div>
        )}

      </main>

      {/* ── MODALS ── */}
      <UploadBuktiModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSubmit={handleUploadSubmit}
        loading={actionLoading}
        errorMessage={uploadError}
        successMessage={uploadSuccess}
      />

      {kendalaModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setKendalaModalOpen(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="bg-amber-50 border-b border-amber-100 px-8 py-5 flex items-center gap-3">
              <AlertCircle size={20} className="text-amber-600" />
              <h3 className="font-black text-slate-800">Laporkan Kendala</h3>
            </div>
            <div className="p-8">
              <KendalaForm
                onSubmit={handleKendalaSubmit}
                onCancel={() => setKendalaModalOpen(false)}
                loading={kendalaLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom Status & Alert Modals */}
      {statusModal.open && (
        <StatusUpdateModal 
          isOpen={statusModal.open}
          statusLabel={statusModal.statusLabel}
          onClose={() => setStatusModal({ ...statusModal, open: false })}
          onSubmit={submitStatusUpdate}
        />
      )}

      {alertModal.open && (
        <AlertModal 
          isOpen={alertModal.open}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
          onClose={() => setAlertModal({ ...alertModal, open: false })}
        />
      )}
    </div>
  );
}
