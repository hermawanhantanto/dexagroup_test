import { monitoringApiClient } from "@/lib/api-client"
import { MONITORING_ENDPOINTS } from "@/constants/monitoring"
import type {
  CreateManualAttendancePayload,
  GetWorkforceAttendancesQuery,
  WorkforceAttendanceListResponse,
  WorkforceAttendanceRecord,
} from "@/types/monitoring"

export const attendanceMonitoringService = {
  async getWorkforceAttendances(
    query?: GetWorkforceAttendancesQuery,
  ): Promise<WorkforceAttendanceListResponse> {
    const sanitizedQueryParams: Record<string, unknown> = {}

    if (query) {
      for (const [parameterKey, parameterValue] of Object.entries(query)) {
        if (
          parameterValue !== undefined &&
          parameterValue !== null &&
          parameterValue !== "" &&
          parameterValue !== "ALL"
        ) {
          sanitizedQueryParams[parameterKey] = parameterValue
        }
      }
    }

    const response =
      await monitoringApiClient.get<WorkforceAttendanceListResponse>(
        MONITORING_ENDPOINTS.ATTENDANCES,
        { params: sanitizedQueryParams },
      )
    return response.data
  },

  async getAttendanceById(
    attendanceId: string,
  ): Promise<{ message: string; data: WorkforceAttendanceRecord }> {
    const response = await monitoringApiClient.get<{
      message: string
      data: WorkforceAttendanceRecord
    }>(MONITORING_ENDPOINTS.ATTENDANCE_BY_ID(attendanceId))
    return response.data
  },

  async createManualAttendance(
    payload: CreateManualAttendancePayload,
  ): Promise<{ message: string; data: WorkforceAttendanceRecord }> {
    const sanitizedPayload: Record<string, unknown> = {}

    for (const [propertyKey, propertyValue] of Object.entries(payload)) {
      if (
        propertyValue !== undefined &&
        propertyValue !== null &&
        propertyValue !== ""
      ) {
        sanitizedPayload[propertyKey] = propertyValue
      }
    }

    const response = await monitoringApiClient.post<{
      message: string
      data: WorkforceAttendanceRecord
    }>(
      MONITORING_ENDPOINTS.ATTENDANCES,
      sanitizedPayload as unknown as CreateManualAttendancePayload,
    )
    return response.data
  },
}
