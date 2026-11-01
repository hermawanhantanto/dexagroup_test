import {
  ForbiddenException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AUTH_CONSTANTS, AUTH_ERROR_MESSAGES } from './auth.constants.js';
import { SignInDto } from './dto/sign-in.dto.js';

interface JwtPayloadWithUserRole {
  sub: string;
  email: string;
  role: string;
}

interface JwtPayloadWithUserId {
  sub: string;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private dummyTimingHash: string = '';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.dummyTimingHash = await bcrypt.hash(
      AUTH_CONSTANTS.DUMMY_TIMING_PASSWORD_SEED,
      AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS,
    );
  }

  async signIn(signInDto: SignInDto) {
    const normalizedEmail = signInDto.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!existingUser) {
      await bcrypt.compare(signInDto.password, this.dummyTimingHash);
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(
      signInDto.password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    if (existingUser.role !== AUTH_CONSTANTS.REQUIRED_ROLE) {
      throw new ForbiddenException(AUTH_ERROR_MESSAGES.FORBIDDEN_HR_ADMIN_ONLY);
    }

    const { accessToken, refreshToken } = await this.generateTokens(
      existingUser.id,
      existingUser.email,
      existingUser.role,
    );

    const hashedRefreshToken = await bcrypt.hash(
      refreshToken,
      AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS,
    );

    await this.prisma.user.update({
      where: { id: existingUser.id },
      data: { refreshToken: hashedRefreshToken },
    });

    const sanitizedUser = this.sanitizeUser(existingUser);

    return {
      accessToken,
      refreshToken,
      user: sanitizedUser,
    };
  }

  async refreshTokens(incomingRefreshToken: string) {
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      AUTH_CONSTANTS.DEFAULT_REFRESH_SECRET;

    let tokenPayload: JwtPayloadWithUserId;

    try {
      tokenPayload = await this.jwtService.verifyAsync<JwtPayloadWithUserId>(
        incomingRefreshToken,
        { secret: refreshSecret },
      );
    } catch {
      throw new UnauthorizedException(
        AUTH_ERROR_MESSAGES.INVALID_OR_EXPIRED_REFRESH_TOKEN,
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id: tokenPayload.sub },
    });

    if (!existingUser || !existingUser.refreshToken) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_DENIED);
    }

    if (existingUser.role !== AUTH_CONSTANTS.REQUIRED_ROLE) {
      throw new ForbiddenException(AUTH_ERROR_MESSAGES.FORBIDDEN_HR_ADMIN_ONLY);
    }

    const isRefreshTokenMatching = await bcrypt.compare(
      incomingRefreshToken,
      existingUser.refreshToken,
    );

    if (!isRefreshTokenMatching) {
      await this.prisma.user.update({
        where: { id: existingUser.id },
        data: { refreshToken: null },
      });
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_DENIED);
    }

    const newTokens = await this.generateTokens(
      existingUser.id,
      existingUser.email,
      existingUser.role,
    );

    const hashedNewRefreshToken = await bcrypt.hash(
      newTokens.refreshToken,
      AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS,
    );

    await this.prisma.user.update({
      where: { id: existingUser.id },
      data: { refreshToken: hashedNewRefreshToken },
    });

    return newTokens;
  }

  private sanitizeUser<T extends { password?: string; refreshToken?: string | null }>(
    userToSanitize: T,
  ) {
    const {
      password: _excludedPassword,
      refreshToken: _excludedRefreshToken,
      ...sanitizedUserProfile
    } = userToSanitize;

    return sanitizedUserProfile;
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const accessSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET') ||
      AUTH_CONSTANTS.DEFAULT_ACCESS_SECRET;
    const accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ||
      AUTH_CONSTANTS.DEFAULT_ACCESS_TOKEN_EXPIRATION;

    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      AUTH_CONSTANTS.DEFAULT_REFRESH_SECRET;
    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ||
      AUTH_CONSTANTS.DEFAULT_REFRESH_TOKEN_EXPIRATION;

    const accessTokenOptions: JwtSignOptions = {
      secret: accessSecret,
      expiresIn: accessExpiresIn as any,
    };

    const refreshTokenOptions: JwtSignOptions = {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn as any,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync<JwtPayloadWithUserRole>(
        { sub: userId, email, role },
        accessTokenOptions,
      ),
      this.jwtService.signAsync<JwtPayloadWithUserId>(
        { sub: userId },
        refreshTokenOptions,
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
