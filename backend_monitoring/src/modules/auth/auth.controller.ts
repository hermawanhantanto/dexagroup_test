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
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AUTH_CONSTANTS, AUTH_ERROR_MESSAGES } from './auth.constants.js';
import { AuthService } from './auth.service.js';
import { SignInDto } from './dto/sign-in.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Throttle({
    default: {
      limit: AUTH_CONSTANTS.THROTTLE_SIGN_IN_LIMIT,
      ttl: AUTH_CONSTANTS.THROTTLE_SIGN_IN_TTL_MS,
    },
  })
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const signInResult = await this.authService.signIn(signInDto);

    const isProductionEnvironment =
      this.configService.get<string>('NODE_ENV') ===
      AUTH_CONSTANTS.PRODUCTION_ENVIRONMENT;

    response.cookie(
      AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE,
      signInResult.refreshToken,
      {
        httpOnly: true,
        secure: isProductionEnvironment,
        sameSite: AUTH_CONSTANTS.REFRESH_TOKEN_SAME_SITE,
        maxAge: AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
        path: AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_PATH,
      },
    );

    return {
      message: AUTH_CONSTANTS.SIGN_IN_SUCCESS_MESSAGE,
      accessToken: signInResult.accessToken,
      user: signInResult.user,
    };
  }

  @Throttle({
    default: {
      limit: AUTH_CONSTANTS.THROTTLE_REFRESH_LIMIT,
      ttl: AUTH_CONSTANTS.THROTTLE_REFRESH_TTL_MS,
    },
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const incomingRefreshToken =
      request.cookies?.[AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE];

    if (!incomingRefreshToken) {
      throw new UnauthorizedException(
        AUTH_ERROR_MESSAGES.REFRESH_TOKEN_REQUIRED,
      );
    }

    const rotatedTokens =
      await this.authService.refreshTokens(incomingRefreshToken);

    const isProductionEnvironment =
      this.configService.get<string>('NODE_ENV') ===
      AUTH_CONSTANTS.PRODUCTION_ENVIRONMENT;

    response.cookie(
      AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE,
      rotatedTokens.refreshToken,
      {
        httpOnly: true,
        secure: isProductionEnvironment,
        sameSite: AUTH_CONSTANTS.REFRESH_TOKEN_SAME_SITE,
        maxAge: AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
        path: AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_PATH,
      },
    );

    return {
      message: AUTH_CONSTANTS.REFRESH_SUCCESS_MESSAGE,
      accessToken: rotatedTokens.accessToken,
    };
  }
}
