import React from "react"
import { useQuery } from "@tanstack/react-query"
import { employeeService } from "../services/employee-service"
import { attendanceMonitoringService } from "../services/attendance-monitoring-service"
import { holidayService } from "../services/holiday-service"
import {
  MONITORING_QUERY_KEYS,
  MONITORING_HEADER_TEXTS,
} from "@/constants/monitoring"
import type { MonitoringKpis } from "@/types/monitoring"

export function useMonitoringKpis() {
  const todayIsoDate = React.useMemo(() => {
    const today = new Date()
    return today.toISOString().split(MONITORING_HEADER_TEXTS.ISO_DATE_DELIMITER)[0]
  }, [])

  const employeesQuery = useQuery({
    queryKey: [MONITORING_QUERY_KEYS.KPIS, "employees"],
    queryFn: async () => {
      const response = await employeeService.getEmployees({ limit: 1 })
      return response.pagination.totalRecords
    },
  })

  const todayPresentQuery = useQuery({
    queryKey: [MONITORING_QUERY_KEYS.KPIS, "todayPresent", todayIsoDate],
    queryFn: async () => {
      const response =
        await attendanceMonitoringService.getWorkforceAttendances({
          startDate: todayIsoDate,
          endDate: todayIsoDate,
          status: "PRESENT",
          limit: 1,
        })
      return response.pagination.totalRecords
    },
  })

  const holidaysQuery = useQuery({
    queryKey: [MONITORING_QUERY_KEYS.KPIS, "upcomingHolidays"],
    queryFn: async () => {
      const response = await holidayService.getAllHolidays()
      const now = new Date()
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).getTime()
      return response.data.filter((holiday) => {
        const holidayTime = new Date(holiday.holidayDate).getTime()
        return holidayTime >= todayStart
      }).length
    },
  })

  const isLoading =
    employeesQuery.isLoading ||
    todayPresentQuery.isLoading ||
    holidaysQuery.isLoading

  const isError =
    employeesQuery.isError ||
    todayPresentQuery.isError ||
    holidaysQuery.isError

  const kpis: MonitoringKpis = {
    totalEmployees: employeesQuery.data ?? 0,
    todayPresentCount: todayPresentQuery.data ?? 0,
    upcomingHolidaysCount: holidaysQuery.data ?? 0,
  }

  return {
    kpis,
    isLoading,
    isError,
  }
}
