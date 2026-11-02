import * as React from "react"
import { USER_ROLES, type UserRole } from "@/constants/auth"
import {
  AuthContext,
  type AuthContextValue,
} from "@/features/auth/context/auth-context-def"
import { authService } from "@/features/auth/services/auth-service"
import { tokenStorage } from "@/lib/token-storage"
import type { AuthUserProfile, SignInCredentials } from "@/types/auth"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = React.useState<AuthUserProfile | null>(null)
  const [activeRole, setActiveRole] = React.useState<UserRole>(() =>
    tokenStorage.getActiveRole(),
  )

  React.useEffect(() => {
    const unsubscribe = tokenStorage.subscribeToLogout(() => {
      setCurrentUser(null)
      setActiveRole(USER_ROLES.EMPLOYEE)
    })
    return unsubscribe
  }, [])

  const handleSignIn = React.useCallback(
    async (credentials: SignInCredentials): Promise<AuthUserProfile> => {
      const response = await authService.signIn(credentials)
      setCurrentUser(response.user)
      setActiveRole(credentials.role)
      return response.user
    },
    [],
  )

  const handleSignOut = React.useCallback(async () => {
    await authService.signOut()
    setCurrentUser(null)
    setActiveRole(USER_ROLES.EMPLOYEE)
  }, [])

  const contextValue = React.useMemo<AuthContextValue>(
    () => ({
      user: currentUser,
      activeRole,
      isAuthenticated: Boolean(currentUser || tokenStorage.getAccessToken()),
      signIn: handleSignIn,
      signOut: handleSignOut,
    }),
    [currentUser, activeRole, handleSignIn, handleSignOut],
  )

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}
