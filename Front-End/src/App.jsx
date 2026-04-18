import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LaporanList from './pages/LaporanList';
import LaporanForm from './pages/LaporanForm';
import LaporanDetail from './pages/LaporanDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import { LogOut } from 'lucide-react';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Memuat...</div>;
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Navbar Component
function Navbar() {
  const { user, profile, logout } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-200">
            S
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-800">SIMIKOT</span>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
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

function AppRoutes() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <main className="pb-20">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<Navigate to="/laporan" replace />} />
          <Route path="/laporan" element={
            <ProtectedRoute>
              <LaporanList />
            </ProtectedRoute>
          } />
          <Route path="/laporan/baru" element={
            <ProtectedRoute>
              <LaporanForm />
            </ProtectedRoute>
          } />
          <Route path="/laporan/:id" element={
            <ProtectedRoute>
              <LaporanDetail />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

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
