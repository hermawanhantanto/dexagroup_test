import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaService } from './prisma.service.js';

describe('PrismaService', () => {
  let configServiceMock: any;

  beforeEach(() => {
    configServiceMock = {
      get: vi.fn().mockReturnValue('mysql://app_user:app_password@localhost:3306/attendance_db'),
    };
  });

  it('should instantiate successfully with database adapter', () => {
    const prismaService = new PrismaService(configServiceMock);
    expect(prismaService).toBeDefined();
  });

  it('should attempt connection on module init', async () => {
    const prismaService = new PrismaService(configServiceMock);
    const connectSpy = vi.spyOn(prismaService, '$connect').mockResolvedValue(undefined as never);

    await prismaService.onModuleInit();

    expect(connectSpy).toHaveBeenCalled();
  });

  it('should disconnect on module destroy', async () => {
    const prismaService = new PrismaService(configServiceMock);
    const disconnectSpy = vi.spyOn(prismaService, '$disconnect').mockResolvedValue(undefined as never);

    await prismaService.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalled();
  });
});
