import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* =========================
   USER-ONLY ROUTES
   ========================= */
export function RequireAuth() {
  const { currentUser, loading } = useAuth();

  if (loading) return null;

  if (!currentUser) {
    return <Navigate to='/login' replace />;
  }

  if (currentUser.role !== "user") {
    return <Navigate to='/' replace />;
  }

  return <Outlet />;
}

/* =========================
   SHOP-ONLY ROUTES
   ========================= */
export function RequireShop() {
  const { currentUser, loading } = useAuth();

  if (loading) return null;

  if (!currentUser) {
    return <Navigate to='/login' replace />;
  }

  if (currentUser.role !== "shop") {
    return <Navigate to='/' replace />;
  }

  return <Outlet />;
}

/* =========================
   BLOCK LOGIN IF AUTHED
   ========================= */
export function RedirectIfAuth() {
  const { currentUser, loading } = useAuth();

  if (loading) return null;

  if (!currentUser) return <Outlet />;

  return currentUser.role === "shop" ? (
    <Navigate to='/shop/dashboard' replace />
  ) : (
    <Navigate to='/user/dashboard' replace />
  );
}
