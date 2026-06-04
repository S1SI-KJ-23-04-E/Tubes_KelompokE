import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getKecamatan } from '../services/laporanService';
import {
  Mail, Lock, UserPlus, User, MapPin,
  Eye, EyeOff, AlertCircle, Check, ArrowRight,
  ShieldCheck, Users, FileText, Info
} from 'lucide-react';
import Select from 'react-select';

/* ─────────────────────────────────────────────
   DECORATIVE BACKGROUND
───────────────────────────────────────────── */
function BackgroundDecor() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="grid-reg" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-reg)" />
      <circle cx="8%"   cy="18%" r="110" fill="none" stroke="#e0e7ff" strokeWidth="1" />
      <circle cx="8%"   cy="18%" r="65"  fill="none" stroke="#e0e7ff" strokeWidth="1" />
      <circle cx="93%"  cy="78%" r="160" fill="none" stroke="#dbeafe" strokeWidth="1" />
      <circle cx="93%"  cy="78%" r="95"  fill="none" stroke="#dbeafe" strokeWidth="1" />
      <line x1="0"    y1="52%" x2="22%" y2="74%" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="8 5" />
      <line x1="100%" y1="22%" x2="78%" y2="6%"  stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="8 5" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   PASSWORD STRENGTH
───────────────────────────────────────────── */
function PasswordStrength({ password }) {
  const checks = [
    { label: 'Min. 6 karakter', ok: password.length >= 6 },
    { label: 'Mengandung angka', ok: /\d/.test(password) },
    { label: 'Huruf kapital',   ok: /[A-Z]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const bars  = ['bg-red-400', 'bg-amber-400', 'bg-emerald-500'];
  const label = ['Lemah', 'Sedang', 'Kuat'];

  if (!password) return null;
  return (
    <div className="mt-2.5 space-y-1.5">
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all duration-400 ${
              i < score ? bars[score - 1] : 'bg-slate-100'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {checks.map(c => (
            <span
              key={c.label}
              className={`flex items-center gap-1 text-[10px] font-semibold transition-colors ${
                c.ok ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <Check size={9} className={c.ok ? 'opacity-100' : 'opacity-20'} />
              {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className={`text-[10px] font-black uppercase tracking-wider ${
            score === 1 ? 'text-red-500' : score === 2 ? 'text-amber-500' : 'text-emerald-600'
          }`}>
            {label[score - 1]}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   INPUT WRAPPER
───────────────────────────────────────────── */
function InputWrap({ label, required, optional, icon: Icon, focused, hasError, hasValue, hint, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
        <Icon size={10} className="text-slate-400" />
        {label}
        {required && <span className="text-red-400">*</span>}
        {optional && (
          <span className="text-slate-300 font-medium normal-case tracking-normal text-[10px]">
            (opsional)
          </span>
        )}
      </label>
      <div className={`relative flex items-center rounded-2xl border-2 transition-all duration-200 ${
        hasError
          ? 'border-red-300 bg-red-50/30'
          : focused
          ? 'border-indigo-500 bg-indigo-50/30 shadow-[0_0_0_4px_rgba(99,102,241,0.08)]'
          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
      }`}>
        <div className={`absolute left-4 pointer-events-none transition-colors ${
          hasError ? 'text-red-400' : focused ? 'text-indigo-500' : 'text-slate-400'
        }`}>
          <Icon size={15} />
        </div>
        {children}
        {hasValue && !hasError && (
          <div className="absolute right-4 text-emerald-500 pointer-events-none">
            <Check size={14} />
          </div>
        )}
      </div>
      {hint && (
        <p className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mt-1.5">
          <Info size={9} /> {hint}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Register() {
  const [nama,        setNama]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [kecamatanId, setKecamatanId] = useState('');
  const [kecamatans,  setKecamatans]  = useState([]);
  const [errorMsg,    setErrorMsg]    = useState('');
  const [loading,     setLoading]     = useState(false);
  const [showPass,    setShowPass]    = useState(false);
  const [focused,     setFocused]     = useState('');
  const [touched,     setTouched]     = useState({});
  const [agreeTerms,  setAgreeTerms]  = useState(false);

  const { register } = useAuth();
  const navigate     = useNavigate();

  useEffect(() => {
    getKecamatan().then(data => {
      setKecamatans(data.map(k => ({ value: k.id, label: k.nama_kecamatan })));
    });
  }, []);

  /* ── validasi per-field ── */
  const errors = {
    nama:
      touched.nama && !nama.trim()
        ? 'Nama wajib diisi' : '',
    email:
      touched.email && !email.trim()
        ? 'Email wajib diisi'
        : touched.email && email.trim() && !email.endsWith('@gmail.com')
        ? 'Hanya email @gmail.com yang diizinkan'
        : '',
    password:
      touched.password && password.length < 6
        ? 'Password minimal 6 karakter' : '',
  };

  /* ── progress bar ── */
  const filled = [
    nama.trim(),
    email.trim() && email.endsWith('@gmail.com'),
    password.length >= 6,
  ].filter(Boolean).length;
  const pct = Math.round((filled / 3) * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ nama: true, email: true, password: true, terms: true });

    if (!agreeTerms) return;

    if (!email.endsWith('@gmail.com')) {
      return setErrorMsg('Hanya email dengan domain @gmail.com yang diizinkan.');
    }
    if (password.length < 6) {
      return setErrorMsg('Password minimal 6 karakter.');
    }

    setLoading(true);
    setErrorMsg('');

    const { success, error } = await register(email, password, nama, kecamatanId);
    setLoading(false);

    if (success) {
      // ← TIDAK DIUBAH: redirect ke /login dengan state message, sama seperti kode asli
      navigate('/login', {
        state: { message: 'Pendaftaran berhasil! Silakan login dengan akun yang baru dibuat.' }
      });
    } else {
      setErrorMsg(`Pendaftaran gagal: ${error}`);
    }
  };

  const customFilter = (option, inputValue) =>
    option.label.toLowerCase().startsWith(inputValue.toLowerCase());

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      border: state.isFocused ? '2px solid #6366f1' : '2px solid #e2e8f0',
      borderRadius: '1rem',
      padding: '6px 4px',
      backgroundColor: state.isFocused ? 'rgba(238,242,255,0.3)' : 'rgba(248,250,252,0.5)',
      boxShadow: state.isFocused ? '0 0 0 4px rgba(99,102,241,0.08)' : 'none',
      transition: 'all 0.2s',
      '&:hover': { borderColor: state.isFocused ? '#6366f1' : '#cbd5e1' },
    }),
    placeholder: (base) => ({ ...base, color: '#cbd5e1', fontWeight: 500, fontSize: '0.875rem' }),
    singleValue:  (base) => ({ ...base, color: '#1e293b', fontWeight: 600, fontSize: '0.875rem' }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#eef2ff' : 'white',
      color: state.isSelected ? 'white' : '#1e293b',
      fontWeight: 500,
      fontSize: '0.875rem',
      borderRadius: '0.5rem',
      margin: '2px 4px',
      width: 'calc(100% - 8px)',
    }),
    menu:               (base) => ({ ...base, borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', overflow: 'hidden', padding: '4px' }),
    indicatorSeparator: ()     => ({ display: 'none' }),
    dropdownIndicator:  (base) => ({ ...base, color: '#94a3b8', '&:hover': { color: '#6366f1' } }),
    clearIndicator:     (base) => ({ ...base, color: '#94a3b8', '&:hover': { color: '#ef4444' } }),
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <BackgroundDecor />

      {/* blob accent */}
      <div className="absolute top-[-10%] left-[-8%]  w-72 h-72 rounded-full bg-indigo-100/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-8%] right-[-5%] w-80 h-80 rounded-full bg-blue-100/30  blur-3xl pointer-events-none" />

      {/* ── CARD CONTAINER ── */}
      <div className="relative z-10 w-full max-w-5xl flex items-stretch shadow-2xl shadow-slate-300/40 rounded-[2rem] overflow-hidden">

        {/* ════════════════════
            LEFT PANEL
        ════════════════════ */}
        <div className="hidden lg:flex lg:w-[42%] flex-col justify-between bg-[#1e3a8a] p-10 relative overflow-hidden shrink-0">
          {/* decor circles */}
          <div className="absolute top-0    right-0  w-64 h-64 rounded-full bg-white/5   -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0   w-48 h-48 rounded-full bg-indigo-500/20 -ml-16 -mb-16" />
          <div className="absolute top-1/2  left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] border border-white/[0.04] rounded-full pointer-events-none" />
          <div className="absolute top-1/2  left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] border border-white/[0.04] rounded-full pointer-events-none" />

          {/* brand */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="7" y="2" width="6" height="16" rx="1" fill="white" opacity="0.9" />
                  <rect x="9.5" y="5"  width="1" height="2" rx="0.5" fill="#1e3a8a" />
                  <rect x="9.5" y="9"  width="1" height="2" rx="0.5" fill="#1e3a8a" />
                  <rect x="9.5" y="13" width="1" height="2" rx="0.5" fill="#1e3a8a" />
                  <path d="M7 4 L2 18"  stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                  <path d="M13 4 L18 18" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                </svg>
              </div>
              <div>
                <p className="text-white font-black text-lg tracking-tight leading-none">SIMIKOT</p>
                <p className="text-indigo-300/60 text-[10px] font-semibold mt-0.5 tracking-widest uppercase">v2.0</p>
              </div>
            </div>

            <h1 className="text-white text-3xl font-black leading-tight tracking-tight mb-4">
              Bergabung &<br />
              <span className="text-indigo-300">Mulai Melapor.</span>
            </h1>
            <p className="text-indigo-200/60 text-sm font-medium leading-relaxed max-w-xs">
              Daftarkan dirimu sebagai warga dan bantu kami memantau kondisi infrastruktur kota secara nyata.
            </p>
          </div>

          {/* benefit list */}
          <div className="relative z-10 space-y-3">
            {[
              { icon: FileText,    title: 'Buat Laporan',     desc: 'Laporkan kerusakan jalan di sekitarmu' },
              { icon: Users,       title: 'Dukung Warga Lain', desc: 'Upvote laporan yang kamu anggap penting' },
              { icon: ShieldCheck, title: 'Pantau Progress',   desc: 'Ikuti perkembangan penanganan real-time' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 bg-white/[0.06] border border-white/[0.08] rounded-2xl px-4 py-3.5 hover:bg-white/[0.09] transition-colors">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/25 flex items-center justify-center text-indigo-300 shrink-0">
                  <Icon size={15} />
                </div>
                <div>
                  <p className="text-white text-xs font-bold leading-none">{title}</p>
                  <p className="text-indigo-300/50 text-[10px] font-medium mt-0.5 leading-snug">{desc}</p>
                </div>
              </div>
            ))}

            {/* gmail note */}
            <div className="flex items-start gap-3 bg-amber-400/10 border border-amber-400/20 rounded-2xl px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300 shrink-0">
                <Mail size={14} />
              </div>
              <div>
                <p className="text-amber-200 text-xs font-bold leading-none">Gunakan Gmail</p>
                <p className="text-amber-300/50 text-[10px] font-medium mt-0.5 leading-snug">
                  Pendaftaran hanya untuk akun @gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════
            RIGHT PANEL (form)
        ════════════════════ */}
        <div className="flex-1 bg-white flex flex-col justify-center p-8 sm:p-12 overflow-y-auto max-h-screen">

          {/* mobile brand */}
          <div className="lg:hidden text-center mb-6">
            <p className="text-2xl font-black text-slate-900 tracking-tight">SIMIKOT</p>
            <p className="text-slate-500 text-xs font-medium mt-1">Sistem Informasi Manajemen Infrastruktur</p>
          </div>

          <div className="max-w-sm w-full mx-auto">

            {/* heading */}
            <div className="mb-5">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Buat akun baru</h2>
              <p className="text-slate-400 text-sm font-medium mt-1.5">
                Isi data di bawah untuk mendaftar sebagai warga.
              </p>
            </div>

            {/* progress bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kelengkapan Form</span>
                <span className={`text-[10px] font-black transition-colors ${pct === 100 ? 'text-emerald-500' : 'text-indigo-500'}`}>
                  {pct}%
                </span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* error banner */}
            {errorMsg && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3.5 mb-5">
                <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-red-700 leading-snug">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ── NAMA ── */}
              <InputWrap
                label="Nama Lengkap" required icon={User}
                focused={focused === 'nama'}
                hasError={!!errors.nama}
                hasValue={!!nama.trim()}
              >
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Budi Santoso"
                  value={nama}
                  onChange={e => { setNama(e.target.value); setErrorMsg(''); }}
                  onFocus={() => setFocused('nama')}
                  onBlur={() => { setFocused(''); setTouched(t => ({ ...t, nama: true })); }}
                  className="w-full pl-11 pr-10 py-3.5 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-300 outline-none rounded-2xl"
                />
              </InputWrap>
              {errors.nama && (
                <p className="flex items-center gap-1.5 text-[11px] text-red-500 font-semibold -mt-2">
                  <AlertCircle size={11} /> {errors.nama}
                </p>
              )}

              {/* ── KECAMATAN ── */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  <MapPin size={10} className="text-slate-400" />
                  Kecamatan Domisili
                  <span className="text-slate-300 font-medium normal-case tracking-normal text-[10px]">(opsional)</span>
                </label>
                {/* react-select — tidak ada perubahan props/behavior, hanya styles */}
                <Select
                  options={kecamatans}
                  placeholder="Pilih kecamatan..."
                  isClearable
                  isSearchable
                  filterOption={customFilter}
                  styles={selectStyles}
                  onChange={opt => setKecamatanId(opt ? opt.value : '')}
                  noOptionsMessage={() => 'Kecamatan tidak ditemukan'}
                />
              </div>

              {/* ── EMAIL ── */}
              <InputWrap
                label="Email" required icon={Mail}
                focused={focused === 'email'}
                hasError={!!errors.email}
                hasValue={!!email.trim() && email.endsWith('@gmail.com')}
                hint="Hanya @gmail.com yang diterima"
              >
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="nama@gmail.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrorMsg(''); }}
                  onFocus={() => setFocused('email')}
                  onBlur={() => { setFocused(''); setTouched(t => ({ ...t, email: true })); }}
                  className="w-full pl-11 pr-10 py-3.5 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-300 outline-none rounded-2xl"
                />
              </InputWrap>
              {errors.email && (
                <p className="flex items-center gap-1.5 text-[11px] text-red-500 font-semibold -mt-2">
                  <AlertCircle size={11} /> {errors.email}
                </p>
              )}

              {/* ── PASSWORD ── */}
              <div>
                <InputWrap
                  label="Password" required icon={Lock}
                  focused={focused === 'pass'}
                  hasError={!!errors.password}
                  hasValue={password.length >= 6}
                >
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrorMsg(''); }}
                    onFocus={() => setFocused('pass')}
                    onBlur={() => { setFocused(''); setTouched(t => ({ ...t, password: true })); }}
                    className="w-full pl-11 pr-12 py-3.5 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-300 outline-none rounded-2xl"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </InputWrap>
                {errors.password && (
                  <p className="flex items-center gap-1.5 text-[11px] text-red-500 font-semibold mt-1.5">
                    <AlertCircle size={11} /> {errors.password}
                  </p>
                )}
                <PasswordStrength password={password} />
              </div>

              {/* ── SUBMIT ── */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !agreeTerms}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#1e3a8a] hover:bg-[#172554] active:scale-[0.98] text-white font-black text-sm py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-indigo-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses…
                    </>
                  ) : (
                    <>
                      <UserPlus size={15} />
                      Daftar Sekarang
                      <ArrowRight size={13} className="ml-auto opacity-60" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* login link */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-slate-500 text-sm">
                Sudah punya akun?{' '}
                <Link
                  to="/login"
                  className="font-black text-[#1e3a8a] hover:text-blue-700 transition-colors underline underline-offset-2 decoration-indigo-200 hover:decoration-blue-400"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>

            {/* ── TERMS CHECKBOX ── */}
            <div className="mt-5">
              <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none ${
                agreeTerms
                  ? 'bg-indigo-50/60 border-indigo-300'
                  : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
              }`}>
                {/* custom checkbox */}
                <div className="relative shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={e => setAgreeTerms(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                    agreeTerms
                      ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-200'
                      : 'bg-white border-slate-300'
                  }`}>
                    {agreeTerms && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
                {/* text */}
                <span className={`text-xs font-medium leading-relaxed transition-colors ${
                  agreeTerms ? 'text-slate-700' : 'text-slate-500'
                }`}>
                  Saya telah membaca dan menyetujui{' '}
                  <span className="font-bold text-indigo-600 underline underline-offset-2 cursor-pointer">
                    Kebijakan Privasi
                  </span>{' '}
                  dan{' '}
                  <span className="font-bold text-indigo-600 underline underline-offset-2 cursor-pointer">
                    Ketentuan Layanan
                  </span>{' '}
                  SIMIKOT.
                </span>
              </label>

              {/* hint jika belum dicentang & sudah klik submit */}
              {!agreeTerms && touched.terms && (
                <p className="flex items-center gap-1.5 text-[11px] text-red-500 font-semibold mt-1.5 px-1">
                  <AlertCircle size={11} /> Kamu menyetujui kebijakan untuk melanjutkan
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}