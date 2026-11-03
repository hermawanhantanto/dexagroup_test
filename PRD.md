# Mini Microservice ERP — Product Requirement Document (PRD)

A Work-From-Home (WFH) Attendance and Workforce Monitoring System built with a decoupled microservice architecture. Employees can authenticate, submit daily attendance with notes and camera selfie proof via Supabase Storage, update attendance with clock-out notes, and view their attendance history. HR Admins can manage master employee records (CRUD), inspect workforce attendance submissions and verification selfies, log manual absences (sick/leave) for employees who missed clock-in, schedule company holidays, and track real-time dashboard KPIs.

---

## 1. System Architecture

The solution is divided into two independent NestJS backend microservices, a MySQL database, Supabase cloud object storage, and a React single-page frontend:

### backend_attendance (Port 3000)
- Employee-facing service.
- Endpoints:
  - `POST /api/auth/sign-in`: Authenticates employee credentials, returns short-lived JWT access token, and sets secure HTTP-only refresh token cookie.
  - `POST /api/auth/refresh`: Rotates access and refresh tokens.
  - `POST /api/auth/sign-out`: Clears refresh token cookie and database hash.
  - `GET /api/attendance/today`: Fetches today's attendance record and clock-in/out status.
  - `POST /api/attendance/upload-url`: Generates signed pre-signed upload URL for Supabase storage bucket (`dexa_test`).
  - `POST /api/attendance/check-in`: Submits clock-in record with date, time, optional notes, and photo proof URL.
  - `POST /api/attendance/clock-out`: Records clock-out timestamp and appends or updates attendance notes.
  - `GET /api/attendance/history`: Returns paginated attendance records for the authenticated employee.

### backend_monitoring (Port 3002)
- HR administration and workforce monitoring service.
- Endpoints:
  - `POST /api/auth/sign-in`: Authenticates HR Admin credentials (rejects non-HR roles with 403 Forbidden).
  - `POST /api/auth/refresh`: Rotates HR Admin tokens.
  - `POST /api/auth/sign-out`: Clears HR Admin session.
  - `GET /api/employees`: Paginated employee directory with multi-field search and department/gender filtering.
  - `POST /api/employees`: Creates employee profile with bcrypt password hashing and 409 duplicate email protection.
  - `GET /api/employees/:id`: Retrieves individual employee profile.
  - `PUT /api/employees/:id`: Updates employee details (position, department, salary, credentials).
  - `DELETE /api/employees/:id`: Deletes employee and cascades associated attendance records.
  - `GET /api/attendances`: Paginated workforce attendance log with date range, status, and employee search filters.
  - `GET /api/attendances/:id`: Retrieves full attendance record and photo proof URL.
  - `POST /api/attendances`: Allows HR Admins to record manual attendance for employees (restricted to SICK and LEAVE absences).
  - `GET /api/holidays`: Lists chronological company holidays.
  - `POST /api/holidays`: Creates new holiday record with 409 duplicate date conflict detection.
  - `DELETE /api/holidays/:id`: Deletes scheduled holiday.

### frontend (Port 5173)
- React 19 single-page application built with Vite and Tailwind CSS v4.
- Clean light theme interface with semantic color tokens.
- Role-based routing guards:
  - `/auth`: Shared sign-in view with role switcher (Employee vs. HR Admin).
  - `/attendance`: Protected employee attendance self-service portal.
  - `/monitoring`: Protected HR Admin dashboard with tab navigation (Employees, Workforce Attendance, Company Holidays, and KPI Summary).

### Cloud Storage & Infrastructure
- **Database**: MySQL 8.0 on port 3306 with Prisma ORM 7 (`@prisma/adapter-mariadb`).
- **Object Storage**: Supabase Storage (`dexa_test` bucket) for attendance selfie proof images.
- **Orchestration**: Docker Compose running MySQL, both NestJS backends, and Nginx frontend.

---

## 2. User Roles & Access Control

### EMPLOYEE
- Allowed routes: `/attendance`, `/auth`.
- Redirected away from `/monitoring` if attempting direct access.
- Capabilities:
  - Sign in and sign out.
  - View today's attendance status card.
  - Upload attendance proof selfie to Supabase via pre-signed URL.
  - Submit clock-in with notes.
  - Submit clock-out with pre-populated notes.
  - View personal attendance history table and preview submitted photos.

### HR_ADMIN
- Allowed routes: `/monitoring`, `/attendance`, `/auth`.
- Capabilities:
  - Sign in and sign out.
  - View top KPI summary cards (Total Workforce, Present Today, Upcoming Holidays).
  - Search, filter, add, edit, and delete employee records.
  - Monitor all workforce attendance entries with date range and status filters.
  - Inspect attendance verification selfies in a dedicated modal.
  - Record manual attendance for absent employees (SICK or LEAVE).
  - Schedule and delete company holidays.

---

## 3. Database Schema

### Users (`users`)
- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `password`: String (Bcrypt hash)
- `first_name`: String
- `last_name`: String (Optional)
- `position`: String (Optional)
- `department`: String (Optional)
- `date_of_birth`: Date (Optional)
- `gender`: MALE / FEMALE (Optional)
- `role`: EMPLOYEE / HR_ADMIN (Default: EMPLOYEE)
- `salary`: Decimal (Optional)
- `join_date`: Date (Optional)
- `refresh_token`: Text (Bcrypt hashed token for session rotation)
- `created_at`, `updated_at`: Timestamps

### Attendances (`attendances`)
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> users.id, onDelete: Cascade)
- `attendance_date`: Date (UTC normalized, unique per user per date)
- `clock_in_at`: Timestamp (Optional for manual absence entries)
- `clock_out_at`: Timestamp (Optional)
- `proof_image_url`: Text (Supabase public storage URL, Optional)
- `notes`: Text (Optional)
- `status`: PRESENT / SICK / LEAVE / ABSENT (Default: PRESENT)
- `created_at`, `updated_at`: Timestamps

### Holidays (`holidays`)
- `id`: UUID (Primary Key)
- `holiday_date`: Date (Unique)
- `name`: String
- `description`: Text (Optional)
- `created_at`, `updated_at`: Timestamps
