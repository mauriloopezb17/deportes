import { useAuthStore } from "@/features/auth/stores/authStore";
import { UserRole } from "@types";
import { useNavigate } from "react-router-dom";

export const useRequireRole = (requiredRoles: UserRole[]) => {
  const { hasRole } = useAuthStore();
  const navigate = useNavigate();

  if (!hasRole(requiredRoles)) {
    if (hasRole(UserRole.ADMIN)) navigate("/panel-admin");
    else if (hasRole(UserRole.DELEGADO)) navigate("/panel-delegado");
    else if (hasRole(UserRole.ENTRENADOR)) navigate("/panel-entrenador");
    else navigate("/dashboard");
    return false;
  }

  return true;
};
