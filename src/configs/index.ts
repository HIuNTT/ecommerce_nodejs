import { AppConfig } from './app.config';
import { CookieConfig } from './cookie.config';
import { SecurityConfig } from './security.config';
import { SwaggerConfig } from './swagger.config';

export * from './app.config';
export * from './security.config';
export * from './swagger.config';

export default {
    AppConfig,
    SwaggerConfig,
    SecurityConfig,
    CookieConfig,
};
