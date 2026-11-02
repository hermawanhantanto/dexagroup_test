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
          <h2 className="text-xl font-bold text-white tracking-tight">
            {MONITORING_HOLIDAY_DIALOG_TEXTS.TABLE_TITLE}
          </h2>
          <p className="text-sm text-neutral-400 mt-0.5">
            {MONITORING_HOLIDAY_DIALOG_TEXTS.TABLE_SUBTITLE}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all cursor-pointer"
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

      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/90 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                <th scope="col" className="px-6 py-4">
                  {MONITORING_HOLIDAY_HEADERS.DATE}
                </th>
                <th scope="col" className="px-6 py-4">
                  {MONITORING_HOLIDAY_HEADERS.NAME}
                </th>
                <th scope="col" className="px-6 py-4">
                  {MONITORING_HOLIDAY_HEADERS.DESCRIPTION}
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  {MONITORING_HOLIDAY_HEADERS.ACTIONS}
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
                      <div className="h-4 w-28 bg-neutral-800 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-40 bg-neutral-800 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-56 bg-neutral-800 rounded" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-8 w-16 bg-neutral-800 rounded ml-auto" />
                    </td>
                  </tr>
                ))}

              {!isLoading && isError && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-neutral-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <p className="text-sm font-semibold text-rose-400">
                        {MONITORING_HOLIDAY_DIALOG_TEXTS.FETCH_ERROR}
                      </p>
                      <button
                        type="button"
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-all"
                      >
                        {MONITORING_FEEDBACK_MESSAGES.UNEXPECTED_ERROR}
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !isError && holidays.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-neutral-400">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm font-medium">
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
                      className="hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-white font-semibold">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-blue-400"
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

                      <td className="px-6 py-4 text-neutral-200 font-medium">
                        {holiday.name}
                      </td>

                      <td className="px-6 py-4 text-neutral-400 max-w-sm">
                        {holiday.description ||
                          MONITORING_FORMATTING.EMPTY_VALUE_PLACEHOLDER}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setDeletingHoliday(holiday)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
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
