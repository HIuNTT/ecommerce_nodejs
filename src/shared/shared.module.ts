import { Global, Module } from '@nestjs/common';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';

@Global()
@Module({
    imports: [CloudinaryModule, MailModule, PrismaModule],
    exports: [CloudinaryModule, MailModule, PrismaModule],
})
export class SharedModule {}
