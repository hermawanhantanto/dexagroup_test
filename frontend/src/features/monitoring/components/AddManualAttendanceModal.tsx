import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEmployees } from "../hooks/use-employees"
import { useCreateManualAttendance } from "../hooks/use-attendance-monitoring"
import {
  createManualAttendanceSchema,
  type CreateManualAttendanceFormValues,
} from "../schemas/manual-attendance-schema"
import { extractApiErrorMessage, isConflictApiError } from "../utils/error-parser"
import {
  MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS,
  MONITORING_MANUAL_ATTENDANCE_STATUS_OPTIONS,
  MONITORING_DIALOG_TEXTS,
  MONITORING_HEADER_TEXTS,
} from "@/constants/monitoring"
import type { CreateManualAttendancePayload } from "@/types/monitoring"

interface AddManualAttendanceModalProps {
  isOpen: boolean
  onClose: () => void
  preselectedUserId?: string
}

export function AddManualAttendanceModal({
  isOpen,
  onClose,
  preselectedUserId,
}: AddManualAttendanceModalProps) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const createManualAttendanceMutation = useCreateManualAttendance()

  const { data: employeesResponse, isLoading: isLoadingEmployees } = useEmployees({
    limit: 100,
  })

  const employees = employeesResponse?.data || []

  const todayIsoDate = React.useMemo(() => {
    const today = new Date()
    return today.toISOString().split(MONITORING_HEADER_TEXTS.ISO_DATE_DELIMITER)[0]
  }, [])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateManualAttendanceFormValues>({
    resolver: zodResolver(createManualAttendanceSchema),
    defaultValues: {
      userId: preselectedUserId || "",
      attendanceDate: todayIsoDate,
      status: "SICK",
      notes: "",
      proofImageUrl: "",
    },
  })

  React.useEffect(() => {
    if (isOpen) {
      reset({
        userId: preselectedUserId || "",
        attendanceDate: todayIsoDate,
        status: "SICK",
        notes: "",
        proofImageUrl: "",
      })
      setErrorMessage(null)
    }
  }, [isOpen, preselectedUserId, todayIsoDate, reset])

  React.useEffect(() => {
    if (preselectedUserId) {
      setValue("userId", preselectedUserId)
    }
  }, [preselectedUserId, setValue])

  if (!isOpen) {
    return null
  }

  const handleFormSubmit = async (
    formValues: CreateManualAttendanceFormValues,
  ) => {
    setErrorMessage(null)
    try {
      const sanitizedPayload: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(formValues)) {
        if (value !== undefined && value !== null && value !== "") {
          sanitizedPayload[key] = value
        }
      }

      await createManualAttendanceMutation.mutateAsync(
        sanitizedPayload as unknown as CreateManualAttendancePayload,
      )
      onClose()
    } catch (submissionError: unknown) {
      if (isConflictApiError(submissionError)) {
        setErrorMessage(
          MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS.CONFLICT_ERROR,
        )
      } else {
        const parsedMessage = extractApiErrorMessage(
          submissionError,
          MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS.CONFLICT_ERROR,
        )
        setErrorMessage(parsedMessage)
      }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-attendance-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-xl bg-card border border-border shadow-2xl"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3
              id="manual-attendance-title"
              className="text-base font-bold text-foreground"
            >
              {MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS.TITLE}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS.SUBTITLE}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="p-6 space-y-4"
        >
          {errorMessage && (
            <div
              role="alert"
              className="flex items-center gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium"
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="userId"
              className="block text-xs font-medium text-foreground mb-1.5"
            >
              {MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS.FIELD_EMPLOYEE}{" "}
              <span className="text-destructive">*</span>
            </label>
            <select
              id="userId"
              {...register("userId")}
              disabled={isLoadingEmployees}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-all"
            >
              <option value="">
                {
                  MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS.FIELD_EMPLOYEE_PLACEHOLDER
                }
              </option>
              {employees.map((employee) => {
                const fullName = [employee.firstName, employee.lastName]
                  .filter(Boolean)
                  .join(" ")
                const departmentInfo = employee.department
                  ? ` - ${employee.department}`
                  : ""
                return (
                  <option key={employee.id} value={employee.id}>
                    {fullName} ({employee.email}
                    {departmentInfo})
                  </option>
                )
              })}
            </select>
            {errors.userId && (
              <p className="mt-1 text-xs text-destructive">
                {errors.userId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="attendanceDate"
                className="block text-xs font-medium text-foreground mb-1.5"
              >
                {MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS.FIELD_DATE}{" "}
                <span className="text-destructive">*</span>
              </label>
              <input
                id="attendanceDate"
                type="date"
                {...register("attendanceDate")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-all"
              />
              {errors.attendanceDate && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.attendanceDate.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-xs font-medium text-foreground mb-1.5"
              >
                {MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS.FIELD_STATUS}{" "}
                <span className="text-destructive">*</span>
              </label>
              <select
                id="status"
                {...register("status")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-all"
              >
                {MONITORING_MANUAL_ATTENDANCE_STATUS_OPTIONS.map((statusOption) => (
                  <option key={statusOption.value} value={statusOption.value}>
                    {statusOption.label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-xs font-medium text-foreground mb-1.5"
            >
              {MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS.FIELD_NOTES}
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder={
                MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS.FIELD_NOTES_PLACEHOLDER
              }
              {...register("notes")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-all resize-none"
            />
            {errors.notes && (
              <p className="mt-1 text-xs text-destructive">
                {errors.notes.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="proofImageUrl"
              className="block text-xs font-medium text-foreground mb-1.5"
            >
              {MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS.FIELD_PROOF_URL}
            </label>
            <input
              id="proofImageUrl"
              type="text"
              placeholder={
                MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS.FIELD_PROOF_URL_PLACEHOLDER
              }
              {...register("proofImageUrl")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-all"
            />
            {errors.proofImageUrl && (
              <p className="mt-1 text-xs text-destructive">
                {errors.proofImageUrl.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-semibold text-secondary-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors border border-border cursor-pointer"
            >
              {MONITORING_DIALOG_TEXTS.CANCEL}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-md transition-colors shadow-xs cursor-pointer"
            >
              {isSubmitting
                ? MONITORING_DIALOG_TEXTS.CREATING
                : MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS.CREATE_BUTTON}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
