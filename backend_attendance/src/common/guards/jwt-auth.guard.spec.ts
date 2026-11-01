import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard.js';

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let jwtServiceMock: any;
  let configServiceMock: any;

  beforeEach(() => {
    jwtServiceMock = {
      verifyAsync: vi.fn(),
    };

    configServiceMock = {
      get: vi.fn(() => 'test_jwt_secret'),
    };

    jwtAuthGuard = new JwtAuthGuard(jwtServiceMock, configServiceMock);
  });

  it('should throw UnauthorizedException if authorization header is missing', async () => {
    const contextMock: any = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    };

    await expect(jwtAuthGuard.canActivate(contextMock)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if authorization header is not Bearer', async () => {
    const contextMock: any = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Basic 12345' } }),
      }),
    };

    await expect(jwtAuthGuard.canActivate(contextMock)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token verification fails', async () => {
    const contextMock: any = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Bearer invalid_token' } }),
      }),
    };

    jwtServiceMock.verifyAsync.mockRejectedValue(new Error('Invalid token'));

    await expect(jwtAuthGuard.canActivate(contextMock)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should attach user payload to request and return true on valid token', async () => {
    const requestMock: any = {
      headers: { authorization: 'Bearer valid_token' },
    };

    const contextMock: any = {
      switchToHttp: () => ({
        getRequest: () => requestMock,
      }),
    };

    const decodedPayload = { sub: 'user-1', email: 'user@dexa.com', role: 'EMPLOYEE' };
    jwtServiceMock.verifyAsync.mockResolvedValue(decodedPayload);

    const result = await jwtAuthGuard.canActivate(contextMock);

    expect(result).toBe(true);
    expect(requestMock.user).toEqual(decodedPayload);
  });
});
