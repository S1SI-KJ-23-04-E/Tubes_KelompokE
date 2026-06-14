import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getLaporanByKecamatan, getKendalaByKecamatan } from "../services/laporanService";
import {
  LayoutDashboard, FileText, Clock, CheckCircle2, XCircle,
  AlertTriangle, RefreshCw, MapPin, ChevronRight,
  TrendingUp, Activity, Wrench, Calendar, User, ArrowUpRight,
  BarChart3, InboxIcon
} from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────

// Normalize status: map system statuses to display groups
const normalizeStatus = (status) => {
  if (["done", "selesai"].includes(status))            return "done";
  if (["verified", "in_progress", "proses"].includes(status)) return "proses";
  if (status === "rejected")                           return "rejected";
  return "pending";
};

const STATUS_CONFIG = {
  pending:  { label: "Menunggu",  bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400"   },
  proses:   { label: "Diproses",  bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-500"    },
  done:     { label: "Selesai",   bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  rejected: { label: "Ditolak",  bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500"     },
};

function StatusBadge({ status }) {
  const key = normalizeStatus(status);
  const cfg = STATUS_CONFIG[key] || { label: status, bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return "–";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Baru saja";
  if (mins < 60)  return `${mins} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  return `${days} hari lalu`;
}

function formatDate(dateStr) {
  if (!dateStr) return "–";
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function getDaysOld(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

// ─── Stat Card ─────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, accent = "indigo", pulse = false, onClick }) {
  const accents = {
    indigo:  { iconBg: "bg-indigo-600",  shadow: "shadow-indigo-100",  ring: "ring-indigo-100",  blob: "bg-indigo-50",  arrow: "text-indigo-400 group-hover:text-indigo-600"  },
    amber:   { iconBg: "bg-amber-500",   shadow: "shadow-amber-100",   ring: "ring-amber-100",   blob: "bg-amber-50",   arrow: "text-amber-300 group-hover:text-amber-500"   },
    blue:    { iconBg: "bg-blue-600",    shadow: "shadow-blue-100",    ring: "ring-blue-100",    blob: "bg-blue-50",    arrow: "text-blue-300 group-hover:text-blue-500"    },
    emerald: { iconBg: "bg-emerald-600", shadow: "shadow-emerald-100", ring: "ring-emerald-100", blob: "bg-emerald-50", arrow: "text-emerald-300 group-hover:text-emerald-500" },
    red:     { iconBg: "bg-red-500",     shadow: "shadow-red-100",     ring: "ring-red-100",     blob: "bg-red-50",     arrow: "text-red-300 group-hover:text-red-500"     },
    violet:  { iconBg: "bg-violet-600",  shadow: "shadow-violet-100",  ring: "ring-violet-100",  blob: "bg-violet-50",  arrow: "text-violet-300 group-hover:text-violet-500"  },
  };
  const a = accents[accent] ?? accents.indigo;

  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={`relative bg-white rounded-2xl border border-slate-100 shadow-lg ${a.shadow} p-5 flex flex-col gap-3 overflow-hidden group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 text-left w-full${
        onClick ? " cursor-pointer active:scale-[0.98]" : ""
      }`}
    >
      {/* decorative blob */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 ${a.blob} rounded-full opacity-60 group-hover:scale-110 transition-transform duration-500`} />
      <div className="flex items-start justify-between relative z-10">
        <div className={`w-10 h-10 rounded-xl ${a.iconBg} flex items-center justify-center text-white shadow-md ${a.shadow}`}>
          <Icon size={18} />
        </div>
        <div className="flex items-center gap-1.5">
          {pulse && (
            <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Aktif
            </span>
          )}
          {onClick && (
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-0.5 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 ${a.arrow}`}>
              Lihat <ArrowUpRight size={10} />
            </span>
          )}
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-3xl font-black text-slate-900 leading-none tabular-nums">{value}</p>
        {sub && <p className="text-xs text-slate-400 font-medium mt-1.5">{sub}</p>}
      </div>
    </Tag>
  );
}

// ─── Status Distribution Bar ───────────────────────────────────────────────

function DistributionBar({ stats, total }) {
  const segments = [
    { key: "done",     pct: total > 0 ? (stats.done / total) * 100 : 0,     cls: "bg-emerald-500" },
    { key: "proses",   pct: total > 0 ? (stats.proses / total) * 100 : 0,   cls: "bg-blue-500"    },
    { key: "pending",  pct: total > 0 ? (stats.pending / total) * 100 : 0,  cls: "bg-amber-400"   },
    { key: "rejected", pct: total > 0 ? (stats.rejected / total) * 100 : 0, cls: "bg-red-400"     },
  ];

  return (
    <div className="space-y-3">
      {/* stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 gap-0.5">
        {segments.map(s => s.pct > 0 && (
          <div
            key={s.key}
            className={`${s.cls} h-full transition-all duration-700 first:rounded-l-full last:rounded-r-full`}
            style={{ width: `${s.pct}%` }}
          />
        ))}
      </div>
      {/* legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {[
          { label: "Selesai",  count: stats.done,     dot: "bg-emerald-500" },
          { label: "Diproses", count: stats.proses,   dot: "bg-blue-500"    },
          { label: "Menunggu", count: stats.pending,  dot: "bg-amber-400"   },
          { label: "Ditolak",  count: stats.rejected, dot: "bg-red-400"     },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${l.dot}`} />
            <span className="text-[11px] font-semibold text-slate-500">{l.label}</span>
            <span className="text-[11px] font-black text-slate-800">{l.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle, accent = "indigo", action }) {
  const cls = accent === "amber"
    ? "bg-amber-500 shadow-amber-200"
    : accent === "red"
    ? "bg-red-500 shadow-red-200"
    : "bg-indigo-600 shadow-indigo-200";

  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${cls}`}>
          <Icon size={18} />
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-900 tracking-tight leading-none">{title}</h2>
          {subtitle && <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
      <Icon size={36} strokeWidth={1.2} />
      <p className="text-sm font-semibold">{message}</p>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function AdminKecamatanDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [laporan, setLaporan]       = useState([]);
  const [kendala, setKendala]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab]   = useState("laporan"); // "laporan" | "kendala"

  const kecamatanId   = profile?.kecamatan?.id || profile?.kecamatan_id;
  const kecamatanNama = profile?.kecamatan?.nama_kecamatan || "Kecamatan";

  const fetchData = useCallback(async () => {
    if (!kecamatanId) return;
    try {
      setLoading(true);
      setError("");
      const [lapRes, kendalaRes] = await Promise.all([
        getLaporanByKecamatan(kecamatanId),
        getKendalaByKecamatan(kecamatanId),
      ]);
      if (lapRes.success)     setLaporan(lapRes.data ?? []);
      else throw new Error(lapRes.error || "Gagal mengambil laporan");
      if (kendalaRes.success) setKendala(kendalaRes.data ?? []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal mengambil data dashboard");
    } finally {
      setLoading(false);
    }
  }, [kecamatanId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── computed stats (using normalizeStatus for all real system statuses) ──
  const stats = {
    total:    laporan.length,
    pending:  laporan.filter(l => normalizeStatus(l.status) === "pending").length,
    proses:   laporan.filter(l => normalizeStatus(l.status) === "proses").length,
    done:     laporan.filter(l => normalizeStatus(l.status) === "done").length,
    rejected: laporan.filter(l => normalizeStatus(l.status) === "rejected").length,
  };

  const completionRate = stats.total > 0
    ? Math.round((stats.done / stats.total) * 100)
    : 0;

  const recentLaporan = [...laporan].slice(0, 10);

  // laporan pending/proses yang sudah > 3 hari
  const overdue = laporan.filter(
    l => ["pending","verified","in_progress","proses"].includes(l.status) && getDaysOld(l.created_at) >= 3
  );

  // ── Loading ──
  if (loading && laporan.length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 border-[3px] border-slate-200 rounded-full" />
        <div className="absolute inset-0 border-[3px] border-indigo-600 rounded-full border-t-transparent animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-slate-800 font-black text-sm tracking-tight">Memuat Dashboard</p>
        <p className="text-slate-400 text-xs font-medium mt-1">Mengambil data kecamatan {kecamatanNama}…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F6FB]">

      {/* ── TOPBAR ── */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <LayoutDashboard size={15} className="text-white" />
            </div>
            <div>
              <span className="font-black text-slate-800 text-sm tracking-tight">Dashboard Penugasan</span>
              <span className="hidden sm:inline text-[11px] text-slate-400 font-semibold ml-2">· Kec. {kecamatanNama}</span>
              {lastUpdated && (
                <span className="hidden md:inline text-[10px] text-slate-400 font-medium ml-3">
                  Diperbarui {lastUpdated.toLocaleTimeString("id-ID", { timeStyle: "short" })}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-7">

        {/* ── ERROR ── */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
            <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700">{error}</p>
              <button onClick={fetchData} className="text-xs text-red-500 underline mt-1 font-medium">Coba lagi</button>
            </div>
          </div>
        )}

        {/* ── OVERDUE ALERT ── */}
        {overdue.length > 0 && (
          <div className="flex items-center gap-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl px-5 py-4 text-white shadow-lg shadow-amber-200/50">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black">
                {overdue.length} laporan belum tertangani lebih dari 3 hari!
              </p>
              <p className="text-xs text-amber-100 font-medium mt-0.5">
                Segera tindak lanjuti laporan-laporan ini untuk menjaga kualitas pelayanan.
              </p>
            </div>
            <button
              onClick={() => { setActiveTab("overdue"); }}
              className="flex items-center gap-1 text-xs font-black bg-white/20 hover:bg-white/30 px-3 py-2 rounded-xl transition-all shrink-0"
            >
              Lihat <ArrowUpRight size={12} />
            </button>
          </div>
        )}

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Total Laporan"
            value={stats.total}
            sub={`Di Kec. ${kecamatanNama}`}
            accent="indigo"
          />
          <StatCard
            icon={Clock}
            label="Menunggu"
            value={stats.pending}
            sub="Belum ditangani"
            accent="amber"
            pulse={stats.pending > 0}
            onClick={() => navigate("/laporan?tab=masuk")}
          />
          <StatCard
            icon={Activity}
            label="Sedang Diproses"
            value={stats.proses}
            sub="Dalam penanganan"
            accent="blue"
            onClick={() => navigate("/laporan?tab=progress")}
          />
          <StatCard
            icon={CheckCircle2}
            label="Selesai"
            value={stats.done}
            sub={`${completionRate}% tingkat penyelesaian`}
            accent="emerald"
            onClick={() => navigate("/laporan?tab=selesai")}
          />
        </div>

        {/* ── OVERVIEW ROW ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Completion Rate Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl p-5 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-5 -mb-5" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <TrendingUp size={15} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200/80">Tingkat Selesai</span>
              </div>
              <p className="text-5xl font-black leading-none tabular-nums">{completionRate}<span className="text-2xl">%</span></p>
              <p className="text-xs text-indigo-200 font-semibold mt-2">{stats.done} dari {stats.total} laporan terselesaikan</p>
            </div>
          </div>

          {/* Distribution Bar */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-md shadow-violet-200">
                <BarChart3 size={15} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distribusi Status</p>
                <p className="text-sm font-black text-slate-900 leading-tight">Sebaran Laporan</p>
              </div>
            </div>
            {stats.total > 0
              ? <DistributionBar stats={stats} total={stats.total} />
              : <EmptyState icon={BarChart3} message="Belum ada laporan" />
            }
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">

          {/* Tab Bar */}
          <div className="flex border-b border-slate-100">
            {[
              { key: "laporan", label: "Laporan Terbaru",  icon: FileText,  count: recentLaporan.length },
              { key: "kendala", label: "Kendala Masuk",    icon: Wrench,    count: kendala.length },
              { key: "overdue", label: "Perlu Perhatian",  icon: AlertTriangle, count: overdue.length },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-black transition-all border-b-2 ${
                  activeTab === t.key
                    ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <t.icon size={13} />
                <span className="hidden sm:inline">{t.label}</span>
                {t.count > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    activeTab === t.key
                      ? "bg-indigo-600 text-white"
                      : t.key === "overdue"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── TAB: Laporan Terbaru ── */}
          {activeTab === "laporan" && (
            <div>
              {recentLaporan.length === 0
                ? <EmptyState icon={InboxIcon} message="Belum ada laporan di kecamatan ini" />
                : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-50 bg-slate-50/50">
                            <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul</th>
                            <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Pelapor</th>
                            <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Kelurahan</th>
                            <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu</th>
                            <th className="px-5 py-3 w-10" />
                          </tr>
                        </thead>
                        <tbody>
                          {recentLaporan.map((item) => {
                            const isOverdue = ["pending","verified","in_progress","proses"].includes(item.status) && getDaysOld(item.created_at) >= 3;
                            return (
                              <tr
                                key={item.id}
                                className={`border-b border-slate-50 last:border-0 transition-colors ${
                                  isOverdue ? "bg-amber-50/40 hover:bg-amber-50/70" : "hover:bg-slate-50/60"
                                }`}
                              >
                                <td className="px-5 py-3.5 max-w-[220px]">
                                  <div className="flex items-center gap-2">
                                    {isOverdue && <AlertTriangle size={12} className="text-amber-500 shrink-0" />}
                                    <span className="text-sm font-bold text-slate-800 truncate">{item.judul}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">{item.alamat}</p>
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                      <User size={11} className="text-indigo-600" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700 truncate max-w-[100px]">
                                      {item.profiles?.nama || "–"}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                                    <MapPin size={11} className="text-slate-400 shrink-0" />
                                    {item.kelurahan?.nama_kelurahan || "–"}
                                  </div>
                                </td>
                                <td className="px-5 py-3.5">
                                  <StatusBadge status={item.status} />
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                                    <Calendar size={11} />
                                    {formatRelativeTime(item.created_at)}
                                  </div>
                                </td>
                                <td className="px-5 py-3.5">
                                  <Link
                                    to={`/laporan/${item.id}`}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-400 transition-all"
                                  >
                                    <ChevronRight size={14} />
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-slate-50">
                      {recentLaporan.map(item => (
                        <Link
                          key={item.id}
                          to={`/laporan/${item.id}`}
                          className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{item.judul}</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                              {item.kelurahan?.nama_kelurahan} · {formatRelativeTime(item.created_at)}
                            </p>
                          </div>
                          <StatusBadge status={item.status} />
                          <ChevronRight size={14} className="text-slate-400 shrink-0" />
                        </Link>
                      ))}
                    </div>

                    {laporan.length > 10 && (
                      <div className="px-5 py-3.5 border-t border-slate-50 bg-slate-50/50">
                        <Link
                          to="/laporan"
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                          Lihat semua {laporan.length} laporan <ArrowUpRight size={12} />
                        </Link>
                      </div>
                    )}
                  </>
                )
              }
            </div>
          )}

          {/* ── TAB: Kendala Masuk ── */}
          {activeTab === "kendala" && (
            <div>
              {kendala.length === 0
                ? <EmptyState icon={Wrench} message="Tidak ada kendala yang dilaporkan" />
                : (
                  <div className="divide-y divide-slate-50">
                    {kendala.map(item => (
                      <div key={item.id} className="px-5 py-4 hover:bg-slate-50/60 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                            <Wrench size={14} className="text-red-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 leading-snug">
                              {item.deskripsi || "Kendala tidak ada deskripsi"}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                              {item.laporan?.judul && (
                                <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                                  📋 {item.laporan.judul}
                                </span>
                              )}
                              {item.laporan?.alamat && (
                                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                  <MapPin size={10} /> {item.laporan.alamat}
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                <Clock size={10} /> {formatRelativeTime(item.created_at)}
                              </span>
                            </div>
                          </div>
                          {item.laporan_id && (
                            <Link
                              to={`/laporan/${item.laporan_id}`}
                              className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-all"
                            >
                              Detail <ArrowUpRight size={11} />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          )}

          {/* ── TAB: Perlu Perhatian ── */}
          {activeTab === "overdue" && (
            <div>
              {overdue.length === 0
                ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <CheckCircle2 size={36} strokeWidth={1.2} className="text-emerald-400" />
                    <p className="text-sm font-semibold text-emerald-600">Semua laporan tertangani dengan baik! 🎉</p>
                  </div>
                )
                : (
                  <div className="divide-y divide-slate-50">
                    {overdue.map(item => {
                      const days = getDaysOld(item.created_at);
                      return (
                        <div key={item.id} className="px-5 py-4 bg-amber-50/30 hover:bg-amber-50/60 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                              <AlertTriangle size={14} className="text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-bold text-slate-800 truncate">{item.judul}</p>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-100 text-amber-700 border border-amber-200">
                                  {days} hari
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                  <MapPin size={10} /> {item.kelurahan?.nama_kelurahan || "–"}
                                </span>
                                <StatusBadge status={item.status} />
                                <span className="text-[11px] text-slate-400 font-medium">
                                  Dibuat {formatDate(item.created_at)}
                                </span>
                              </div>
                            </div>
                            <Link
                              to={`/laporan/${item.id}`}
                              className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-white bg-amber-500 hover:bg-amber-600 px-2.5 py-1.5 rounded-lg transition-all"
                            >
                              Tindak <ArrowUpRight size={11} />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              }
            </div>
          )}
        </div>

        {/* ── FOOTER STATS ROW ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Laporan Ditolak",  value: stats.rejected, icon: XCircle,     color: "text-red-500",    bg: "bg-red-50"     },
            { label: "Kendala Masuk",    value: kendala.length, icon: Wrench,       color: "text-orange-500", bg: "bg-orange-50"  },
            { label: "Perlu Perhatian",  value: overdue.length, icon: AlertTriangle,color: "text-amber-600",  bg: "bg-amber-50"   },
            { label: "Total Kelurahan",  value: [...new Set(laporan.map(l => l.kelurahan_id).filter(Boolean))].length, icon: MapPin, color: "text-indigo-500", bg: "bg-indigo-50" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3 flex items-center gap-3 border border-slate-100`}>
              <s.icon size={18} className={s.color} />
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{s.label}</p>
                <p className="text-xl font-black text-slate-800 tabular-nums">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
