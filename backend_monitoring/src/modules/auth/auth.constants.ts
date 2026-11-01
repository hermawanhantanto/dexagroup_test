import { Role } from '../../generated/prisma/enums.js';

export const AUTH_CONSTANTS = {
  REFRESH_TOKEN_COOKIE: 'refresh_token',
  BCRYPT_SALT_ROUNDS: 10,
  DEFAULT_ACCESS_TOKEN_EXPIRATION: '15m',
  DEFAULT_REFRESH_TOKEN_EXPIRATION: '7d',
  DEFAULT_ACCESS_SECRET: 'dexa_access_secret_key_change_in_production',
  DEFAULT_REFRESH_SECRET: 'dexa_refresh_secret_key_change_in_production',
  REFRESH_TOKEN_COOKIE_MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000,
  REFRESH_TOKEN_COOKIE_PATH: '/',
  REFRESH_TOKEN_SAME_SITE: 'lax',
  PRODUCTION_ENVIRONMENT: 'production',
  DUMMY_TIMING_PASSWORD_SEED: 'dexa_timing_defense_seed',
  REQUIRED_ROLE: Role.HR_ADMIN,
  SIGN_IN_SUCCESS_MESSAGE: 'Sign-in successful',
  REFRESH_SUCCESS_MESSAGE: 'Tokens refreshed successfully',
  BEARER_PREFIX: 'Bearer ',
  THROTTLE_SIGN_IN_LIMIT: 5,
  THROTTLE_SIGN_IN_TTL_MS: 60000,
  THROTTLE_REFRESH_LIMIT: 10,
  THROTTLE_REFRESH_TTL_MS: 60000,
} as const;

export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  FORBIDDEN_HR_ADMIN_ONLY: 'Access denied: Only HR Admin is authorized to access this service',
  INVALID_OR_EXPIRED_REFRESH_TOKEN: 'Invalid or expired refresh token',
  ACCESS_DENIED: 'Access denied',
  REFRESH_TOKEN_REQUIRED: 'Refresh token is required',
  AUTH_HEADER_MISSING_OR_MALFORMED: 'Authorization token is missing or malformed',
  INVALID_OR_EXPIRED_ACCESS_TOKEN: 'Invalid or expired token',
} as const;
