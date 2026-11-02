import { useNavigate } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AUTH_LABELS } from "@/constants/auth"
import { ATTENDANCE_UI_MESSAGES } from "@/constants/attendance"
import { ROUTE_PATHS } from "@/constants/routes"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useTodayAttendance } from "@/features/attendance/hooks/use-attendance"
import { TodayStatusCard } from "@/features/attendance/components/TodayStatusCard"
import { CheckInForm } from "@/features/attendance/components/CheckInForm"
import { ClockOutForm } from "@/features/attendance/components/ClockOutForm"
import { AttendanceHistoryTable } from "@/features/attendance/components/AttendanceHistoryTable"

export function AttendancePage() {
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const {
    data: todayData,
    isLoading: isLoadingToday,
    refetch: refetchToday,
    isRefetching: isRefetchingToday,
  } = useTodayAttendance()

  const handleSignOut = async () => {
    await signOut()
    navigate(ROUTE_PATHS.AUTH, { replace: true })
  }

  const hasCheckedIn = Boolean(todayData?.hasCheckedIn)
  const hasClockedOut = Boolean(todayData?.hasClockedOut)
  const todayAttendance = todayData?.attendance ?? null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="space-y-0.5">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              {ATTENDANCE_UI_MESSAGES.TITLE}
            </h1>
            <p className="text-xs text-muted-foreground">
              {user?.email || "Employee Portal"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="cursor-pointer"
          >
            {AUTH_LABELS.SIGN_OUT_BUTTON}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {ATTENDANCE_UI_MESSAGES.TITLE}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {ATTENDANCE_UI_MESSAGES.SUBTITLE}
          </p>
        </div>

        <TodayStatusCard
          hasCheckedIn={hasCheckedIn}
          hasClockedOut={hasClockedOut}
          attendance={todayAttendance}
          isLoading={isLoadingToday}
          onRefresh={() => refetchToday()}
          isRefreshing={isRefetchingToday}
        />

        {!isLoadingToday && (
          <div>
            {!hasCheckedIn ? (
              <CheckInForm onCheckInSuccess={() => refetchToday()} />
            ) : !hasClockedOut ? (
              <ClockOutForm
                key={
                  todayAttendance
                    ? `${todayAttendance.id}-${todayAttendance.notes ?? ""}`
                    : "clock-out-form"
                }
                initialNotes={todayAttendance?.notes}
                clockInAt={todayAttendance?.clockInAt}
              />
            ) : (
              <Card className="border border-emerald-500/20 bg-emerald-500/5 shadow-xs">
                <CardContent className="flex items-center gap-3 p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {ATTENDANCE_UI_MESSAGES.DAY_COMPLETED_TITLE}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ATTENDANCE_UI_MESSAGES.DAY_COMPLETED_SUBTITLE}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <AttendanceHistoryTable />
      </main>
    </div>
  )
}

export default AttendancePage
