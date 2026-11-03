import React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { AUTH_LABELS } from "@/constants/auth"
import {
  MONITORING_DASHBOARD_TEXTS,
  MONITORING_HEADER_TEXTS,
  MONITORING_ROLES,
  MONITORING_TABS,
} from "@/constants/monitoring"
import { ROUTE_PATHS } from "@/constants/routes"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { EmployeeTable } from "@/features/monitoring/components/EmployeeTable"
import { AttendanceMonitoringTable } from "@/features/monitoring/components/AttendanceMonitoringTable"
import { HolidayManagementList } from "@/features/monitoring/components/HolidayManagementList"
import { MonitoringSummaryCards } from "@/features/monitoring/components/MonitoringSummaryCards"

type MonitoringActiveTab =
  (typeof MONITORING_TABS)[keyof typeof MONITORING_TABS]

export function MonitoringPage() {
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const [activeTab, setActiveTab] = React.useState<MonitoringActiveTab>(
    MONITORING_TABS.EMPLOYEES,
  )

  const handleSignOut = async () => {
    await signOut()
    navigate(ROUTE_PATHS.AUTH, { replace: true })
  }

  const avatarInitial =
    user?.firstName?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    MONITORING_HEADER_TEXTS.DEFAULT_AVATAR_INITIAL

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card sticky top-0 z-40 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold">
              {avatarInitial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-foreground">
                  {AUTH_LABELS.MONITORING_TITLE}
                </h1>
                <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  {MONITORING_ROLES.HR_ADMIN}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {user?.email || MONITORING_HEADER_TEXTS.PORTAL_SUBTITLE}
              </p>
            </div>
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

        <div className="mx-auto max-w-7xl px-6 flex gap-8">
          <button
            type="button"
            onClick={() => setActiveTab(MONITORING_TABS.EMPLOYEES)}
            className={`pb-3 pt-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === MONITORING_TABS.EMPLOYEES
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {MONITORING_DASHBOARD_TEXTS.TAB_EMPLOYEES}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(MONITORING_TABS.ATTENDANCE)}
            className={`pb-3 pt-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === MONITORING_TABS.ATTENDANCE
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {MONITORING_DASHBOARD_TEXTS.TAB_ATTENDANCE}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(MONITORING_TABS.HOLIDAYS)}
            className={`pb-3 pt-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === MONITORING_TABS.HOLIDAYS
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {MONITORING_DASHBOARD_TEXTS.TAB_HOLIDAYS}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        <MonitoringSummaryCards />

        <div className="pt-2">
          {activeTab === MONITORING_TABS.EMPLOYEES && <EmployeeTable />}
          {activeTab === MONITORING_TABS.ATTENDANCE && (
            <AttendanceMonitoringTable />
          )}
          {activeTab === MONITORING_TABS.HOLIDAYS && <HolidayManagementList />}
        </div>
      </main>
    </div>
  )
}

export default MonitoringPage
