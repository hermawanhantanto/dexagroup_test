export const USER_ROLES = {
  EMPLOYEE: "EMPLOYEE",
  HR_ADMIN: "HR_ADMIN",
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export const AUTH_RULES = {
  PASSWORD_MIN_LENGTH: 8,
} as const

export const AUTH_LABELS = {
  SIGN_IN_TITLE: "Sign in to your account",
  SIGN_IN_SUBTITLE: "Select your role and enter your credentials.",
  ROLE_LABEL: "Account Role",
  ROLE_EMPLOYEE_TITLE: "Employee",
  ROLE_EMPLOYEE_SUBTITLE: "Attendance portal",
  ROLE_HR_ADMIN_TITLE: "HR Admin",
  ROLE_HR_ADMIN_SUBTITLE: "Monitoring portal",
  EMAIL_LABEL: "Email",
  EMAIL_PLACEHOLDER: "name@dexagroup.com",
  PASSWORD_LABEL: "Password",
  PASSWORD_PLACEHOLDER: "Enter your password",
  SUBMIT_BUTTON: "Sign In",
  SUBMITTING_BUTTON: "Signing In...",
  ATTENDANCE_TITLE: "Employee Attendance",
  ATTENDANCE_DESCRIPTION: "Attendance tracking and check-in (view under construction).",
  MONITORING_TITLE: "HR Admin Monitoring",
  MONITORING_DESCRIPTION: "Workforce monitoring and employee management (view under construction).",
  SIGN_OUT_BUTTON: "Sign Out",
} as const

export const AUTH_VALIDATION_MESSAGES = {
  EMAIL_INVALID: "Please enter a valid email address.",
  EMAIL_REQUIRED: "Email is required.",
  PASSWORD_MIN_LENGTH: "Password must be at least 8 characters.",
  PASSWORD_REQUIRED: "Password is required.",
  ROLE_REQUIRED: "Please select an account role.",
} as const
