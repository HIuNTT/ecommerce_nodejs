import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { appRegToken, IAppConfig } from './configs/app.config';
import { ISwaggerConfig, swaggerRegToken } from './configs/swagger.config';
import { ResOp, TreeResult } from './helpers/response.helper';

export function setupSwagger(app: INestApplication, configService: ConfigService): void {
    const { name, port } = configService.get<IAppConfig>(appRegToken)!;
    const { enable, path } = configService.get<ISwaggerConfig>(swaggerRegToken)!;

    if (!enable) return;

    const config = new DocumentBuilder()
        .setTitle(`${name} - Ecommerce Backend API`)
        .setDescription(`${name} API document`)
        .setContact('Vũ Xuân Hội', 'https://github.com/HIuNTT', 'rinciumin@gmail.com')
        .addServer(`http://localhost:${port}`)
        .setVersion('1.0');

    // add security
    config.addBearerAuth();

    const document = SwaggerModule.createDocument(app, config.build(), {
        ignoreGlobalPrefix: false,
        extraModels: [ResOp, TreeResult],
    });
    SwaggerModule.setup(path, app, document, {
        swaggerOptions: {
            persistAuthorization: true, // duy trì trạng thái đăng nhập
        },
        customSiteTitle: 'Ecommerce Backend API Documentation',
    });

    // started log
    const logger = new Logger('SwaggerModule');
    logger.log(`Document API is running on http://127.0.0.1:${port}/${path}`);
}
