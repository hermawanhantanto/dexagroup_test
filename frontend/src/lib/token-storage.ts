import { USER_ROLES, type UserRole } from "@/constants/auth"

const STORAGE_KEYS = {
  ACCESS_TOKEN: "dexa_access_token",
  USER_ROLE: "dexa_user_role",
} as const

type LogoutSubscriber = () => void

let inMemoryAccessToken: string | null = null
let inMemoryRole: UserRole | null = null
const logoutSubscribers: Set<LogoutSubscriber> = new Set()

export const tokenStorage = {
  getAccessToken(): string | null {
    if (inMemoryAccessToken) {
      return inMemoryAccessToken
    }
    const persistedToken = window.sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (persistedToken) {
      inMemoryAccessToken = persistedToken
    }
    return inMemoryAccessToken
  },

  setAccessToken(token: string | null): void {
    inMemoryAccessToken = token
    if (token) {
      window.sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
    } else {
      window.sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    }
  },

  getActiveRole(): UserRole {
    if (inMemoryRole) {
      return inMemoryRole
    }
    const persistedRole = window.sessionStorage.getItem(STORAGE_KEYS.USER_ROLE) as UserRole | null
    if (persistedRole && (persistedRole === USER_ROLES.EMPLOYEE || persistedRole === USER_ROLES.HR_ADMIN)) {
      inMemoryRole = persistedRole
      return inMemoryRole
    }
    return USER_ROLES.EMPLOYEE
  },

  setActiveRole(role: UserRole | null): void {
    inMemoryRole = role
    if (role) {
      window.sessionStorage.setItem(STORAGE_KEYS.USER_ROLE, role)
    } else {
      window.sessionStorage.removeItem(STORAGE_KEYS.USER_ROLE)
    }
  },

  clearSession(): void {
    inMemoryAccessToken = null
    inMemoryRole = null
    window.sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    window.sessionStorage.removeItem(STORAGE_KEYS.USER_ROLE)
    logoutSubscribers.forEach((subscriber) => subscriber())
  },

  subscribeToLogout(subscriber: LogoutSubscriber): () => void {
    logoutSubscribers.add(subscriber)
    return () => {
      logoutSubscribers.delete(subscriber)
    }
  },
}
