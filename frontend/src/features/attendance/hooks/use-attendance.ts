import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { attendanceService } from "../services/attendance-service"
import type { CheckInPayload, ClockOutPayload } from "@/types/attendance"

export const ATTENDANCE_QUERY_KEYS = {
  TODAY: "today-attendance",
  HISTORY: "attendance-history",
} as const

export function useTodayAttendance() {
  return useQuery({
    queryKey: [ATTENDANCE_QUERY_KEYS.TODAY],
    queryFn: attendanceService.getTodayStatus,
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
}

export function useAttendanceHistory(currentPage = 1, pageSize = 10) {
  return useQuery({
    queryKey: [ATTENDANCE_QUERY_KEYS.HISTORY, currentPage, pageSize],
    queryFn: () => attendanceService.getMyHistory(currentPage, pageSize),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
}

export function useCheckInMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CheckInPayload) =>
      attendanceService.submitCheckIn(payload),
    onSuccess: async (response) => {
      queryClient.setQueryData([ATTENDANCE_QUERY_KEYS.TODAY], {
        hasCheckedIn: true,
        hasClockedOut: false,
        attendance: response.attendance,
      })
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: [ATTENDANCE_QUERY_KEYS.TODAY],
        }),
        queryClient.refetchQueries({
          queryKey: [ATTENDANCE_QUERY_KEYS.HISTORY],
        }),
      ])
    },
  })
}

export function useClockOutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ClockOutPayload) =>
      attendanceService.submitClockOut(payload),
    onSuccess: async (response) => {
      queryClient.setQueryData([ATTENDANCE_QUERY_KEYS.TODAY], {
        hasCheckedIn: true,
        hasClockedOut: true,
        attendance: response.attendance,
      })
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: [ATTENDANCE_QUERY_KEYS.TODAY],
        }),
        queryClient.refetchQueries({
          queryKey: [ATTENDANCE_QUERY_KEYS.HISTORY],
        }),
      ])
    },
  })
}
