import { ConfigType, registerAs } from '@nestjs/config';
import { env } from '~/global/env';

export const securityRegToken = 'security';

export const SecurityConfig = registerAs(securityRegToken, () => ({
    jwtSecret: env('JWT_SECRET'),
    jwtExpire: env('JWT_EXPIRE'),
    refreshSecret: env('REFRESH_TOKEN_SECRET'),
    refreshExpire: env('REFRESH_TOKEN_EXPIRE'),
    refreshToken: env('REFRESH_TOKEN'),
}));

export type ISecurityConfig = ConfigType<typeof SecurityConfig>;
