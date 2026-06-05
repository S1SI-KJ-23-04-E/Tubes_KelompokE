import { useEffect, useState } from "react";
import { getPerformanceDashboard } from "../services/dashboardService";
import {
  BarChart2, Clock, MapPin, Zap, AlertTriangle,
  TrendingUp, TrendingDown, RefreshCw, Award,
  ChevronUp, ChevronDown, Minus, Activity,
  CheckCircle2, FileText, Timer
} from "lucide-react";

/* ─── helpers ─── */
const formatDuration = (hours) => {
  const h = parseFloat(hours) || 0;
  if (h < 1) return `${Math.round(h * 60)} menit`;
  if (h < 24) return `${h.toFixed(1)} jam`;
  return `${(h / 24).toFixed(1)} hari`;
};

const getRankBadge = (index) => {
  if (index === 0) return { bg: "bg-amber-400",  text: "text-white", label: "🥇" };
  if (index === 1) return { bg: "bg-slate-400",  text: "text-white", label: "🥈" };
  if (index === 2) return { bg: "bg-amber-600",  text: "text-white", label: "🥉" };
  return { bg: "bg-slate-100", text: "text-slate-500", label: `#${index + 1}` };
};

const getPerformanceColor = (hours, avg) => {
  if (!avg || avg === 0) return { bar: "bg-slate-300", text: "text-slate-500", badge: "bg-slate-50 text-slate-500 border-slate-200" };
  const ratio = hours / avg;
  if (ratio <= 0.7) return { bar: "bg-emerald-500", text: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (ratio <= 1.2) return { bar: "bg-blue-500",    text: "text-blue-600",    badge: "bg-blue-50 text-blue-700 border-blue-200" };
  if (ratio <= 1.8) return { bar: "bg-amber-500",   text: "text-amber-600",   badge: "bg-amber-50 text-amber-700 border-amber-200" };
  return { bar: "bg-red-500", text: "text-red-600", badge: "bg-red-50 text-red-700 border-red-200" };
};

const getPerformanceLabel = (hours, avg) => {
  if (!avg || avg === 0) return "–";
  const ratio = hours / avg;
  if (ratio <= 0.7) return "Cepat";
  if (ratio <= 1.2) return "Normal";
  if (ratio <= 1.8) return "Lambat";
  return "Kritis";
};

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, label, value, sub, accent = "indigo", trend, large = false }) {
  const accents = {
    indigo:  { bg: "bg-indigo-600",  ring: "shadow-indigo-200",  light: "bg-indigo-50",  text: "text-indigo-600" },
    emerald: { bg: "bg-emerald-600", ring: "shadow-emerald-200", light: "bg-emerald-50", text: "text-emerald-600" },
    amber:   { bg: "bg-amber-500",   ring: "shadow-amber-200",   light: "bg-amber-50",   text: "text-amber-600" },
    red:     { bg: "bg-red-500",     ring: "shadow-red-200",     light: "bg-red-50",     text: "text-red-600" },
    violet:  { bg: "bg-violet-600",  ring: "shadow-violet-200",  light: "bg-violet-50",  text: "text-violet-600" },
  };
  const a = accents[accent];
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6 flex flex-col gap-4 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full ${a.light} opacity-40 -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500`} />
      <div className="flex items-start justify-between relative z-10">
        <div className={`w-11 h-11 rounded-2xl ${a.bg} flex items-center justify-center text-white shadow-lg ${a.ring}`}>
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-xl border ${
            trend > 0  ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
            trend < 0  ? "bg-red-50 text-red-600 border-red-100" :
                         "bg-slate-50 text-slate-500 border-slate-100"
          }`}>
            {trend > 0 ? <ChevronUp size={10} /> : trend < 0 ? <ChevronDown size={10} /> : <Minus size={10} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`font-black text-slate-900 leading-none ${large ? "text-4xl" : "text-3xl"}`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 font-medium mt-2">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Section Header ─── */
function SectionHeader({ icon: Icon, title, subtitle, accent = "indigo", action }) {
  const accents = {
    indigo: "bg-indigo-600 shadow-indigo-200",
    amber:  "bg-amber-500 shadow-amber-200",
  };
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg ${accents[accent]}`}>
          <Icon size={20} />
        </div>
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight leading-none">{title}</h2>
          {subtitle && <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ─── MAIN ─── */
export default function SuperAdminDashboard() {
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [sortBy, setSortBy]               = useState("avg"); // "avg" | "total"
  const [sortDir, setSortDir]             = useState("asc");
  const [lastUpdated, setLastUpdated]     = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getPerformanceDashboard();
      setDashboardData(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  /* ── computed ── */
  const totalLaporan = dashboardData.reduce((acc, i) => acc + i.total_laporan, 0);

  const avgDurasi = dashboardData.length > 0
    ? dashboardData.reduce((acc, i) => acc + i.avg_duration_hours, 0) / dashboardData.length
    : 0;

  const sorted = [...dashboardData].sort((a, b) =>
    sortBy === "avg"
      ? sortDir === "asc" ? a.avg_duration_hours - b.avg_duration_hours : b.avg_duration_hours - a.avg_duration_hours
      : sortDir === "asc" ? a.total_laporan - b.total_laporan : b.total_laporan - a.total_laporan
  );

  const fastestKecamatan = dashboardData.length > 0
    ? [...dashboardData].sort((a, b) => a.avg_duration_hours - b.avg_duration_hours)[0]
    : null;

  const slowestKecamatan = dashboardData.length > 0
    ? [...dashboardData].sort((a, b) => b.avg_duration_hours - a.avg_duration_hours)[0]
    : null;

  const maxLaporan = Math.max(...dashboardData.map(d => d.total_laporan), 1);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <Minus size={11} className="text-slate-300" />;
    return sortDir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />;
  };

  /* ── LOADING ── */
  if (loading) return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col items-center justify-center gap-5">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-[3px] border-slate-200 rounded-full" />
        <div className="absolute inset-0 border-[3px] border-indigo-600 rounded-full border-t-transparent animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-slate-800 font-black text-base tracking-tight">Memuat Dashboard</p>
        <p className="text-slate-400 text-xs font-medium mt-1">Mengambil data performa kecamatan…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F6FB]">

      {/* ── TOPBAR ── */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1e3a8a] flex items-center justify-center">
              <BarChart2 size={15} className="text-white" />
            </div>
            <div>
              <span className="font-black text-slate-800 text-sm tracking-tight">Dashboard Super Admin</span>
              {lastUpdated && (
                <span className="hidden sm:inline text-[10px] text-slate-400 font-medium ml-3">
                  Diperbarui {lastUpdated.toLocaleTimeString("id-ID", { timeStyle: "short" })}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">

        {/* ── ERROR ── */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
            <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700">{error}</p>
              <button onClick={fetchDashboard} className="text-xs text-red-500 underline mt-1 font-medium">Coba lagi</button>
            </div>
          </div>
        )}

        {!error && (
          <>
            {/* ── STAT CARDS ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={FileText}
                label="Total Laporan"
                value={totalLaporan.toLocaleString("id-ID")}
                sub={`Dari ${dashboardData.length} kecamatan`}
                accent="indigo"
              />
              <StatCard
                icon={MapPin}
                label="Total Kecamatan"
                value={dashboardData.length}
                sub="Area terpantau"
                accent="violet"
              />
              <StatCard
                icon={Timer}
                label="Rata-rata Durasi"
                value={formatDuration(avgDurasi)}
                sub="Per penyelesaian laporan"
                accent="amber"
              />
              <StatCard
                icon={Activity}
                label="Tingkat Aktivitas"
                value={dashboardData.length > 0 ? `${(totalLaporan / dashboardData.length).toFixed(1)}` : "—"}
                sub="Laporan per kecamatan"
                accent="emerald"
              />
            </div>

            {/* ── HIGHLIGHT CARDS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* fastest */}
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-emerald-200/50">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-6 -mb-6" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                      <Zap size={18} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100/80">Kecamatan Tercepat</span>
                  </div>
                  <p className="text-2xl font-black leading-tight tracking-tight">
                    {fastestKecamatan?.kecamatan || "–"}
                  </p>
                  {fastestKecamatan && (
                    <div className="flex items-center gap-4 mt-3">
                      <div>
                        <p className="text-[10px] text-emerald-200/70 font-semibold uppercase tracking-wider">Avg Durasi</p>
                        <p className="text-sm font-black">{formatDuration(fastestKecamatan.avg_duration_hours)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-emerald-200/70 font-semibold uppercase tracking-wider">Total Laporan</p>
                        <p className="text-sm font-black">{fastestKecamatan.total_laporan}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* slowest */}
              <div className="bg-gradient-to-br from-red-600 to-rose-500 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-red-200/50">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-6 -mb-6" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                      <AlertTriangle size={18} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-100/80">Perlu Perhatian</span>
                  </div>
                  <p className="text-2xl font-black leading-tight tracking-tight">
                    {slowestKecamatan?.kecamatan || "–"}
                  </p>
                  {slowestKecamatan && (
                    <div className="flex items-center gap-4 mt-3">
                      <div>
                        <p className="text-[10px] text-red-200/70 font-semibold uppercase tracking-wider">Avg Durasi</p>
                        <p className="text-sm font-black">{formatDuration(slowestKecamatan.avg_duration_hours)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-red-200/70 font-semibold uppercase tracking-wider">Total Laporan</p>
                        <p className="text-sm font-black">{slowestKecamatan.total_laporan}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── RANKING TABLE ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">

              <div className="px-7 py-5 border-b border-slate-50">
                <SectionHeader
                  icon={Award}
                  title="Ranking Performa Kecamatan"
                  subtitle="Diurutkan berdasarkan kecepatan penyelesaian"
                  accent="indigo"
                  action={
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider hidden sm:block">Urutkan:</span>
                      <button
                        onClick={() => toggleSort("avg")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border ${
                          sortBy === "avg"
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <Clock size={10} /> Durasi
                        <SortIcon col="avg" />
                      </button>
                      <button
                        onClick={() => toggleSort("total")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border ${
                          sortBy === "total"
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <FileText size={10} /> Laporan
                        <SortIcon col="total" />
                      </button>
                    </div>
                  }
                />
              </div>

              {/* desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">Rank</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Kecamatan</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Laporan</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Durasi</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-28">Performa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((item, index) => {
                      const rank    = getRankBadge(index);
                      const perf    = getPerformanceColor(item.avg_duration_hours, avgDurasi);
                      const barPct  = Math.min((item.total_laporan / maxLaporan) * 100, 100);
                      const isTop   = index === 0;
                      return (
                        <tr
                          key={item.kecamatan}
                          className={`border-b border-slate-50 last:border-0 transition-colors ${
                            isTop ? "bg-emerald-50/40" : "hover:bg-slate-50/80"
                          }`}
                        >
                          {/* rank */}
                          <td className="px-6 py-4">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black ${rank.bg} ${rank.text}`}>
                              {rank.label}
                            </div>
                          </td>

                          {/* kecamatan */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <MapPin size={13} className="text-slate-400 shrink-0" />
                              <span className="text-sm font-bold text-slate-800">{item.kecamatan}</span>
                              {isTop && (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                                  Terbaik
                                </span>
                              )}
                            </div>
                          </td>

                          {/* total laporan + mini bar */}
                          <td className="px-6 py-4">
                            <div>
                              <span className="text-sm font-black text-slate-800">{item.total_laporan}</span>
                              <div className="mt-1.5 h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                                  style={{ width: `${barPct}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* durasi */}
                          <td className="px-6 py-4">
                            <span className={`text-sm font-black ${perf.text}`}>
                              {formatDuration(item.avg_duration_hours)}
                            </span>
                          </td>

                          {/* badge performa */}
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase tracking-wider ${perf.badge}`}>
                              {getPerformanceLabel(item.avg_duration_hours, avgDurasi)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* mobile cards */}
              <div className="md:hidden divide-y divide-slate-50">
                {sorted.map((item, index) => {
                  const rank = getRankBadge(index);
                  const perf = getPerformanceColor(item.avg_duration_hours, avgDurasi);
                  return (
                    <div key={item.kecamatan} className="px-5 py-4 flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${rank.bg} ${rank.text}`}>
                        {rank.label}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{item.kecamatan}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {item.total_laporan} laporan · {formatDuration(item.avg_duration_hours)}
                        </p>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border shrink-0 ${perf.badge}`}>
                        {getPerformanceLabel(item.avg_duration_hours, avgDurasi)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* footer legend */}
              <div className="px-7 py-4 border-t border-slate-50 bg-slate-50/50 flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-2">Keterangan:</span>
                {[
                  { label: "Cepat",  badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                  { label: "Normal", badge: "bg-blue-50 text-blue-700 border-blue-200" },
                  { label: "Lambat", badge: "bg-amber-50 text-amber-700 border-amber-200" },
                  { label: "Kritis", badge: "bg-red-50 text-red-700 border-red-200" },
                ].map(({ label, badge }) => (
                  <span key={label} className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${badge}`}>
                    {label}
                  </span>
                ))}
                <span className="text-[10px] text-slate-400 font-medium ml-auto hidden sm:block">
                  Performa relatif terhadap rata-rata {formatDuration(avgDurasi)}
                </span>
              </div>
            </div>

          </>
        )}
      </main>
    </div>
  );
}