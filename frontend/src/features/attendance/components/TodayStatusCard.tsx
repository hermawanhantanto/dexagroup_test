import * as React from "react"
import { Clock, CheckCircle2, AlertCircle, Calendar, Image as ImageIcon, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ATTENDANCE_UI_MESSAGES } from "@/constants/attendance"
import { cn } from "@/lib/utils"
import type { AttendanceRecord } from "@/types/attendance"

interface TodayStatusCardProps {
  hasCheckedIn: boolean
  hasClockedOut: boolean
  attendance: AttendanceRecord | null
  isLoading?: boolean
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function TodayStatusCard({
  hasCheckedIn,
  hasClockedOut,
  attendance,
  isLoading,
  onRefresh,
  isRefreshing,
}: TodayStatusCardProps) {
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = React.useState(false)

  const [todayDate] = React.useState(() => new Date())

  const formattedToday = React.useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(todayDate)
  }, [todayDate])

  const formatTimestamp = (dateString?: string | null): string => {
    if (!dateString) return ATTENDANCE_UI_MESSAGES.NOT_RECORDED
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(new Date(dateString))
  }

  return (
    <Card className="border border-border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedToday}</span>
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              {ATTENDANCE_UI_MESSAGES.TODAY_SUMMARY_TITLE}
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading || isRefreshing}
                className="h-7 px-2.5 text-xs cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <RefreshCw
                  className={cn(
                    "h-3 w-3 mr-1.5",
                    (isLoading || isRefreshing) && "animate-spin",
                  )}
                />
                Refresh
              </Button>
            )}

            {!hasCheckedIn ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-3.5 w-3.5" />
                Not Clocked In
              </span>
            ) : hasClockedOut ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <Clock className="h-3.5 w-3.5" />
                Clocked In (Active)
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            Loading today's status...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5">
              <span className="text-xs font-medium text-muted-foreground">
                {ATTENDANCE_UI_MESSAGES.CLOCK_IN_TIME_LABEL}
              </span>
              <p className="mt-1 text-base font-semibold text-foreground">
                {hasCheckedIn
                  ? formatTimestamp(attendance?.clockInAt)
                  : ATTENDANCE_UI_MESSAGES.NOT_RECORDED}
              </p>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5">
              <span className="text-xs font-medium text-muted-foreground">
                {ATTENDANCE_UI_MESSAGES.CLOCK_OUT_TIME_LABEL}
              </span>
              <p className="mt-1 text-base font-semibold text-foreground">
                {hasClockedOut
                  ? formatTimestamp(attendance?.clockOutAt)
                  : ATTENDANCE_UI_MESSAGES.NOT_RECORDED}
              </p>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5 sm:col-span-2 lg:col-span-1">
              <span className="text-xs font-medium text-muted-foreground">
                {ATTENDANCE_UI_MESSAGES.PROOF_LABEL}
              </span>
              <div className="mt-1 flex items-center gap-2">
                {attendance?.proofImageUrl ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsPhotoPreviewOpen(true)}
                      className="group relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted cursor-pointer hover:opacity-80"
                    >
                      <img
                        src={attendance.proofImageUrl}
                        alt="Today's attendance proof"
                        className="h-full w-full object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPhotoPreviewOpen(true)}
                      className="text-xs font-medium text-primary hover:underline cursor-pointer"
                    >
                      {ATTENDANCE_UI_MESSAGES.VIEW_PHOTO}
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    <span>No proof uploaded yet</span>
                  </div>
                )}
              </div>
            </div>

            {attendance?.notes && (
              <div className="col-span-full rounded-lg border border-border/60 bg-muted/30 p-3.5">
                <span className="text-xs font-medium text-muted-foreground">
                  {ATTENDANCE_UI_MESSAGES.NOTES_LABEL}
                </span>
                <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                  {attendance.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {isPhotoPreviewOpen && attendance?.proofImageUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setIsPhotoPreviewOpen(false)}
          >
            <div
              className="relative max-w-lg rounded-xl bg-card p-4 shadow-xl ring-1 ring-border"
              onClick={(clickEvent) => clickEvent.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Selfie Proof Preview
                </h3>
                <button
                  type="button"
                  onClick={() => setIsPhotoPreviewOpen(false)}
                  className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Close
                </button>
              </div>
              <img
                src={attendance.proofImageUrl}
                alt="Selfie proof preview"
                className="max-h-[70vh] w-full rounded-lg object-contain"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
