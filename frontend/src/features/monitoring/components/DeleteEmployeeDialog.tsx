import * as React from "react"
import { AlertTriangle, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  MONITORING_DIALOG_TEXTS,
  MONITORING_FEEDBACK_MESSAGES,
  MONITORING_FORMATTING,
  MONITORING_TABLE_HEADERS,
} from "@/constants/monitoring"
import { useDeleteEmployee } from "../hooks/use-employees"
import { extractApiErrorMessage } from "../utils/error-parser"
import type { EmployeeRecord } from "@/types/monitoring"

export interface DeleteEmployeeDialogProps {
  employee: EmployeeRecord | null
  isOpen: boolean
  onClose: () => void
}

export function DeleteEmployeeDialog({
  employee,
  isOpen,
  onClose,
}: DeleteEmployeeDialogProps) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const deleteEmployeeMutation = useDeleteEmployee()

  React.useEffect(() => {
    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape" && isOpen && !deleteEmployeeMutation.isPending) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, deleteEmployeeMutation.isPending])

  if (!isOpen || !employee) {
    return null
  }

  const handleDeleteConfirm = async () => {
    setErrorMessage(null)

    try {
      await deleteEmployeeMutation.mutateAsync(employee.id)
      onClose()
    } catch (deletionError: unknown) {
      const extractedErrorMessage = extractApiErrorMessage(
        deletionError,
        MONITORING_FEEDBACK_MESSAGES.DELETE_ERROR,
      )
      setErrorMessage(extractedErrorMessage)
    }
  }

  const employeeFullName = employee.lastName
    ? `${employee.firstName} ${employee.lastName}`
    : employee.firstName

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => {
        if (!deleteEmployeeMutation.isPending) {
          onClose()
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-employee-title"
        aria-describedby="delete-employee-description"
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-destructive/20 bg-card p-6 shadow-2xl"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="delete-employee-title"
                className="text-base font-bold text-foreground"
              >
                {MONITORING_DIALOG_TEXTS.DELETE_EMPLOYEE_TITLE}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={deleteEmployeeMutation.isPending}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 cursor-pointer"
            aria-label={MONITORING_DIALOG_TEXTS.CLOSE}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p
          id="delete-employee-description"
          className="mt-3 text-xs leading-relaxed text-muted-foreground"
        >
          {MONITORING_DIALOG_TEXTS.DELETE_EMPLOYEE_SUBTITLE}
        </p>

        {errorMessage && (
          <div
            role="alert"
            className="mt-3.5 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{errorMessage}</div>
          </div>
        )}

        <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3.5 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">
              {MONITORING_TABLE_HEADERS.NAME}:
            </span>
            <span className="font-semibold text-foreground">{employeeFullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">
              {MONITORING_TABLE_HEADERS.EMAIL}:
            </span>
            <span className="font-mono text-muted-foreground">{employee.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">
              {MONITORING_TABLE_HEADERS.DEPARTMENT}:
            </span>
            <span className="text-foreground">
              {employee.department || MONITORING_FORMATTING.EMPTY_VALUE_PLACEHOLDER}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">
              {MONITORING_TABLE_HEADERS.POSITION}:
            </span>
            <span className="text-foreground">
              {employee.position || MONITORING_FORMATTING.EMPTY_VALUE_PLACEHOLDER}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">
              {MONITORING_TABLE_HEADERS.ROLE}:
            </span>
            <span className="font-medium text-foreground">{employee.role}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={deleteEmployeeMutation.isPending}
            className="cursor-pointer"
          >
            {MONITORING_DIALOG_TEXTS.CANCEL}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDeleteConfirm}
            disabled={deleteEmployeeMutation.isPending}
            className="cursor-pointer"
          >
            {deleteEmployeeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {MONITORING_DIALOG_TEXTS.DELETING}
              </>
            ) : (
              MONITORING_DIALOG_TEXTS.DELETE_EMPLOYEE_CONFIRM
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
