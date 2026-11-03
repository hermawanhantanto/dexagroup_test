import React from "react"
import { useDeleteHoliday } from "../hooks/use-holidays"
import { extractApiErrorMessage } from "../utils/error-parser"
import {
  MONITORING_HOLIDAY_DIALOG_TEXTS,
  MONITORING_DIALOG_TEXTS,
} from "@/constants/monitoring"
import type { HolidayRecord } from "@/types/monitoring"

interface DeleteHolidayDialogProps {
  isOpen: boolean
  holiday: HolidayRecord | null
  onClose: () => void
  onSuccess?: () => void
}

export function DeleteHolidayDialog({
  isOpen,
  holiday,
  onClose,
  onSuccess,
}: DeleteHolidayDialogProps) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const deleteHolidayMutation = useDeleteHoliday()

  React.useEffect(() => {
    if (isOpen) {
      setErrorMessage(null)
    }
  }, [isOpen])

  if (!isOpen || !holiday) {
    return null
  }

  const formattedDate = new Date(holiday.holidayDate).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  )

  const handleConfirmDelete = async () => {
    setErrorMessage(null)
    try {
      await deleteHolidayMutation.mutateAsync(holiday.id)
      onSuccess?.()
      onClose()
    } catch (error: unknown) {
      const parsedErrorMessage = extractApiErrorMessage(
        error,
        MONITORING_HOLIDAY_DIALOG_TEXTS.DELETE_SUCCESS,
      )
      setErrorMessage(parsedErrorMessage)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-holiday-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-xl bg-card border border-destructive/20 shadow-2xl p-6 space-y-4"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20 text-destructive">
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>

          <div className="space-y-0.5">
            <h3
              id="delete-holiday-dialog-title"
              className="text-base font-bold text-foreground tracking-tight"
            >
              {MONITORING_HOLIDAY_DIALOG_TEXTS.DELETE_TITLE}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {MONITORING_HOLIDAY_DIALOG_TEXTS.DELETE_SUBTITLE}
            </p>
          </div>
        </div>

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

        <div className="rounded-lg bg-muted/40 p-3.5 border border-border space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground font-medium">Holiday</span>
            <span className="font-semibold text-foreground">{holiday.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground font-medium">Date</span>
            <span className="text-foreground">{formattedDate}</span>
          </div>
          {holiday.description && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground font-medium">Details</span>
              <span className="text-muted-foreground text-xs truncate max-w-xs">
                {holiday.description}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteHolidayMutation.isPending}
            className="px-3.5 py-2 text-xs font-semibold text-secondary-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors border border-border cursor-pointer"
          >
            {MONITORING_DIALOG_TEXTS.CANCEL}
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={deleteHolidayMutation.isPending}
            className="px-4 py-2 text-xs font-semibold text-destructive-foreground bg-destructive hover:bg-destructive/90 disabled:opacity-50 rounded-md transition-colors shadow-xs cursor-pointer"
          >
            {deleteHolidayMutation.isPending
              ? MONITORING_DIALOG_TEXTS.DELETING
              : MONITORING_HOLIDAY_DIALOG_TEXTS.DELETE_CONFIRM}
          </button>
        </div>
      </div>
    </div>
  )
}
