import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import {
  AUTH_CONSTANTS,
  AUTH_ERROR_MESSAGES,
} from '../../modules/auth/auth.constants.js';

export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authorizationHeader = request.headers.authorization;

    if (
      !authorizationHeader ||
      !authorizationHeader.startsWith(AUTH_CONSTANTS.BEARER_PREFIX)
    ) {
      throw new UnauthorizedException(
        AUTH_ERROR_MESSAGES.AUTH_HEADER_MISSING_OR_MALFORMED,
      );
    }

    const token = authorizationHeader.slice(AUTH_CONSTANTS.BEARER_PREFIX.length);
    const accessSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET') ||
      AUTH_CONSTANTS.DEFAULT_ACCESS_SECRET;

    try {
      const decodedPayload =
        await this.jwtService.verifyAsync<AuthenticatedUser>(token, {
          secret: accessSecret,
        });

      if (decodedPayload.role !== AUTH_CONSTANTS.REQUIRED_ROLE) {
        throw new ForbiddenException(
          AUTH_ERROR_MESSAGES.FORBIDDEN_HR_ADMIN_ONLY,
        );
      }

      (request as any).user = decodedPayload;
      return true;
    } catch (caughtError) {
      if (caughtError instanceof ForbiddenException) {
        throw caughtError;
      }
      throw new UnauthorizedException(
        AUTH_ERROR_MESSAGES.INVALID_OR_EXPIRED_ACCESS_TOKEN,
      );
    }
  }
}
