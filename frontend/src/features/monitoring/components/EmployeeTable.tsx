import * as React from "react"
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Users,
  RotateCcw,
  Building2,
  CalendarOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MONITORING_CONSTRAINTS,
  MONITORING_DEPARTMENTS,
  MONITORING_DIALOG_TEXTS,
  MONITORING_FILTER_GENDER_OPTIONS,
  MONITORING_FILTER_GENDERS,
  MONITORING_FILTER_LABELS,
  MONITORING_FORMATTING,
  MONITORING_GENDERS,
  MONITORING_HEADER_TEXTS,
  MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS,
  MONITORING_PAGINATION_LABELS,
  MONITORING_ROLES,
  MONITORING_TABLE_HEADERS,
} from "@/constants/monitoring"
import { useEmployees } from "../hooks/use-employees"
import { AddEmployeeModal } from "./AddEmployeeModal"
import { EditEmployeeModal } from "./EditEmployeeModal"
import { DeleteEmployeeDialog } from "./DeleteEmployeeDialog"
import { AddManualAttendanceModal } from "./AddManualAttendanceModal"
import type {
  EmployeeGender,
  EmployeeRecord,
  GetEmployeesQuery,
} from "@/types/monitoring"

export interface EmployeeTableProps {
  initialLimit?: number
}

const getEmployeeInitials = (firstName: string, lastName?: string | null): string => {
  const firstInitial = firstName.charAt(0).toUpperCase()
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : ""
  return `${firstInitial}${lastInitial}` || MONITORING_HEADER_TEXTS.DEFAULT_AVATAR_INITIAL
}

const formatSalaryCurrency = (salaryValue: number | string | null): string => {
  if (salaryValue === null || salaryValue === undefined || salaryValue === "") {
    return MONITORING_FORMATTING.EMPTY_VALUE_PLACEHOLDER
  }
  const numericSalary = Number(salaryValue)
  if (isNaN(numericSalary)) {
    return MONITORING_FORMATTING.EMPTY_VALUE_PLACEHOLDER
  }
  return new Intl.NumberFormat(MONITORING_FORMATTING.CURRENCY_LOCALE, {
    style: "currency",
    currency: MONITORING_FORMATTING.CURRENCY_CODE,
    maximumFractionDigits: 0,
  }).format(numericSalary)
}

export function EmployeeTable({
  initialLimit = MONITORING_CONSTRAINTS.DEFAULT_LIMIT,
}: EmployeeTableProps) {
  const [searchInputValue, setSearchInputValue] = React.useState("")
  const [debouncedSearchValue, setDebouncedSearchValue] = React.useState("")
  const [selectedGender, setSelectedGender] = React.useState<string>(
    MONITORING_FILTER_GENDERS.ALL,
  )
  const [selectedDepartment, setSelectedDepartment] = React.useState<string>(
    MONITORING_HEADER_TEXTS.DEPARTMENT_FILTER_ALL,
  )
  const [currentPage, setCurrentPage] = React.useState<number>(
    MONITORING_CONSTRAINTS.DEFAULT_PAGE,
  )

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [employeeToEdit, setEmployeeToEdit] = React.useState<EmployeeRecord | null>(null)
  const [employeeToDelete, setEmployeeToDelete] = React.useState<EmployeeRecord | null>(null)
  const [employeeForAbsence, setEmployeeForAbsence] = React.useState<EmployeeRecord | null>(null)

  React.useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearchValue(searchInputValue.trim())
    }, MONITORING_CONSTRAINTS.SEARCH_DEBOUNCE_DELAY_MS)

    return () => clearTimeout(debounceTimer)
  }, [searchInputValue])

  const handleSearchInputChange = (
    inputEvent: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchInputValue(inputEvent.target.value)
    setCurrentPage(MONITORING_CONSTRAINTS.DEFAULT_PAGE)
  }

  const handleGenderChange = (
    selectEvent: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedGender(selectEvent.target.value)
    setCurrentPage(MONITORING_CONSTRAINTS.DEFAULT_PAGE)
  }

  const handleDepartmentChange = (
    selectEvent: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedDepartment(selectEvent.target.value)
    setCurrentPage(MONITORING_CONSTRAINTS.DEFAULT_PAGE)
  }

  const backendSearchQuery = React.useMemo(() => {
    if (debouncedSearchValue.length > 0) {
      return debouncedSearchValue
    }
    if (selectedDepartment !== "ALL") {
      return selectedDepartment
    }
    return undefined
  }, [debouncedSearchValue, selectedDepartment])

  const queryParameters: GetEmployeesQuery = React.useMemo(() => {
    const parameters: GetEmployeesQuery = {
      page: currentPage,
      limit: initialLimit,
    }

    if (backendSearchQuery) {
      parameters.search = backendSearchQuery
    }

    if (
      selectedGender === MONITORING_GENDERS.MALE ||
      selectedGender === MONITORING_GENDERS.FEMALE
    ) {
      parameters.gender = selectedGender as EmployeeGender
    }

    return parameters
  }, [currentPage, initialLimit, backendSearchQuery, selectedGender])

  const { data, isLoading, isError, error, refetch } = useEmployees(queryParameters)

  const employeeRecords = data?.data
  const pagination = data?.pagination

  const filteredEmployeeList = React.useMemo(() => {
    if (!employeeRecords) {
      return []
    }
    if (selectedDepartment === "ALL") {
      return employeeRecords
    }
    return employeeRecords.filter((employee) => {
      if (!employee.department) {
        return false
      }
      return (
        employee.department.toLowerCase() === selectedDepartment.toLowerCase()
      )
    })
  }, [employeeRecords, selectedDepartment])

  const isAnyFilterActive =
    searchInputValue.length > 0 ||
    selectedGender !== MONITORING_FILTER_GENDERS.ALL ||
    selectedDepartment !== "ALL"

  const handleClearFilters = () => {
    setSearchInputValue("")
    setDebouncedSearchValue("")
    setSelectedGender(MONITORING_FILTER_GENDERS.ALL)
    setSelectedDepartment("ALL")
    setCurrentPage(MONITORING_CONSTRAINTS.DEFAULT_PAGE)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {MONITORING_FILTER_LABELS.TABLE_TITLE}
          </h2>
          <p className="text-xs text-muted-foreground">
            {MONITORING_FILTER_LABELS.TABLE_SUBTITLE}
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          size="sm"
          className="inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="h-4 w-4" />
          {MONITORING_DIALOG_TEXTS.ADD_EMPLOYEE_BUTTON}
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInputValue}
            onChange={handleSearchInputChange}
            placeholder={MONITORING_FILTER_LABELS.SEARCH_PLACEHOLDER}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedGender}
            onChange={handleGenderChange}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {MONITORING_FILTER_GENDER_OPTIONS.map((genderOption) => (
              <option key={genderOption.value} value={genderOption.value}>
                {genderOption.label}
              </option>
            ))}
          </select>

          <select
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {MONITORING_DEPARTMENTS.map((departmentOption) => (
              <option key={departmentOption} value={departmentOption}>
                {departmentOption === "ALL"
                  ? MONITORING_FILTER_LABELS.FILTER_DEPARTMENT_ALL
                  : departmentOption}
              </option>
            ))}
          </select>

          {isAnyFilterActive && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {MONITORING_FILTER_LABELS.CLEAR_FILTERS}
            </Button>
          )}
        </div>
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{(error as Error)?.message || MONITORING_FILTER_LABELS.RETRY}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs cursor-pointer"
          >
            {MONITORING_FILTER_LABELS.RETRY}
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{MONITORING_TABLE_HEADERS.NAME}</th>
                <th className="px-4 py-3">{MONITORING_TABLE_HEADERS.EMAIL}</th>
                <th className="px-4 py-3">{MONITORING_TABLE_HEADERS.DEPARTMENT}</th>
                <th className="px-4 py-3">{MONITORING_TABLE_HEADERS.POSITION}</th>
                <th className="px-4 py-3">{MONITORING_TABLE_HEADERS.ROLE}</th>
                <th className="px-4 py-3">{MONITORING_TABLE_HEADERS.GENDER}</th>
                <th className="px-4 py-3">{MONITORING_TABLE_HEADERS.SALARY}</th>
                <th className="px-4 py-3 text-right">{MONITORING_TABLE_HEADERS.ACTIONS}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, placeholderIndex) => (
                  <tr key={`loading-row-${placeholderIndex}`} className="animate-pulse">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-muted/60" />
                        <div className="h-3.5 w-24 rounded bg-muted/60" />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-3.5 w-32 rounded bg-muted/60" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-3.5 w-20 rounded bg-muted/60" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-3.5 w-24 rounded bg-muted/60" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-16 rounded bg-muted/60" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-3.5 w-12 rounded bg-muted/60" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-3.5 w-20 rounded bg-muted/60" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-block h-6 w-14 rounded bg-muted/60" />
                    </td>
                  </tr>
                ))
              ) : filteredEmployeeList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-center">
                      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                        <Users className="h-6 w-6 opacity-60" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {isAnyFilterActive
                          ? MONITORING_FILTER_LABELS.NO_EMPLOYEES_FOUND
                          : MONITORING_FILTER_LABELS.NO_EMPLOYEES_RECORDED}
                      </h3>
                      {isAnyFilterActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearFilters}
                          className="mt-4 text-xs cursor-pointer"
                        >
                          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                          {MONITORING_FILTER_LABELS.CLEAR_FILTERS}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployeeList.map((employee) => {
                  const employeeFullName = employee.lastName
                    ? `${employee.firstName} ${employee.lastName}`
                    : employee.firstName

                  const initials = getEmployeeInitials(
                    employee.firstName,
                    employee.lastName,
                  )

                  return (
                    <tr
                      key={employee.id}
                      className="transition-colors hover:bg-muted/20"
                    >
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {initials}
                          </div>
                          <span className="font-semibold">{employeeFullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-muted-foreground whitespace-nowrap">
                        {employee.email}
                      </td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">
                        {employee.department ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-foreground">
                            <Building2 className="h-3 w-3 opacity-60" />
                            {employee.department}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {MONITORING_FORMATTING.EMPTY_VALUE_PLACEHOLDER}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">
                        {employee.position || MONITORING_FORMATTING.EMPTY_VALUE_PLACEHOLDER}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {employee.role === MONITORING_ROLES.HR_ADMIN ? (
                          <span className="inline-flex rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-medium text-purple-600 dark:text-purple-400">
                            HR Admin
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                            Employee
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {employee.gender ? (
                          <span className="inline-flex rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-600 dark:text-sky-400">
                            {employee.gender}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {MONITORING_FORMATTING.EMPTY_VALUE_PLACEHOLDER}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                        {formatSalaryCurrency(employee.salary)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEmployeeForAbsence(employee)}
                            className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                            title={MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS.OPEN_BUTTON}
                            aria-label={`${MONITORING_MANUAL_ATTENDANCE_DIALOG_TEXTS.OPEN_BUTTON} ${employeeFullName}`}
                          >
                            <CalendarOff className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEmployeeToEdit(employee)}
                            className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                            aria-label={`${MONITORING_DIALOG_TEXTS.EDIT} ${employeeFullName}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEmployeeToDelete(employee)}
                            className="inline-flex size-7 items-center justify-center rounded-md border border-destructive/30 bg-background text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
                            aria-label={`${MONITORING_DIALOG_TEXTS.DELETE} ${employeeFullName}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
            <div>
              {MONITORING_PAGINATION_LABELS.PAGE} {pagination.currentPage}{" "}
              {MONITORING_PAGINATION_LABELS.OF} {pagination.totalPages} (
              {pagination.totalRecords} {MONITORING_PAGINATION_LABELS.TOTAL_RECORDS})
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((previousPage) =>
                    Math.max(previousPage - 1, MONITORING_CONSTRAINTS.MIN_PAGE),
                  )
                }
                disabled={pagination.currentPage <= MONITORING_CONSTRAINTS.MIN_PAGE || isLoading}
                className="cursor-pointer"
              >
                <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                {MONITORING_PAGINATION_LABELS.PREVIOUS}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((previousPage) =>
                    Math.min(previousPage + 1, pagination.totalPages),
                  )
                }
                disabled={
                  pagination.currentPage >= pagination.totalPages || isLoading
                }
                className="cursor-pointer"
              >
                {MONITORING_PAGINATION_LABELS.NEXT}
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <EditEmployeeModal
        employee={employeeToEdit}
        isOpen={Boolean(employeeToEdit)}
        onClose={() => setEmployeeToEdit(null)}
      />

      <DeleteEmployeeDialog
        employee={employeeToDelete}
        isOpen={Boolean(employeeToDelete)}
        onClose={() => setEmployeeToDelete(null)}
      />

      <AddManualAttendanceModal
        isOpen={Boolean(employeeForAbsence)}
        onClose={() => setEmployeeForAbsence(null)}
        preselectedUserId={employeeForAbsence?.id}
      />
    </div>
  )
}
