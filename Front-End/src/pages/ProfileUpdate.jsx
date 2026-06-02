import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/ProfileService";
import { useAuth } from "../contexts/AuthContext";
import {
  User, MapPin, Phone, Save, Check, AlertCircle,
  ArrowLeft, Edit3, ShieldCheck, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─── Avatar ─── */
function Avatar({ name }) {
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <div className="relative inline-block">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-200 ring-4 ring-white select-none">
        {initials}
      </div>
      <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white shadow-sm" title="Akun aktif" />
    </div>
  );
}

/* ─── Field wrapper ─── */
function Field({ label, required, icon: Icon, error, hint, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
        <Icon size={11} className="text-slate-400" />
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-[11px] text-red-500 font-semibold mt-1.5">
          <AlertCircle size={11} /> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-slate-400 font-medium mt-1.5">{hint}</p>
      )}
    </div>
  );
}

/* ─── Input ─── */
function Input({ icon: Icon, focused, hasError, hasValue, ...props }) {
  return (
    <div className={`relative flex items-center rounded-2xl border-2 transition-all duration-200 ${
      hasError
        ? "border-red-300 bg-red-50/30"
        : focused
        ? "border-indigo-500 bg-indigo-50/30 shadow-[0_0_0_4px_rgba(99,102,241,0.08)]"
        : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
    }`}>
      <div className={`absolute left-4 transition-colors ${
        hasError ? "text-red-400" : focused ? "text-indigo-500" : "text-slate-400"
      }`}>
        <Icon size={15} />
      </div>
      <input
        {...props}
        className="w-full pl-11 pr-4 py-3.5 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-300 outline-none rounded-2xl"
      />
      {hasValue && !hasError && (
        <div className="absolute right-4 text-emerald-500">
          <Check size={14} />
        </div>
      )}
    </div>
  );
}

/* ─── MAIN ─── */
export default function ProfileUpdate() {
  const { user, updateProfileState } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nama: "", alamat: "", no_hp: "" });
  const [original, setOriginal] = useState({ nama: "", alamat: "", no_hp: "" });
  const [focused, setFocused] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [statusMsg, setStatusMsg] = useState("");
  const [touched, setTouched] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const data = await getProfile(user.id);
        const loaded = {
          nama: data?.nama || "",
          alamat: data?.alamat || "",
          no_hp: data?.no_hp || "",
        };
        setForm(loaded);
        setOriginal(loaded);
      } catch {
        setStatus("error");
        setStatusMsg("Gagal memuat data profil.");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setStatus(null);
  };

  /* ── per-field errors (only show after touched) ── */
  const errors = {
    nama:   touched.nama   && !form.nama.trim()                          ? "Nama wajib diisi" : "",
    alamat: touched.alamat && !form.alamat.trim()                        ? "Alamat wajib diisi" : "",
    no_hp:  touched.no_hp  && !form.no_hp.trim()                         ? "Nomor HP wajib diisi"
          : touched.no_hp  && form.no_hp && !/^\d+$/.test(form.no_hp)   ? "Hanya boleh angka"
          : touched.no_hp  && form.no_hp && form.no_hp.length < 10      ? "Minimal 10 digit"
          : "",
  };

  const isValid =
    form.nama.trim() &&
    form.alamat.trim() &&
    form.no_hp.trim() &&
    /^\d+$/.test(form.no_hp) &&
    form.no_hp.length >= 10;

  const isDirty =
    form.nama !== original.nama ||
    form.alamat !== original.alamat ||
    form.no_hp !== original.no_hp;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ nama: true, alamat: true, no_hp: true });
    if (!isValid) return;

    setLoading(true);
    setStatus(null);
    try {
      await updateProfile(user.id, form);
      setStatus("success");
      setStatusMsg("Profil berhasil diperbarui.");
      setOriginal({ ...form });
      
      // Perbarui state lokal di AuthContext supaya nama di navbar ikut berubah tanpa refresh
      if (updateProfileState) {
        updateProfileState({ nama: form.nama, alamat: form.alamat, no_hp: form.no_hp });
      }
    } catch (err) {
      setStatus("error");
      setStatusMsg(err.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setLoading(false);
    }
  };

  /* ── completion percentage ── */
  const completedFields = [form.nama, form.alamat, form.no_hp].filter(Boolean).length;
  const completionPct = Math.round((completedFields / 3) * 100);

  /* ── LOADING STATE ── */
  if (fetchLoading) return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col items-center justify-center gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 border-[3px] border-slate-200 rounded-full" />
        <div className="absolute inset-0 border-[3px] border-indigo-600 rounded-full border-t-transparent animate-spin" />
      </div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Memuat profil…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F6FB]">

      {/* ── TOPBAR ── */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-all group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Kembali</span>
          </button>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Edit Profil</span>
          <div className="w-16" /> {/* spacer */}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* ── PROFILE HERO ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
          {/* cover */}
          <div className="h-24 bg-gradient-to-r from-[#1e3a8a] via-indigo-600 to-blue-500 relative">
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "repeating-linear-gradient(45deg,white 0,white 1px,transparent 0,transparent 50%)", backgroundSize: "12px 12px" }}
            />
          </div>

          <div className="px-7 pb-7">
            {/* avatar + name */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 -mt-12 mb-6">
              <div className="flex items-end gap-4">
                <Avatar name={form.nama} />
                <div className="pb-1">
                  <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                    {form.nama || <span className="text-slate-300 font-medium italic text-base">Belum diisi</span>}
                  </h1>
                  <p className="text-slate-400 text-xs font-medium mt-1">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pb-1">
                <span className="flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-widest">
                  <ShieldCheck size={11} /> Akun Aktif
                </span>
              </div>
            </div>

            {/* completion bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kelengkapan Profil</span>
                <span className={`text-[10px] font-black ${completionPct === 100 ? "text-emerald-600" : "text-amber-500"}`}>
                  {completionPct}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${completionPct === 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              {completionPct < 100 && (
                <p className="text-[10px] text-slate-400 font-medium mt-1.5">
                  Lengkapi semua field di bawah untuk profil 100%
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── FORM CARD ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
          <div className="px-7 py-5 border-b border-slate-50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Edit3 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Perbarui Data</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Informasi pribadi</p>
            </div>
          </div>

          <div className="px-7 py-7">
            {/* global status */}
            {status && (
              <div className={`flex items-start gap-3 rounded-2xl px-4 py-3.5 border mb-6 text-sm font-semibold ${
                status === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}>
                {status === "success"
                  ? <Check size={15} className="shrink-0 mt-0.5" />
                  : <AlertCircle size={15} className="shrink-0 mt-0.5" />
                }
                {statusMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* nama */}
              <Field label="Nama Lengkap" required icon={User} error={errors.nama}>
                <Input
                  icon={User}
                  type="text"
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  onFocus={() => setFocused("nama")}
                  onBlur={() => setFocused("")}
                  placeholder="Masukkan nama lengkap"
                  autoComplete="name"
                  focused={focused === "nama"}
                  hasError={!!errors.nama}
                  hasValue={!!form.nama && !errors.nama}
                />
              </Field>

              {/* alamat */}
              <Field label="Alamat" required icon={MapPin} error={errors.alamat}
                hint="Masukkan alamat domisili saat ini">
                <Input
                  icon={MapPin}
                  type="text"
                  name="alamat"
                  value={form.alamat}
                  onChange={handleChange}
                  onFocus={() => setFocused("alamat")}
                  onBlur={() => setFocused("")}
                  placeholder="Jl. Contoh No. 1, Kelurahan, Kota"
                  autoComplete="street-address"
                  focused={focused === "alamat"}
                  hasError={!!errors.alamat}
                  hasValue={!!form.alamat && !errors.alamat}
                />
              </Field>

              {/* no hp */}
              <Field label="Nomor HP" required icon={Phone} error={errors.no_hp}
                hint="Contoh: 081234567890 (minimal 10 digit, hanya angka)">
                <Input
                  icon={Phone}
                  type="tel"
                  name="no_hp"
                  value={form.no_hp}
                  onChange={handleChange}
                  onFocus={() => setFocused("no_hp")}
                  onBlur={() => setFocused("")}
                  placeholder="081234567890"
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength={15}
                  focused={focused === "no_hp"}
                  hasError={!!errors.no_hp}
                  hasValue={form.no_hp.length >= 10 && /^\d+$/.test(form.no_hp)}
                />
              </Field>

              {/* dirty indicator */}
              {isDirty && !loading && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <p className="text-[11px] text-amber-600 font-semibold">Ada perubahan yang belum disimpan</p>
                </div>
              )}

              {/* submit */}
              <button
                type="submit"
                disabled={loading || !isDirty || !isValid}
                className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm transition-all duration-200 active:scale-[0.98] ${
                  isValid && isDirty && !loading
                    ? "bg-indigo-600 hover:bg-[#172554] text-white shadow-lg shadow-indigo-200/70"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Menyimpan…
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Simpan Perubahan
                  </>
                )}
              </button>

              {(!isDirty || !isValid) && !loading && (
                <p className="text-center text-[10px] text-slate-300 font-medium -mt-2">
                  {!isDirty ? "Tidak ada perubahan untuk disimpan" : "Lengkapi semua field dengan benar"}
                </p>
              )}

            </form>
          </div>
        </div>

      </main>
    </div>
  );
}