import { ConfigType, registerAs } from '@nestjs/config';
import { CookieOptions } from 'express';
import ms from 'ms';
import { env, envBoolean } from '~/global/env';

export const cookieRegToken = 'cookie';

export const CookieConfig = registerAs(cookieRegToken, () => ({
    // domain: env('COOKIE_DOMAIN'),
    path: env('COOKIE_PATH'),
    maxAge: ms(env('COOKIE_MAX_AGE')),
    httpOnly: envBoolean('COOKIE_HTTP_ONLY'),
    secure: envBoolean('COOKIE_SECURE'),
    sameSite: env('COOKIE_SAME_SITE'),
}));

export type ICookieConfig = CookieOptions & ConfigType<typeof CookieConfig>;
