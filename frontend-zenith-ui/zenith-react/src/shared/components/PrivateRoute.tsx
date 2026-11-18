import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/shared/hooks/useAuth";

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; // Opcional: mostrar un esqueleto/loader aquí
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
