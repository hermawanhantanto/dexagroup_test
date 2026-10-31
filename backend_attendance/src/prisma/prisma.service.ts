import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL') || process.env.DATABASE_URL || '';
    
    const adapter = new PrismaMariaDb(databaseUrl);

    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to MySQL database');
    } catch (error) {
      this.logger.warn(
        `Failed to connect to MySQL database on startup: ${(error as Error).message}. Please verify DATABASE_URL in .env`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
