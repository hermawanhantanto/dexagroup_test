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
  MONITORING_GENDERS,
  MONITORING_ROLE_OPTIONS,
  MONITORING_ROLES,
} from "@/constants/monitoring"
import type { CreateEmployeePayload } from "@/types/monitoring"
import {
  createEmployeeSchema,
  type CreateEmployeeFormValues,
} from "../schemas/employee-schema"
import { useCreateEmployee } from "../hooks/use-employees"
import { extractApiErrorMessage, isConflictApiError } from "../utils/error-parser"

export interface AddEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
}

const defaultFormValues: CreateEmployeeFormValues = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  position: "",
  department: "",
  dateOfBirth: "",
  gender: "",
  role: MONITORING_ROLES.EMPLOYEE,
  salary: "",
  joinDate: "",
}

export function AddEmployeeModal({ isOpen, onClose }: AddEmployeeModalProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [conflictErrorMessage, setConflictErrorMessage] = React.useState<string | null>(null)

  const createEmployeeMutation = useCreateEmployee()

  const form = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: defaultFormValues,
  })

  const handleCloseModal = React.useCallback(() => {
    setConflictErrorMessage(null)
    setShowPassword(false)
    form.reset(defaultFormValues)
    onClose()
  }, [form, onClose])

  React.useEffect(() => {
    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape" && isOpen && !createEmployeeMutation.isPending) {
        handleCloseModal()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, handleCloseModal, createEmployeeMutation.isPending])

  if (!isOpen) {
    return null
  }

  const handleFormSubmit = async (formValues: CreateEmployeeFormValues) => {
    setConflictErrorMessage(null)

    const dynamicCreationPayload: Record<string, unknown> = {}

    for (const [fieldKey, fieldValue] of Object.entries(formValues)) {
      if (fieldValue === undefined || fieldValue === null) {
        continue
      }

      if (fieldKey === "salary") {
        if (typeof fieldValue === "string" && fieldValue.trim().length > 0) {
          const numericSalary = Number(fieldValue)
          if (!isNaN(numericSalary)) {
            dynamicCreationPayload.salary = numericSalary
          }
        }
        continue
      }

      if (fieldKey === "gender") {
        if (
          fieldValue === MONITORING_GENDERS.MALE ||
          fieldValue === MONITORING_GENDERS.FEMALE
        ) {
          dynamicCreationPayload.gender = fieldValue
        }
        continue
      }

      if (typeof fieldValue === "string") {
        const trimmedStringValue = fieldValue.trim()
        if (trimmedStringValue.length > 0) {
          dynamicCreationPayload[fieldKey] = trimmedStringValue
        }
        continue
      }

      dynamicCreationPayload[fieldKey] = fieldValue
    }

    try {
      await createEmployeeMutation.mutateAsync(
        dynamicCreationPayload as unknown as CreateEmployeePayload,
      )
      handleCloseModal()
    } catch (submissionError: unknown) {
      const extractedErrorMessage = extractApiErrorMessage(
        submissionError,
        MONITORING_FEEDBACK_MESSAGES.CREATE_ERROR,
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
        if (!createEmployeeMutation.isPending) {
          handleCloseModal()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-employee-title"
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <h2
              id="add-employee-title"
              className="text-lg font-bold tracking-tight text-foreground"
            >
              {MONITORING_DIALOG_TEXTS.ADD_EMPLOYEE_TITLE}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {MONITORING_DIALOG_TEXTS.ADD_EMPLOYEE_SUBTITLE}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            disabled={createEmployeeMutation.isPending}
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
              <Label htmlFor="create-first-name" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.FIRST_NAME} *
              </Label>
              <Input
                id="create-first-name"
                placeholder={MONITORING_FIELD_LABELS.FIRST_NAME_PLACEHOLDER}
                {...form.register("firstName")}
                disabled={createEmployeeMutation.isPending}
                aria-invalid={Boolean(form.formState.errors.firstName)}
              />
              {form.formState.errors.firstName && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-last-name" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.LAST_NAME}
              </Label>
              <Input
                id="create-last-name"
                placeholder={MONITORING_FIELD_LABELS.LAST_NAME_PLACEHOLDER}
                {...form.register("lastName")}
                disabled={createEmployeeMutation.isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-email" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.EMAIL} *
              </Label>
              <Input
                id="create-email"
                type="email"
                placeholder={MONITORING_FIELD_LABELS.EMAIL_PLACEHOLDER}
                {...form.register("email")}
                disabled={createEmployeeMutation.isPending}
                aria-invalid={Boolean(form.formState.errors.email)}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-password" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.PASSWORD} *
              </Label>
              <div className="relative">
                <Input
                  id="create-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={MONITORING_FIELD_LABELS.PASSWORD_CREATE_PLACEHOLDER}
                  {...form.register("password")}
                  disabled={createEmployeeMutation.isPending}
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
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-department" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.DEPARTMENT}
              </Label>
              <Input
                id="create-department"
                placeholder={MONITORING_FIELD_LABELS.DEPARTMENT_PLACEHOLDER}
                {...form.register("department")}
                disabled={createEmployeeMutation.isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-position" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.POSITION}
              </Label>
              <Input
                id="create-position"
                placeholder={MONITORING_FIELD_LABELS.POSITION_PLACEHOLDER}
                {...form.register("position")}
                disabled={createEmployeeMutation.isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-role" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.ROLE} *
              </Label>
              <select
                id="create-role"
                {...form.register("role")}
                disabled={createEmployeeMutation.isPending}
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
              <Label htmlFor="create-gender" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.GENDER}
              </Label>
              <select
                id="create-gender"
                {...form.register("gender")}
                disabled={createEmployeeMutation.isPending}
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
              <Label htmlFor="create-salary" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.SALARY}
              </Label>
              <Input
                id="create-salary"
                type="number"
                min={MONITORING_CONSTRAINTS.SALARY_MIN}
                placeholder={MONITORING_FIELD_LABELS.SALARY_PLACEHOLDER}
                {...form.register("salary")}
                disabled={createEmployeeMutation.isPending}
                aria-invalid={Boolean(form.formState.errors.salary)}
              />
              {form.formState.errors.salary && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.salary.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-join-date" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.JOIN_DATE}
              </Label>
              <Input
                id="create-join-date"
                type="date"
                {...form.register("joinDate")}
                disabled={createEmployeeMutation.isPending}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="create-dob" className="text-xs font-semibold text-foreground">
                {MONITORING_FIELD_LABELS.DATE_OF_BIRTH}
              </Label>
              <Input
                id="create-dob"
                type="date"
                {...form.register("dateOfBirth")}
                disabled={createEmployeeMutation.isPending}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={createEmployeeMutation.isPending}
              className="cursor-pointer"
            >
              {MONITORING_DIALOG_TEXTS.CANCEL}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createEmployeeMutation.isPending}
              className="cursor-pointer"
            >
              {createEmployeeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {MONITORING_DIALOG_TEXTS.CREATING}
                </>
              ) : (
                MONITORING_DIALOG_TEXTS.CREATE_EMPLOYEE
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
