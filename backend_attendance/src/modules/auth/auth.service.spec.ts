import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaMock: any;
  let jwtMock: any;
  let configMock: any;

  beforeEach(async () => {
    prismaMock = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    jwtMock = {
      signAsync: vi.fn(),
    };

    configMock = {
      get: vi.fn((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') return 'test_access_secret';
        if (key === 'JWT_ACCESS_EXPIRES_IN') return '15m';
        if (key === 'JWT_REFRESH_SECRET') return 'test_refresh_secret';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
        return undefined;
      }),
    };

    authService = new AuthService(prismaMock, jwtMock, configMock);
    await authService.onModuleInit();
  });

  it('should throw UnauthorizedException when user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      authService.signIn({ email: 'nonexistent@example.com', password: 'password123' }),
    ).rejects.toThrow(UnauthorizedException);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'nonexistent@example.com' },
    });
  });

  it('should throw UnauthorizedException when password is wrong', async () => {
    const hashedPassword = await bcrypt.hash('correct_password', 10);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
    });

    await expect(
      authService.signIn({ email: 'user@example.com', password: 'wrong_password' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should return tokens and sanitized user when credentials are valid', async () => {
    const rawPassword = 'correct_password';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'EMPLOYEE',
      refreshToken: null,
    };

    prismaMock.user.findUnique.mockResolvedValue(mockUser);
    prismaMock.user.update.mockResolvedValue({ ...mockUser, refreshToken: 'hashed_rt' });

    jwtMock.signAsync
      .mockResolvedValueOnce('mock_access_token')
      .mockResolvedValueOnce('mock_refresh_token');

    const result = await authService.signIn({
      email: 'user@example.com',
      password: rawPassword,
    });

    expect(result.accessToken).toBe('mock_access_token');
    expect(result.refreshToken).toBe('mock_refresh_token');
    expect(result.user).toEqual({
      id: 'user-123',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'EMPLOYEE',
    });
    expect((result.user as any).password).toBeUndefined();

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-123' },
        data: { refreshToken: expect.any(String) },
      }),
    );
  });
});
