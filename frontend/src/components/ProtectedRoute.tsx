import React from "react"
import { Navigate } from "react-router-dom"
import { USER_ROLES, type UserRole } from "@/constants/auth"
import { ROUTE_PATHS } from "@/constants/routes"
import { useAuth } from "@/features/auth/hooks/use-auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, activeRole } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.AUTH} replace />
  }

  if (requiredRole && activeRole !== requiredRole) {
    const fallbackPath =
      activeRole === USER_ROLES.HR_ADMIN
        ? ROUTE_PATHS.MONITORING
        : ROUTE_PATHS.ATTENDANCE
    return <Navigate to={fallbackPath} replace />
  }

  return <>{children}</>
}
