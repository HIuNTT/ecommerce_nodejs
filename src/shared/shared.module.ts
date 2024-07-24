import { Global, Module } from '@nestjs/common';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HelperModule } from './helpers/helper.module';

@Global()
@Module({
    imports: [CloudinaryModule, MailModule, PrismaModule, ScheduleModule.forRoot(), HelperModule],
    exports: [CloudinaryModule, MailModule, PrismaModule, HelperModule],
})
export class SharedModule {}
