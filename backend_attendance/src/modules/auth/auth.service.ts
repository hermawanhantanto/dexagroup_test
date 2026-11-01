import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AUTH_CONSTANTS } from './auth.constants.js';
import { SignInDto } from './dto/sign-in.dto.js';

@Injectable()
export class AuthService implements OnModuleInit {
  private dummyHash: string = '';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.dummyHash = await bcrypt.hash(
      AUTH_CONSTANTS.DUMMY_TIMING_PASSWORD_SEED,
      AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS,
    );
  }

  async signIn(signInDto: SignInDto) {
    const email = signInDto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      await bcrypt.compare(signInDto.password, this.dummyHash);
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(signInDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.role);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    const sanitizedUser = this.sanitizeUser(user);

    return {
      accessToken,
      refreshToken,
      user: sanitizedUser,
    };
  }

  async refreshTokens(refreshToken: string) {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'default_refresh_secret';
    
    let payload: { sub: string };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, { secret: refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isRefreshTokenMatching) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: null },
      });
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    const hashedNewRefreshToken = await bcrypt.hash(
      tokens.refreshToken,
      AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedNewRefreshToken },
    });

    return tokens;
  }

  private sanitizeUser<T extends { password?: string; refreshToken?: string | null }>(user: T) {
    const {
      password: _excludedPassword,
      refreshToken: _excludedRefreshToken,
      ...safeUserProfile
    } = user;

    return safeUserProfile;
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET') || 'default_access_secret';
    const accessExpiresIn = (this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ||
      AUTH_CONSTANTS.DEFAULT_ACCESS_TOKEN_EXPIRATION) as any;

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'default_refresh_secret';
    const refreshExpiresIn = (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ||
      AUTH_CONSTANTS.DEFAULT_REFRESH_TOKEN_EXPIRATION) as any;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { secret: accessSecret, expiresIn: accessExpiresIn },
      ),
      this.jwtService.signAsync(
        { sub: userId },
        { secret: refreshSecret, expiresIn: refreshExpiresIn },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
