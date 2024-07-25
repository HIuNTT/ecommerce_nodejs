declare const module: any;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus, UnprocessableEntityException, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

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
        defaultVersion: '1',
    });

    app.useGlobalInterceptors(new LoggingInterceptor());

    app.enableCors();
    app.setViewEngine('hbs');
    app.setGlobalPrefix('api');

    // Starts listening for shutdown hooks
    app.enableShutdownHooks();

    await app.listen(3000);

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }

    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
