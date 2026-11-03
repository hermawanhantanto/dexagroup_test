import React from "react"
import { useWorkforceAttendances } from "../hooks/use-attendance-monitoring"
import { ProofPreviewModal } from "./ProofPreviewModal"
import { AddManualAttendanceModal } from "./AddManualAttendanceModal"
import {
  MONITORING_ATTENDANCE_TABLE_HEADERS,
  MONITORING_ATTENDANCE_FILTER_LABELS,
  MONITORING_ATTENDANCE_STATUS_OPTIONS,
  MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS,
  MONITORING_CONSTRAINTS,
  MONITORING_FORMATTING,
  MONITORING_HEADER_TEXTS,
  MONITORING_PAGINATION_LABELS,
  MONITORING_FEEDBACK_MESSAGES,
} from "@/constants/monitoring"
import type {
  AttendanceStatusType,
  WorkforceAttendanceRecord,
} from "@/types/monitoring"

export function AttendanceMonitoringTable() {
  const [currentPage, setCurrentPage] = React.useState<number>(
    MONITORING_CONSTRAINTS.DEFAULT_PAGE,
  )
  const [searchInput, setSearchInput] = React.useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = React.useState<string>("")
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const [startDate, setStartDate] = React.useState<string>("")
  const [endDate, setEndDate] = React.useState<string>("")
  const [isManualAttendanceModalOpen, setIsManualAttendanceModalOpen] =
    React.useState<boolean>(false)

  const [inspectingAttendance, setInspectingAttendance] =
    React.useState<WorkforceAttendanceRecord | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setCurrentPage(MONITORING_CONSTRAINTS.DEFAULT_PAGE)
    }, MONITORING_CONSTRAINTS.SEARCH_DEBOUNCE_DELAY_MS)

    return () => clearTimeout(timer)
  }, [searchInput])

  const isDateRangeInvalid = Boolean(
    startDate && endDate && new Date(startDate) > new Date(endDate),
  )

  const queryParams = React.useMemo(() => {
    return {
      page: currentPage,
      limit: MONITORING_CONSTRAINTS.DEFAULT_LIMIT,
      search: debouncedSearch || undefined,
      status:
        statusFilter !== "ALL"
          ? (statusFilter as AttendanceStatusType)
          : undefined,
      startDate: !isDateRangeInvalid && startDate ? startDate : undefined,
      endDate: !isDateRangeInvalid && endDate ? endDate : undefined,
    }
  }, [currentPage, debouncedSearch, statusFilter, startDate, endDate, isDateRangeInvalid])

  const {
    data: attendanceResponse,
    isLoading,
    isError,
    refetch,
  } = useWorkforceAttendances(queryParams)

  const attendanceRecords = attendanceResponse?.data || []
  const pagination = attendanceResponse?.pagination

  const handleStatusFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setStatusFilter(event.target.value)
    setCurrentPage(MONITORING_CONSTRAINTS.DEFAULT_PAGE)
  }

  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setStartDate(event.target.value)
    setCurrentPage(MONITORING_CONSTRAINTS.DEFAULT_PAGE)
  }

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value)
    setCurrentPage(MONITORING_CONSTRAINTS.DEFAULT_PAGE)
  }

  const handleResetFilters = () => {
    setSearchInput("")
    setDebouncedSearch("")
    setStatusFilter("ALL")
    setStartDate("")
    setEndDate("")
    setCurrentPage(MONITORING_CONSTRAINTS.DEFAULT_PAGE)
  }

  const isAnyFilterActive = Boolean(
    debouncedSearch ||
      statusFilter !== "ALL" ||
      startDate ||
      endDate,
  )

  const getStatusBadgeClass = (status: AttendanceStatusType) => {
    switch (status) {
      case "PRESENT":
        return "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
      case "SICK":
        return "bg-amber-500/10 text-amber-700 border border-amber-500/20"
      case "LEAVE":
        return "bg-blue-500/10 text-blue-700 border border-blue-500/20"
      case "ABSENT":
        return "bg-rose-500/10 text-rose-700 border border-rose-500/20"
      default:
        return "bg-muted text-muted-foreground border border-border"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {MONITORING_ATTENDANCE_FILTER_LABELS.TABLE_TITLE}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {MONITORING_ATTENDANCE_FILTER_LABELS.TABLE_SUBTITLE}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsManualAttendanceModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS.OPEN_BUTTON}
        </button>
      </div>

      {isDateRangeInvalid && (
        <div
          role="alert"
          className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
        >
          <svg
            className="w-5 h-5 shrink-0"
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
          <span>{MONITORING_ATTENDANCE_FILTER_LABELS.INVALID_DATE_RANGE}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 items-center rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="relative lg:col-span-2">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={
              MONITORING_ATTENDANCE_FILTER_LABELS.SEARCH_PLACEHOLDER
            }
            className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-all"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-all"
          >
            {MONITORING_ATTENDANCE_STATUS_OPTIONS.map((statusOption) => (
              <option key={statusOption.value} value={statusOption.value}>
                {statusOption.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            aria-label={MONITORING_ATTENDANCE_FILTER_LABELS.START_DATE}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-all"
          />
        </div>

        <div className="flex gap-2">
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            aria-label={MONITORING_ATTENDANCE_FILTER_LABELS.END_DATE}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-all"
          />

          {isAnyFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              title={MONITORING_ATTENDANCE_FILTER_LABELS.CLEAR_FILTERS}
              className="rounded-md px-3 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border transition-all text-xs font-semibold shrink-0 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-semibold tracking-wider text-muted-foreground uppercase">
                <th scope="col" className="px-6 py-3.5">
                  {MONITORING_ATTENDANCE_TABLE_HEADERS.EMPLOYEE}
                </th>
                <th scope="col" className="px-6 py-3.5">
                  {MONITORING_ATTENDANCE_TABLE_HEADERS.DATE}
                </th>
                <th scope="col" className="px-6 py-3.5">
                  {MONITORING_ATTENDANCE_TABLE_HEADERS.STATUS}
                </th>
                <th scope="col" className="px-6 py-3.5">
                  {MONITORING_ATTENDANCE_TABLE_HEADERS.CLOCK_IN}
                </th>
                <th scope="col" className="px-6 py-3.5">
                  {MONITORING_ATTENDANCE_TABLE_HEADERS.CLOCK_OUT}
                </th>
                <th scope="col" className="px-6 py-3.5">
                  {MONITORING_ATTENDANCE_TABLE_HEADERS.NOTES}
                </th>
                <th scope="col" className="px-6 py-3.5 text-center">
                  {MONITORING_ATTENDANCE_TABLE_HEADERS.PROOF}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {isLoading &&
                Array.from({
                  length: MONITORING_CONSTRAINTS.TABLE_SKELETON_ROWS,
                }).map((_, skeletonRowIndex) => (
                  <tr
                    key={`skeleton-row-${skeletonRowIndex}`}
                    className="animate-pulse"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted/60" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-28 bg-muted/60 rounded" />
                          <div className="h-2.5 w-36 bg-muted/60 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="h-3.5 w-20 bg-muted/60 rounded" />
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="h-5 w-16 bg-muted/60 rounded" />
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="h-3.5 w-16 bg-muted/60 rounded" />
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="h-3.5 w-16 bg-muted/60 rounded" />
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="h-3.5 w-32 bg-muted/60 rounded" />
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <div className="h-7 w-20 bg-muted/60 rounded mx-auto" />
                    </td>
                  </tr>
                ))}

              {!isLoading && isError && (
                <tr>
                  <td
                    colSpan={
                      MONITORING_ATTENDANCE_FILTER_LABELS.TABLE_COLUMN_COUNT
                    }
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <p className="text-xs font-semibold text-destructive">
                        {MONITORING_FEEDBACK_MESSAGES.FETCH_ERROR}
                      </p>
                      <button
                        type="button"
                        onClick={() => refetch()}
                        className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-md text-xs font-semibold transition-all cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !isError && attendanceRecords.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      MONITORING_ATTENDANCE_FILTER_LABELS.TABLE_COLUMN_COUNT
                    }
                    className="px-6 py-16 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg
                        className="h-10 w-10 text-muted-foreground/60"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <p className="text-xs font-medium">
                        {isAnyFilterActive
                          ? MONITORING_ATTENDANCE_FILTER_LABELS.NO_RECORDS_FOUND
                          : MONITORING_ATTENDANCE_FILTER_LABELS.NO_RECORDS_YET}
                      </p>
                      {isAnyFilterActive && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-1 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-md text-xs font-semibold transition-all cursor-pointer"
                        >
                          {MONITORING_ATTENDANCE_FILTER_LABELS.CLEAR_FILTERS}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                attendanceRecords.map((record) => {
                  const employeeFullName = [
                    record.user.firstName,
                    record.user.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ")

                  const formattedDate = new Date(
                    record.attendanceDate,
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })

                  const formattedClockIn = record.clockInAt
                    ? new Date(record.clockInAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : MONITORING_FORMATTING.EMPTY_VALUE_PLACEHOLDER

                  const formattedClockOut = record.clockOutAt
                    ? new Date(record.clockOutAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : MONITORING_FORMATTING.EMPTY_VALUE_PLACEHOLDER

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                            {record.user.firstName.charAt(0).toUpperCase() ||
                              MONITORING_HEADER_TEXTS.DEFAULT_AVATAR_INITIAL}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {employeeFullName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {record.user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-3.5 text-foreground whitespace-nowrap">
                        {formattedDate}
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadgeClass(record.status)}`}
                        >
                          {record.status}
                        </span>
                      </td>

                      <td className="px-6 py-3.5 text-foreground whitespace-nowrap">
                        {formattedClockIn}
                      </td>

                      <td className="px-6 py-3.5 text-foreground whitespace-nowrap">
                        {formattedClockOut}
                      </td>

                      <td className="px-6 py-3.5 text-muted-foreground max-w-xs truncate">
                        {record.notes ||
                          MONITORING_FORMATTING.EMPTY_VALUE_PLACEHOLDER}
                      </td>

                      <td className="px-6 py-3.5 text-center whitespace-nowrap">
                        {record.proofImageUrl ? (
                          <button
                            type="button"
                            onClick={() => setInspectingAttendance(record)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-medium transition-colors cursor-pointer"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {MONITORING_ATTENDANCE_FILTER_LABELS.VIEW_PHOTO}
                          </button>
                        ) : (
                          <span className="text-muted-foreground text-xs font-medium">
                            {MONITORING_FORMATTING.EMPTY_VALUE_PLACEHOLDER}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border px-6 py-4 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              {MONITORING_PAGINATION_LABELS.PAGE}{" "}
              <span className="font-semibold text-foreground">
                {pagination.currentPage}
              </span>{" "}
              {MONITORING_PAGINATION_LABELS.OF}{" "}
              <span className="font-semibold text-foreground">
                {pagination.totalPages}
              </span>{" "}
              (
              <span className="font-semibold text-foreground">
                {pagination.totalRecords}
              </span>{" "}
              {MONITORING_PAGINATION_LABELS.TOTAL_RECORDS})
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPreviousPage || isLoading}
                onClick={() =>
                  setCurrentPage((previousPage: number) =>
                    Math.max(
                      MONITORING_CONSTRAINTS.DEFAULT_PAGE,
                      previousPage - 1,
                    ),
                  )
                }
                className="px-3 py-1.5 rounded-md bg-background hover:bg-muted text-foreground border border-input text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {MONITORING_PAGINATION_LABELS.PREVIOUS}
              </button>

              <button
                type="button"
                disabled={!pagination.hasNextPage || isLoading}
                onClick={() =>
                  setCurrentPage((previousPage: number) => previousPage + 1)
                }
                className="px-3 py-1.5 rounded-md bg-background hover:bg-muted text-foreground border border-input text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {MONITORING_PAGINATION_LABELS.NEXT}
              </button>
            </div>
          </div>
        )}
      </div>

      <ProofPreviewModal
        isOpen={Boolean(inspectingAttendance)}
        attendanceRecord={inspectingAttendance}
        onClose={() => setInspectingAttendance(null)}
      />

      <AddManualAttendanceModal
        isOpen={isManualAttendanceModalOpen}
        onClose={() => setIsManualAttendanceModalOpen(false)}
      />
    </div>
  )
}
