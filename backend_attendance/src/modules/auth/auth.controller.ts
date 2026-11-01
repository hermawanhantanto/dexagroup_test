import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { AUTH_CONSTANTS } from './auth.constants.js';
import { SignInDto } from './dto/sign-in.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signIn(signInDto);

    res.cookie(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE, result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
      path: '/',
    });

    return {
      message: 'Sign-in successful',
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const incomingRefreshToken = req.cookies?.[AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE];

    if (!incomingRefreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const tokens = await this.authService.refreshTokens(incomingRefreshToken);

    res.cookie(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
      path: '/',
    });

    return {
      message: 'Tokens refreshed successfully',
      accessToken: tokens.accessToken,
    };
  }
}
