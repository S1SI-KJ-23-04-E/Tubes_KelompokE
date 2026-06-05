import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

/* ── decorative road/infra SVG background ── */
function BackgroundDecor() {
  return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      {/* subtle grid */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-200/60" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* decorative circles */}
      <circle cx="10%" cy="15%" r="120" fill="none" stroke="#e0e7ff" strokeWidth="1" />
      <circle cx="10%" cy="15%" r="80" fill="none" stroke="#e0e7ff" strokeWidth="1" />
      <circle cx="92%" cy="80%" r="180" fill="none" stroke="#dbeafe" strokeWidth="1" />
      <circle cx="92%" cy="80%" r="120" fill="none" stroke="#dbeafe" strokeWidth="1" />

      {/* road-like lines */}
      <line x1="0" y1="60%" x2="30%" y2="85%" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="8 6" />
      <line x1="100%" y1="20%" x2="70%" y2="5%" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="8 6" />
    </svg>
  );
}

/* ── floating stat pill ── */
function StatPill({ icon: Icon, value, label, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl px-4 py-2.5 shadow-sm ${className}`}>
      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
        <Icon size={14} />
      </div>
      <div>
        <p className="text-xs font-black text-slate-800 leading-none">{value}</p>
        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/laporan';
  const successMsg = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      const role = result.profile?.role;
      if (role === 'kecamatan')   navigate('/laporan?tab=__dashboard_kecamatan__', { replace: true });
      else if (role === 'super_admin') navigate('/dashboard', { replace: true });
      else navigate(from, { replace: true });
    } else {
      setErrorMsg('Email atau password yang kamu masukkan salah.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 relative overflow-hidden">
      <BackgroundDecor />

      {/* floating accent blobs */}
      <div className="absolute top-[-10%] left-[-8%] w-72 h-72 rounded-full bg-indigo-100/50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-8%] right-[-5%] w-80 h-80 rounded-full bg-blue-100/40 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl flex items-stretch gap-0 shadow-2xl shadow-slate-300/40 rounded-[2rem] overflow-hidden">

        {/* ── LEFT PANEL ── */}
        <div className="hidden lg:flex lg:w-[46%] flex-col justify-between bg-[#1e3a8a] p-10 relative overflow-hidden">
          {/* inner decor */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-indigo-500/20 -ml-16 -mb-16" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] border border-white/5 rounded-full pointer-events-none" />

          {/* brand */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                {/* road icon */}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="7" y="2" width="6" height="16" rx="1" fill="white" opacity="0.9"/>
                  <rect x="9.5" y="5" width="1" height="2" rx="0.5" fill="#1e3a8a"/>
                  <rect x="9.5" y="9" width="1" height="2" rx="0.5" fill="#1e3a8a"/>
                  <rect x="9.5" y="13" width="1" height="2" rx="0.5" fill="#1e3a8a"/>
                  <path d="M7 4 L2 18" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                  <path d="M13 4 L18 18" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-black text-lg tracking-tight leading-none">SIMIKOT</p>
                <p className="text-indigo-300/60 text-[10px] font-semibold mt-0.5 tracking-widest uppercase">v2.0</p>
              </div>
            </div>

            <h1 className="text-white text-3xl font-black leading-tight tracking-tight mb-4">
              Infrastruktur<br />
              <span className="text-indigo-300">Lebih Baik</span><br />
              Bersama Warga.
            </h1>
            <p className="text-indigo-200/60 text-sm font-medium leading-relaxed max-w-xs">
              Platform pelaporan kerusakan infrastruktur yang transparan dan dapat dipantau secara real-time.
            </p>
          </div>

          {/* stats */}
          <div className="relative z-10 space-y-3">
            <div className="bg-white/8 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div>
                <p className="text-white text-xs font-bold">Sistem Aktif</p>
                <p className="text-indigo-300/50 text-[10px] font-medium">Pemantauan 24/7</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL (form) ── */}
        <div className="flex-1 bg-white flex flex-col justify-center p-8 sm:p-12">
          {/* mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <p className="text-2xl font-black text-slate-900 tracking-tight">SIMIKOT</p>
            <p className="text-slate-500 text-xs font-medium mt-1">Sistem Informasi Manajemen Infrastruktur</p>
          </div>

          <div className="max-w-sm w-full mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Selamat datang</h2>
              <p className="text-slate-400 text-sm font-medium mt-1.5">Masuk untuk melanjutkan ke dashboard.</p>
            </div>

            {/* success */}
            {successMsg && (
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                <AlertCircle size={16} className="text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-green-700 leading-snug">{successMsg}</p>
              </div>
            )}

            {/* error */}
            {errorMsg && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-red-700 leading-snug">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* email */}
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2">
                  Email
                </label>
                <div className={`relative flex items-center rounded-2xl border-2 transition-all duration-200 ${
                  focused === 'email'
                    ? 'border-indigo-500 bg-indigo-50/30 shadow-[0_0_0_4px_rgba(99,102,241,0.08)]'
                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                }`}>
                  <div className="absolute left-4 text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    className="w-full pl-11 pr-4 py-3.5 bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 outline-none rounded-2xl"
                  />
                </div>
              </div>

              {/* password */}
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2">
                  Password
                </label>
                <div className={`relative flex items-center rounded-2xl border-2 transition-all duration-200 ${
                  focused === 'pass'
                    ? 'border-indigo-500 bg-indigo-50/30 shadow-[0_0_0_4px_rgba(99,102,241,0.08)]'
                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                }`}>
                  <div className="absolute left-4 text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused('pass')}
                    onBlur={() => setFocused('')}
                    className="w-full pl-11 pr-12 py-3.5 bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 outline-none rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#1e3a8a] hover:bg-[#172554] active:scale-[0.98] text-white font-black text-sm py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-indigo-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <LogIn size={16} />
                      Masuk ke Akun
                      <ArrowRight size={14} className="ml-auto opacity-60" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* divider & register */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-slate-500 text-sm">
                Belum punya akun?{' '}
                <Link
                  to="/register"
                  className="font-black text-[#1e3a8a] hover:text-blue-700 transition-colors underline underline-offset-2 decoration-indigo-200 hover:decoration-blue-400"
                >
                  Daftar sekarang
                </Link>
              </p>
            </div>

            {/* footer note */}
            <p className="text-center text-[10px] text-slate-300 mt-6 font-medium leading-relaxed">
              Dengan masuk, kamu menyetujui kebijakan privasi<br />dan ketentuan layanan SIMIKOT.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}