import { monitoringApiClient } from "@/lib/api-client"
import { MONITORING_ENDPOINTS } from "@/constants/monitoring"
import type {
  CreateEmployeePayload,
  DeleteEmployeeResponse,
  EmployeeDetailResponse,
  EmployeeListResponse,
  GetEmployeesQuery,
  UpdateEmployeePayload,
} from "@/types/monitoring"

export const employeeService = {
  async getEmployees(query?: GetEmployeesQuery): Promise<EmployeeListResponse> {
    const sanitizedQueryParams: Record<string, unknown> = {}

    if (query) {
      for (const [parameterKey, parameterValue] of Object.entries(query)) {
        if (
          parameterValue !== undefined &&
          parameterValue !== null &&
          parameterValue !== ""
        ) {
          sanitizedQueryParams[parameterKey] = parameterValue
        }
      }
    }

    const response = await monitoringApiClient.get<EmployeeListResponse>(
      MONITORING_ENDPOINTS.EMPLOYEES,
      { params: sanitizedQueryParams },
    )
    return response.data
  },

  async getEmployeeById(employeeId: string): Promise<EmployeeDetailResponse> {
    const response = await monitoringApiClient.get<EmployeeDetailResponse>(
      MONITORING_ENDPOINTS.EMPLOYEE_BY_ID(employeeId),
    )
    return response.data
  },

  async createEmployee(
    payload: CreateEmployeePayload,
  ): Promise<EmployeeDetailResponse> {
    const response = await monitoringApiClient.post<EmployeeDetailResponse>(
      MONITORING_ENDPOINTS.EMPLOYEES,
      payload,
    )
    return response.data
  },

  async updateEmployee(
    employeeId: string,
    payload: UpdateEmployeePayload,
  ): Promise<EmployeeDetailResponse> {
    const sanitizedUpdatePayload: Record<string, unknown> = {}

    for (const [propertyKey, propertyValue] of Object.entries(payload)) {
      if (propertyValue === undefined || propertyValue === null) {
        continue
      }

      if (propertyKey === "password") {
        if (
          typeof propertyValue === "string" &&
          propertyValue.trim().length > 0
        ) {
          sanitizedUpdatePayload.password = propertyValue
        }
        continue
      }

      if (propertyKey === "salary") {
        if (typeof propertyValue === "number" && !isNaN(propertyValue)) {
          sanitizedUpdatePayload.salary = propertyValue
        } else if (
          typeof propertyValue === "string" &&
          propertyValue.trim().length > 0
        ) {
          const numericSalary = Number(propertyValue)
          if (!isNaN(numericSalary)) {
            sanitizedUpdatePayload.salary = numericSalary
          }
        }
        continue
      }

      if (typeof propertyValue === "string") {
        const trimmedStringValue = propertyValue.trim()
        if (trimmedStringValue.length > 0) {
          sanitizedUpdatePayload[propertyKey] = trimmedStringValue
        }
        continue
      }

      sanitizedUpdatePayload[propertyKey] = propertyValue
    }

    const response = await monitoringApiClient.patch<EmployeeDetailResponse>(
      MONITORING_ENDPOINTS.EMPLOYEE_BY_ID(employeeId),
      sanitizedUpdatePayload,
    )
    return response.data
  },

  async deleteEmployee(employeeId: string): Promise<DeleteEmployeeResponse> {
    const response = await monitoringApiClient.delete<DeleteEmployeeResponse>(
      MONITORING_ENDPOINTS.EMPLOYEE_BY_ID(employeeId),
    )
    return response.data
  },
}
