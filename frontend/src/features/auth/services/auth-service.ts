import { API_ENDPOINTS } from "@/constants/api"
import { USER_ROLES } from "@/constants/auth"
import { attendanceApiClient, monitoringApiClient } from "@/lib/api-client"
import { tokenStorage } from "@/lib/token-storage"
import type { AuthResponse, SignInCredentials } from "@/types/auth"

export const authService = {
  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    const payload = {
      email: credentials.email,
      password: credentials.password,
    }

    const client =
      credentials.role === USER_ROLES.HR_ADMIN
        ? monitoringApiClient
        : attendanceApiClient

    const response = await client.post<AuthResponse>(
      API_ENDPOINTS.SIGN_IN,
      payload,
    )

    tokenStorage.setAccessToken(response.data.accessToken)
    tokenStorage.setActiveRole(credentials.role)

    return response.data
  },

  async signOut(): Promise<void> {
    tokenStorage.clearSession()
  },
}
