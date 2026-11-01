import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const databaseUrl =
      configService.get<string>('DATABASE_URL') ||
      process.env.DATABASE_URL ||
      '';

    const databaseAdapter = new PrismaMariaDb(databaseUrl);

    super({ adapter: databaseAdapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to MySQL database');
    } catch (connectionError) {
      this.logger.warn(
        `Failed to connect to MySQL database on startup: ${(connectionError as Error).message}. Please verify DATABASE_URL in .env`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
