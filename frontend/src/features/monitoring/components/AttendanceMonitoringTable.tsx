import React from "react"
import { useWorkforceAttendances } from "../hooks/use-attendance-monitoring"
import { ProofPreviewModal } from "./ProofPreviewModal"
import {
  MONITORING_ATTENDANCE_TABLE_HEADERS,
  MONITORING_ATTENDANCE_FILTER_LABELS,
  MONITORING_ATTENDANCE_STATUS_OPTIONS,
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
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "SICK":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "LEAVE":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "ABSENT":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20"
      default:
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {MONITORING_ATTENDANCE_FILTER_LABELS.TABLE_TITLE}
          </h2>
          <p className="text-sm text-neutral-400 mt-0.5">
            {MONITORING_ATTENDANCE_FILTER_LABELS.TABLE_SUBTITLE}
          </p>
        </div>
      </div>

      {isDateRangeInvalid && (
        <div
          role="alert"
          className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium"
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 items-center bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
        <div className="relative lg:col-span-2">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500"
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
            className="w-full rounded-xl bg-neutral-800/80 border border-neutral-700/80 pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full rounded-xl bg-neutral-800/80 border border-neutral-700/80 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
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
            className="w-full rounded-xl bg-neutral-800/80 border border-neutral-700/80 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex gap-2">
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            aria-label={MONITORING_ATTENDANCE_FILTER_LABELS.END_DATE}
            className="w-full rounded-xl bg-neutral-800/80 border border-neutral-700/80 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />

          {isAnyFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              title={MONITORING_ATTENDANCE_FILTER_LABELS.CLEAR_FILTERS}
              className="rounded-xl px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-all text-xs font-semibold shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/90 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                <th scope="col" className="px-6 py-4">
                  {MONITORING_ATTENDANCE_TABLE_HEADERS.EMPLOYEE}
                </th>
                <th scope="col" className="px-6 py-4">
                  {MONITORING_ATTENDANCE_TABLE_HEADERS.DATE}
                </th>
                <th scope="col" className="px-6 py-4">
                  {MONITORING_ATTENDANCE_TABLE_HEADERS.STATUS}
                </th>
                <th scope="col" className="px-6 py-4">
                  {MONITORING_ATTENDANCE_TABLE_HEADERS.CLOCK_IN}
                </th>
                <th scope="col" className="px-6 py-4">
                  {MONITORING_ATTENDANCE_TABLE_HEADERS.CLOCK_OUT}
                </th>
                <th scope="col" className="px-6 py-4">
                  {MONITORING_ATTENDANCE_TABLE_HEADERS.NOTES}
                </th>
                <th scope="col" className="px-6 py-4 text-center">
                  {MONITORING_ATTENDANCE_TABLE_HEADERS.PROOF}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-medium">
              {isLoading &&
                Array.from({
                  length: MONITORING_CONSTRAINTS.TABLE_SKELETON_ROWS,
                }).map((_, skeletonRowIndex) => (
                  <tr
                    key={`skeleton-row-${skeletonRowIndex}`}
                    className="animate-pulse"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-neutral-800" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-28 bg-neutral-800 rounded" />
                          <div className="h-2.5 w-36 bg-neutral-800 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3.5 w-20 bg-neutral-800 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 w-16 bg-neutral-800 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3.5 w-16 bg-neutral-800 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3.5 w-16 bg-neutral-800 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3.5 w-32 bg-neutral-800 rounded" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="h-8 w-20 bg-neutral-800 rounded mx-auto" />
                    </td>
                  </tr>
                ))}

              {!isLoading && isError && (
                <tr>
                  <td
                    colSpan={
                      MONITORING_ATTENDANCE_FILTER_LABELS.TABLE_COLUMN_COUNT
                    }
                    className="px-6 py-12 text-center text-neutral-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <p className="text-sm font-semibold text-rose-400">
                        {MONITORING_FEEDBACK_MESSAGES.FETCH_ERROR}
                      </p>
                      <button
                        type="button"
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-all"
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
                    className="px-6 py-16 text-center text-neutral-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg
                        className="h-10 w-10 text-neutral-600"
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
                      <p className="text-sm font-medium">
                        {isAnyFilterActive
                          ? MONITORING_ATTENDANCE_FILTER_LABELS.NO_RECORDS_FOUND
                          : MONITORING_ATTENDANCE_FILTER_LABELS.NO_RECORDS_YET}
                      </p>
                      {isAnyFilterActive && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-1 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold transition-all"
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
                      className="hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600/20 border border-blue-500/30 text-xs font-bold text-blue-400">
                            {record.user.firstName.charAt(0).toUpperCase() ||
                              MONITORING_HEADER_TEXTS.DEFAULT_AVATAR_INITIAL}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate">
                              {employeeFullName}
                            </p>
                            <p className="text-xs text-neutral-400 truncate">
                              {record.user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-neutral-300 whitespace-nowrap">
                        {formattedDate}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(record.status)}`}
                        >
                          {record.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-neutral-300 whitespace-nowrap">
                        {formattedClockIn}
                      </td>

                      <td className="px-6 py-4 text-neutral-300 whitespace-nowrap">
                        {formattedClockOut}
                      </td>

                      <td className="px-6 py-4 text-neutral-300 max-w-xs truncate">
                        {record.notes ||
                          MONITORING_FORMATTING.EMPTY_VALUE_PLACEHOLDER}
                      </td>

                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {record.proofImageUrl ? (
                          <button
                            type="button"
                            onClick={() => setInspectingAttendance(record)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs font-semibold transition-colors"
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
                          <span className="text-neutral-500 text-xs font-medium">
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-800 px-6 py-4 bg-neutral-900/80">
            <p className="text-xs text-neutral-400">
              {MONITORING_PAGINATION_LABELS.PAGE}{" "}
              <span className="font-semibold text-white">
                {pagination.currentPage}
              </span>{" "}
              {MONITORING_PAGINATION_LABELS.OF}{" "}
              <span className="font-semibold text-white">
                {pagination.totalPages}
              </span>{" "}
              (
              <span className="font-semibold text-white">
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
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {MONITORING_PAGINATION_LABELS.PREVIOUS}
              </button>

              <button
                type="button"
                disabled={!pagination.hasNextPage || isLoading}
                onClick={() =>
                  setCurrentPage((previousPage: number) => previousPage + 1)
                }
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
    </div>
  )
}
