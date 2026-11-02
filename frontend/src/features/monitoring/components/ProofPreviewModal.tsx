import React from "react"
import {
  MONITORING_PROOF_MODAL_TEXTS,
  MONITORING_FORMATTING,
} from "@/constants/monitoring"
import type { WorkforceAttendanceRecord } from "@/types/monitoring"

interface ProofPreviewModalProps {
  isOpen: boolean
  attendanceRecord: WorkforceAttendanceRecord | null
  onClose: () => void
}

export function ProofPreviewModal({
  isOpen,
  attendanceRecord,
  onClose,
}: ProofPreviewModalProps) {
  const [imageLoadFailed, setImageLoadFailed] = React.useState<boolean>(false)

  React.useEffect(() => {
    setImageLoadFailed(false)
  }, [attendanceRecord?.id])

  if (!isOpen || !attendanceRecord) {
    return null
  }

  const employeeFullName = [
    attendanceRecord.user.firstName,
    attendanceRecord.user.lastName,
  ]
    .filter(Boolean)
    .join(" ")

  const formattedAttendanceDate = new Date(
    attendanceRecord.attendanceDate,
  ).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const formattedClockInTime = attendanceRecord.clockInAt
    ? new Date(attendanceRecord.clockInAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : MONITORING_FORMATTING.EMPTY_VALUE_PLACEHOLDER

  const formattedClockOutTime = attendanceRecord.clockOutAt
    ? new Date(attendanceRecord.clockOutAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : MONITORING_FORMATTING.EMPTY_VALUE_PLACEHOLDER

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="proof-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
          <div>
            <h3
              id="proof-modal-title"
              className="text-lg font-semibold text-white"
            >
              {MONITORING_PROOF_MODAL_TEXTS.TITLE}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {MONITORING_PROOF_MODAL_TEXTS.SUBTITLE}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
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

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-center rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 aspect-video relative">
            {attendanceRecord.proofImageUrl && !imageLoadFailed ? (
              <img
                src={attendanceRecord.proofImageUrl}
                alt={MONITORING_PROOF_MODAL_TEXTS.IMAGE_ALT}
                className="w-full h-full object-contain"
                onError={() => setImageLoadFailed(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-neutral-500 p-6 text-center">
                <svg
                  className="w-12 h-12 mb-2 text-neutral-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm font-medium">No photo proof available</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm bg-neutral-800/40 p-4 rounded-xl border border-neutral-800">
            <div>
              <span className="text-xs text-neutral-400 block font-medium">
                {MONITORING_PROOF_MODAL_TEXTS.EMPLOYEE}
              </span>
              <p className="font-semibold text-white mt-0.5">
                {employeeFullName}
              </p>
              <p className="text-xs text-neutral-400">
                {attendanceRecord.user.email}
              </p>
            </div>

            <div>
              <span className="text-xs text-neutral-400 block font-medium">
                {MONITORING_PROOF_MODAL_TEXTS.STATUS}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {attendanceRecord.status}
              </span>
            </div>

            <div>
              <span className="text-xs text-neutral-400 block font-medium">
                {MONITORING_PROOF_MODAL_TEXTS.ATTENDANCE_DATE}
              </span>
              <p className="text-neutral-200 mt-0.5">
                {formattedAttendanceDate}
              </p>
            </div>

            <div>
              <span className="text-xs text-neutral-400 block font-medium">
                {MONITORING_PROOF_MODAL_TEXTS.CLOCK_IN}
              </span>
              <p className="text-neutral-200 mt-0.5">
                {formattedClockInTime}
              </p>
            </div>

            <div>
              <span className="text-xs text-neutral-400 block font-medium">
                {MONITORING_PROOF_MODAL_TEXTS.CLOCK_OUT}
              </span>
              <p className="text-neutral-200 mt-0.5">
                {formattedClockOutTime}
              </p>
            </div>

            <div>
              <span className="text-xs text-neutral-400 block font-medium">
                {MONITORING_PROOF_MODAL_TEXTS.DEPARTMENT}
              </span>
              <p className="text-neutral-200 mt-0.5">
                {attendanceRecord.user.department ||
                  MONITORING_FORMATTING.EMPTY_VALUE_PLACEHOLDER}
              </p>
            </div>
          </div>

          <div>
            <span className="text-xs text-neutral-400 block font-medium mb-1">
              {MONITORING_PROOF_MODAL_TEXTS.NOTES}
            </span>
            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-sm text-neutral-300 min-h-[4rem] max-h-28 overflow-y-auto whitespace-pre-wrap">
              {attendanceRecord.notes ||
                MONITORING_FORMATTING.EMPTY_VALUE_PLACEHOLDER}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-neutral-800 px-6 py-4 bg-neutral-950/50">
          {attendanceRecord.proofImageUrl ? (
            <a
              href={attendanceRecord.proofImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              {MONITORING_PROOF_MODAL_TEXTS.OPEN_FULL}
            </a>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            {MONITORING_PROOF_MODAL_TEXTS.CLOSE}
          </button>
        </div>
      </div>
    </div>
  )
}
