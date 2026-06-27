import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { UserRole } from "@types";
import { authService } from "@/features/auth/services/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
}) => {
  const { isAuthenticated, hasRole } = useAuthStore();
  const storedUser = authService.getStoredUser();
  const hasToken = authService.isAuthenticated();

  const defaultPanelPath = () => {
    if (hasRole(UserRole.ADMIN)) return "/panel-admin";
    if (hasRole(UserRole.DELEGADO)) return "/equipos";
    if (hasRole(UserRole.ENTRENADOR)) return "/panel-entrenador";
    return "/dashboard";
  };

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !hasRole(requiredRoles)) {
    const storedRoles = storedUser?.roles || [];
    const canEnterFromStorage = requiredRoles.some((role) =>
      storedRoles
        .map((storedRole) =>
          String(storedRole)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toUpperCase(),
        )
        .some((storedRole) => storedRole.includes(role)),
    );

    if (canEnterFromStorage) {
      return <>{children}</>;
    }

    return <Navigate to={defaultPanelPath()} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
