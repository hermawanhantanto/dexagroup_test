import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios"
import {
  API_BASE_URLS,
  API_ENDPOINTS,
  AUTH_HEADER,
  HTTP_STATUS,
} from "@/constants/api"
import { USER_ROLES } from "@/constants/auth"
import { tokenStorage } from "@/lib/token-storage"
import type { RefreshResponse } from "@/types/auth"

interface FailedRequestPromise {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let isRefreshingToken = false
let failedRequestsQueue: FailedRequestPromise[] = []

const processFailedQueue = (
  error: unknown,
  refreshedToken: string | null = null,
): void => {
  failedRequestsQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else if (refreshedToken) {
      promise.resolve(refreshedToken)
    }
  })
  failedRequestsQueue = []
}

const resolveRefreshUrl = (): string => {
  const activeRole = tokenStorage.getActiveRole()
  const targetBaseUrl =
    activeRole === USER_ROLES.HR_ADMIN
      ? API_BASE_URLS.MONITORING
      : API_BASE_URLS.ATTENDANCE
  return `${targetBaseUrl}${API_ENDPOINTS.REFRESH}`
}

const attachAuthInterceptors = (client: AxiosInstance): AxiosInstance => {
  client.interceptors.request.use(
    (requestConfig: InternalAxiosRequestConfig) => {
      const activeAccessToken = tokenStorage.getAccessToken()
      if (activeAccessToken) {
        requestConfig.headers[AUTH_HEADER.KEY] =
          `${AUTH_HEADER.BEARER_PREFIX}${activeAccessToken}`
      }
      return requestConfig
    },
    (requestError: AxiosError) => {
      return Promise.reject(requestError)
    },
  )

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as
        | (InternalAxiosRequestConfig & { _retryAttempted?: boolean })
        | undefined

      if (!originalRequest) {
        return Promise.reject(error)
      }

      const isUnauthorizedStatus =
        error.response?.status === HTTP_STATUS.UNAUTHORIZED
      const isAuthEndpoint =
        originalRequest.url?.includes(API_ENDPOINTS.SIGN_IN) ||
        originalRequest.url?.includes(API_ENDPOINTS.REFRESH)

      if (!isUnauthorizedStatus || isAuthEndpoint || originalRequest._retryAttempted) {
        return Promise.reject(error)
      }

      if (isRefreshingToken) {
        return new Promise<string>((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject })
        })
          .then((newAccessToken: string) => {
            originalRequest.headers[AUTH_HEADER.KEY] =
              `${AUTH_HEADER.BEARER_PREFIX}${newAccessToken}`
            return client(originalRequest)
          })
          .catch((queuedError) => {
            return Promise.reject(queuedError)
          })
      }

      originalRequest._retryAttempted = true
      isRefreshingToken = true

      try {
        const refreshEndpointUrl = resolveRefreshUrl()
        const refreshResponse = await axios.post<RefreshResponse>(
          refreshEndpointUrl,
          {},
          { withCredentials: true },
        )

        const refreshedAccessToken = refreshResponse.data.accessToken
        tokenStorage.setAccessToken(refreshedAccessToken)

        processFailedQueue(null, refreshedAccessToken)

        originalRequest.headers[AUTH_HEADER.KEY] =
          `${AUTH_HEADER.BEARER_PREFIX}${refreshedAccessToken}`
        return client(originalRequest)
      } catch (refreshError) {
        processFailedQueue(refreshError, null)
        tokenStorage.clearSession()
        return Promise.reject(refreshError)
      } finally {
        isRefreshingToken = false
      }
    },
  )

  return client
}

export const attendanceApiClient: AxiosInstance = attachAuthInterceptors(
  axios.create({
    baseURL: API_BASE_URLS.ATTENDANCE,
    withCredentials: true,
  }),
)

export const monitoringApiClient: AxiosInstance = attachAuthInterceptors(
  axios.create({
    baseURL: API_BASE_URLS.MONITORING,
    withCredentials: true,
  }),
)
