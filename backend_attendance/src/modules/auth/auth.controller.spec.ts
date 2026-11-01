import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthController } from './auth.controller.js';

describe('AuthController', () => {
  let authController: AuthController;
  let authServiceMock: any;

  beforeEach(() => {
    authServiceMock = {
      signIn: vi.fn(),
    };
    authController = new AuthController(authServiceMock);
  });

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
