export const SEED_CONFIG = {
  BCRYPT_SALT_ROUNDS: 10,
  DEFAULT_EMPLOYEE_PASSWORD: 'EmployeePassword123!',
} as const;

export const SEED_ADMIN_USER = {
  email: 'admin@dexagroup.com',
  password: 'AdminPassword123!',
  firstName: 'HR',
  lastName: 'Administrator',
  position: 'HR Manager',
  department: 'Human Resources',
  dateOfBirth: new Date('1988-05-12'),
  gender: 'FEMALE' as const,
  salary: '18000000.00',
  joinDate: new Date('2021-01-15'),
} as const;

export interface SeedEmployeeData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE';
  salary: string;
  joinDate: Date;
}

export const SEED_EMPLOYEES: readonly SeedEmployeeData[] = [
  {
    email: 'employee@dexagroup.com',
    password: 'EmployeePassword123!',
    firstName: 'John',
    lastName: 'Doe',
    position: 'Software Engineer',
    department: 'Engineering',
    dateOfBirth: new Date('1994-08-23'),
    gender: 'MALE',
    salary: '14000000.00',
    joinDate: new Date('2022-04-01'),
  },
  {
    email: 'jane.smith@dexagroup.com',
    password: 'EmployeePassword123!',
    firstName: 'Jane',
    lastName: 'Smith',
    position: 'QA Engineer',
    department: 'Quality Assurance',
    dateOfBirth: new Date('1996-03-14'),
    gender: 'FEMALE',
    salary: '12500000.00',
    joinDate: new Date('2022-08-01'),
  },
  {
    email: 'michael.tan@dexagroup.com',
    password: 'EmployeePassword123!',
    firstName: 'Michael',
    lastName: 'Tan',
    position: 'Product Manager',
    department: 'Product',
    dateOfBirth: new Date('1991-11-28'),
    gender: 'MALE',
    salary: '19000000.00',
    joinDate: new Date('2021-05-10'),
  },
  {
    email: 'sarah.putri@dexagroup.com',
    password: 'EmployeePassword123!',
    firstName: 'Sarah',
    lastName: 'Putri',
    position: 'UI/UX Designer',
    department: 'Product',
    dateOfBirth: new Date('1997-09-05'),
    gender: 'FEMALE',
    salary: '13000000.00',
    joinDate: new Date('2023-02-15'),
  },
  {
    email: 'david.wijaya@dexagroup.com',
    password: 'EmployeePassword123!',
    firstName: 'David',
    lastName: 'Wijaya',
    position: 'DevOps Engineer',
    department: 'Engineering',
    dateOfBirth: new Date('1993-01-19'),
    gender: 'MALE',
    salary: '16500000.00',
    joinDate: new Date('2022-01-10'),
  },
  {
    email: 'clara.setiawan@dexagroup.com',
    password: 'EmployeePassword123!',
    firstName: 'Clara',
    lastName: 'Setiawan',
    position: 'Marketing Specialist',
    department: 'Marketing',
    dateOfBirth: new Date('1998-07-22'),
    gender: 'FEMALE',
    salary: '11500000.00',
    joinDate: new Date('2023-06-01'),
  },
  {
    email: 'budi.santoso@dexagroup.com',
    password: 'EmployeePassword123!',
    firstName: 'Budi',
    lastName: 'Santoso',
    position: 'Backend Developer',
    department: 'Engineering',
    dateOfBirth: new Date('1992-04-10'),
    gender: 'MALE',
    salary: '15000000.00',
    joinDate: new Date('2021-09-01'),
  },
  {
    email: 'rachel.kurnia@dexagroup.com',
    password: 'EmployeePassword123!',
    firstName: 'Rachel',
    lastName: 'Kurnia',
    position: 'Financial Analyst',
    department: 'Finance',
    dateOfBirth: new Date('1995-12-03'),
    gender: 'FEMALE',
    salary: '13500000.00',
    joinDate: new Date('2022-11-15'),
  },
] as const;
