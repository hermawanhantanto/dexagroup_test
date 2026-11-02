import { AUTH_LABELS, USER_ROLES, type UserRole } from "@/constants/auth"
import { cn } from "@/lib/utils"

interface RoleSegmentedControlProps {
  value: UserRole
  onChange: (selectedRole: UserRole) => void
  disabled?: boolean
}

export function RoleSegmentedControl({
  value,
  onChange,
  disabled = false,
}: RoleSegmentedControlProps) {
  return (
    <div
      role="radiogroup"
      aria-label={AUTH_LABELS.ROLE_LABEL}
      className="grid grid-cols-2 gap-1.5 rounded-lg border border-border bg-muted/40 p-1"
    >
      <button
        type="button"
        role="radio"
        aria-checked={value === USER_ROLES.EMPLOYEE}
        disabled={disabled}
        onClick={() => onChange(USER_ROLES.EMPLOYEE)}
        className={cn(
          "flex flex-col items-center justify-center rounded-md py-2 px-3 text-center transition-all outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          value === USER_ROLES.EMPLOYEE
            ? "bg-background text-foreground shadow-xs font-semibold"
            : "text-muted-foreground hover:text-foreground",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <span className="text-sm tracking-tight">
          {AUTH_LABELS.ROLE_EMPLOYEE_TITLE}
        </span>
        <span className="text-[11px] font-normal opacity-70">
          {AUTH_LABELS.ROLE_EMPLOYEE_SUBTITLE}
        </span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={value === USER_ROLES.HR_ADMIN}
        disabled={disabled}
        onClick={() => onChange(USER_ROLES.HR_ADMIN)}
        className={cn(
          "flex flex-col items-center justify-center rounded-md py-2 px-3 text-center transition-all outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          value === USER_ROLES.HR_ADMIN
            ? "bg-background text-foreground shadow-xs font-semibold"
            : "text-muted-foreground hover:text-foreground",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <span className="text-sm tracking-tight">
          {AUTH_LABELS.ROLE_HR_ADMIN_TITLE}
        </span>
        <span className="text-[11px] font-normal opacity-70">
          {AUTH_LABELS.ROLE_HR_ADMIN_SUBTITLE}
        </span>
      </button>
    </div>
  )
}
