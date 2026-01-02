import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RequireAuth() {
  const { currentUser, loading } = useAuth();

  if (loading) return null; // or loader

  return currentUser ? <Outlet /> : <Navigate to='/login/user' replace />;
}

export function RedirectIfAuth() {
  const { currentUser, loading } = useAuth();

  if (loading) return null;

  return currentUser ? <Navigate to='/upload' replace /> : <Outlet />;
}
