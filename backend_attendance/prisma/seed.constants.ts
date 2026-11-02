export const SEED_CONFIG = {
  BCRYPT_SALT_ROUNDS: 10,
} as const;

export const SEED_ADMIN_USER = {
  email: 'admin@dexagroup.com',
  password: 'AdminPassword123!',
  firstName: 'HR',
  lastName: 'Administrator',
  position: 'HR Manager',
  department: 'Human Resources',
  dateOfBirth: new Date('1988-05-12'),
  salary: '18000000.00',
  joinDate: new Date('2021-01-15'),
} as const;

export const SEED_EMPLOYEE_USER = {
  email: 'employee@dexagroup.com',
  password: 'EmployeePassword123!',
  firstName: 'John',
  lastName: 'Doe',
  position: 'Software Engineer',
  department: 'Engineering',
  dateOfBirth: new Date('1994-08-23'),
  salary: '14000000.00',
  joinDate: new Date('2022-04-01'),
} as const;
