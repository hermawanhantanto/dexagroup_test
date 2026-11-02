import * as React from "react"
import { ChevronLeft, ChevronRight, Eye, Calendar, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_UI_MESSAGES,
} from "@/constants/attendance"
import { useAttendanceHistory } from "../hooks/use-attendance"
import type { AttendanceRecord, AttendanceStatus } from "@/types/attendance"

export function AttendanceHistoryTable() {
  const [currentPage, setCurrentPage] = React.useState(1)
  const [selectedPhotoUrl, setSelectedPhotoUrl] = React.useState<string | null>(null)

  const { data, isLoading, isError, error } = useAttendanceHistory(currentPage, 10)

  const formatDisplayDate = (dateString: string): string => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString))
  }

  const formatDisplayTime = (timestamp?: string | null): string => {
    if (!timestamp) return "-"
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(timestamp))
  }

  const renderStatusBadge = (status: AttendanceStatus) => {
    const statusLabel = ATTENDANCE_STATUS_LABELS[status] || status
    if (status === "PRESENT") {
      return (
        <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {statusLabel}
        </span>
      )
    }
    if (status === "SICK") {
      return (
        <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
          {statusLabel}
        </span>
      )
    }
    return (
      <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        {statusLabel}
      </span>
    )
  }

  const attendanceList = data?.data || []
  const pagination = data?.pagination

  return (
    <Card className="border border-border bg-card shadow-xs">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-bold text-foreground">
            {ATTENDANCE_UI_MESSAGES.HISTORY_TITLE}
          </CardTitle>
        </div>
        <CardDescription>
          {ATTENDANCE_UI_MESSAGES.HISTORY_SUBTITLE}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            {(error as Error)?.message || "Failed to load attendance history."}
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading attendance records...
          </div>
        ) : attendanceList.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {ATTENDANCE_UI_MESSAGES.NO_HISTORY_MESSAGE}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">{ATTENDANCE_UI_MESSAGES.DATE_LABEL}</th>
                  <th className="px-4 py-3">{ATTENDANCE_UI_MESSAGES.CLOCK_IN_TIME_LABEL}</th>
                  <th className="px-4 py-3">{ATTENDANCE_UI_MESSAGES.CLOCK_OUT_TIME_LABEL}</th>
                  <th className="px-4 py-3">{ATTENDANCE_UI_MESSAGES.STATUS_LABEL}</th>
                  <th className="px-4 py-3">{ATTENDANCE_UI_MESSAGES.NOTES_LABEL}</th>
                  <th className="px-4 py-3 text-right">{ATTENDANCE_UI_MESSAGES.PROOF_LABEL}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attendanceList.map((record: AttendanceRecord) => (
                  <tr key={record.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                      {formatDisplayDate(record.attendanceDate)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDisplayTime(record.clockInAt)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDisplayTime(record.clockOutAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {renderStatusBadge(record.status)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                      {record.notes ? (
                        <span title={record.notes} className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 shrink-0 opacity-60" />
                          <span className="truncate">{record.notes}</span>
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {record.proofImageUrl ? (
                        <button
                          type="button"
                          onClick={() => setSelectedPhotoUrl(record.proofImageUrl)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {ATTENDANCE_UI_MESSAGES.VIEW_PHOTO}
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
            <div>
              {ATTENDANCE_UI_MESSAGES.PAGE_OF} {pagination.currentPage} of{" "}
              {pagination.totalPages} ({pagination.totalRecords} total records)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((previous) => Math.max(previous - 1, 1))}
                disabled={!pagination.hasPreviousPage}
                className="cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                {ATTENDANCE_UI_MESSAGES.PAGINATION_PREV}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((previous) =>
                    Math.min(previous + 1, pagination.totalPages),
                  )
                }
                disabled={!pagination.hasNextPage}
                className="cursor-pointer"
              >
                {ATTENDANCE_UI_MESSAGES.PAGINATION_NEXT}
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {selectedPhotoUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setSelectedPhotoUrl(null)}
          >
            <div
              className="relative max-w-lg rounded-xl bg-card p-4 shadow-xl ring-1 ring-border"
              onClick={(clickEvent) => clickEvent.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Proof Photo
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedPhotoUrl(null)}
                  className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Close
                </button>
              </div>
              <img
                src={selectedPhotoUrl}
                alt="Selfie proof"
                className="max-h-[70vh] w-full rounded-lg object-contain"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
