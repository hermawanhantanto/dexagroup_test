import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller.js';

describe('AuthController', () => {
  let authController: AuthController;
  let authServiceMock: any;

  beforeEach(() => {
    authServiceMock = {
      signIn: vi.fn(),
      refreshTokens: vi.fn(),
    };
    authController = new AuthController(authServiceMock);
  });

  describe('signIn', () => {
    it('should call authService.signIn, set cookie, and return response payload', async () => {
      const mockResult = {
        accessToken: 'access_jwt',
        refreshToken: 'refresh_jwt',
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'Dexa',
          role: 'EMPLOYEE',
        },
      };

      authServiceMock.signIn.mockResolvedValue(mockResult);

      const cookieMock = vi.fn();
      const resMock: any = {
        cookie: cookieMock,
      };

      const response = await authController.signIn(
        { email: 'test@example.com', password: 'password123' },
        resMock,
      );

      expect(authServiceMock.signIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(cookieMock).toHaveBeenCalledWith(
        'refresh_token',
        'refresh_jwt',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        }),
      );

      expect(response).toEqual({
        message: 'Sign-in successful',
        accessToken: 'access_jwt',
        user: mockResult.user,
      });
    });
  });

  describe('refresh', () => {
    it('should throw UnauthorizedException when refresh token cookie is missing', async () => {
      const reqMock: any = { cookies: {} };
      const resMock: any = { cookie: vi.fn() };

      await expect(authController.refresh(reqMock, resMock)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should rotate tokens, update cookie, and return new access token', async () => {
      const reqMock: any = {
        cookies: {
          refresh_token: 'valid_refresh_cookie',
        },
      };

      const rotatedTokens = {
        accessToken: 'new_access_jwt',
        refreshToken: 'new_refresh_jwt',
      };

      authServiceMock.refreshTokens.mockResolvedValue(rotatedTokens);

      const cookieMock = vi.fn();
      const resMock: any = { cookie: cookieMock };

      const response = await authController.refresh(reqMock, resMock);

      expect(authServiceMock.refreshTokens).toHaveBeenCalledWith('valid_refresh_cookie');

      expect(cookieMock).toHaveBeenCalledWith(
        'refresh_token',
        'new_refresh_jwt',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        }),
      );

      expect(response).toEqual({
        message: 'Tokens refreshed successfully',
        accessToken: 'new_access_jwt',
      });
    });
  });
});
