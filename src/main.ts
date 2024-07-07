declare const module: any;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });

    app.enableCors();
    app.setViewEngine('hbs');
    app.setGlobalPrefix('api');
    await app.listen(3000);

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }

    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
