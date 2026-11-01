import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { Role } from '../../generated/prisma/enums.js';

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let jwtServiceMock: any;
  let configServiceMock: any;

  beforeEach(() => {
    jwtServiceMock = {
      verifyAsync: vi.fn(),
    };
    configServiceMock = {
      get: vi.fn((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') return 'test_access_secret';
        return undefined;
      }),
    };
    jwtAuthGuard = new JwtAuthGuard(jwtServiceMock, configServiceMock);
  });

  const createMockExecutionContext = (authorizationHeader?: string): ExecutionContext => {
    const request = {
      headers: {
        authorization: authorizationHeader,
      },
      user: undefined,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should throw UnauthorizedException when authorization header is missing', async () => {
    const context = createMockExecutionContext(undefined);

    await expect(jwtAuthGuard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when authorization header does not start with Bearer', async () => {
    const context = createMockExecutionContext('Basic dXNlcjpwYXNz');

    await expect(jwtAuthGuard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when jwt verification rejects', async () => {
    const context = createMockExecutionContext('Bearer invalid_token');
    jwtServiceMock.verifyAsync.mockRejectedValue(new Error('Invalid token'));

    await expect(jwtAuthGuard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw ForbiddenException when user role is not HR_ADMIN', async () => {
    const context = createMockExecutionContext('Bearer valid_employee_token');
    jwtServiceMock.verifyAsync.mockResolvedValue({
      sub: 'employee-123',
      email: 'employee@example.com',
      role: Role.EMPLOYEE,
    });

    await expect(jwtAuthGuard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should set request.user and return true when token is valid and user is HR_ADMIN', async () => {
    const context = createMockExecutionContext('Bearer valid_hr_admin_token');
    const mockPayload = {
      sub: 'admin-123',
      email: 'admin@example.com',
      role: Role.HR_ADMIN,
    };
    jwtServiceMock.verifyAsync.mockResolvedValue(mockPayload);

    const canActivateResult = await jwtAuthGuard.canActivate(context);

    expect(canActivateResult).toBe(true);
    const request = context.switchToHttp().getRequest();
    expect(request.user).toEqual(mockPayload);
  });
});
