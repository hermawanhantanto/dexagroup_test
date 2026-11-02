export const MONITORING_ENDPOINTS = {
  EMPLOYEES: "/employees",
  EMPLOYEE_BY_ID: (employeeId: string) => `/employees/${employeeId}`,
  ATTENDANCES: "/attendances",
  ATTENDANCE_BY_ID: (attendanceId: string) => `/attendances/${attendanceId}`,
  ATTENDANCE_UPLOAD_URL: "/attendances/upload-url",
  HOLIDAYS: "/holidays",
  HOLIDAY_BY_ID: (holidayId: string) => `/holidays/${holidayId}`,
} as const

export const MONITORING_QUERY_KEYS = {
  EMPLOYEES: "monitoring-employees",
  EMPLOYEE_DETAIL: "monitoring-employee-detail",
  ATTENDANCES: "monitoring-attendances",
  ATTENDANCE_DETAIL: "monitoring-attendance-detail",
  HOLIDAYS: "monitoring-holidays",
  KPIS: "monitoring-kpis",
} as const

export const MONITORING_HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const

export const MONITORING_CONSTRAINTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MIN_PAGE: 1,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
  PASSWORD_MIN_LENGTH: 8,
  SALARY_MIN: 0,
  SALARY_MAX_DECIMAL_PLACES: 2,
  SEARCH_DEBOUNCE_DELAY_MS: 350,
  MAX_PHOTO_FILE_SIZE_BYTES: 5242880,
  DEFAULT_UPLOAD_EXPIRATION_SECONDS: 120,
  TABLE_SKELETON_ROWS: 5,
  TABLE_COLUMN_COUNT: 8,
} as const

export const MONITORING_GENDERS = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const

export const MONITORING_FILTER_GENDERS = {
  ALL: "ALL",
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const

export const MONITORING_GENDER_OPTIONS = [
  { label: "Male", value: MONITORING_GENDERS.MALE },
  { label: "Female", value: MONITORING_GENDERS.FEMALE },
] as const

export const MONITORING_FILTER_GENDER_OPTIONS = [
  { label: "All Genders", value: MONITORING_FILTER_GENDERS.ALL },
  { label: "Male", value: MONITORING_FILTER_GENDERS.MALE },
  { label: "Female", value: MONITORING_FILTER_GENDERS.FEMALE },
] as const

export const MONITORING_ROLES = {
  EMPLOYEE: "EMPLOYEE",
  HR_ADMIN: "HR_ADMIN",
} as const

export const MONITORING_ROLE_OPTIONS = [
  { label: "Employee", value: MONITORING_ROLES.EMPLOYEE },
  { label: "HR Admin", value: MONITORING_ROLES.HR_ADMIN },
] as const

export const MONITORING_ATTENDANCE_STATUS = {
  PRESENT: "PRESENT",
  SICK: "SICK",
  LEAVE: "LEAVE",
  ABSENT: "ABSENT",
} as const

export const MONITORING_TABS = {
  EMPLOYEES: "employees",
  ATTENDANCE: "attendance",
  HOLIDAYS: "holidays",
} as const

export const MONITORING_DEPARTMENTS = [
  "ALL",
  "Engineering",
  "Quality Assurance",
  "Product",
  "Human Resources",
  "Marketing",
  "Finance",
  "Operations",
] as const

export const MONITORING_TABLE_HEADERS = {
  NAME: "Employee Name",
  EMAIL: "Email Address",
  ROLE: "Role",
  DEPARTMENT: "Department",
  POSITION: "Position",
  GENDER: "Gender",
  SALARY: "Salary",
  JOIN_DATE: "Join Date",
  ACTIONS: "Actions",
} as const

export const MONITORING_DIALOG_TEXTS = {
  ADD_EMPLOYEE_TITLE: "Add New Employee",
  ADD_EMPLOYEE_SUBTITLE: "Create a new employee profile with credentials and details.",
  EDIT_EMPLOYEE_TITLE: "Edit Employee Profile",
  EDIT_EMPLOYEE_SUBTITLE: "Update employee details, department, position, or credentials.",
  DELETE_EMPLOYEE_TITLE: "Delete Employee",
  DELETE_EMPLOYEE_SUBTITLE: "Are you sure you want to permanently delete this employee? This will also remove all associated attendance records.",
  DELETE_EMPLOYEE_CONFIRM: "Yes, Delete Employee",
  CANCEL: "Cancel",
  SAVE_CHANGES: "Save Changes",
  SAVING: "Saving...",
  CREATE_EMPLOYEE: "Create Employee",
  CREATING: "Creating...",
  DELETING: "Deleting...",
  CLOSE: "Close",
  EDIT: "Edit",
  DELETE: "Delete",
  ADD_EMPLOYEE_BUTTON: "Add Employee",
  PASSWORD_EDIT_HELP: "Only enter a new password if you want to update credentials.",
  SHOW_PASSWORD: "Show password",
  HIDE_PASSWORD: "Hide password",
} as const

export const MONITORING_FILTER_LABELS = {
  TABLE_TITLE: "Employee Directory",
  TABLE_SUBTITLE: "Manage workforce records, administrative roles, and credentials.",
  SEARCH_PLACEHOLDER: "Search by name, position, or department...",
  FILTER_ROLE_ALL: "All Roles",
  FILTER_GENDER_ALL: "All Genders",
  FILTER_DEPARTMENT_ALL: "All Departments",
  CLEAR_FILTERS: "Clear Filters",
  NO_EMPLOYEES_FOUND: "No employees found matching the specified criteria.",
  NO_EMPLOYEES_RECORDED: "No employees recorded yet.",
  RETRY: "Retry",
} as const

export const MONITORING_FIELD_LABELS = {
  FIRST_NAME: "First Name",
  FIRST_NAME_PLACEHOLDER: "e.g., John",
  LAST_NAME: "Last Name",
  LAST_NAME_PLACEHOLDER: "e.g., Doe",
  EMAIL: "Work Email",
  EMAIL_PLACEHOLDER: "name@dexagroup.com",
  PASSWORD: "Password",
  PASSWORD_CREATE_PLACEHOLDER: "Minimum 8 characters",
  PASSWORD_EDIT_PLACEHOLDER: "Leave blank to keep unchanged",
  DEPARTMENT: "Department",
  DEPARTMENT_PLACEHOLDER: "e.g., Engineering, Marketing, Finance",
  POSITION: "Position",
  POSITION_PLACEHOLDER: "e.g., Software Engineer, HR Specialist",
  ROLE: "System Role",
  ROLE_SELECT_PLACEHOLDER: "Select role",
  GENDER: "Gender",
  GENDER_SELECT_PLACEHOLDER: "Select gender",
  SALARY: "Monthly Salary (IDR)",
  SALARY_PLACEHOLDER: "e.g., 15000000",
  DATE_OF_BIRTH: "Date of Birth",
  JOIN_DATE: "Join Date",
} as const

export const MONITORING_VALIDATION_MESSAGES = {
  FIRST_NAME_REQUIRED: "First name is required.",
  EMAIL_REQUIRED: "Work email is required.",
  EMAIL_INVALID: "Please enter a valid email address.",
  PASSWORD_REQUIRED: "Password is required.",
  PASSWORD_MIN_LENGTH: "Password must be at least 8 characters long.",
  SALARY_INVALID: "Salary must be a valid number.",
  SALARY_MIN: "Salary must be greater than or equal to 0.",
  GENDER_INVALID: "Please select a valid gender.",
  ROLE_INVALID: "Please select a valid role.",
  DATE_OF_BIRTH_INVALID: "Date of birth must be a valid date.",
  JOIN_DATE_INVALID: "Join date must be a valid date.",
} as const

export const MONITORING_FEEDBACK_MESSAGES = {
  CREATE_SUCCESS: "Employee created successfully.",
  UPDATE_SUCCESS: "Employee updated successfully.",
  DELETE_SUCCESS: "Employee deleted successfully.",
  FETCH_ERROR: "Failed to load employees. Please try again.",
  CREATE_ERROR: "Failed to create employee.",
  UPDATE_ERROR: "Failed to update employee.",
  DELETE_ERROR: "Failed to delete employee.",
  EMAIL_CONFLICT: "An employee with this email already exists.",
  UNEXPECTED_ERROR: "An unexpected error occurred. Please try again.",
} as const

export const MONITORING_PAGINATION_LABELS = {
  PAGE: "Page",
  OF: "of",
  TOTAL_RECORDS: "total records",
  PREVIOUS: "Previous",
  NEXT: "Next",
} as const

export const MONITORING_FORMATTING = {
  EMPTY_VALUE_PLACEHOLDER: "-",
  CURRENCY_LOCALE: "id-ID",
  CURRENCY_CODE: "IDR",
} as const

export const MONITORING_ROLE_LABELS = {
  [MONITORING_ROLES.EMPLOYEE]: "Employee",
  [MONITORING_ROLES.HR_ADMIN]: "HR Admin",
} as const

export const MONITORING_HEADER_TEXTS = {
  PORTAL_SUBTITLE: "HR Administration Portal",
  DEFAULT_AVATAR_INITIAL: "U",
  ISO_DATE_DELIMITER: "T",
  DEPARTMENT_FILTER_ALL: "ALL",
} as const

export const MONITORING_ATTENDANCE_TABLE_HEADERS = {
  EMPLOYEE: "Employee",
  DATE: "Date",
  STATUS: "Status",
  CLOCK_IN: "Clock In",
  CLOCK_OUT: "Clock Out",
  NOTES: "Notes",
  PROOF: "Photo Proof",
} as const

export const MONITORING_ATTENDANCE_FILTER_LABELS = {
  TABLE_TITLE: "Workforce Attendance Monitoring",
  TABLE_SUBTITLE: "Real-time employee attendance tracking, timestamps, and verification photo proof.",
  START_DATE: "Start Date",
  END_DATE: "End Date",
  STATUS: "Status",
  STATUS_ALL: "All Statuses",
  SEARCH_PLACEHOLDER: "Search employee name or email...",
  CLEAR_FILTERS: "Clear Filters",
  NO_RECORDS_FOUND: "No attendance records found matching the specified filters.",
  NO_RECORDS_YET: "No attendance records registered yet.",
  VIEW_PHOTO: "View Proof",
  NO_PHOTO: "No Photo",
  INVALID_DATE_RANGE: "Start date cannot be after end date.",
  TABLE_COLUMN_COUNT: 7,
} as const

export const MONITORING_ATTENDANCE_STATUS_OPTIONS = [
  { label: "All Statuses", value: "ALL" },
  { label: "Present", value: "PRESENT" },
  { label: "Sick", value: "SICK" },
  { label: "Leave", value: "LEAVE" },
  { label: "Absent", value: "ABSENT" },
] as const

export const MONITORING_PROOF_MODAL_TEXTS = {
  TITLE: "Attendance Proof Inspection",
  SUBTITLE: "Review submitted verification selfie and attendance details.",
  EMPLOYEE: "Employee",
  DEPARTMENT: "Department",
  ATTENDANCE_DATE: "Attendance Date",
  CLOCK_IN: "Clock In",
  CLOCK_OUT: "Clock Out",
  NOTES: "Submitted Notes",
  STATUS: "Status",
  CLOSE: "Close",
  IMAGE_ALT: "Attendance verification selfie",
  OPEN_FULL: "Open Full Image",
} as const

export const MONITORING_HOLIDAY_HEADERS = {
  DATE: "Holiday Date",
  NAME: "Holiday Name",
  DESCRIPTION: "Description",
  ACTIONS: "Actions",
} as const

export const MONITORING_HOLIDAY_DIALOG_TEXTS = {
  TABLE_TITLE: "Company Holiday Management",
  TABLE_SUBTITLE: "Official national holidays and corporate work-free dates.",
  ADD_TITLE: "Add Company Holiday",
  ADD_SUBTITLE: "Designate official holidays and non-working days for the organization.",
  DELETE_TITLE: "Delete Company Holiday",
  DELETE_SUBTITLE: "Are you sure you want to remove this holiday? This will restore standard attendance expectations.",
  DELETE_CONFIRM: "Yes, Delete Holiday",
  CREATE_BUTTON: "Add Holiday",
  FIELD_DATE: "Holiday Date",
  FIELD_NAME: "Holiday Name",
  FIELD_NAME_PLACEHOLDER: "e.g., Independence Day, Eid al-Fitr",
  FIELD_DESC: "Description (Optional)",
  FIELD_DESC_PLACEHOLDER: "e.g., National public holiday observation",
  DATE_REQUIRED: "Holiday date is required.",
  NAME_REQUIRED: "Holiday name is required.",
  CONFLICT_ERROR: "A holiday on this date already exists.",
  CREATE_SUCCESS: "Holiday added successfully.",
  DELETE_SUCCESS: "Holiday deleted successfully.",
  FETCH_ERROR: "Failed to load company holidays.",
  NO_HOLIDAYS_FOUND: "No holidays scheduled for the organization.",
  CLEAR_FILTERS: "Clear Filters",
} as const

export const MONITORING_DASHBOARD_TEXTS = {
  TAB_EMPLOYEES: "Employees",
  TAB_ATTENDANCE: "Workforce Attendance",
  TAB_HOLIDAYS: "Company Holidays",
  KPI_TOTAL_EMPLOYEES: "Total Workforce",
  KPI_TODAY_PRESENT: "Present Today",
  KPI_UPCOMING_HOLIDAYS: "Upcoming Holidays",
  SIGN_OUT: "Sign Out",
  SEARCH_ANY: "Search...",
} as const


