import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LaporanList from './pages/LaporanList';
import LaporanForm from './pages/LaporanForm';
import LaporanDetail from './pages/LaporanDetail';
import AdminPage from './pages/AdminPage';
import BeritaPage from './pages/BeritaPage';
import ProfileUpdate from './pages/ProfileUpdate';
import Login from './pages/Login';
import Register from './pages/Register';
import { LogOut, Bell } from 'lucide-react';
import { countUnreadNotifikasi } from './services/notifikasiService';

// ─────────────────────────────────────────
// PROTECTED ROUTE
// ─────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Memuat...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
}

// ─────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────
function Navbar() {
  const { user, profile, logout } = useAuth();
  const [jumlahNotif, setJumlahNotif] = useState(0);

  useEffect(() => {
    if (profile?.role !== 'petugas') return;

    loadNotif();
    const interval = setInterval(loadNotif, 30000);
    return () => clearInterval(interval);
  }, [profile]);

  const loadNotif = async () => {
  try {
    const count = await countUnreadNotifikasi(user.id); // ← pakai user.id
    setJumlahNotif(count);
  } catch (err) {
    console.error('Gagal memuat notifikasi:', err);
  }
};

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-200">
            S
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-800">SIMIKOT</span>
        </div>

        {/* User area */}
        {user && (
          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              Profil
            </Link>

            {/* Bell icon — hanya untuk petugas */}
            {profile?.role === 'petugas' && (
              <Link
                to="/laporan?tab=notifikasi"
                className="relative p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Notifikasi"
              >
                <Bell size={20} />
                {jumlahNotif > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] font-black flex items-center justify-center leading-none">
                    {jumlahNotif > 9 ? '9+' : jumlahNotif}
                  </span>
                )}
              </Link>
            )}

            <span className="text-sm font-bold text-slate-600 hidden sm:block">
              Halo, {profile?.nama || user.email}
            </span>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              title="Logout"
            >
              <LogOut size={20} />
              <span className="text-sm font-bold hidden sm:block">Keluar</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────
// APP ROUTES
// ─────────────────────────────────────────
function AppRoutes() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <main className="pb-20">
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/laporan" replace />} />

          {/* Protected */}
          <Route path="/laporan" element={
            <ProtectedRoute><LaporanList /></ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute><Navigate to="/laporan?tab=dashboard" replace /></ProtectedRoute>
          } />

          <Route path="/laporan/baru" element={
            <ProtectedRoute><LaporanForm /></ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute><ProfileUpdate /></ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute><AdminPage /></ProtectedRoute>
          } />

          <Route path="/berita" element={
            <ProtectedRoute><BeritaPage /></ProtectedRoute>
          } />

          <Route path="/laporan/:id" element={
            <ProtectedRoute><LaporanDetail /></ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────
// APP
// ─────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;