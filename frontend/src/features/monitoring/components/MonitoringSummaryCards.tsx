import { useMonitoringKpis } from "../hooks/use-monitoring-kpis"
import { MONITORING_DASHBOARD_TEXTS } from "@/constants/monitoring"

export function MonitoringSummaryCards() {
  const { kpis, isLoading } = useMonitoringKpis()

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              {MONITORING_DASHBOARD_TEXTS.KPI_TOTAL_EMPLOYEES}
            </p>
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-neutral-800" />
            ) : (
              <p className="text-3xl font-extrabold tracking-tight text-white">
                {kpis.totalEmployees}
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              {MONITORING_DASHBOARD_TEXTS.KPI_TODAY_PRESENT}
            </p>
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-neutral-800" />
            ) : (
              <p className="text-3xl font-extrabold tracking-tight text-white">
                {kpis.todayPresentCount}
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              {MONITORING_DASHBOARD_TEXTS.KPI_UPCOMING_HOLIDAYS}
            </p>
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-neutral-800" />
            ) : (
              <p className="text-3xl font-extrabold tracking-tight text-white">
                {kpis.upcomingHolidaysCount}
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
