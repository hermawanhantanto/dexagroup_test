import axios from "axios"
import {
  MONITORING_FEEDBACK_MESSAGES,
  MONITORING_HTTP_STATUS,
} from "@/constants/monitoring"

export interface ApiErrorResponseData {
  statusCode?: number
  message?: string | string[]
  error?: string
}

export function extractApiErrorMessage(
  error: unknown,
  fallbackMessage: string = MONITORING_FEEDBACK_MESSAGES.UNEXPECTED_ERROR,
): string {
  if (axios.isAxiosError<ApiErrorResponseData>(error)) {
    const responsePayload = error.response?.data

    if (responsePayload?.message) {
      if (Array.isArray(responsePayload.message)) {
        return responsePayload.message.join(", ")
      }
      if (typeof responsePayload.message === "string") {
        return responsePayload.message
      }
    }

    if (typeof responsePayload?.error === "string") {
      return responsePayload.error
    }

    if (error.message) {
      return error.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallbackMessage
}

export function isConflictApiError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === MONITORING_HTTP_STATUS.CONFLICT
  }
  return false
}
