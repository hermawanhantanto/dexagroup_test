import { attendanceApiClient } from "@/lib/api-client"
import { ATTENDANCE_ENDPOINTS } from "@/constants/attendance"
import type {
  AttendanceHistoryResponse,
  AttendanceRecord,
  CheckInPayload,
  ClockOutPayload,
  CreateUploadUrlPayload,
  CreateUploadUrlResponse,
  TodayAttendanceResponse,
} from "@/types/attendance"

export const attendanceService = {
  async getTodayStatus(): Promise<TodayAttendanceResponse> {
    const response = await attendanceApiClient.get<TodayAttendanceResponse>(
      ATTENDANCE_ENDPOINTS.TODAY,
    )
    return response.data
  },

  async requestPresignedUploadUrl(
    payload: CreateUploadUrlPayload,
  ): Promise<CreateUploadUrlResponse> {
    const response = await attendanceApiClient.post<CreateUploadUrlResponse>(
      ATTENDANCE_ENDPOINTS.UPLOAD_URL,
      payload,
    )
    return response.data
  },

  async uploadProofImageToStorage(
    targetUploadUrl: string,
    imageFile: File,
  ): Promise<void> {
    const storageResponse = await fetch(targetUploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": imageFile.type,
        "x-upsert": "true",
      },
      body: imageFile,
    })

    if (!storageResponse.ok) {
      const errorText = await storageResponse.text().catch(() => "")
      throw new Error(
        `Storage upload failed with status ${storageResponse.status}: ${errorText || storageResponse.statusText}`,
      )
    }
  },

  async submitCheckIn(
    payload: CheckInPayload,
  ): Promise<{ message: string; attendance: AttendanceRecord }> {
    const response = await attendanceApiClient.post<{
      message: string
      attendance: AttendanceRecord
    }>(ATTENDANCE_ENDPOINTS.CHECK_IN, payload)
    return response.data
  },

  async submitClockOut(
    payload: ClockOutPayload,
  ): Promise<{ message: string; attendance: AttendanceRecord }> {
    const response = await attendanceApiClient.post<{
      message: string
      attendance: AttendanceRecord
    }>(ATTENDANCE_ENDPOINTS.CLOCK_OUT, payload)
    return response.data
  },

  async getMyHistory(
    targetPage = 1,
    recordsLimit = 10,
  ): Promise<AttendanceHistoryResponse> {
    const response = await attendanceApiClient.get<AttendanceHistoryResponse>(
      ATTENDANCE_ENDPOINTS.MY_HISTORY,
      {
        params: {
          page: targetPage,
          limit: recordsLimit,
        },
      },
    )
    return response.data
  },
}
