import { z } from "zod"
import { MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS } from "@/constants/monitoring"

export const createManualAttendanceSchema = z.object({
  userId: z
    .string()
    .min(1, { message: MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS.EMPLOYEE_REQUIRED }),
  attendanceDate: z
    .string()
    .min(1, { message: MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS.DATE_REQUIRED }),
  status: z.enum(["SICK", "LEAVE"], {
    message: MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS.STATUS_REQUIRED,
  }),
  notes: z.string().optional(),
  proofImageUrl: z.string().optional(),
})

export type CreateManualAttendanceFormValues = z.infer<
  typeof createManualAttendanceSchema
>
