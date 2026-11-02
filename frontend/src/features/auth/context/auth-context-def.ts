import { createContext } from "react"
import type { UserRole } from "@/constants/auth"
import type { AuthUserProfile, SignInCredentials } from "@/types/auth"

export interface AuthContextValue {
  user: AuthUserProfile | null
  activeRole: UserRole
  isAuthenticated: boolean
  signIn: (credentials: SignInCredentials) => Promise<AuthUserProfile>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
