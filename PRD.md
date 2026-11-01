# Mini Microservice ERP 
A WFH (Work From Home) Attendance and Employee Monitoring System. Employees can log in, submit daily attendance with a selfie photo proof, and view their attendance history. HR Admins can log in, manage master employee records (add, view, update, delete), and monitor all employee attendance submissions.

---

# Applications

- **backend_attendance** 
  Handles employee-facing operations: user authentication (sign-in and token refresh), attendance check-in with photo upload, and personal attendance history retrieval.

- **backend_monitoring** 
  Handles HR admin operations: HR authentication, master employee data management (CRUD), and view-only monitoring of submitted employee attendance records.

- **frontend** 
  A single React web application with role-based navigation: a shared login screen that directs employees to the Attendance screen and HR Admins to the Monitoring Dashboard.

---

# Features

### 1. Backend Attendance (`backend_attendance`)
- **Sign In**: Login with email and password. Returns a short-lived access token and sets a secure HTTP-only refresh token cookie.
- **Refresh Token**: Refreshes expired access tokens with automatic token rotation to prevent theft.
- **Check In**: Submits daily attendance with automatic date/time capture, work type (WFH/WFO), notes, and selfie photo upload.
- **My Attendance History**: Returns the logged-in employee's personal attendance records.

### 2. Backend Monitoring (`backend_monitoring`)
- **HR Sign In**: Login for HR Admin accounts.
- **Master Employee CRUD**:
  - View employee list (with search and pagination).
  - Add new employee (name, email, password, job position, department, salary, join date).
  - View employee details.
  - Update employee details.
  - Delete or deactivate employee.
- **Attendance Monitoring (View Only)**:
  - View all employee attendance records with date filters.
  - View attendance details including clock-in time and photo proof.

### 3. Frontend (`frontend`)
- **Login Page**: Simple email and password form.
- **Employee Attendance View**:
  - Today's attendance status card.
  - Check-in form with camera/file upload for selfie proof.
  - Personal attendance history table.
- **HR Monitoring View**:
  - Employee Management tab: table of employees with "Add Employee" button and edit actions.
  - Attendance Monitoring tab: list of all employee attendances with date filters and photo proof preview modal.

---

# User Roles & Positions

- **System Roles** (Controls permissions in the app):
  - `EMPLOYEE`: Can only access the attendance app to clock in and see their own history.
  - `HR_ADMIN`: Can clock in and access the HR monitoring portal to manage employees and view all attendances.

- **Job Positions** (What the employee actually does at the company):
  - Examples: Programmer, QA Engineer, Marketing Specialist, HR Specialist, Product Manager.

- **Departments**:
  - Examples: Engineering, Human Resources, Marketing, Finance.
