import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AUTH_CONSTANTS } from './auth.constants.js';

describe('AuthController', () => {
  let authController: AuthController;
  let authServiceMock: any;
  let configServiceMock: any;

  beforeEach(() => {
    authServiceMock = {
      signIn: vi.fn(),
      refreshTokens: vi.fn(),
    };
    configServiceMock = {
      get: vi.fn((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        return undefined;
      }),
    };
    authController = new AuthController(authServiceMock, configServiceMock);
  });

  describe('signIn', () => {
    it('should call authService.signIn, set refresh cookie, and return response payload', async () => {
      const mockResult = {
        accessToken: 'mock_access_jwt',
        refreshToken: 'mock_refresh_jwt',
        user: {
          id: 'admin-uuid',
          email: 'admin@example.com',
          firstName: 'HR',
          role: 'HR_ADMIN',
        },
      };

      authServiceMock.signIn.mockResolvedValue(mockResult);

      const cookieMock = vi.fn();
      const responseMock: any = {
        cookie: cookieMock,
      };

      const response = await authController.signIn(
        { email: 'admin@example.com', password: 'password123' },
        responseMock,
      );

      expect(authServiceMock.signIn).toHaveBeenCalledWith({
        email: 'admin@example.com',
        password: 'password123',
      });

      expect(cookieMock).toHaveBeenCalledWith(
        AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE,
        'mock_refresh_jwt',
        expect.objectContaining({
          httpOnly: true,
          sameSite: AUTH_CONSTANTS.REFRESH_TOKEN_SAME_SITE,
          path: AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_PATH,
          secure: false,
        }),
      );

      expect(response).toEqual({
        message: AUTH_CONSTANTS.SIGN_IN_SUCCESS_MESSAGE,
        accessToken: 'mock_access_jwt',
        user: mockResult.user,
      });
    });

    it('should set secure cookie when NODE_ENV is production', async () => {
      configServiceMock.get.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'production';
        return undefined;
      });

      const mockResult = {
        accessToken: 'access_jwt',
        refreshToken: 'refresh_jwt',
        user: { id: '1', email: 'test@example.com', role: 'HR_ADMIN' },
      };

      authServiceMock.signIn.mockResolvedValue(mockResult);
      const cookieMock = vi.fn();
      const responseMock: any = { cookie: cookieMock };

      await authController.signIn(
        { email: 'admin@example.com', password: 'password123' },
        responseMock,
      );

      expect(cookieMock).toHaveBeenCalledWith(
        AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE,
        'refresh_jwt',
        expect.objectContaining({
          secure: true,
        }),
      );
    });
  });

  describe('refresh', () => {
    it('should throw UnauthorizedException when refresh token cookie is missing', async () => {
      const requestMock: any = { cookies: {} };
      const responseMock: any = { cookie: vi.fn() };

      await expect(
        authController.refresh(requestMock, responseMock),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should rotate tokens, update cookie, and return new access token', async () => {
      const requestMock: any = {
        cookies: {
          [AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE]: 'valid_refresh_cookie',
        },
      };

      const rotatedTokens = {
        accessToken: 'new_access_jwt',
        refreshToken: 'new_refresh_jwt',
      };

      authServiceMock.refreshTokens.mockResolvedValue(rotatedTokens);

      const cookieMock = vi.fn();
      const responseMock: any = { cookie: cookieMock };

      const response = await authController.refresh(requestMock, responseMock);

      expect(authServiceMock.refreshTokens).toHaveBeenCalledWith(
        'valid_refresh_cookie',
      );

      expect(cookieMock).toHaveBeenCalledWith(
        AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE,
        'new_refresh_jwt',
        expect.objectContaining({
          httpOnly: true,
          sameSite: AUTH_CONSTANTS.REFRESH_TOKEN_SAME_SITE,
          path: AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_PATH,
        }),
      );

      expect(response).toEqual({
        message: AUTH_CONSTANTS.REFRESH_SUCCESS_MESSAGE,
        accessToken: 'new_access_jwt',
      });
    });
  });
});
