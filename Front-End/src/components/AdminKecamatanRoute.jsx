import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AdminKecamatanRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-[3px] border-slate-200 rounded-full" />
            <div className="absolute inset-0 border-[3px] border-indigo-600 rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-semibold text-slate-500">Memverifikasi akses…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.role !== "kecamatan") {
    return <Navigate to="/laporan" replace />;
  }

  return children;
};

export default AdminKecamatanRoute;
