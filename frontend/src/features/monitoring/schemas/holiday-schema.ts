import { z } from "zod"
import { MONITORING_HOLIDAY_DIALOG_TEXTS } from "@/constants/monitoring"

export const createHolidaySchema = z.object({
  holidayDate: z
    .string()
    .min(1, { message: MONITORING_HOLIDAY_DIALOG_TEXTS.DATE_REQUIRED }),
  name: z
    .string()
    .min(1, { message: MONITORING_HOLIDAY_DIALOG_TEXTS.NAME_REQUIRED }),
  description: z.string().optional(),
})

export type CreateHolidayFormValues = z.infer<typeof createHolidaySchema>
