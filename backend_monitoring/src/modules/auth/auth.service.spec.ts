import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import * as bcrypt from 'bcrypt';
import { Role } from '../../generated/prisma/enums.js';

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
      verifyAsync: vi.fn(),
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

  describe('signIn', () => {
    it('should throw UnauthorizedException when user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.signIn({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const hashedPassword = await bcrypt.hash('correct_password', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-hr-1',
        email: 'hr@example.com',
        password: hashedPassword,
        role: Role.HR_ADMIN,
      });

      await expect(
        authService.signIn({
          email: 'hr@example.com',
          password: 'wrong_password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException when user exists with valid credentials but is not HR Admin', async () => {
      const rawPassword = 'employee_password';
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'employee-123',
        email: 'employee@example.com',
        password: hashedPassword,
        firstName: 'Regular',
        lastName: 'Employee',
        role: Role.EMPLOYEE,
        refreshToken: null,
      });

      await expect(
        authService.signIn({
          email: 'employee@example.com',
          password: rawPassword,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return tokens and sanitized user when credentials are valid and user is HR Admin', async () => {
      const rawPassword = 'admin_password';
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      const mockAdminUser = {
        id: 'admin-123',
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: Role.HR_ADMIN,
        refreshToken: null,
      };

      prismaMock.user.findUnique.mockResolvedValue(mockAdminUser);
      prismaMock.user.update.mockResolvedValue({
        ...mockAdminUser,
        refreshToken: 'hashed_refresh_token',
      });

      jwtMock.signAsync
        .mockResolvedValueOnce('mock_access_token')
        .mockResolvedValueOnce('mock_refresh_token');

      const result = await authService.signIn({
        email: '  ADMIN@example.com  ',
        password: rawPassword,
      });

      expect(result.accessToken).toBe('mock_access_token');
      expect(result.refreshToken).toBe('mock_refresh_token');
      expect(result.user).toEqual({
        id: 'admin-123',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: Role.HR_ADMIN,
      });
      expect((result.user as any).password).toBeUndefined();
      expect((result.user as any).refreshToken).toBeUndefined();

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'admin-123' },
          data: { refreshToken: expect.any(String) },
        }),
      );
    });
  });

  describe('refreshTokens', () => {
    it('should throw UnauthorizedException when refresh token verification fails', async () => {
      jwtMock.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(authService.refreshTokens('invalid_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user does not exist or has no stored refresh token', async () => {
      jwtMock.verifyAsync.mockResolvedValue({ sub: 'admin-123' });
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(authService.refreshTokens('valid_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ForbiddenException when user is found but does not have HR Admin role', async () => {
      jwtMock.verifyAsync.mockResolvedValue({ sub: 'employee-123' });
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'employee-123',
        email: 'employee@example.com',
        role: Role.EMPLOYEE,
        refreshToken: 'some_hash',
      });

      await expect(authService.refreshTokens('token')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should detect token theft, revoke token in DB, and throw UnauthorizedException when hash mismatch', async () => {
      const storedHashedToken = await bcrypt.hash('stored_token', 10);
      jwtMock.verifyAsync.mockResolvedValue({ sub: 'admin-123' });
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'admin-123',
        email: 'admin@example.com',
        role: Role.HR_ADMIN,
        refreshToken: storedHashedToken,
      });

      await expect(
        authService.refreshTokens('stolen_tampered_token'),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'admin-123' },
        data: { refreshToken: null },
      });
    });

    it('should rotate tokens and update stored hash when refresh token matches', async () => {
      const incomingToken = 'incoming_valid_refresh_token';
      const storedHashedToken = await bcrypt.hash(incomingToken, 10);

      jwtMock.verifyAsync.mockResolvedValue({ sub: 'admin-123' });
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'admin-123',
        email: 'admin@example.com',
        role: Role.HR_ADMIN,
        refreshToken: storedHashedToken,
      });

      jwtMock.signAsync
        .mockResolvedValueOnce('new_access_token')
        .mockResolvedValueOnce('new_rotated_refresh_token');

      const result = await authService.refreshTokens(incomingToken);

      expect(result.accessToken).toBe('new_access_token');
      expect(result.refreshToken).toBe('new_rotated_refresh_token');

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'admin-123' },
          data: { refreshToken: expect.any(String) },
        }),
      );
    });
  });
});
