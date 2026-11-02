import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { attendanceMonitoringService } from "../services/attendance-monitoring-service"
import { MONITORING_QUERY_KEYS } from "@/constants/monitoring"
import type { GetWorkforceAttendancesQuery } from "@/types/monitoring"

export function useWorkforceAttendances(query?: GetWorkforceAttendancesQuery) {
  return useQuery({
    queryKey: [MONITORING_QUERY_KEYS.ATTENDANCES, query],
    queryFn: () => attendanceMonitoringService.getWorkforceAttendances(query),
    placeholderData: keepPreviousData,
  })
}

export function useAttendanceDetail(attendanceId: string) {
  return useQuery({
    queryKey: [MONITORING_QUERY_KEYS.ATTENDANCE_DETAIL, attendanceId],
    queryFn: () => attendanceMonitoringService.getAttendanceById(attendanceId),
    enabled: Boolean(attendanceId),
  })
}
