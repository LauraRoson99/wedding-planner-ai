import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn } from "@/lib/auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}