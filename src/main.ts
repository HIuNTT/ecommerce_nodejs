declare const module: any;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus, UnprocessableEntityException, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './setup-swagger';
import helmet from 'helmet';
import { isDev } from './global/env';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const configService = app.get(ConfigService);

    const { port, globalPrefix, version } = configService.get('app', { infer: true });

    // app.use(
    //     helmet({
    //         contentSecurityPolicy: {
    //             directives: {
    //                 defaultSrc: ["'self'"],
    //                 connectSrc: ["'self'", `http://127.0.0.1:${port}`],
    //             },
    //         },
    //     }),
    // );
    app.enableCors({ origin: '*', credentials: true });

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true, // Những thuộc tính có decorator của class-validator thì sẽ thuộc white list
            forbidNonWhitelisted: false, // Dừng yêu cầu xử lý và phản hồi lỗi khi có thuộc tính không nằm trong white list
            transformOptions: {
                enableImplicitConversion: true,
            },
            stopAtFirstError: true, // dừng lại ngay khi có lỗi đầu tiên
            errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            exceptionFactory: (errors) =>
                new UnprocessableEntityException(
                    errors.map((e) => {
                        const rule = Object.keys(e.constraints!)[0];
                        const msg = e.constraints![rule];
                        return msg;
                    })[0],
                ), // Lấy ra lỗi đầu tiên trong mảng lỗi và trả về lỗi đó
        }),
    );

    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: version,
    });

    if (isDev) {
        app.useGlobalInterceptors(new LoggingInterceptor());
    }

    app.setViewEngine('hbs');
    app.setGlobalPrefix(globalPrefix);

    setupSwagger(app, configService);

    await app.listen(port, '0.0.0.0', async () => {
        const url = await app.getUrl();
        console.log(`Application is running on: ${url}`);
        console.log(`OpenAPI: ${url}/api-docs`);
    });

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}
bootstrap();
