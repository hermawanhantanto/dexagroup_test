import type { UserRole } from "@/constants/auth"

export interface AuthUserProfile {
  id: string
  email: string
  firstName: string
  lastName?: string | null
  position?: string | null
  department?: string | null
  role: UserRole
  dateOfBirth?: string | null
  gender?: string | null
  salary?: number | null
  joinDate?: string | null
}

export interface SignInCredentials {
  email: string
  password: string
  role: UserRole
}

export interface AuthResponse {
  message: string
  accessToken: string
  user: AuthUserProfile
}

export interface RefreshResponse {
  message: string
  accessToken: string
}
