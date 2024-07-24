import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { UserModule } from '~/modules/user/user.module';
import { FlashSaleModule } from '~/modules/flash-sale/flash-sale.module';

@Module({
    imports: [UserModule, FlashSaleModule],
    providers: [CronService],
    exports: [CronService],
})
export class HelperModule {}
