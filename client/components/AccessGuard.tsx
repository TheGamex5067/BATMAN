import { Navigate } from "react-router-dom";
import { useAuth } from "@/state/auth";

export default function AccessGuard({ children }: { children: JSX.Element }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  return children;
}
