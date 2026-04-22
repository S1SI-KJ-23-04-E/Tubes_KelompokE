import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Dimana user mau pergi sebelum disuruh login? (default: /laporan)
  const from = location.state?.from?.pathname || '/laporan';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { success, error } = await login(email, password);
    setLoading(false);

    if (success) {
      navigate(from, { replace: true });
    } else {
      setErrorMsg('Login gagal: Email atau Password salah.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#1e3a8a] to-blue-600 bg-clip-text text-transparent mb-3">
            SIMIKOT
          </h2>
          <p className="text-slate-600 text-base font-medium">Sistem Informasi Manajemen Infrastruktur Kerusakan Jalan</p>
        </div>
        <p className="mt-6 text-center text-sm text-slate-600">
          Belum punya akun?{' '}
          <Link to="/register" className="font-bold text-[#1e3a8a] hover:text-blue-700 transition-colors duration-300">
            Daftar di sini
          </Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-xl rounded-2xl border border-slate-100 backdrop-blur-sm bg-opacity-95">
          
          {errorMsg && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-sm font-semibold text-red-700">{errorMsg}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2.5 flex items-center">
                <span className="w-1 h-1 bg-[#1e3a8a] rounded-full mr-2"></span>
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  className="focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] block w-full pl-11 sm:text-sm border-2 border-slate-200 rounded-lg p-3 bg-gradient-to-br from-slate-50 to-blue-50 outline-none transition-all duration-300 placeholder-slate-500 font-medium"
                  placeholder="anda@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2.5 flex items-center">
                <span className="w-1 h-1 bg-[#1e3a8a] rounded-full mr-2"></span>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  className="focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] block w-full pl-11 sm:text-sm border-2 border-slate-200 rounded-lg p-3 bg-gradient-to-br from-slate-50 to-blue-50 outline-none transition-all duration-300 placeholder-slate-500 font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg bg-gradient-to-r from-[#1e3a8a] to-blue-600 hover:from-[#172554] hover:to-blue-700 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 active:scale-95"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Memproses...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Masuk
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
