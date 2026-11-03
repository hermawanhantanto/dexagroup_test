import {
  MONITORING_ATTENDANCE_STATUS,
  MONITORING_GENDERS,
  MONITORING_ROLES,
} from "@/constants/monitoring"

export type EmployeeGender =
  (typeof MONITORING_GENDERS)[keyof typeof MONITORING_GENDERS]

export type EmployeeRole =
  (typeof MONITORING_ROLES)[keyof typeof MONITORING_ROLES]

export type AttendanceStatusType =
  (typeof MONITORING_ATTENDANCE_STATUS)[keyof typeof MONITORING_ATTENDANCE_STATUS]

export interface EmployeeRecord {
  id: string
  email: string
  firstName: string
  lastName: string | null
  position: string | null
  department: string | null
  dateOfBirth: string | null
  gender: EmployeeGender | null
  role: EmployeeRole
  salary: number | string | null
  joinDate: string | null
  createdAt: string
  updatedAt: string
}

export interface EmployeePaginationMetadata {
  totalRecords: number
  currentPage: number
  totalPages: number
  recordsPerPage: number
}

export interface EmployeeListResponse {
  message: string
  data: EmployeeRecord[]
  pagination: EmployeePaginationMetadata
}

export interface EmployeeDetailResponse {
  message: string
  data: EmployeeRecord
}

export interface DeleteEmployeeResponse {
  message: string
  data: {
    id: string
  }
}

export interface GetEmployeesQuery {
  page?: number
  limit?: number
  role?: EmployeeRole
  gender?: EmployeeGender
  search?: string
}

export interface CreateEmployeePayload {
  email: string
  password: string
  firstName: string
  lastName?: string
  position?: string
  department?: string
  dateOfBirth?: string
  gender?: EmployeeGender
  role?: EmployeeRole
  salary?: number
  joinDate?: string
}

export interface UpdateEmployeePayload {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  position?: string
  department?: string
  dateOfBirth?: string
  gender?: EmployeeGender
  role?: EmployeeRole
  salary?: number
  joinDate?: string
}

export interface WorkforceAttendanceUserSummary {
  id: string
  email: string
  firstName: string
  lastName: string | null
  position: string | null
  department: string | null
  role: EmployeeRole
}

export interface WorkforceAttendanceRecord {
  id: string
  userId: string
  attendanceDate: string
  clockInAt: string | null
  clockOutAt: string | null
  proofImageUrl: string | null
  notes: string | null
  status: AttendanceStatusType
  createdAt: string
  updatedAt: string
  user: WorkforceAttendanceUserSummary
}

export interface WorkforceAttendancePaginationMetadata {
  totalRecords: number
  currentPage: number
  totalPages: number
  recordsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface WorkforceAttendanceListResponse {
  message: string
  data: WorkforceAttendanceRecord[]
  pagination: WorkforceAttendancePaginationMetadata
}

export interface GetWorkforceAttendancesQuery {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  status?: AttendanceStatusType
  search?: string
}

export interface CreateManualAttendancePayload {
  userId: string
  attendanceDate: string
  status: "SICK" | "LEAVE"
  notes?: string
  proofImageUrl?: string
}

export interface HolidayRecord {
  id: string
  holidayDate: string
  name: string
  description?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateHolidayPayload {
  holidayDate: string
  name: string
  description?: string
}

export interface HolidayListResponse {
  message: string
  data: HolidayRecord[]
}

export interface MonitoringKpis {
  totalEmployees: number
  todayPresentCount: number
  upcomingHolidaysCount: number
}
