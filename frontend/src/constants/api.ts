export const API_BASE_URLS = {
  ATTENDANCE:
    (import.meta.env.VITE_ATTENDANCE_API_URL as string | undefined) ||
    "http://localhost:3000/api",
  MONITORING:
    (import.meta.env.VITE_MONITORING_API_URL as string | undefined) ||
    "http://localhost:3002/api",
} as const

export const API_ENDPOINTS = {
  SIGN_IN: "/auth/sign-in",
  REFRESH: "/auth/refresh",
} as const

export const HTTP_STATUS = {
  OK: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
} as const

export const AUTH_HEADER = {
  KEY: "Authorization",
  BEARER_PREFIX: "Bearer ",
} as const
