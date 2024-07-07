import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MailModule } from './modules/mail/mail.module';
import { OtpModule } from './modules/otp/otp.module';
import { CategoryModule } from './modules/category/category.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { CloudinaryProvider } from './modules/cloudinary/cloudinary.provider';

@Module({
    imports: [
        AuthModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        UserModule,
        MailModule,
        OtpModule,
        CategoryModule,
        CloudinaryModule,
    ],
    providers: [CloudinaryProvider],
})
export class AppModule {}
