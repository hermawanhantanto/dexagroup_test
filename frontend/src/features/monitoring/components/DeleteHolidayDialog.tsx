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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <svg
              className="h-6 w-6"
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

          <div className="space-y-1">
            <h3
              id="delete-holiday-dialog-title"
              className="text-lg font-bold text-white tracking-tight"
            >
              {MONITORING_HOLIDAY_DIALOG_TEXTS.DELETE_TITLE}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {MONITORING_HOLIDAY_DIALOG_TEXTS.DELETE_SUBTITLE}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium"
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

        <div className="rounded-xl bg-neutral-950 p-4 border border-neutral-800 space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-500 font-medium">Holiday</span>
            <span className="font-semibold text-white">{holiday.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-500 font-medium">Date</span>
            <span className="text-neutral-300">{formattedDate}</span>
          </div>
          {holiday.description && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-500 font-medium">Details</span>
              <span className="text-neutral-400 text-xs truncate max-w-xs">
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
            className="px-4 py-2 text-sm font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors"
          >
            {MONITORING_DIALOG_TEXTS.CANCEL}
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={deleteHolidayMutation.isPending}
            className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl transition-colors shadow-lg shadow-rose-600/20"
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
