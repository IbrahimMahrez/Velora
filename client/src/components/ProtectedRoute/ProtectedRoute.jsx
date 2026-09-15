import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute() {
  const { isAuthenticated, user } = useAuth();
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

  // Unverified users may only visit /verify-email or /login.
  // (Verify page itself is a public route, so this guard only
  // applies to protected content.)
  if (user && user.isVerified === false) {
    const allowed = ["/verify-email", "/login"];
    if (!allowed.includes(location.pathname)) {
      return <Navigate to="/verify-email" replace />;
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;
