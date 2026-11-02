export type AttendanceStatus = "PRESENT" | "SICK" | "LEAVE" | "ABSENT"

export interface AttendanceRecord {
  id: string
  userId: string
  attendanceDate: string
  clockInAt: string | null
  clockOutAt: string | null
  proofImageUrl: string | null
  notes: string | null
  status: AttendanceStatus
  createdAt: string
  updatedAt: string
}

export interface TodayAttendanceResponse {
  hasCheckedIn: boolean
  hasClockedOut: boolean
  attendance: AttendanceRecord | null
}

export interface CreateUploadUrlPayload {
  mimeType: "image/jpeg" | "image/png" | "image/webp"
  fileSize?: number
}

export interface CreateUploadUrlResponse {
  uploadUrl: string
  publicUrl: string
  filePath: string
  token: string
  expiresIn: number
}

export interface CheckInPayload {
  proofImageUrl: string
  notes?: string
}

export interface ClockOutPayload {
  notes?: string
}

export interface AttendanceHistoryPagination {
  totalRecords: number
  currentPage: number
  totalPages: number
  limit: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface AttendanceHistoryResponse {
  data: AttendanceRecord[]
  pagination: AttendanceHistoryPagination
}
