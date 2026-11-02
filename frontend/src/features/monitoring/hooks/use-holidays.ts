import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { holidayService } from "../services/holiday-service"
import { MONITORING_QUERY_KEYS } from "@/constants/monitoring"
import type { CreateHolidayPayload } from "@/types/monitoring"

export function useHolidays() {
  return useQuery({
    queryKey: [MONITORING_QUERY_KEYS.HOLIDAYS],
    queryFn: () => holidayService.getAllHolidays(),
  })
}

export function useCreateHoliday() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateHolidayPayload) =>
      holidayService.createHoliday(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [MONITORING_QUERY_KEYS.HOLIDAYS],
        }),
        queryClient.invalidateQueries({
          queryKey: [MONITORING_QUERY_KEYS.KPIS],
        }),
      ])
    },
  })
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (holidayId: string) => holidayService.deleteHoliday(holidayId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [MONITORING_QUERY_KEYS.HOLIDAYS],
        }),
        queryClient.invalidateQueries({
          queryKey: [MONITORING_QUERY_KEYS.KPIS],
        }),
      ])
    },
  })
}
