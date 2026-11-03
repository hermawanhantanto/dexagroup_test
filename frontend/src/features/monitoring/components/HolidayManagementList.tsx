import React from "react"
import { useHolidays } from "../hooks/use-holidays"
import { AddHolidayModal } from "./AddHolidayModal"
import { DeleteHolidayDialog } from "./DeleteHolidayDialog"
import {
  MONITORING_HOLIDAY_HEADERS,
  MONITORING_HOLIDAY_DIALOG_TEXTS,
  MONITORING_CONSTRAINTS,
  MONITORING_FORMATTING,
  MONITORING_DIALOG_TEXTS,
  MONITORING_FEEDBACK_MESSAGES,
} from "@/constants/monitoring"
import type { HolidayRecord } from "@/types/monitoring"

export function HolidayManagementList() {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState<boolean>(false)
  const [deletingHoliday, setDeletingHoliday] =
    React.useState<HolidayRecord | null>(null)

  const { data: holidaysResponse, isLoading, isError, refetch } = useHolidays()

  const holidays = holidaysResponse?.data || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {MONITORING_HOLIDAY_DIALOG_TEXTS.TABLE_TITLE}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {MONITORING_HOLIDAY_DIALOG_TEXTS.TABLE_SUBTITLE}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
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
          {MONITORING_HOLIDAY_DIALOG_TEXTS.CREATE_BUTTON}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-semibold tracking-wider text-muted-foreground uppercase">
                <th scope="col" className="px-6 py-3.5">
                  {MONITORING_HOLIDAY_HEADERS.DATE}
                </th>
                <th scope="col" className="px-6 py-3.5">
                  {MONITORING_HOLIDAY_HEADERS.NAME}
                </th>
                <th scope="col" className="px-6 py-3.5">
                  {MONITORING_HOLIDAY_HEADERS.DESCRIPTION}
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  {MONITORING_HOLIDAY_HEADERS.ACTIONS}
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
                      <div className="h-4 w-28 bg-muted/60 rounded" />
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="h-4 w-40 bg-muted/60 rounded" />
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="h-4 w-56 bg-muted/60 rounded" />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="h-6 w-14 bg-muted/60 rounded ml-auto" />
                    </td>
                  </tr>
                ))}

              {!isLoading && isError && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <p className="text-xs font-semibold text-destructive">
                        {MONITORING_HOLIDAY_DIALOG_TEXTS.FETCH_ERROR}
                      </p>
                      <button
                        type="button"
                        onClick={() => refetch()}
                        className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-md text-xs font-semibold transition-all cursor-pointer"
                      >
                        {MONITORING_FEEDBACK_MESSAGES.UNEXPECTED_ERROR}
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !isError && holidays.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-muted-foreground">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-xs font-medium">
                        {MONITORING_HOLIDAY_DIALOG_TEXTS.NO_HOLIDAYS_FOUND}
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                holidays.map((holiday) => {
                  const formattedDate = new Date(
                    holiday.holidayDate,
                  ).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })

                  return (
                    <tr
                      key={holiday.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-3.5 whitespace-nowrap text-foreground font-semibold">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-primary"
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
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      <td className="px-6 py-3.5 text-foreground font-medium">
                        {holiday.name}
                      </td>

                      <td className="px-6 py-3.5 text-muted-foreground max-w-sm">
                        {holiday.description ||
                          MONITORING_FORMATTING.EMPTY_VALUE_PLACEHOLDER}
                      </td>

                      <td className="px-6 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setDeletingHoliday(holiday)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all cursor-pointer"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          {MONITORING_DIALOG_TEXTS.DELETE}
                        </button>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>

      <AddHolidayModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <DeleteHolidayDialog
        isOpen={Boolean(deletingHoliday)}
        holiday={deletingHoliday}
        onClose={() => setDeletingHoliday(null)}
      />
    </div>
  )
}
