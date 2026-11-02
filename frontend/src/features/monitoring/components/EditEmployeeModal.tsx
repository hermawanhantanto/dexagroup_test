import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { X, Eye, EyeOff, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  MONITORING_CONSTRAINTS,
  MONITORING_DIALOG_TEXTS,
  MONITORING_FEEDBACK_MESSAGES,
  MONITORING_FIELD_LABELS,
  MONITORING_GENDER_OPTIONS,
  MONITORING_HEADER_TEXTS,
  MONITORING_ROLE_OPTIONS,
  MONITORING_ROLES,
} from "@/constants/monitoring"
import {
  editEmployeeSchema,
  type EditEmployeeFormValues,
} from "../schemas/employee-schema"
import { useUpdateEmployee } from "../hooks/use-employees"
import { extractApiErrorMessage, isConflictApiError } from "../utils/error-parser"
import type { EmployeeRecord, UpdateEmployeePayload } from "@/types/monitoring"

export interface EditEmployeeModalProps {
  employee: EmployeeRecord | null
  isOpen: boolean
  onClose: () => void
}

const formatIsoDateForInput = (rawIsoDate?: string | null): string => {
  if (!rawIsoDate) {
    return ""
  }
  return rawIsoDate.split(MONITORING_HEADER_TEXTS.ISO_DATE_DELIMITER)[0] || ""
}

export function EditEmployeeModal({
  employee,
  isOpen,
  onClose,
}: EditEmployeeModalProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [conflictErrorMessage, setConflictErrorMessage] = React.useState<string | null>(null)

  const updateEmployeeMutation = useUpdateEmployee()

  const form = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      position: "",
      department: "",
      dateOfBirth: "",
      gender: undefined,
      role: MONITORING_ROLES.EMPLOYEE,
      salary: "",
      joinDate: "",
    },
  })

  const handleCloseModal = React.useCallback(() => {
    setConflictErrorMessage(null)
    setShowPassword(false)
    onClose()
  }, [onClose])

  React.useEffect(() => {
    if (isOpen && employee) {
      form.reset({
        email: employee.email,
        password: "",
        firstName: employee.firstName,
        lastName: employee.lastName || "",
        position: employee.position || "",
        department: employee.department || "",
        dateOfBirth: formatIsoDateForInput(employee.dateOfBirth),
        gender: employee.gender || undefined,
        role: employee.role,
        salary:
          employee.salary !== null && employee.salary !== undefined
            ? String(employee.salary)
            : "",
        joinDate: formatIsoDateForInput(employee.joinDate),
      })
    }
  }, [isOpen, employee, form])

  React.useEffect(() => {
    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape" && isOpen && !updateEmployeeMutation.isPending) {
        handleCloseModal()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, handleCloseModal, updateEmployeeMutation.isPending])

  if (!isOpen || !employee) {
    return null
  }

  const buildDynamicUpdatePayload = (
    formValues: EditEmployeeFormValues,
  ): UpdateEmployeePayload => {
    const updatePayload: Record<string, unknown> = {}

    for (const [fieldKey, fieldValue] of Object.entries(formValues)) {
      if (fieldValue === undefined || fieldValue === null) {
        continue
      }

      if (fieldKey === "password") {
        if (
          typeof fieldValue === "string" &&
          fieldValue.trim().length >= MONITORING_CONSTRAINTS.PASSWORD_MIN_LENGTH
        ) {
          updatePayload.password = fieldValue.trim()
        }
        continue
      }

      if (fieldKey === "salary") {
        if (typeof fieldValue === "number" && !isNaN(fieldValue)) {
          updatePayload.salary = fieldValue
        } else if (
          typeof fieldValue === "string" &&
          fieldValue.trim().length > 0
        ) {
          const numericSalary = Number(fieldValue)
          if (!isNaN(numericSalary)) {
            updatePayload.salary = numericSalary
          }
        }
        continue
      }

      if (fieldKey === "dateOfBirth" || fieldKey === "joinDate") {
        if (typeof fieldValue === "string" && fieldValue.trim().length > 0) {
          updatePayload[fieldKey] = fieldValue.trim()
        }
        continue
      }

      if (typeof fieldValue === "string") {
        const trimmedStringValue = fieldValue.trim()
        if (trimmedStringValue.length > 0) {
          updatePayload[fieldKey] = trimmedStringValue
        }
        continue
      }

      updatePayload[fieldKey] = fieldValue
    }

    return updatePayload as UpdateEmployeePayload
  }

  const handleFormSubmit = async (formValues: EditEmployeeFormValues) => {
    setConflictErrorMessage(null)

    const payload = buildDynamicUpdatePayload(formValues)

    try {
      await updateEmployeeMutation.mutateAsync({
        employeeId: employee.id,
        payload,
      })
      handleCloseModal()
    } catch (submissionError: unknown) {
      const extractedErrorMessage = extractApiErrorMessage(
        submissionError,
        MONITORING_FEEDBACK_MESSAGES.UPDATE_ERROR,
      )

      if (isConflictApiError(submissionError)) {
        setConflictErrorMessage(extractedErrorMessage)
        form.setError("email", { message: extractedErrorMessage })
        return
      }

      setConflictErrorMessage(extractedErrorMessage)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => {
        if (!updateEmployeeMutation.isPending) {
          handleCloseModal()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-employee-title"
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <h2
              id="edit-employee-title"
              className="text-lg font-bold tracking-tight text-foreground"
            >
              {MONITORING_DIALOG_TEXTS.EDIT_EMPLOYEE_TITLE}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {MONITORING_DIALOG_TEXTS.EDIT_EMPLOYEE_SUBTITLE}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            disabled={updateEmployeeMutation.isPending}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 cursor-pointer"
            aria-label={MONITORING_DIALOG_TEXTS.CLOSE}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {conflictErrorMessage && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{conflictErrorMessage}</div>
          </div>
        )}

        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-first-name" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.FIRST_NAME} *
              </Label>
              <Input
                id="edit-first-name"
                placeholder={MONITORING_FIELD_LABELS.FIRST_NAME_PLACEHOLDER}
                {...form.register("firstName")}
                disabled={updateEmployeeMutation.isPending}
                aria-invalid={Boolean(form.formState.errors.firstName)}
              />
              {form.formState.errors.firstName && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-last-name" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.LAST_NAME}
              </Label>
              <Input
                id="edit-last-name"
                placeholder={MONITORING_FIELD_LABELS.LAST_NAME_PLACEHOLDER}
                {...form.register("lastName")}
                disabled={updateEmployeeMutation.isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-email" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.EMAIL} *
              </Label>
              <Input
                id="edit-email"
                type="email"
                placeholder={MONITORING_FIELD_LABELS.EMAIL_PLACEHOLDER}
                {...form.register("email")}
                disabled={updateEmployeeMutation.isPending}
                aria-invalid={Boolean(form.formState.errors.email)}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-password" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.PASSWORD}
              </Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={MONITORING_FIELD_LABELS.PASSWORD_EDIT_PLACEHOLDER}
                  {...form.register("password")}
                  disabled={updateEmployeeMutation.isPending}
                  aria-invalid={Boolean(form.formState.errors.password)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((previousState) => !previousState)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label={
                    showPassword
                      ? MONITORING_DIALOG_TEXTS.HIDE_PASSWORD
                      : MONITORING_DIALOG_TEXTS.SHOW_PASSWORD
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {MONITORING_DIALOG_TEXTS.PASSWORD_EDIT_HELP}
              </p>
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-department" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.DEPARTMENT}
              </Label>
              <Input
                id="edit-department"
                placeholder={MONITORING_FIELD_LABELS.DEPARTMENT_PLACEHOLDER}
                {...form.register("department")}
                disabled={updateEmployeeMutation.isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-position" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.POSITION}
              </Label>
              <Input
                id="edit-position"
                placeholder={MONITORING_FIELD_LABELS.POSITION_PLACEHOLDER}
                {...form.register("position")}
                disabled={updateEmployeeMutation.isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-role" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.ROLE} *
              </Label>
              <select
                id="edit-role"
                {...form.register("role")}
                disabled={updateEmployeeMutation.isPending}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {MONITORING_ROLE_OPTIONS.map((roleOption) => (
                  <option key={roleOption.value} value={roleOption.value}>
                    {roleOption.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-gender" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.GENDER}
              </Label>
              <select
                id="edit-gender"
                {...form.register("gender")}
                disabled={updateEmployeeMutation.isPending}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">{MONITORING_FIELD_LABELS.GENDER_SELECT_PLACEHOLDER}</option>
                {MONITORING_GENDER_OPTIONS.map((genderOption) => (
                  <option key={genderOption.value} value={genderOption.value}>
                    {genderOption.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-salary" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.SALARY}
              </Label>
              <Input
                id="edit-salary"
                type="number"
                min={MONITORING_CONSTRAINTS.SALARY_MIN}
                placeholder={MONITORING_FIELD_LABELS.SALARY_PLACEHOLDER}
                {...form.register("salary")}
                disabled={updateEmployeeMutation.isPending}
                aria-invalid={Boolean(form.formState.errors.salary)}
              />
              {form.formState.errors.salary && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.salary.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-join-date" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.JOIN_DATE}
              </Label>
              <Input
                id="edit-join-date"
                type="date"
                {...form.register("joinDate")}
                disabled={updateEmployeeMutation.isPending}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit-dob" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.DATE_OF_BIRTH}
              </Label>
              <Input
                id="edit-dob"
                type="date"
                {...form.register("dateOfBirth")}
                disabled={updateEmployeeMutation.isPending}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCloseModal}
              disabled={updateEmployeeMutation.isPending}
              className="cursor-pointer"
            >
              {MONITORING_DIALOG_TEXTS.CANCEL}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateEmployeeMutation.isPending}
              className="cursor-pointer"
            >
              {updateEmployeeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {MONITORING_DIALOG_TEXTS.SAVING}
                </>
              ) : (
                MONITORING_DIALOG_TEXTS.SAVE_CHANGES
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
