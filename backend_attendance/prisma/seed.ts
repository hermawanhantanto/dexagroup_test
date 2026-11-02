import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient, Role, Gender } from '../src/generated/prisma/client.js';
import {
  SEED_CONFIG,
  SEED_ADMIN_USER,
  SEED_EMPLOYEE_USER,
} from './seed.constants.js';

const connectionString =
  process.env.DATABASE_URL ||
  'mysql://app_user:app_password@localhost:3306/attendance_db';

const databaseAdapter = new PrismaMariaDb(connectionString);
const databaseClient = new PrismaClient({ adapter: databaseAdapter });

async function seedDatabase(): Promise<void> {
  const hashedAdminPassword = await bcrypt.hash(
    SEED_ADMIN_USER.password,
    SEED_CONFIG.BCRYPT_SALT_ROUNDS,
  );

  const hashedEmployeePassword = await bcrypt.hash(
    SEED_EMPLOYEE_USER.password,
    SEED_CONFIG.BCRYPT_SALT_ROUNDS,
  );

  const seededAdminUser = await databaseClient.user.upsert({
    where: { email: SEED_ADMIN_USER.email },
    update: {
      password: hashedAdminPassword,
      firstName: SEED_ADMIN_USER.firstName,
      lastName: SEED_ADMIN_USER.lastName,
      position: SEED_ADMIN_USER.position,
      department: SEED_ADMIN_USER.department,
      dateOfBirth: SEED_ADMIN_USER.dateOfBirth,
      gender: Gender.FEMALE,
      role: Role.HR_ADMIN,
      salary: SEED_ADMIN_USER.salary,
      joinDate: SEED_ADMIN_USER.joinDate,
    },
    create: {
      email: SEED_ADMIN_USER.email,
      password: hashedAdminPassword,
      firstName: SEED_ADMIN_USER.firstName,
      lastName: SEED_ADMIN_USER.lastName,
      position: SEED_ADMIN_USER.position,
      department: SEED_ADMIN_USER.department,
      dateOfBirth: SEED_ADMIN_USER.dateOfBirth,
      gender: Gender.FEMALE,
      role: Role.HR_ADMIN,
      salary: SEED_ADMIN_USER.salary,
      joinDate: SEED_ADMIN_USER.joinDate,
    },
  });

  const seededEmployeeUser = await databaseClient.user.upsert({
    where: { email: SEED_EMPLOYEE_USER.email },
    update: {
      password: hashedEmployeePassword,
      firstName: SEED_EMPLOYEE_USER.firstName,
      lastName: SEED_EMPLOYEE_USER.lastName,
      position: SEED_EMPLOYEE_USER.position,
      department: SEED_EMPLOYEE_USER.department,
      dateOfBirth: SEED_EMPLOYEE_USER.dateOfBirth,
      gender: Gender.MALE,
      role: Role.EMPLOYEE,
      salary: SEED_EMPLOYEE_USER.salary,
      joinDate: SEED_EMPLOYEE_USER.joinDate,
    },
    create: {
      email: SEED_EMPLOYEE_USER.email,
      password: hashedEmployeePassword,
      firstName: SEED_EMPLOYEE_USER.firstName,
      lastName: SEED_EMPLOYEE_USER.lastName,
      position: SEED_EMPLOYEE_USER.position,
      department: SEED_EMPLOYEE_USER.department,
      dateOfBirth: SEED_EMPLOYEE_USER.dateOfBirth,
      gender: Gender.MALE,
      role: Role.EMPLOYEE,
      salary: SEED_EMPLOYEE_USER.salary,
      joinDate: SEED_EMPLOYEE_USER.joinDate,
    },
  });

  console.log('Database seeded successfully:');
  console.log(`- HR Admin: ${seededAdminUser.email} (${seededAdminUser.role})`);
  console.log(
    `- Employee: ${seededEmployeeUser.email} (${seededEmployeeUser.role})`,
  );
}

async function runSeed(): Promise<void> {
  try {
    await seedDatabase();
  } catch (error) {
    console.error('Error executing database seed:', error);
    process.exitCode = 1;
  } finally {
    await databaseClient.$disconnect();
  }
}

await runSeed();
