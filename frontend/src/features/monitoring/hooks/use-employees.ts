import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { employeeService } from "../services/employee-service"
import { MONITORING_QUERY_KEYS } from "@/constants/monitoring"
import type {
  CreateEmployeePayload,
  GetEmployeesQuery,
  UpdateEmployeePayload,
} from "@/types/monitoring"

export function useEmployees(query?: GetEmployeesQuery) {
  return useQuery({
    queryKey: [MONITORING_QUERY_KEYS.EMPLOYEES, query],
    queryFn: () => employeeService.getEmployees(query),
    placeholderData: keepPreviousData,
  })
}

export function useEmployeeDetail(employeeId: string) {
  return useQuery({
    queryKey: [MONITORING_QUERY_KEYS.EMPLOYEE_DETAIL, employeeId],
    queryFn: () => employeeService.getEmployeeById(employeeId),
    enabled: Boolean(employeeId),
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) =>
      employeeService.createEmployee(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [MONITORING_QUERY_KEYS.EMPLOYEES],
        }),
        queryClient.invalidateQueries({
          queryKey: [MONITORING_QUERY_KEYS.KPIS],
        }),
      ])
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      employeeId,
      payload,
    }: {
      employeeId: string
      payload: UpdateEmployeePayload
    }) => employeeService.updateEmployee(employeeId, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [MONITORING_QUERY_KEYS.EMPLOYEES],
        }),
        queryClient.invalidateQueries({
          queryKey: [
            MONITORING_QUERY_KEYS.EMPLOYEE_DETAIL,
            variables.employeeId,
          ],
        }),
      ])
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (employeeId: string) =>
      employeeService.deleteEmployee(employeeId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [MONITORING_QUERY_KEYS.EMPLOYEES],
        }),
        queryClient.invalidateQueries({
          queryKey: [MONITORING_QUERY_KEYS.KPIS],
        }),
      ])
    },
  })
}
