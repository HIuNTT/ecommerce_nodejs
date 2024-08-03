import { ConfigType, registerAs } from '@nestjs/config';
import { env, envNumber } from '~/global/env';

export const appRegToken = 'app';

export const AppConfig = registerAs(appRegToken, () => ({
    name: env('APP_NAME'),
    port: envNumber('APP_PORT', 3000),
    version: env('APP_VERSION', '1'),
    baseUrl: env('APP_BASE_URL'),
    globalPrefix: env('GLOBAL_PREFIX', 'api'),
    locale: env('APP_LOCALE', 'vi'),
}));

export type IAppConfig = ConfigType<typeof AppConfig>;
