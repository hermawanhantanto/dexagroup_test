import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient, Role, Gender } from '../src/generated/prisma/client.js';
import {
  SEED_CONFIG,
  SEED_ADMIN_USER,
  SEED_EMPLOYEES,
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

  console.log('Database seeding started:');
  console.log(`- HR Admin: ${seededAdminUser.email} (${seededAdminUser.role})`);

  for (const employeeData of SEED_EMPLOYEES) {
    const rawPassword =
      employeeData.password || SEED_CONFIG.DEFAULT_EMPLOYEE_PASSWORD;
    const hashedPassword = await bcrypt.hash(
      rawPassword,
      SEED_CONFIG.BCRYPT_SALT_ROUNDS,
    );

    const employeeGender =
      employeeData.gender === 'FEMALE' ? Gender.FEMALE : Gender.MALE;

    const seededEmployeeRecord = await databaseClient.user.upsert({
      where: { email: employeeData.email },
      update: {
        password: hashedPassword,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        position: employeeData.position,
        department: employeeData.department,
        dateOfBirth: employeeData.dateOfBirth,
        gender: employeeGender,
        role: Role.EMPLOYEE,
        salary: employeeData.salary,
        joinDate: employeeData.joinDate,
      },
      create: {
        email: employeeData.email,
        password: hashedPassword,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        position: employeeData.position,
        department: employeeData.department,
        dateOfBirth: employeeData.dateOfBirth,
        gender: employeeGender,
        role: Role.EMPLOYEE,
        salary: employeeData.salary,
        joinDate: employeeData.joinDate,
      },
    });

    console.log(
      `- Employee: ${seededEmployeeRecord.email} - ${seededEmployeeRecord.firstName} ${seededEmployeeRecord.lastName || ''} (${seededEmployeeRecord.position})`,
    );
  }

  console.log(`Total employees seeded: ${SEED_EMPLOYEES.length}`);
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
