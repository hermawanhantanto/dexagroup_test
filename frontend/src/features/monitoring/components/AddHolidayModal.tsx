import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateHoliday } from "../hooks/use-holidays"
import {
  createHolidaySchema,
  type CreateHolidayFormValues,
} from "../schemas/holiday-schema"
import { extractApiErrorMessage, isConflictApiError } from "../utils/error-parser"
import {
  MONITORING_HOLIDAY_DIALOG_TEXTS,
  MONITORING_DIALOG_TEXTS,
} from "@/constants/monitoring"

interface AddHolidayModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddHolidayModal({ isOpen, onClose }: AddHolidayModalProps) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const createHolidayMutation = useCreateHoliday()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateHolidayFormValues>({
    resolver: zodResolver(createHolidaySchema),
    defaultValues: {
      holidayDate: "",
      name: "",
      description: "",
    },
  })

  React.useEffect(() => {
    if (isOpen) {
      reset({
        holidayDate: "",
        name: "",
        description: "",
      })
      setErrorMessage(null)
    }
  }, [isOpen, reset])

  if (!isOpen) {
    return null
  }

  const handleFormSubmit = async (values: CreateHolidayFormValues) => {
    setErrorMessage(null)
    try {
      const sanitizedPayload: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(values)) {
        if (val !== undefined && val !== null && val !== "") {
          sanitizedPayload[key] = val
        }
      }

      await createHolidayMutation.mutateAsync(
        sanitizedPayload as unknown as CreateHolidayFormValues,
      )
      onClose()
    } catch (error: unknown) {
      if (isConflictApiError(error)) {
        setErrorMessage(MONITORING_HOLIDAY_DIALOG_TEXTS.CONFLICT_ERROR)
      } else {
        const extractedMessage = extractApiErrorMessage(
          error,
          MONITORING_HOLIDAY_DIALOG_TEXTS.CONFLICT_ERROR,
        )
        setErrorMessage(extractedMessage)
      }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-holiday-title"
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
              id="add-holiday-title"
              className="text-base font-bold text-foreground"
            >
              {MONITORING_HOLIDAY_DIALOG_TEXTS.ADD_TITLE}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {MONITORING_HOLIDAY_DIALOG_TEXTS.ADD_SUBTITLE}
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

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
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
              htmlFor="holidayDate"
              className="block text-xs font-medium text-foreground mb-1.5"
            >
              {MONITORING_HOLIDAY_DIALOG_TEXTS.FIELD_DATE}{" "}
              <span className="text-destructive">*</span>
            </label>
            <input
              id="holidayDate"
              type="date"
              {...register("holidayDate")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-all"
            />
            {errors.holidayDate && (
              <p className="mt-1 text-xs text-destructive">
                {errors.holidayDate.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-xs font-medium text-foreground mb-1.5"
            >
              {MONITORING_HOLIDAY_DIALOG_TEXTS.FIELD_NAME}{" "}
              <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder={
                MONITORING_HOLIDAY_DIALOG_TEXTS.FIELD_NAME_PLACEHOLDER
              }
              {...register("name")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-all"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-xs font-medium text-foreground mb-1.5"
            >
              {MONITORING_HOLIDAY_DIALOG_TEXTS.FIELD_DESC}
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder={
                MONITORING_HOLIDAY_DIALOG_TEXTS.FIELD_DESC_PLACEHOLDER
              }
              {...register("description")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-all resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-destructive">
                {errors.description.message}
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
                : MONITORING_HOLIDAY_DIALOG_TEXTS.CREATE_BUTTON}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
