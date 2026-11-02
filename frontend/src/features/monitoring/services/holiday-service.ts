import { monitoringApiClient } from "@/lib/api-client"
import { MONITORING_ENDPOINTS } from "@/constants/monitoring"
import type {
  CreateHolidayPayload,
  HolidayListResponse,
  HolidayRecord,
} from "@/types/monitoring"

export const holidayService = {
  async getAllHolidays(): Promise<HolidayListResponse> {
    const response = await monitoringApiClient.get<HolidayListResponse>(
      MONITORING_ENDPOINTS.HOLIDAYS,
    )
    return response.data
  },

  async createHoliday(
    payload: CreateHolidayPayload,
  ): Promise<{ message: string; data: HolidayRecord }> {
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
      data: HolidayRecord
    }>(
      MONITORING_ENDPOINTS.HOLIDAYS,
      sanitizedPayload as unknown as CreateHolidayPayload,
    )
    return response.data
  },

  async deleteHoliday(
    holidayId: string,
  ): Promise<{ message: string; data: { id: string } }> {
    const response = await monitoringApiClient.delete<{
      message: string
      data: { id: string }
    }>(MONITORING_ENDPOINTS.HOLIDAY_BY_ID(holidayId))
    return response.data
  },
}
