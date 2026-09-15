import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ======================================================
// ADMIN ROUTE GUARD
// Backend already enforces verifyAuthorizationadmin, but
// without this guard any logged-in user could open the
// admin shell and only fail later on 403 API errors.
// ======================================================

function AdminRoute() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (!user?.isAdmin) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}

export default AdminRoute;
