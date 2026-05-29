import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const SuperAdminRoute = ({
  children,
}) => {

  const {
    user,
    profile,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div className="p-8">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    profile?.role !==
    "super_admin"
  ) {
    return (
      <Navigate
        to="/laporan"
        replace
      />
    );
  }

  return children;
};

export default SuperAdminRoute;